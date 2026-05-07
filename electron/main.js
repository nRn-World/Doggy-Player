import { app, BrowserWindow, ipcMain } from 'electron';
import os from 'os';
import pkg from 'electron-updater';
const { autoUpdater } = pkg;
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

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
    icon: path.join(__dirname, '../Logo Bilder/logoW-cropped-no-bg.png'),
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
      const needsFullTranscode = ['.vob', '.avi', '.wmv', '.flv', '.3gp', '.mpg', '.mpeg', '.ts', '.m2ts', '.rm', '.rmvb', '.divx', '.xvid'].includes(ext);

      if (transcode || needsFullTranscode) {
        console.log(`[Stream] Transcoding ${needsFullTranscode ? 'FULL' : 'AUDIO'} from ${start}s: ${videoPath}`);
        res.writeHead(200, {
          'Content-Type': 'video/mp4',
          'Transfer-Encoding': 'chunked'
        });

        const command = ffmpeg(videoPath);
        
        if (start > 0) {
          command.seekInput(start);
        }

        if (needsFullTranscode) {
          command.videoCodec('libx264')
                 .addOptions(['-preset ultrafast', '-crf 23', '-threads 0', '-pix_fmt yuv420p']);
        } else {
          command.videoCodec('copy');
        }

        command.audioCodec('aac')
          .format('matroska')
          .on('start', (cmd) => console.log('[FFmpeg] Command:', cmd))
          .on('error', (err) => {
            console.error('[Stream Error]', err.message);
          })
          .pipe(res, { end: true });

        res.on('close', () => {
          try { command.kill(); } catch (e) {}
        });
      } else {
        if (range) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          const chunksize = (end - start) + 1;
          const file = fs.createReadStream(videoPath, { start, end });
          const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
          };
          res.writeHead(206, head);
          file.pipe(res);
        } else {
          const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
          };
          res.writeHead(200, head);
          fs.createReadStream(videoPath).pipe(res);
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
  
  const duration = await getVideoDuration(cleanPath);
  const url = `http://127.0.0.1:${port}/stream?path=${encodeURIComponent(cleanPath)}${transcode ? '&transcode=true' : ''}`;
  
  return { url, duration };
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
