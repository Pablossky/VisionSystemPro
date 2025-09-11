var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { useState, useEffect } from 'react';
import ControlPanel from '../ControlPanel';
import LogsWindow from '../logsWindow/LogsWindow';
import MarkerSearch from '../../components/MarkerSearch';
import ContourViewer from '../contourViewer/ContourViewer';
import ScanApproval from '../../components/ScanApproval';
import ElementDetailsPanel from '../../components/ElementDetailsPanel';
import ParameterSettings from '../parameterPanel/ParameterSettings';
import ShapeAccuracyCalculator from '../../components/ShapeAccuracyCalculator';
import CommentManager from '../../components/CommentManager';
import UserManager from '../../components/UserManager';
import RightSidebar from '../../components/RightSidebar';
import TemplateFileSelector from '../../components/templateFileSelector/TemplateFileSelector';
import GoalsPanel from '../goals/GoalsPanel';
import CalibrationPanel from '../calibrationPanel/CalibrationPanel';
import './MainMenu.css';
import logo from '../../../assets/LOGO.png';
// Definiujemy dostępne opcje w zależności od roli użytkownika
const optionsByRole = {
    programmer: [
        "Logi",
        "Skanuj marker",
        "Wyszukaj marker",
        "Podgląd konturu",
        "Zmiana parametrów",
        "Zarządzaj użytkownikami",
        "Zarządzaj komentarzami",
        "Cele skanowania",
        "Kalibracja",
        "Wyloguj się",
    ],
    service: [
        "Logi",
        "Skanuj marker",
        "Wyszukaj marker",
        "Podgląd konturu",
        "Zmiana parametrów",
        "Zarządzaj użytkownikami",
        "Zarządzaj komentarzami",
        "Cele skanowania",
        "Kalibracja",
        "Wyloguj się",
    ],
    admin: [
        "Logi",
        "Skanuj marker",
        "Wyszukaj marker",
        "Podgląd konturu",
        "Zmiana parametrów",
        "Zarządzaj użytkownikami",
        "Zarządzaj komentarzami",
        "Cele skanowania",
        "Wyloguj się",
    ],
    operator: [
        "Skanuj marker",
        "Wyszukaj marker",
        "Podgląd konturu",
        "Cele skanowania",
        "Wyloguj się"
    ]
};
export default function MainMenu({ user, onLogout }) {
    const [showLogs, setShowLogs] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [scannedElements, setScannedElements] = useState([]);
    const [elementsWithAccuracy, setElementsWithAccuracy] = useState([]);
    const [replayComment, setReplayComment] = useState('');
    const [isReplay, setIsReplay] = useState(false);
    const [tolerance, setTolerance] = useState(2.0);
    const [isVerificationMode, setIsVerificationMode] = useState(false);
    const [originalLogId, setOriginalLogId] = useState(null);
    const [logs, setLogs] = useState([]);
    const [lineWidthModel, setLineWidthModel] = useState(1);
    const [lineWidthReal, setLineWidthReal] = useState(1);
    const [outlierPointSize, setOutlierPointSize] = useState(4); // domyślny rozmiar czerwonych punktów
    useEffect(() => {
        function loadTolerance() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const storedTolerance = yield window.electronAPI.invoke('get-parameter', 'tolerance');
                    if (storedTolerance !== undefined && storedTolerance !== null) {
                        setTolerance(parseFloat(storedTolerance));
                    }
                }
                catch (e) {
                    console.warn('Nie udało się wczytać tolerancji, używam domyślnej');
                }
            });
        }
        loadTolerance();
    }, []);
    useEffect(() => {
        const calculator = new ShapeAccuracyCalculator(tolerance);
        const updatedElements = scannedElements.map(el => (Object.assign(Object.assign({}, el), { accuracy: calculator.calculateAccuracy(el.data) })));
        setElementsWithAccuracy(updatedElements);
    }, [scannedElements, tolerance]);
    useEffect(() => {
        if (selectedOption === "Cele skanowania") {
            fetchLogs();
        }
    }, [selectedOption]);
    const handleStartScan = (elements) => {
        console.log('Start scanning elements:', elements);
        setScannedElements(elements);
        setIsReplay(false);
        setSelectedOption("Podgląd konturu");
    };
    const handleScanApproval = () => {
        setScannedElements([]);
        setSelectedOption(null);
        setIsVerificationMode(false);
        setOriginalLogId(null);
    };
    const handleReplayScan = (scanData, comment = '', { isVerificationMode = false, originalLogId = null } = {}) => {
        if (!scanData) {
            alert('Brak danych skanu do odtworzenia');
            return;
        }
        const safeElements = scanData.map((item, index) => {
            var _a;
            const data = item.data || item; // obsługa, jeśli item ma strukturę { data: {...} } lub sam obiekt
            const marker_number = item.marker_number || item.name || `Element ${index + 1}`;
            // Wydobywamy punkty, próbując z mainContour.points
            let points = [];
            if (Array.isArray(data)) {
                points = data;
            }
            else if ((_a = data === null || data === void 0 ? void 0 : data.mainContour) === null || _a === void 0 ? void 0 : _a.points) {
                points = data.mainContour.points;
            }
            else if (data === null || data === void 0 ? void 0 : data.points) {
                points = data.points;
            }
            else if (Array.isArray(data.mainContour)) {
                points = data.mainContour;
            }
            const formattedPoints = points.map((pt) => ({
                position: pt.position || [0, 0],
                modelPosition: pt.modelPosition || [0, 0],
                distance: pt.distance || 0,
            }));
            return {
                data: Object.assign(Object.assign({}, data), { mainContour: Object.assign(Object.assign({}, data.mainContour), { points: formattedPoints }) }),
                marker_number,
                accuracy: item.accuracy !== undefined ? item.accuracy : null,
            };
        });
        console.log("Replay - got safeElements:", safeElements);
        setScannedElements(safeElements);
        setReplayComment(comment || '');
        setIsReplay(true);
        setSelectedOption('Podgląd konturu');
        setIsVerificationMode(!!isVerificationMode);
        setOriginalLogId(originalLogId);
    };
    const fetchLogs = () => __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield window.electronAPI.getLogs();
            setLogs(data);
        }
        catch (error) {
            console.error("Błąd podczas pobierania logów:", error);
        }
    });
    const options = optionsByRole[user.role] || [];
    const handleLogoutClick = () => __awaiter(this, void 0, void 0, function* () {
        try {
            yield window.electronAPI.invoke('logout-user', { username: user.username });
            onLogout();
        }
        catch (err) {
            console.error('Błąd podczas wylogowywania:', err);
            alert('Błąd podczas wylogowywania');
        }
    });
    const renderRightPanel = () => {
        var _a, _b;
        if (showLogs || selectedOption === 'Logi') {
            return (React.createElement(LogsWindow, { onClose: () => {
                    setShowLogs(false);
                    setSelectedOption(null);
                }, onReplayScan: handleReplayScan }));
        }
        switch (selectedOption) {
            case "Wyszukaj marker":
                return React.createElement(MarkerSearch, null);
            case "Kalibracja":
                return (React.createElement(CalibrationPanel, { onClose: () => setSelectedOption(null) }));
            case "Rozpocznij kontrolę":
            case "Zatwierdź OK/NOK":
            case "Logi":
                return React.createElement(LogsWindow, { onClose: () => setSelectedOption(null) });
            case "Skanuj marker":
                return (React.createElement(ControlPanel, { onStartScan: handleStartScan, user: user }),
                    React.createElement(TemplateFileSelector, { onSelectElements: handleStartScan }));
            case "Podgląd konturu":
                return (React.createElement("div", { className: "dynamic-panel" },
                    React.createElement("div", { className: "panel-bottom" },
                        React.createElement(ScanApproval, { elements: elementsWithAccuracy, user: user, onDone: handleScanApproval, markerNumber: elementsWithAccuracy.length > 0 ? (elementsWithAccuracy[0].marker_number || ((_a = elementsWithAccuracy[0].data) === null || _a === void 0 ? void 0 : _a.name) || ((_b = elementsWithAccuracy[0].data) === null || _b === void 0 ? void 0 : _b.element_name) || '') : '', isVerificationMode: isVerificationMode, originalLogId: originalLogId }))));
            case 'Zmiana parametrów':
                return (React.createElement("div", { className: "RightSidePanel", style: { padding: 20 } },
                    React.createElement(ParameterSettings, { tolerance: tolerance, onToleranceChange: setTolerance, username: user.username, lineWidthModel: lineWidthModel, lineWidthReal: lineWidthReal, onLineWidthModelChange: setLineWidthModel, onLineWidthRealChange: setLineWidthReal, outlierPointSize: outlierPointSize, onOutlierPointSizeChange: setOutlierPointSize })));
            case "Zarządzaj użytkownikami":
                return React.createElement(UserManager, null);
            case "Zarządzaj komentarzami":
                return React.createElement(CommentManager, null);
            case "Cele skanowania":
                return React.createElement(GoalsPanel, { logs: logs });
            case "Wyloguj się":
                onLogout();
                return null;
            default:
                return null;
        }
    };
    return (React.createElement("div", { className: "main-panel" },
        React.createElement("div", { className: "logo-container" },
            React.createElement("img", { src: logo, alt: "Logo", className: "app-logo" })),
        React.createElement("div", { className: "left-panel" },
            React.createElement(ContourViewer, { elements: elementsWithAccuracy, tolerance: tolerance, lineWidthModel: lineWidthModel, lineWidthReal: lineWidthReal, outlierPointSize: outlierPointSize })),
        React.createElement("div", { className: "right-panel" },
            React.createElement("div", { className: "right-panel-top" },
                React.createElement("div", { className: "card user-info" },
                    React.createElement("h2", null,
                        "U\u017Cytkownik: ",
                        user.username),
                    React.createElement("p", null,
                        "Rola: ",
                        React.createElement("strong", null, user.role))),
                React.createElement("div", { className: "card access-panel" },
                    React.createElement("h3", null, "Dost\u0119pne opcje"),
                    React.createElement("div", { className: "options-grid" }, options.map((opt) => (React.createElement("div", { key: opt, className: `card option-card ${selectedOption === opt ? 'selected' : ''}`, onClick: () => {
                            setSelectedOption(opt);
                            setShowLogs(false);
                        } }, opt)))))),
            selectedOption && (React.createElement("div", { className: "right-panel-bottom" }, renderRightPanel())))));
}
