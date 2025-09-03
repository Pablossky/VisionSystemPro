const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const db = require('./src/main/database');
const cvApi = require('./src/api/ICvApi.ts'); 

const dataRoot = path.join(__dirname, 'src', 'data');

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,          // początkowa szerokość
    height: 1080,         // początkowa wysokość
    fullscreen: true, 
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
        db.addLog(username, 'Próba logowania', 'Nieudane logowanie');
        return resolve({ success: false, message: 'Invalid credentials' });
      }
      db.addLog(username, 'Pomyślne logowanie', 'Pomyślne logowanie');
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

ipcMain.handle('log-action', async (_event, { username, action, details, scanData, related_log_id }) => {
  return new Promise((resolve, reject) => {
    db.addLog(username, action, details, scanData, related_log_id, function(err) {
      if (err) {
        console.error('Błąd zapisu logu:', err);
        reject(err);
      } else {
        resolve({ id: this.lastID });
      }
    });
  });
});

ipcMain.handle('add-user', async (event, userData) => {
  const { username, password, role } = userData;
  if (!username || !password || !role) {
    return { success: false, message: 'Wszystkie pola są wymagane' };
  }
  return new Promise((resolve, reject) => {
    db.addUser({ username, password, role }, (err) => {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          resolve({ success: false, message: 'Użytkownik już istnieje' });
        } else {
          console.error('Błąd dodawania użytkownika:', err);
          reject(err);
        }
      } else {
        resolve({ success: true });
      }
    });
  });
});

ipcMain.handle('update-user-role', async (event, { username, newRole }) => {
  if (!username || !newRole) {
    return { success: false, message: 'Niepoprawne dane' };
  }
  return new Promise((resolve, reject) => {
    db.updateUserRole(username, newRole, (err) => {
      if (err) {
        console.error('Błąd aktualizacji roli:', err);
        reject(err);
      } else {
        resolve({ success: true });
      }
    });
  });
});

ipcMain.handle('get-all-users', async () => {
  return new Promise((resolve, reject) => {
    db.getAllUsers((err, rows) => {
      if (err) {
        console.error('Błąd pobierania użytkowników:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
});


ipcMain.handle('save-parameter', async (event, { username, parameter, oldValue, newValue }) => {
  return new Promise((resolve, reject) => {
    db.saveParameter(parameter, newValue, (err) => {
      if (err) {
        console.error('Błąd zapisu parametru:', err);
        reject(err);
      } else {
        // Logujemy zmianę
        db.addLog(username, 'Zmiana parametru', `Zmiana parametru "${parameter}": z "${oldValue}" na "${newValue}"`);
        resolve();
      }
    });
  });
});

ipcMain.handle('get-parameter', async (event, parameter) => {
  return new Promise((resolve, reject) => {
    db.getParameter(parameter, (err, row) => {
      if (err) reject(err);
      else resolve(row ? row.value : null);
    });
  });
});

ipcMain.handle('get-approval-comments', async () => {
  return new Promise((resolve, reject) => {
    db.getApprovalComments((err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

ipcMain.handle('add-approval-comment', async (e, text) => {
  return new Promise((resolve, reject) => {
    db.addApprovalComment(text, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
});

ipcMain.handle('delete-approval-comment', async (e, id) => {
  return new Promise((resolve, reject) => {
    db.deleteApprovalComment(id, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
});

ipcMain.handle('get-template-folders', async () => {
  try {
    const folders = fs.readdirSync(dataRoot, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    return folders;
  } catch (error) {
    console.error('Błąd przy pobieraniu folderów:', error);
    return [];
  }
});


ipcMain.handle('get-elements-from-folder', async (event, folderName) => {
  const folderPath = path.join(dataRoot, folderName);
  try {
    const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.json'));
    const elements = [];

    for (const file of files) {
      const fullPath = path.join(folderPath, file);
      const json = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
      elements.push({
        id: file,
        name: file.replace('.json', ''),
        data: json,
      });
    }

    return elements;
  } catch (error) {
    console.error(`Błąd przy pobieraniu plików z folderu ${folderName}:`, error);
    return [];
  }
});

//----------------API------------------

ipcMain.handle('take-calibration-photos', async () => {
  return await cvApi.takeCalibrationPhotos();
});

ipcMain.handle('get-calibration-info', async () => {
  return await cvApi.getCalibrationInfo();
});

ipcMain.handle('take-measurement-photos', async () => {
  return await cvApi.takeMeasurementPhotos();
});

ipcMain.handle('detect-elements', async () => {
  return await cvApi.detectElements();
});

ipcMain.handle('get-detected-elements', async () => {
  return await cvApi.getDetectedElements();
});

ipcMain.handle('measure-element', async (event, { elementI, shapeId, thickness }) => {
  return await cvApi.measureElement(elementI, shapeId, thickness);
});

ipcMain.handle('get-measured-element', async (event, { elementI }) => {
  return await cvApi.getMeasuredElement(elementI);
});

ipcMain.handle('clear-measurement-data', async () => {
  return await cvApi.clearMeasurementData();
});