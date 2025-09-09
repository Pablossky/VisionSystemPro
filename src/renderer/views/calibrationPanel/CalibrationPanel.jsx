import React, { useState } from 'react';
import './CalibrationPanel.css';

export default function CalibrationPanel({ onClose }) {
  const [calibrationInfo, setCalibrationInfo] = useState(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [error, setError] = useState('');

  const handleStartCalibration = async () => {
    setError('');
    setIsCalibrating(true);
    setCalibrationInfo(null);

    try {
      const canvas = document.getElementById('calibration-canvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#222'; // ciemne tło zamiast bieli
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Kalibracja...', canvas.width / 2, canvas.height / 2);
      }

      await window.electronAPI.takeCalibrationPhotos();

      const info = await window.electronAPI.getCalibrationInfo();
      setCalibrationInfo(info.calibrationInfo || null);
    } catch (err) {
      console.error('Błąd podczas kalibracji:', err);
      setError('Nie udało się przeprowadzić kalibracji');
    } finally {
      setIsCalibrating(false);
    }
  };

  return (
    <div className="calibration-overlay">
      <canvas id="calibration-canvas" width={800} height={600} />

      <div className="calibration-controls">
        <h2>Kalibracja systemu</h2>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button
          onClick={handleStartCalibration}
          disabled={isCalibrating}
        >
          {isCalibrating ? 'Kalibracja w toku...' : 'Uruchom kalibrację'}
        </button>

        {/* Ten przycisk teraz wywołuje funkcję onClose przekazaną z MainMenu */}
        <button onClick={onClose} style={{ marginLeft: 10 }}>
          Zamknij / Powrót do menu
        </button>

        {calibrationInfo && (
          <div className="calibration-info">
            <h3>Informacje o kalibracji:</h3>
            <pre>{JSON.stringify(calibrationInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
