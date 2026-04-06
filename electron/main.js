import { app, BrowserWindow, ipcMain } from 'electron';
import pkg from 'electron-updater';
const { autoUpdater } = pkg;
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      
      const fileArg = commandLine.find(arg => arg.match(/\.(mp4|mkv|avi|mov|webm)$/i));
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
    const fileArg = process.argv.find(arg => arg.match(/\.(mp4|mkv|avi|mov|webm)$/i));
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
