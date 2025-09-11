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
import Select from 'react-select';
import ShapeAccuracyCalculator from './../components/ShapeAccuracyCalculator';
import ContourData from './../components/ContourData';
import cvApi from '../../api/CvApiService'; // Twój nowy ICvApi wrapper
import markerElements from '../../data/data';
export default function ControlPanel({ onStartScan, user }) {
    const [markerNumber, setMarkerNumber] = useState('');
    const [elements, setElements] = useState([]);
    const [selectedElements, setSelectedElements] = useState(new Set());
    const [error, setError] = useState('');
    const [scanConfirmed, setScanConfirmed] = useState(null); // null | 'approved' | 'rejected'
    const [comment, setComment] = useState('');
    const markerOptions = Object.keys(markerElements).map((m) => ({
        value: m,
        label: `Marker ${m}`
    }));
    const handleLoadElements = () => __awaiter(this, void 0, void 0, function* () {
        setError('');
        setElements([]);
        setSelectedElements(new Set());
        setScanConfirmed(null);
        setComment('');
        try {
            // 🔹 1. Zrób zdjęcia pomiarowe
            yield cvApi.takeMeasurementPhotos();
            // 🔹 2. Wykryj elementy
            yield cvApi.detectElements();
            // 🔹 3. Pobierz wykryte elementy
            const { detectedElements } = yield cvApi.getDetectedElements();
            if (!detectedElements || detectedElements.length === 0) {
                setError('Nie wykryto żadnych elementów dla tego markera');
                return;
            }
            // 🔹 4. Mapowanie elementów do lokalnego formatu
            const calculator = new ShapeAccuracyCalculator(); // jeśli potrzebujesz tolerancji możesz przekazać
            const enriched = detectedElements.map((el, index) => {
                var _a, _b;
                return ({
                    id: index,
                    element_name: ((_b = (_a = el.shapeComparisons[0]) === null || _a === void 0 ? void 0 : _a.shape) === null || _b === void 0 ? void 0 : _b.name) || `Element ${index + 1}`,
                    data: el.elementBox,
                    accuracy: calculator.calculateAccuracy(el.elementBox)
                });
            });
            setElements(enriched);
        }
        catch (err) {
            console.error('Błąd podczas ładowania elementów:', err);
            setError('Nie udało się pobrać elementów z API');
        }
    });
    const toggleElementSelection = (elementId) => {
        setSelectedElements(prev => {
            const newSet = new Set(prev);
            if (newSet.has(elementId))
                newSet.delete(elementId);
            else
                newSet.add(elementId);
            return newSet;
        });
    };
    const handleStartScanClick = () => __awaiter(this, void 0, void 0, function* () {
        if (selectedElements.size === 0) {
            setError('Proszę zaznaczyć przynajmniej jeden element do skanowania');
            return;
        }
        const selectedElemsArray = elements.filter(el => selectedElements.has(el.id));
        try {
            for (const el of selectedElemsArray) {
                const shapeId = el.element_name; // zakładamy ID modelu kształtu
                yield cvApi.measureElement(el.id, shapeId, 0); // 0 = grubość materiału
                yield cvApi.getMeasuredElement(el.id);
            }
            onStartScan(selectedElemsArray);
            // Logowanie w Electron
            const description = selectedElemsArray.map(el => {
                const acc = typeof el.accuracy === 'number' ? `${el.accuracy.toFixed(1)}%` : 'brak danych';
                return `${el.element_name}, Accuracy: ${acc}`;
            }).join('\n');
            window.electronAPI.logAction({
                username: user.username,
                action: 'Skanowanie',
                details: `Marker: ${markerNumber.trim()}\n${description}`,
                scanData: JSON.stringify(selectedElemsArray.map(el => new ContourData(el.data).toJSON()))
            });
        }
        catch (err) {
            console.error('Błąd podczas skanowania elementów:', err);
            setError('Nie udało się wykonać pomiaru elementów');
        }
    });
    return (React.createElement("div", { className: "control-panel" },
        React.createElement("h2", null, "Kontrola element\u00F3w"),
        React.createElement(Select, { options: markerOptions, onChange: (selected) => setMarkerNumber((selected === null || selected === void 0 ? void 0 : selected.value) || ''), placeholder: "Wybierz marker...", isClearable: true }),
        React.createElement("button", { onClick: handleLoadElements }, "Za\u0142aduj elementy"),
        error && React.createElement("p", { style: { color: 'red' } }, error),
        elements.length > 0 && (React.createElement(React.Fragment, null,
            React.createElement("h3", null, "Elementy do kontroli:"),
            React.createElement("ul", null, elements.map((el) => (React.createElement("li", { key: el.id },
                React.createElement("label", null,
                    React.createElement("input", { type: "checkbox", checked: selectedElements.has(el.id), onChange: () => toggleElementSelection(el.id) }),
                    el.element_name,
                    " \u2013",
                    ' ',
                    React.createElement("span", { style: {
                            fontWeight: 'bold',
                            color: el.accuracy >= 95 ? 'green' : el.accuracy >= 80 ? 'orange' : 'red'
                        } },
                        el.accuracy,
                        "%")))))),
            React.createElement("button", { onClick: handleStartScanClick }, "START/SCAN")))));
}
