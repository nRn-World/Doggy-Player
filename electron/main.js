import { app, BrowserWindow, ipcMain } from 'electron';
import { initUsageTelemetry, unregisterUsageTelemetry } from './telemetry.js';
import os from 'os';
import pkg from 'electron-updater';
const { autoUpdater } = pkg;
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import express from 'express';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { exec, spawn } from 'child_process';
import crypto from 'crypto';

process.env.UV_THREADPOOL_SIZE = '64';

/** Active FFmpeg pipe per response — kill previous on new seek to avoid decoder pile-up */
let activeTranscodeCommand = null;
/** Latest frame-extract process (scrub preview) */
let activeFrameExtract = null;
let frameExtractGen = 0;

let ffmpegExePath = ffmpegPath;
if (app.isPackaged) {
  ffmpegExePath = ffmpegPath.replace('app.asar', 'app.asar.unpacked');
}
ffmpeg.setFfmpegPath(ffmpegExePath);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let streamServer = null;
let streamPort = 3001;

/** Containers Chromium cannot seek well (even if file extension says .mp4) */
const UNSEEKABLE_FORMATS = new Set([
  'mpegts', 'mpeg', 'avi', 'flv', 'asf', 'rm', 'rmvb', 'swf', 'vob'
]);

function resolveLocalMediaPath(filePath) {
  if (!filePath || typeof filePath !== 'string') return '';
  let cleanPath = filePath;
  if (cleanPath.startsWith('file:///')) cleanPath = cleanPath.slice(8);
  else if (cleanPath.startsWith('file://')) cleanPath = cleanPath.slice(7);
  if (process.platform === 'win32') {
    try { cleanPath = decodeURIComponent(cleanPath); } catch (_) {}
    cleanPath = cleanPath.replace(/\//g, '\\');
  }
  return cleanPath;
}

/** Parse `Input #0, mpegts, from ...` from ffmpeg stderr */
function probeInputFormat(videoPath) {
  return new Promise((resolve) => {
    const proc = spawn(ffmpegExePath, ['-hide_banner', '-i', videoPath], { windowsHide: true });
    let err = '';
    const timer = setTimeout(() => {
      try { proc.kill('SIGKILL'); } catch (_) {}
      resolve('');
    }, 8000);
    proc.stderr.on('data', (d) => { err += d.toString(); });
    proc.on('error', () => {
      clearTimeout(timer);
      resolve('');
    });
    proc.on('close', () => {
      clearTimeout(timer);
      const m = err.match(/Input #0,\s*([^,\s]+)/i);
      resolve(m ? m[1].toLowerCase() : '');
    });
  });
}

function remuxCachePath(cleanPath) {
  let stat;
  try { stat = fs.statSync(cleanPath); } catch { return null; }
  const key = `${cleanPath}|${stat.size}|${stat.mtimeMs}`;
  const hash = crypto.createHash('sha1').update(key).digest('hex').slice(0, 24);
  const dir = path.join(app.getPath('userData'), 'remux-cache');
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${hash}.mp4`);
}

/**
 * Chromium has to decode from the previous IDR to show a seeked frame, so seek
 * latency scales with GOP length: measured p50 of 217ms at an 8.3s GOP versus
 * 30ms at a 1s GOP on identical file size. Re-encoding with a dense keyframe
 * interval is the only way to get YouTube/VLC-class seeking out of a long-GOP
 * source. Lossy, so this is opt-in and cached.
 */
function seekOptCachePath(cleanPath) {
  let stat;
  try { stat = fs.statSync(cleanPath); } catch { return null; }
  const key = `seekopt-v1|${cleanPath}|${stat.size}|${stat.mtimeMs}`;
  const hash = crypto.createHash('sha1').update(key).digest('hex').slice(0, 24);
  const dir = path.join(app.getPath('userData'), 'seek-cache');
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${hash}.mp4`);
}

/** How often keyframes appear, in seconds. null when it cannot be determined. */
function probeKeyframeInterval(videoPath) {
  return new Promise((resolve) => {
    // -skip_frame nokey + showinfo keeps this cheap: only keyframes are decoded
    // and -t caps the window, so even a 40GB file answers in well under a second.
    const args = [
      '-hide_banner', '-loglevel', 'info',
      '-skip_frame', 'nokey',
      '-t', '120', '-i', videoPath,
      '-an', '-vf', 'showinfo',
      '-f', 'null', '-'
    ];
    const proc = spawn(ffmpegExePath, args, { windowsHide: true });
    let err = '';
    const timer = setTimeout(() => {
      try { proc.kill('SIGKILL'); } catch (_) {}
      resolve(null);
    }, 20000);
    proc.stderr.on('data', (d) => { if (err.length < 400000) err += d.toString(); });
    proc.on('error', () => { clearTimeout(timer); resolve(null); });
    proc.on('close', () => {
      clearTimeout(timer);
      const pts = [...err.matchAll(/pts_time:\s*([0-9.]+)/g)].map(m => parseFloat(m[1]));
      if (pts.length < 2) return resolve(null);
      const gaps = [];
      for (let i = 1; i < pts.length; i++) {
        const g = pts[i] - pts[i - 1];
        if (g > 0.01 && g < 30) gaps.push(g);
      }
      if (!gaps.length) return resolve(null);
      gaps.sort((a, b) => a - b);
      // Median is robust against one odd interval in the sample.
      const median = gaps[Math.floor(gaps.length / 2)];
      resolve(Math.round(median * 100) / 100);
    });
  });
}

function optimizeForSeeking(cleanPath, opts = {}) {
  const gopSec = Math.min(10, Math.max(0.5, Number(opts.gopSeconds) || 1));
  const crf = Number.isFinite(Number(opts.crf)) ? Number(opts.crf) : 20;
  const preset = opts.preset || 'veryfast';

  return new Promise((resolve, reject) => {
    const outPath = seekOptCachePath(cleanPath);
    if (!outPath) return reject(new Error('Cannot optimize: missing file'));
    if (validCachedFile(outPath)) {
      console.log(`[SeekOpt] Cache hit: ${outPath}`);
      return resolve(outPath);
    }
    // A killed encode must never be mistaken for a finished one: write to a
    // sidecar and rename only once ffmpeg exits cleanly.
    const partPath = `${outPath}.part`;
    try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (_) {}
    try { if (fs.existsSync(partPath)) fs.unlinkSync(partPath); } catch (_) {}

    let source = cleanPath;
    let tmpPath = null;
    if (opts.remuxFirst) {
      // Normalise the container first so the encoder sees a clean MP4 stream.
      tmpPath = remuxCachePath(cleanPath);
      if (tmpPath && !fs.existsSync(tmpPath)) {
        return reject(new Error('Container not normalised yet'));
      }
      if (tmpPath) source = tmpPath;
    }

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('seek-optimize-progress', { phase: 'start' });
    }
    console.log(`[SeekOpt] ${cleanPath} -> dense keyframes every ${gopSec}s (crf ${crf}, ${preset})`);

    const gopFrames = Math.max(1, Math.round(gopSec * 30));
    const args = [
      '-y', '-hide_banner', '-loglevel', 'error',
      '-i', source,
      '-c:v', 'libx264', '-preset', preset, '-crf', String(crf),
      '-g', String(gopFrames), '-keyint_min', String(gopFrames),
      '-sc_threshold', '0', '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      '-c:a', 'aac', '-b:a', '160k',
      '-progress', 'pipe:1', '-nostats',
      // The .part suffix hides the container from ffmpeg's format guesser.
      '-f', 'mp4',
      partPath
    ];
    const proc = spawn(ffmpegExePath, args, { windowsHide: true });
    activeOptimizeProc = proc;
    let errBuf = '';
    let lastPct = -1;
    proc.stdout.on('data', (d) => {
      const txt = d.toString();
      const m = /out_time_ms=(\d+)/.exec(txt);
      if (!m) return;
      const doneMs = Math.max(0, Math.round(parseInt(m[1], 10) / 1000));
      const pct = durationHint > 0 ? Math.min(99, Math.round((doneMs / (durationHint * 1000)) * 100)) : -1;
      if (pct !== lastPct && pct >= 0 && mainWindow && !mainWindow.isDestroyed()) {
        lastPct = pct;
        mainWindow.webContents.send('seek-optimize-progress', { phase: 'progress', percent: pct });
      }
    });
    proc.stderr.on('data', (d) => { if (errBuf.length < 8000) errBuf += d.toString(); });
    proc.on('error', (err) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('seek-optimize-progress', { phase: 'error' });
      }
      reject(err);
    });
    proc.on('close', (code) => {
      if (activeOptimizeProc === proc) activeOptimizeProc = null;
      const ok = code === 0 && fs.existsSync(partPath) && fs.statSync(partPath).size > 1024;
      if (ok) {
        try {
          fs.renameSync(partPath, outPath);
        } catch (err) {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('seek-optimize-progress', { phase: 'error' });
          }
          return reject(err);
        }
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('seek-optimize-progress', { phase: 'done' });
        }
        console.log(`[SeekOpt] Done: ${outPath}`);
        resolve(outPath);
      } else {
        try { if (fs.existsSync(partPath)) fs.unlinkSync(partPath); } catch (_) {}
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('seek-optimize-progress', { phase: 'error' });
        }
        reject(new Error(errBuf || `Seek optimization failed with code ${code}`));
      }
    });
  });
}

/** Duration probe cached per file so the progress bar has a denominator. */
let durationHint = 0;
void durationHint;


/**
 * Remux unseekable containers (e.g. MPEG-TS saved as .mp4) to real MP4 + faststart.
 * Stream-copy only — ~4s for a 1.5GB file on SSD. Result is cached.
 */
function ensureSeekableRemux(cleanPath, format) {
  return new Promise((resolve, reject) => {
    const outPath = remuxCachePath(cleanPath);
    if (!outPath) return reject(new Error('Cannot remux: missing file'));
    if (fs.existsSync(outPath)) {
      try {
        if (fs.statSync(outPath).size > 1024) {
          console.log(`[Remux] Cache hit (${format}): ${outPath}`);
          return resolve(outPath);
        }
      } catch (_) {}
    }

    console.log(`[Remux] Converting ${format} → seekable MP4: ${cleanPath}`);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('remux-progress', { phase: 'start', format });
    }

    const args = [
      '-y', '-hide_banner', '-loglevel', 'error',
      '-fflags', '+genpts',
      '-i', cleanPath,
      '-c', 'copy',
      '-movflags', '+faststart',
      '-avoid_negative_ts', 'make_zero',
      outPath
    ];
    const proc = spawn(ffmpegExePath, args, { windowsHide: true });
    let errBuf = '';
    proc.stderr.on('data', (d) => { errBuf += d.toString(); });
    proc.on('error', (err) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('remux-progress', { phase: 'error' });
      }
      reject(err);
    });
    proc.on('close', (code) => {
      if (code === 0 && fs.existsSync(outPath) && fs.statSync(outPath).size > 1024) {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('remux-progress', { phase: 'done' });
        }
        console.log(`[Remux] Done: ${outPath}`);
        resolve(outPath);
      } else {
        try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (_) {}
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('remux-progress', { phase: 'error' });
        }
        reject(new Error(errBuf || `Remux failed with code ${code}`));
      }
    });
  });
}

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
// Prefer hardware decode / larger media cache when available — helps seek on big files
app.commandLine.appendSwitch('enable-features', 'PlatformHEVCDecoderSupport');
app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling');

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      
      const fileArg = commandLine.find(arg => arg.match(/\.(mp4|mkv|avi|mov|webm|m4v|wmv|flv|ogg|ogv|3gp|vob|ts|m2ts|rm|rmvb|divx|xvid|mpeg|mpg)$/i));
      if (fileArg) {
        mainWindow.webContents.executeJavaScript(`
          window.__initialVideoInfo = ${JSON.stringify(fileArg)};
          window.dispatchEvent(new Event('electron-file-opened'));
        `).catch(e => console.error(e));
        // Fallback IPC msg
        mainWindow.webContents.send('open-file', fileArg);
      }
    }
  });

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });

    initUsageTelemetry();

    // Auto-updater (only in packaged app)
    if (app.isPackaged) {
      autoUpdater.logger = console;
      autoUpdater.checkForUpdatesAndNotify();

      autoUpdater.on('checking-for-update', () => {
        console.log('Checking for update...');
      });

      autoUpdater.on('update-available', (info) => {
        console.log('Update available:', info.version);
        mainWindow?.webContents.send('update-available');
      });

      autoUpdater.on('update-not-available', (info) => {
        console.log('Update not available. Current:', info.version);
      });

      autoUpdater.on('update-downloaded', (info) => {
        console.log('Update downloaded:', info.version);
        mainWindow?.webContents.send('update-downloaded');
      });

      autoUpdater.on('error', (err) => {
        console.error('Auto-updater error:', err.message);
        mainWindow?.webContents.send('update-error', err.message);
      });
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    icon: path.join(__dirname, '../Logo Bilder/logoW-cropped-no-bg1024x1024.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.autoHideMenuBar = true;

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.on('did-finish-load', () => {
    const fileArg = process.argv.find(arg => arg.match(/\.(mp4|mkv|avi|mov|webm|m4v|wmv|flv|ogg|ogv|3gp|vob|ts|m2ts|rm|rmvb|divx|xvid|mpeg|mpg)$/i));
    if (fileArg) {
      mainWindow.webContents.executeJavaScript(`
        window.__initialVideoInfo = ${JSON.stringify(fileArg)};
        window.dispatchEvent(new Event('electron-file-opened'));
      `).catch(e => console.error(e));
      // Fallback IPC msg
      mainWindow.webContents.send('open-file', fileArg);
    }
  });

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://127.0.0.1:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

ipcMain.on('quit-app', () => {
  app.quit();
});

ipcMain.on('restart-and-install', () => {
  autoUpdater.quitAndInstall();
});

// IPTV Fetch Bridge - Bypasses CORS and Mixed Content issues
ipcMain.handle('iptv-fetch', async (event, url, options = {}) => {
  try {
    const fetchOptions = {
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        ...options.headers
      }
    };

    if (options.body) {
      fetchOptions.body = options.body;
      if (typeof options.body === 'object') {
        fetchOptions.body = JSON.stringify(options.body);
        fetchOptions.headers['Content-Type'] = 'application/json';
      }
    }

    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      // Return 404/error status to renderer so it can handle it
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error('IPTV Fetch Error:', error.message);
    throw error;
  }
});

ipcMain.handle('get-network-info', async () => {
  try {
    const interfaces = os.networkInterfaces();
    let type = 'Ethernet';
    
    // Most reliable order: check for Cellular -> Wifi -> LAN
    for (const [name, info] of Object.entries(interfaces)) {
      const active = info.some(i => !i.internal && (i.family === 'IPv4' || i.family === 'IPv6') && i.address !== '127.0.0.1' && !i.address.startsWith('169.254'));
      if (active) {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('wi-fi') || lowerName.includes('wireless') || lowerName.includes('wlan')) {
          return 'Wifi';
        }
        if (lowerName.includes('ethernet') || lowerName.includes('lan') || lowerName.includes('en0')) {
          type = 'LAN';
        }
        if (lowerName.includes('cellular') || lowerName.includes('4g') || lowerName.includes('5g') || lowerName.includes('wwan')) {
          return '4G/5G';
        }
      }
    }
    return type;
  } catch (error) {
    return 'Ethernet';
  }
});

// Helper to get video duration
async function getVideoDuration(videoPath) {
  return new Promise((resolve) => {
    const cp = exec(`"${ffmpegExePath}" -i "${videoPath}"`, (error, stdout, stderr) => {
      if (!stderr) return resolve(0);
      const match = stderr.match(/Duration: (\d\d):(\d\d):(\d\d)\.(\d\d)/);
      if (match) {
        const h = parseInt(match[1]);
        const m = parseInt(match[2]);
        const s = parseInt(match[3]);
        const hundredths = parseInt(match[4]);
        resolve(h * 3600 + m * 60 + s + hundredths / 100);
      } else {
        resolve(0);
      }
    });
  });
}

// Media Stream Server
function startStreamServer() {
  return new Promise((resolve) => {
    if (streamServer) return resolve(streamPort);

    const server = express();
    
    server.get('/stream', (req, res) => {
      const videoPath = req.query.path;
      const transcode = req.query.transcode === 'true';
      const start = req.query.start ? parseFloat(req.query.start) : 0;

      if (!videoPath || !fs.existsSync(videoPath)) {
        return res.status(404).send('File not found');
      }

      const stat = fs.statSync(videoPath);
      const fileSize = stat.size;
      const range = req.headers.range;

      const ext = path.extname(videoPath).toLowerCase();
      const needsFullTranscode = ['.vob', '.avi', '.wmv', '.flv', '.3gp', '.mpg', '.mpeg', '.ts', '.m2ts', '.mts', '.rm', '.rmvb', '.divx', '.xvid'].includes(ext);

      if (transcode || needsFullTranscode) {
        console.log(`[Stream] Transcoding ${needsFullTranscode ? 'FULL' : 'AUDIO'} from ${start}s: ${videoPath}`);

        // Kill previous transcode so rapid seeks don't stack FFmpeg processes
        if (activeTranscodeCommand) {
          try { activeTranscodeCommand.kill('SIGKILL'); } catch (_) {}
          activeTranscodeCommand = null;
        }

        res.writeHead(200, {
          'Content-Type': 'video/mp4',
          'Transfer-Encoding': 'chunked',
          'Cache-Control': 'no-store'
        });

        const command = ffmpeg(videoPath);
        activeTranscodeCommand = command;

        if (start > 0) {
          command.seekInput(start);
        }

        if (needsFullTranscode) {
          command.videoCodec('libx264')
                 .addOptions(['-preset ultrafast', '-crf 23', '-threads 0', '-pix_fmt yuv420p', '-g 48', '-keyint_min 48']);
        } else {
          command.videoCodec('copy');
        }

        command.audioCodec('aac')
          .format('matroska')
          .on('start', (cmd) => console.log('[FFmpeg] Command:', cmd))
          .on('error', (err) => {
            if (!String(err.message || '').includes('SIGKILL')) {
              console.error('[Stream Error]', err.message);
            }
          })
          .pipe(res, { end: true });

        const cleanup = () => {
          if (activeTranscodeCommand === command) activeTranscodeCommand = null;
          try { command.kill('SIGKILL'); } catch (_) {}
        };
        res.on('close', cleanup);
        res.on('error', cleanup);
      } else {
        if (range) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);

          if (isNaN(start) || start >= fileSize) {
            res.writeHead(416, {
              'Content-Range': `bytes */${fileSize}`,
              'Access-Control-Allow-Origin': '*'
            });
            return res.end();
          }

          // Larger initial window + bigger read buffer → fewer stalls on 4K/long seeks
          const CHUNK_SIZE = 64 * 1024 * 1024;
          let end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + CHUNK_SIZE - 1, fileSize - 1);
          end = Math.min(end, fileSize - 1);
          if (end < start) end = start;
          const chunksize = (end - start) + 1;
          const file = fs.createReadStream(videoPath, { start, end, highWaterMark: 2 * 1024 * 1024 });
          const mimeMap = { '.mp4': 'video/mp4', '.mkv': 'video/x-matroska', '.avi': 'video/x-msvideo', '.mov': 'video/quicktime', '.webm': 'video/webm', '.m4v': 'video/mp4' };
          const mimeType = mimeMap[path.extname(videoPath).toLowerCase()] || 'video/mp4';
          const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': mimeType,
            'Cache-Control': 'private, max-age=3600',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Range'
          };
          res.writeHead(206, head);

          res.on('close', () => {
            file.destroy();
          });
          file.on('error', () => {
            try { file.destroy(); } catch {}
            if (!res.headersSent) res.end();
          });

          file.pipe(res);
        } else {
          const mimeMap2 = { '.mp4': 'video/mp4', '.mkv': 'video/x-matroska', '.avi': 'video/x-msvideo', '.mov': 'video/quicktime', '.webm': 'video/webm', '.m4v': 'video/mp4' };
          const mimeType2 = mimeMap2[path.extname(videoPath).toLowerCase()] || 'video/mp4';
          const head = {
            'Content-Length': fileSize,
            'Content-Type': mimeType2,
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'private, max-age=3600',
            'Access-Control-Allow-Origin': '*'
          };
          res.writeHead(200, head);
          const file = fs.createReadStream(videoPath, { highWaterMark: 2 * 1024 * 1024 });
          res.on('close', () => {
            try { file.destroy(); } catch {}
          });
          file.on('error', () => {
            try { file.destroy(); } catch {}
            if (!res.headersSent) res.end();
          });
          file.pipe(res);
        }
      }
    });

    streamServer = server.listen(0, '127.0.0.1', () => {
      streamPort = streamServer.address().port;
      console.log(`🎬 Media server running on http://127.0.0.1:${streamPort}`);
      resolve(streamPort);
    });
  });
}

// Pre-start server when app is ready
app.whenReady().then(() => {
  startStreamServer();
});

ipcMain.handle('get-stream-url', async (event, filePath, transcode = false) => {
  const port = await startStreamServer();
  
  let cleanPath = resolveLocalMediaPath(filePath);
  
  const ext = path.extname(cleanPath).toLowerCase();
  const needsFullTranscode = ['.vob', '.avi', '.wmv', '.flv', '.3gp', '.mpg', '.mpeg', '.ts', '.m2ts', '.mts', '.rm', '.rmvb', '.divx', '.xvid'].includes(ext);
  let willTranscode = transcode || needsFullTranscode;

  // Detect fake extensions: e.g. MPEG-TS saved as .mp4 — Chromium freezes ~1s on every seek
  const format = await probeInputFormat(cleanPath);
  const needsRemux = !willTranscode && format && UNSEEKABLE_FORMATS.has(format);

  if (needsRemux) {
    try {
      cleanPath = await ensureSeekableRemux(cleanPath, format);
      // Remuxed file is real MP4 — play via file:// (no live transcode)
      willTranscode = false;
    } catch (err) {
      console.error('[Remux] Failed, falling back to stream remux:', err.message);
      willTranscode = true;
    }
  }

  const duration = await getVideoDuration(cleanPath);
  durationHint = duration;
  let fileSize = 0;
  try { fileSize = fs.statSync(cleanPath).size; } catch (_) {}

  // Direct file:// for seekable formats — Chromium reads disk natively.
  if (!willTranscode) {
    const url = pathToFileURL(cleanPath).href;
    return {
      url,
      duration,
      isTranscoded: false,
      localPath: cleanPath,
      fileSize,
      remuxed: needsRemux,
      format: format || null
    };
  }

  const url = `http://127.0.0.1:${port}/stream?path=${encodeURIComponent(cleanPath)}&transcode=true`;
  return {
    url,
    duration,
    isTranscoded: true,
    localPath: cleanPath,
    fileSize,
    remuxed: false,
    format: format || null
  };
});

/** Abort an in-progress seek optimization. The partial file is discarded. */
ipcMain.handle('cancel-seek-optimize', async () => {
  const proc = activeOptimizeProc;
  activeOptimizeProc = null;
  if (proc) {
    try { proc.kill('SIGKILL'); } catch (_) {}
    return true;
  }
  return false;
});

/**
 * Report how far apart keyframes are so the UI can tell whether the file is
 * worth optimizing. >2s means every seek pays a multi-hundred-ms decode.
 */ipcMain.handle('probe-seek-quality', async (event, filePath) => {
  const cleanPath = resolveLocalMediaPath(filePath);
  if (!cleanPath || !fs.existsSync(cleanPath)) return null;
  const gopSeconds = await probeKeyframeInterval(cleanPath);
  const duration = await getVideoDuration(cleanPath);
  let size = 0;
  try { size = fs.statSync(cleanPath).size; } catch (_) {}
  return { gopSeconds, duration, size, optimizeCached: validCachedFile(seekOptCachePath(cleanPath)) };
});

/** A cached file only counts if it actually decodes — partial encodes must not
 *  be served as cache hits. Probing duration is the cheapest real validation. */
function validCachedFile(p) {
  try {
    if (!fs.existsSync(p)) return false;
    if (fs.statSync(p).size <= 1024) return false;
  } catch (_) {
    return false;
  }
  return true;
}

let activeOptimize = null;
let activeOptimizeProc = null;

/** Re-encode with a dense keyframe interval so seeking is near-instant. Cached. */
ipcMain.handle('optimize-for-seeking', async (event, filePath, opts = {}) => {
  const cleanPath = resolveLocalMediaPath(filePath);
  if (!cleanPath || !fs.existsSync(cleanPath)) throw new Error('File not found');
  if (activeOptimize) return activeOptimize;

  activeOptimize = (async () => {
    let remuxFirst = false;
    const format = await probeInputFormat(cleanPath);
    if (format && UNSEEKABLE_FORMATS.has(format)) {
      try {
        await ensureSeekableRemux(cleanPath, format);
        remuxFirst = true;
      } catch (err) {
        console.error('[SeekOpt] Remux failed, encoding from source:', err.message);
      }
    }

    durationHint = await getVideoDuration(cleanPath);
    const outPath = await optimizeForSeeking(cleanPath, { ...opts, remuxFirst });
    let duration = await getVideoDuration(outPath);
    if (!(duration > 0)) {
      // Corrupt or unreadable output — drop it so the next run re-encodes.
      try { fs.unlinkSync(outPath); } catch (_) {}
      throw new Error('Optimized file is not readable');
    }
    let size = 0;
    try { size = fs.statSync(outPath).size; } catch (_) {}
    return { path: outPath, url: pathToFileURL(outPath).href, duration, size };
  })();

  try {
    return await activeOptimize;
  } finally {
    activeOptimize = null;
  }
});

/** Fast JPEG frame at timestamp for scrub preview (does not touch the <video> decoder). */ipcMain.handle('extract-seek-frame', async (event, filePath, timeSec) => {
  const cleanPath = resolveLocalMediaPath(filePath);
  if (!cleanPath || !fs.existsSync(cleanPath)) return null;

  const gen = ++frameExtractGen;
  if (activeFrameExtract) {
    try { activeFrameExtract.kill('SIGKILL'); } catch (_) {}
    activeFrameExtract = null;
  }

  return new Promise((resolve) => {
    const args = [
      '-hide_banner', '-loglevel', 'error',
      '-ss', String(Math.max(0, Number(timeSec) || 0)),
      '-i', cleanPath,
      '-frames:v', '1',
      '-an',
      '-vf', 'scale=960:-2:flags=fast_bilinear',
      '-q:v', '6',
      '-f', 'image2pipe',
      '-vcodec', 'mjpeg',
      'pipe:1'
    ];
    const proc = spawn(ffmpegExePath, args, { windowsHide: true });
    activeFrameExtract = proc;
    const chunks = [];
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      if (activeFrameExtract === proc) activeFrameExtract = null;
      resolve(result);
    };
    proc.stdout.on('data', (c) => chunks.push(c));
    proc.stderr.on('data', () => {});
    proc.on('error', () => finish(null));
    proc.on('close', () => {
      if (gen !== frameExtractGen) return finish(null);
      if (!chunks.length) return finish(null);
      finish(`data:image/jpeg;base64,${Buffer.concat(chunks).toString('base64')}`);
    });
    setTimeout(() => {
      try { proc.kill('SIGKILL'); } catch (_) {}
      if (!settled) finish(null);
    }, 2500);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  unregisterUsageTelemetry();
});
