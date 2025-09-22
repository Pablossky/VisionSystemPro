import React, { useState } from 'react';
import './GeneralSettings.css'; // możesz dodać własny styl

export default function GeneralSettings({
  workspaceColor,
  setWorkspaceColor,
  fontSize,
  setFontSize,
  username,
  onRefreshViewer
}) {
  const [localColor, setLocalColor] = useState(workspaceColor);
  const [localFontSize, setLocalFontSize] = useState(fontSize);
  const [message, setMessage] = useState(null);

  const handleSave = async () => {
    try {
      // zapis koloru
      await window.electronAPI.invoke('save-parameter', {
        username,
        parameter: 'workspaceColor',
        oldValue: workspaceColor,
        newValue: localColor
      });
      setWorkspaceColor(localColor);

      // zapis rozmiaru czcionki
      const parsedFont = parseInt(localFontSize);
      if (isNaN(parsedFont) || parsedFont < 8 || parsedFont > 36) {
        alert('Podaj poprawną wartość czcionki (8-36)');
        return;
      }

      await window.electronAPI.invoke('save-parameter', {
        username,
        parameter: 'fontSize',
        oldValue: fontSize,
        newValue: parsedFont
      });
      setFontSize(parsedFont);

      setMessage('Ustawienia zapisane!');
      setTimeout(() => setMessage(null), 1500);

      // odświeżenie ContourViewer
      if (onRefreshViewer) {
        onRefreshViewer();
      }
    } catch (err) {
      alert('Błąd zapisu: ' + err.message);
    }
  };

  return (
    <div className="general-settings-card">
      <h3>Ustawienia ogólne</h3>

      <div className="param-row">
        <label>Kolor tła obszaru roboczego:</label>
        <input
          type="color"
          value={localColor}
          onChange={e => setLocalColor(e.target.value)}
        />
      </div>

      <div className="param-row">
        <label>Wielkość czcionki (px):</label>
        <input
          type="number"
          min={8}
          max={36}
          value={localFontSize}
          onChange={e => setLocalFontSize(e.target.value)}
        />
      </div>

      <button className="save-button" onClick={handleSave}>Zapisz</button>
      {message && <div className="save-message">{message}</div>}
    </div>
  );
}
