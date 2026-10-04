const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let pythonServerProc = null;
const SERVER_PORT = 52400;

function startBackendServer() {
  const pythonScript = path.join(__dirname, 'desktop_server.py');
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

  pythonServerProc = spawn(pythonCmd, [pythonScript, '--port', String(SERVER_PORT)], {
    cwd: __dirname,
    stdio: 'ignore'
  });

  pythonServerProc.on('error', (err) => {
    console.warn('[Electron] Failed to spawn Python backend:', err.message);
  });
}

function createWindow() {
  startBackendServer();

  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#07090e',
    title: 'Agentic Essence — Autonomous Cyberdeck Console',
    icon: path.join(__dirname, 'src', 'www', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    autoHideMenuBar: true
  });

  // Load the cyberdeck UI
  const indexPath = path.join(__dirname, 'src', 'www', 'index.html');
  mainWindow.loadFile(indexPath);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  if (pythonServerProc) {
    try {
      pythonServerProc.kill();
    } catch (e) {}
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
