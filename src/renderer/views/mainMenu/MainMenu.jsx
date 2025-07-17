import React, { useState, useEffect } from 'react';
import ControlPanel from '../ControlPanel';
import LogsWindow from '../logsWindow/LogsWindow';
import MarkerSearch from '../../components/MarkerSearch';
import ContourViewer from '../contourViewer/ContourViewer';
import ScanApproval from '../../components/ScanApproval';
import ElementDetailsPanel from '../../components/ElementDetailsPanel';
import ParameterSettings from '../../components/ParameterSettings';
import ShapeAccuracyCalculator from '../../components/ShapeAccuracyCalculator';
import CommentManager from '../../components/CommentManager';
import UserManager from '../../components/UserManager';
import RightSidebar from '../../components/RightSideBar';
import './MainMenu.css';

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
    "Wyloguj się",
  ],
  operator: [
    "Skanuj marker",
    "Wyszukaj marker",
    "Podgląd konturu",
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

  useEffect(() => {
    async function loadTolerance() {
      try {
        const storedTolerance = await window.electronAPI.invoke('get-parameter', 'tolerance');
        if (storedTolerance !== undefined && storedTolerance !== null) {
          setTolerance(parseFloat(storedTolerance));
        }
      } catch (e) {
        console.warn('Nie udało się wczytać tolerancji, używam domyślnej');
      }
    }
    loadTolerance();
  }, []);

  useEffect(() => {
    const calculator = new ShapeAccuracyCalculator(tolerance);
    const updatedElements = scannedElements.map(el => ({
      ...el,
      accuracy: calculator.calculateAccuracy(el.data),
    }));
    setElementsWithAccuracy(updatedElements);
  }, [scannedElements, tolerance]);

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

    const safeElements = scanData.map(data => {
      if (data && data.mainContour && Array.isArray(data.mainContour.points)) {
        return {
          data,
          marker_number: data.marker_number || 'Nieznany',
        };
      } else {
        return {
          data: {
            mainContour: data
          },
          marker_number: data.marker_number || 'Nieznany',
        };
      }
    });

    setScannedElements(safeElements);
    setReplayComment(comment || '');
    setIsReplay(true);
    setSelectedOption('Podgląd konturu');

    setIsVerificationMode(!!isVerificationMode);
    setOriginalLogId(originalLogId);
  };

  const options = optionsByRole[user.role] || [];

  const handleLogoutClick = async () => {
    try {
      await window.electronAPI.invoke('logout-user', { username: user.username });
      onLogout();
    } catch (err) {
      console.error('Błąd podczas wylogowywania:', err);
      alert('Błąd podczas wylogowywania');
    }
  };

  const renderRightPanel = () => {
    if (showLogs || selectedOption === 'Logi') {
      return (
        <LogsWindow
          onClose={() => {
            setShowLogs(false);
            setSelectedOption(null);
          }}
          onReplayScan={handleReplayScan}
        />
      );
    }

    switch (selectedOption) {
      case "Wyszukaj marker":
        return <MarkerSearch />;
      case "Rozpocznij kontrolę":
      case "Zatwierdź OK/NOK":
      case "Logi":
        return <LogsWindow onClose={() => setSelectedOption(null)} />;
      case "Skanuj marker":
        return <ControlPanel onStartScan={handleStartScan} user={user} />;
      case "Podgląd konturu":
        return (
          <div className="center-panel-layout">
            <div className="center-main-content">
              <div className="contour-viewer-top">
                <ContourViewer elements={elementsWithAccuracy} tolerance={tolerance} />
              </div>
              <div className="scan-approval-bottom">
                <ScanApproval
                  elements={scannedElements}
                  user={user}
                  onDone={handleScanApproval}
                  markerNumber={scannedElements.length > 0 ? scannedElements[0].marker_number : ''}
                  isVerificationMode={isVerificationMode}
                  originalLogId={originalLogId}
                />
              </div>
            </div>
            <div className="right-sidebar-wrapper">
              <RightSidebar
                elements={elementsWithAccuracy}
                tolerance={tolerance}
                replayComment={replayComment}
                isReplay={isReplay}
              />
            </div>
          </div>
        );
      case 'Zmiana parametrów':
        return (
          <div className="RightSidePanel" style={{ padding: 20 }}>
            <ParameterSettings
              tolerance={tolerance}
              onToleranceChange={setTolerance}
              username={user.username}
            />
          </div>
        );
      case "Zarządzaj użytkownikami":
        return <UserManager />;
      case "Zarządzaj komentarzami":
        return <CommentManager />;
      case "Wyloguj się":
        onLogout();
        return null;
      default:
        return <div style={{ padding: 20 }}><h2>Wybierz opcję z lewej strony</h2></div>;
    }
  };

  return (
    <div className="main-panel">
      {/* Lewy panel */}
      <div className="left-panel">
        <div className="card user-info">
          <h2>Użytkownik: {user.username}</h2>
          <p>Rola: <strong>{user.role}</strong></p>
        </div>

        <div className="card access-panel">
          <h3>Dostępne opcje</h3>
          <div className="options-grid">
            {options.map((opt) => (
              <div
                key={opt}
                className={`card option-card ${selectedOption === opt ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedOption(opt);
                  setShowLogs(false);
                }}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Środkowy panel */}
      <div className="center-panel">
        {renderRightPanel()}
      </div>
    </div>
  );
}