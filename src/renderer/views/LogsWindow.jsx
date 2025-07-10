import React, { useEffect, useState } from 'react';

export default function LogsWindow({ onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    window.electronAPI.getLogs()
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Błąd podczas pobierania logów');
        setLoading(false);
      });
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', color: 'white',
      padding: 20, overflowY: 'scroll', zIndex: 1000
    }}>
      <button onClick={onClose} style={{ marginBottom: 10 }}>Zamknij</button>
      <h2>Logi systemowe</h2>
      {loading && <p>Ładowanie logów...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {logs.map(log => (
          <li key={log.id}>
            <strong>[{new Date(log.timestamp).toLocaleString()}]</strong> {log.action} — {log.details}
          </li>
        ))}
      </ul>
    </div>
  );
}
