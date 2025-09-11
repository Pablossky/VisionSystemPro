var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { useState } from 'react';
import './CalibrationPanel.css';
import cvApi from '../api/dist/cvApiService.js'; // skompilowany JS z TS

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
            await cvApi.takeCalibrationPhotos();
            const info = await cvApi.getCalibrationInfo();
            setCalibrationInfo(info.calibrationInfo || null);
            setCalibrationInfo(info.calibrationInfo || null);
        }
        catch (err) {
            console.error('Błąd podczas kalibracji:', err);
            setError('Nie udało się przeprowadzić kalibracji');
        }
        finally {
            setIsCalibrating(false);
        }
    };
    return (React.createElement("div", { className: "calibration-overlay" },
        React.createElement("canvas", { id: "calibration-canvas", width: 800, height: 600 }),
        React.createElement("div", { className: "calibration-controls" },
            React.createElement("h2", null, "Kalibracja systemu"),
            error && React.createElement("p", { style: { color: 'red' } }, error),
            React.createElement("button", { onClick: handleStartCalibration, disabled: isCalibrating }, isCalibrating ? 'Kalibracja w toku...' : 'Uruchom kalibrację'),
            React.createElement("button", { onClick: onClose, style: { marginLeft: 10 } }, "Zamknij / Powr\u00F3t do menu"),
            calibrationInfo && (React.createElement("div", { className: "calibration-info" },
                React.createElement("h3", null, "Informacje o kalibracji:"),
                React.createElement("pre", null, JSON.stringify(calibrationInfo, null, 2)))))));
}
