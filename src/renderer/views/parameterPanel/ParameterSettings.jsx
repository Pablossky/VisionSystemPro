import React, { useState } from 'react';
import './ParameterSettings.css';

export default function ParameterSettings({
  lineWidthModel,
  lineWidthReal,
  outlierPointSize,
  onLineWidthModelChange,
  onLineWidthRealChange,
  onOutlierPointSizeChange,
  username
}) {
  const [localLineModel, setLocalLineModel] = useState(lineWidthModel);
  const [localLineReal, setLocalLineReal] = useState(lineWidthReal);
  const [localOutlierSize, setLocalOutlierSize] = useState(outlierPointSize);
  const [message, setMessage] = useState(null);

  const handleSave = async () => {
    try {
      const parsedModel = parseFloat(localLineModel);
      const parsedReal = parseFloat(localLineReal);
      const parsedOutlier = parseFloat(localOutlierSize);

      if ([parsedModel, parsedReal, parsedOutlier].some(isNaN)) {
        alert("Podaj poprawne liczby dla wszystkich parametrów.");
        return;
      }

      await window.electronAPI.invoke('save-parameter', {
        username, parameter: 'lineWidthModel', oldValue: lineWidthModel, newValue: parsedModel
      });
      onLineWidthModelChange(parsedModel);

      await window.electronAPI.invoke('save-parameter', {
        username, parameter: 'lineWidthReal', oldValue: lineWidthReal, newValue: parsedReal
      });
      onLineWidthRealChange(parsedReal);

      await window.electronAPI.invoke('save-parameter', {
        username, parameter: 'outlierPointSize', oldValue: outlierPointSize, newValue: parsedOutlier
      });
      onOutlierPointSizeChange(parsedOutlier);

      setMessage('Parametry zapisane');
      setTimeout(() => setMessage(null), 1500);
    } catch (err) {
      alert('Błąd zapisu parametru: ' + err.message);
    }
  };

  return (
    <div className="parameter-settings-card">
      <h3>Zmiana parametrów</h3>
      <div className="param-row">
        <label>Grubość linii modelu:</label>
        <input
          type="number"
          value={localLineModel}
          step="0.5"
          onChange={(e) => setLocalLineModel(e.target.value)}
        />
      </div>
      <div className="param-row">
        <label>Grubość linii rzeczywistych:</label>
        <input
          type="number"
          value={localLineReal}
          step="0.5"
          onChange={(e) => setLocalLineReal(e.target.value)}
        />
      </div>
      <div className="param-row">
        <label>Rozmiar punktów poza tolerancją:</label>
        <input
          type="number"
          value={localOutlierSize}
          step="0.5"
          onChange={(e) => setLocalOutlierSize(e.target.value)}
        />
      </div>
      <button className="save-button" onClick={handleSave}>Zapisz</button>
      {message && <div className="save-message">{message}</div>}
    </div>
  );
}
