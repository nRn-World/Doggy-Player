import { app, BrowserWindow, ipcMain } from 'electron';
import os from 'os';
import pkg from 'electron-updater';
const { autoUpdater } = pkg;
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import express from 'express';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { exec } from 'child_process';

process.env.UV_THREADPOOL_SIZE = '64';

/** Active FFmpeg pipe per response — kill previous on new seek to avoid decoder pile-up */
let activeTranscodeCommand = null;

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
  
  let cleanPath = filePath;
  if (cleanPath.startsWith('file:///')) cleanPath = cleanPath.slice(8);
  else if (cleanPath.startsWith('file://')) cleanPath = cleanPath.slice(7);
  if (process.platform === 'win32') {
    try { cleanPath = decodeURIComponent(cleanPath); } catch(e) {}
    cleanPath = cleanPath.replace(/\//g, '\\');
  }
  
  const ext = path.extname(cleanPath).toLowerCase();
  const needsFullTranscode = ['.vob', '.avi', '.wmv', '.flv', '.3gp', '.mpg', '.mpeg', '.ts', '.m2ts', '.mts', '.rm', '.rmvb', '.divx', '.xvid'].includes(ext);
  const willTranscode = transcode || needsFullTranscode;

  const duration = await getVideoDuration(cleanPath);

  // Direct file:// for seekable formats — Chromium reads disk natively (far smoother than HTTP Range).
  // Keep local HTTP+FFmpeg only when remux/transcode is required.
  if (!willTranscode) {
    const url = pathToFileURL(cleanPath).href;
    return { url, duration, isTranscoded: false };
  }

  const url = `http://127.0.0.1:${port}/stream?path=${encodeURIComponent(cleanPath)}&transcode=true`;
  return { url, duration, isTranscoded: true };
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
