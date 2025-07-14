import React, { useState } from 'react';

export default function ParameterSettings({ tolerance, onToleranceChange, username }) {
  const [localTol, setLocalTol] = useState(tolerance);
  const [message, setMessage] = useState(null);

  const handleSave = async () => {
    const parsed = parseFloat(localTol);
    if (isNaN(parsed)) {
      alert("Podaj poprawną liczbę.");
      return;
    }
    try {
      await window.electronAPI.invoke('save-parameter', {
        username,
        parameter: 'tolerance',
        oldValue: tolerance,
        newValue: parsed,
      });
      onToleranceChange(parsed);  // aktualizacja w rodzicu
      setMessage('Parametry zapisane'); // pokaż komunikat

      setTimeout(() => {
        setMessage(null); // ukryj po 1.5s
      }, 1500);
    } catch (err) {
      alert('Błąd zapisu parametru: ' + err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Zmiana parametrów</h3>
      <label>
        Tolerancja (px):
        <input
          type="number"
          value={localTol}
          step="0.1"
          onChange={(e) => setLocalTol(e.target.value)}
          style={{ marginLeft: 10 }}
        />
      </label>
      <button onClick={handleSave} style={{ marginLeft: 10 }}>Zapisz</button>
      {message && <div style={{ marginTop: 10, color: 'green' }}>{message}</div>}
    </div>
  );
}
