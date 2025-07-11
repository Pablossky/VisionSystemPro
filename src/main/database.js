const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'vision-data.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS markers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      marker_number TEXT UNIQUE,
      drawing_path TEXT,
      tolerance REAL,
      material TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('programmer', 'service', 'admin', 'operator')) NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS elements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      marker_number TEXT,
      element_name TEXT,
      description TEXT,
      FOREIGN KEY(marker_number) REFERENCES markers(marker_number)
    )
  `);

  db.run(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user TEXT,
    action TEXT,
    details TEXT
  )
`);

  // Dodajemy użytkowników tylko jeśli tabela jest pusta
  db.get('SELECT COUNT(*) AS count FROM users', (err, row) => {
    if (!err && row.count === 0) {
      db.run(`
        INSERT INTO users (username, password, role) VALUES
        ('jan', '1234', 'operator'),
        ('anna', '123', 'admin'),
        ('pawel', '1', 'programmer')
      `);
    }
  });

  // Dodajemy testowe markery tylko jeśli tabela jest pusta
  db.get('SELECT COUNT(*) AS count FROM markers', (err, row) => {
    if (!err && row.count === 0) {
      const stmt = db.prepare("INSERT INTO markers (marker_number, drawing_path, tolerance, material) VALUES (?, ?, ?, ?)");
      stmt.run('MKR001', 'path/to/drawing1.dxf', 0.05, 'steel');
      stmt.run('MKR002', 'path/to/drawing2.dxf', 0.1, 'aluminum');
      stmt.run('MKR003', 'path/to/drawing3.dxf', 0.02, 'plastic');
      stmt.finalize();
    }
  });

  // Dodajemy testowe elementy tylko jeśli tabela jest pusta
  db.get('SELECT COUNT(*) AS count FROM elements', (err, row) => {
    if (!err && row.count === 0) {
      const stmt = db.prepare("INSERT INTO elements (marker_number, element_name, description) VALUES (?, ?, ?)");
      const elementsData = [
        ['MKR001', 'Element 1', 'Opis elementu 1'],
        ['MKR001', 'Element 2', 'Opis elementu 2'],
        ['MKR001', 'Element 3', 'Opis elementu 3'],
        ['MKR002', 'Element 4', 'Opis elementu 4'],
        ['MKR002', 'Element 5', 'Opis elementu 5'],
        ['MKR002', 'Element 6', 'Opis elementu 6'],
        ['MKR003', 'Element 7', 'Opis elementu 7'],
        ['MKR003', 'Element 8', 'Opis elementu 8'],
        ['MKR003', 'Element 9', 'Opis elementu 9'],
        ['MKR003', 'Element 10', 'Opis elementu 10'],
      ];
      elementsData.forEach(([marker, name, desc]) => {
        stmt.run(marker, name, desc);
      });
      stmt.finalize();
    }
  });
});


// Funkcja do dodawania logu
function addLog(user, action, details = '') {
  const sql = `INSERT INTO logs (user, action, details) VALUES (?, ?, ?)`;
  db.run(sql, [user, action, details], (err) => {
    if (err) {
      console.error('Błąd zapisu logu:', err);
    }
  });
}


// Funkcja do pobierania logów (ostatnie 100 wpisów)
function getLogs(callback) {
  db.all(
    "SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100",
    callback
  );
}

function getAllUsers(callback) {
  db.all('SELECT id, username, role FROM users', callback);
}

function addUser({ username, password, role }, callback) {
  const sql = `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`;
  db.run(sql, [username, password, role], callback);
}

function updateUserRole(username, newRole, callback) {
  const sql = `UPDATE users SET role = ? WHERE username = ?`;
  db.run(sql, [newRole, username], callback);
}



module.exports = {
  getMarker: (number, callback) => {
    db.get("SELECT * FROM markers WHERE marker_number = ?", [number], callback);
  },

  insertMarker: (data, callback) => {
    db.run(
      "INSERT INTO markers (marker_number, drawing_path, tolerance, material) VALUES (?, ?, ?, ?)",
      [data.marker_number, data.drawing_path, data.tolerance, data.material],
      callback
    );
  },

  getUser: (username, password, callback) => {
    db.get(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password],
      callback
    );
  },

  getElementsByMarker: (marker_number, callback) => {
    db.all(
      'SELECT * FROM elements WHERE marker_number = ?',
      [marker_number],
      callback
    );
  },

  getAllUsers,
  addUser,
  updateUserRole,
  addLog,
  getLogs,
};
