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
import './ParameterSettings.css';
export default function ParameterSettings({ tolerance, lineWidthModel, lineWidthReal, outlierPointSize, onToleranceChange, onLineWidthModelChange, onLineWidthRealChange, onOutlierPointSizeChange, username }) {
    const [localTol, setLocalTol] = useState(tolerance);
    const [localLineModel, setLocalLineModel] = useState(lineWidthModel);
    const [localLineReal, setLocalLineReal] = useState(lineWidthReal);
    const [localOutlierSize, setLocalOutlierSize] = useState(outlierPointSize);
    const [message, setMessage] = useState(null);
    const handleSave = () => __awaiter(this, void 0, void 0, function* () {
        try {
            const parsedTol = parseFloat(localTol);
            const parsedModel = parseFloat(localLineModel);
            const parsedReal = parseFloat(localLineReal);
            const parsedOutlier = parseFloat(localOutlierSize);
            if ([parsedTol, parsedModel, parsedReal, parsedOutlier].some(isNaN)) {
                alert("Podaj poprawne liczby dla wszystkich parametrów.");
                return;
            }
            yield window.electronAPI.invoke('save-parameter', {
                username, parameter: 'tolerance', oldValue: tolerance, newValue: parsedTol
            });
            onToleranceChange(parsedTol);
            yield window.electronAPI.invoke('save-parameter', {
                username, parameter: 'lineWidthModel', oldValue: lineWidthModel, newValue: parsedModel
            });
            onLineWidthModelChange(parsedModel);
            yield window.electronAPI.invoke('save-parameter', {
                username, parameter: 'lineWidthReal', oldValue: lineWidthReal, newValue: parsedReal
            });
            onLineWidthRealChange(parsedReal);
            yield window.electronAPI.invoke('save-parameter', {
                username, parameter: 'outlierPointSize', oldValue: outlierPointSize, newValue: parsedOutlier
            });
            onOutlierPointSizeChange(parsedOutlier);
            setMessage('Parametry zapisane');
            setTimeout(() => setMessage(null), 1500);
        }
        catch (err) {
            alert('Błąd zapisu parametru: ' + err.message);
        }
    });
    return (React.createElement("div", { className: "parameter-settings-card" },
        React.createElement("h3", null, "Zmiana parametr\u00F3w"),
        React.createElement("div", { className: "param-row" },
            React.createElement("label", null, "Tolerancja (px):"),
            React.createElement("input", { type: "number", value: localTol, step: "0.1", onChange: (e) => setLocalTol(e.target.value) })),
        React.createElement("div", { className: "param-row" },
            React.createElement("label", null, "Grubo\u015B\u0107 linii modelu:"),
            React.createElement("input", { type: "number", value: localLineModel, step: "0.5", onChange: (e) => setLocalLineModel(e.target.value) })),
        React.createElement("div", { className: "param-row" },
            React.createElement("label", null, "Grubo\u015B\u0107 linii rzeczywistych:"),
            React.createElement("input", { type: "number", value: localLineReal, step: "0.5", onChange: (e) => setLocalLineReal(e.target.value) })),
        React.createElement("div", { className: "param-row" },
            React.createElement("label", null, "Rozmiar punkt\u00F3w poza tolerancj\u0105:"),
            React.createElement("input", { type: "number", value: localOutlierSize, step: "0.5", onChange: (e) => setLocalOutlierSize(e.target.value) })),
        React.createElement("button", { className: "save-button", onClick: handleSave }, "Zapisz"),
        message && React.createElement("div", { className: "save-message" }, message)));
}
