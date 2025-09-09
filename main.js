const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const db = require('./src/main/database');
const cvApi = require('./src/api/ICvApi.ts');

const dataRoot = path.join(__dirname, 'src', 'data');

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
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

// ------------------ Logowanie / użytkownicy ------------------

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
      if (err) return reject(err);
      resolve({ success: true });
    });
  });
});

// ------------------ Markery i elementy ------------------

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

// ------------------ Logi ------------------

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
      if (err) reject(err);
      else resolve({ id: this.lastID });
    });
  });
});

// ------------------ Użytkownicy ------------------

ipcMain.handle('add-user', async (event, userData) => {
  const { username, password, role } = userData;
  if (!username || !password || !role) return { success: false, message: 'Wszystkie pola są wymagane' };
  return new Promise((resolve, reject) => {
    db.addUser({ username, password, role }, (err) => {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) resolve({ success: false, message: 'Użytkownik już istnieje' });
        else reject(err);
      } else resolve({ success: true });
    });
  });
});

ipcMain.handle('update-user-role', async (event, { username, newRole }) => {
  if (!username || !newRole) return { success: false, message: 'Niepoprawne dane' };
  return new Promise((resolve, reject) => {
    db.updateUserRole(username, newRole, (err) => {
      if (err) reject(err);
      else resolve({ success: true });
    });
  });
});

ipcMain.handle('get-all-users', async () => {
  return new Promise((resolve, reject) => {
    db.getAllUsers((err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

// ------------------ Parametry ------------------

ipcMain.handle('save-parameter', async (event, { username, parameter, oldValue, newValue }) => {
  return new Promise((resolve, reject) => {
    db.saveParameter(parameter, newValue, (err) => {
      if (err) reject(err);
      else {
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

// ------------------ Komentarze zatwierdzeń ------------------

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

// ------------------ Foldery i pliki ------------------

ipcMain.handle('get-template-folders', async () => {
  try {
    const folders = fs.readdirSync(dataRoot, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    return folders;
  } catch (error) {
    console.error(error);
    return [];
  }
});

ipcMain.handle('get-elements-from-folder', async (event, folderName) => {
  const folderPath = path.join(dataRoot, folderName);
  try {
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.json'));
    return files.map(file => ({
      id: file,
      name: file.replace('.json', ''),
      data: JSON.parse(fs.readFileSync(path.join(folderPath, file), 'utf-8'))
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
});

// ------------------ API CV ------------------

ipcMain.handle('take-calibration-photos', async () => cvApi.takeCalibrationPhotos());
ipcMain.handle('get-calibration-info', async () => cvApi.getCalibrationInfo());
ipcMain.handle('take-measurement-photos', async () => cvApi.takeMeasurementPhotos());
ipcMain.handle('detect-elements', async () => cvApi.detectElements());
ipcMain.handle('get-detected-elements', async () => cvApi.getDetectedElements());
ipcMain.handle('measure-element', async (event, { elementI, shapeId, thickness }) =>
  cvApi.measureElement(elementI, shapeId, thickness)
);
ipcMain.handle('get-measured-element', async (event, { elementI }) => cvApi.getMeasuredElement(elementI));
ipcMain.handle('clear-measurement-data', async () => cvApi.clearMeasurementData());

// ------------------ Zapis PDF ------------------

ipcMain.handle('save-pdf', async (event, base64, defaultName) => {
  console.log('save-pdf called', { defaultName, base64Length: base64?.length });
  try {
    const { canceled, filePath } = await dialog.showSaveDialog({
      defaultPath: defaultName,
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
    });

    if (canceled || !filePath) return { success: false };

    // zapisujemy Base64 jako PDF
    fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
    return { success: true, path: filePath };
  } catch (err) {
    console.error('Błąd zapisu PDF:', err);
    return { success: false, error: err.message };
  }
});
