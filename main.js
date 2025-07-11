const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./src/main/database');

function createWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'src/preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, 'dist/index.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('login-user', async (event, { username, password }) => {
  return new Promise((resolve, reject) => {
    db.getUser(username, password, (err, row) => {
      if (err) return reject(err);
      if (!row) {
        db.addLog(username, 'login_attempt', 'Nieudane logowanie');
        return resolve({ success: false, message: 'Invalid credentials' });
      }
      db.addLog(username, 'login_success', 'Pomyślne logowanie');
      resolve({ success: true, user: { id: row.id, username: row.username, role: row.role } });
    });
  });
});

ipcMain.handle('logout-user', async (event, { username }) => {
  return new Promise((resolve, reject) => {
    db.addLog(username, 'logout', 'Wylogowanie użytkownika', (err) => {
      if (err) {
        console.error('Błąd zapisu logu wylogowania:', err);
        return reject(err);
      }
      resolve({ success: true });
    });
  });
});


ipcMain.handle('get-marker', async (event, number) => {
  return new Promise((resolve, reject) => {
    db.getMarker(number, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
});

ipcMain.handle('search-markers', async (event, searchTerm) => {
  return new Promise((resolve, reject) => {
    // Przykład wyszukiwania markerów zawierających searchTerm
    db.all(
      "SELECT * FROM markers WHERE marker_number LIKE ? LIMIT 10",
      [`%${searchTerm}%`],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
});

ipcMain.handle('get-elements-by-marker', async (event, marker_number) => {
  return new Promise((resolve, reject) => {
    db.getElementsByMarker(marker_number, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

// IPC do pobierania logów
ipcMain.handle('get-logs', async () => {
  return new Promise((resolve, reject) => {
    db.getLogs((err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

ipcMain.handle('log-action', async (event, { username, action, details }) => {
  return new Promise((resolve, reject) => {
    db.addLog(username, action, details, (err) => {
      if (err) {
        console.error('Błąd zapisu logu:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
});


