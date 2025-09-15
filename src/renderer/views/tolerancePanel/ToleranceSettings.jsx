import React, { useState } from 'react';
import './ToleranceSettings.css';

export default function ToleranceSettings({
  initialTolerances,
  onSave,
  username
}) {
  const [tolerances, setTolerances] = useState(initialTolerances);

  const handleChange = (type, field, value) => {
    setTolerances(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      for (const type of Object.keys(tolerances)) {
        const { value, color } = tolerances[type];
        const parsedVal = parseFloat(value);

        if (isNaN(parsedVal)) {
          alert(`Podaj poprawną liczbę dla tolerancji ${type}`);
          return;
        }

        // zapis wartości tolerancji
        await window.electronAPI.invoke('save-parameter', {
          username,
          parameter: `tolerance_${type}`,
          oldValue: initialTolerances[type].value,
          newValue: parsedVal
        });

        // zapis koloru
        await window.electronAPI.invoke('save-parameter', {
          username,
          parameter: `color_${type}`,
          oldValue: initialTolerances[type].color,
          newValue: color
        });
      }

      onSave(tolerances);
      alert('Tolerancje zapisane');
    } catch (err) {
      alert('Błąd zapisu: ' + err.message);
    }
  };

  return (
    <div className="tolerance-settings-card">
      <h3>Ustawienia tolerancji</h3>

      {Object.keys(tolerances).map((type) => (
        <div key={type} className="tolerance-group">
          <h4>{type}</h4>
          <div className="param-row">
            <label>Tolerancja (px):</label>
            <input
              type="number"
              step="0.1"
              value={tolerances[type].value}
              onChange={(e) => handleChange(type, 'value', e.target.value)}
            />
          </div>
          <div className="param-row">
            <label>Kolor obrysu:</label>
            <input
              type="color"
              value={tolerances[type].color}
              onChange={(e) => handleChange(type, 'color', e.target.value)}
            />
          </div>
        </div>
      ))}

      <button className="save-button" onClick={handleSave}>Zapisz</button>
    </div>
  );
}
