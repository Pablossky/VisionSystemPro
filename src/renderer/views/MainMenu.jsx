import React, { useState, useEffect } from 'react';
import ControlPanel from './ControlPanel';
import LogsWindow from './logsWindow/LogsWindow';
import MarkerSearch from './MarkerSearch';
import ContourViewer from './ContourViewer';
import ScanApproval from './../components/ScanApproval';
import ElementDetailsPanel from './../components/ElementDetailsPanel';
import ParameterSettings from './../components/ParameterSettings';
import ShapeAccuracyCalculator from './../components/ShapeAccuracyCalculator';
import CommentManager from './../components/CommentManager';
import UserManager from '../components/UserManager';
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
  const [tolerance, setTolerance] = useState(2.0);
  const [previewedElement, setPreviewedElement] = useState(null);
  const [isPreviewing, setIsPreviewing] = useState(false);


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
    const listener = async (elementId) => {
      console.log('🎯 ODEBRANO PREVIEW-ELEMENT DLA ID:', elementId);
      try {
        setShowLogs(false);
        const element = await window.electronAPI.getElementById(elementId);
        console.log('🧩 Dane elementu z bazy:', element);

        if (element) {
          const dataObj = typeof element.data === 'string'
            ? JSON.parse(element.data)
            : element.data;

          const calculator = new ShapeAccuracyCalculator(tolerance);
          const withAccuracy = {
            ...element,
            data: dataObj,
            accuracy: calculator.calculateAccuracy(dataObj),
          };

          console.log('🧠 Element z accuracy:', withAccuracy);

          setScannedElements([withAccuracy]);
          setElementsWithAccuracy([withAccuracy]);
          setPreviewedElement([withAccuracy]);
          setSelectedOption('Podgląd konturu');
          setIsPreviewing(true);

          console.log('✅ Podgląd elementu ustawiony!');
        }
      } catch (e) {
        console.error('❌ Błąd ładowania elementu:', e);
      }
    };

    window.electronAPI.receive('preview-element', listener);
  }, [tolerance]);


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
    setSelectedOption("Podgląd konturu");
  };

  const handleScanApproval = () => {
    setScannedElements([]);
    setSelectedOption(null);
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
    if (showLogs) {
      return <LogsWindow onClose={() => setShowLogs(false)} />;
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
          <>
            <div style={{ display: 'flex' }}>
              <div style={{ flex: 1 }}>
                <ContourViewer elements={isPreviewing ? previewedElement : elementsWithAccuracy} tolerance={tolerance} />
              </div>
              <ElementDetailsPanel elements={isPreviewing ? previewedElement : elementsWithAccuracy} tolerance={tolerance} />
            </div>

            {!isPreviewing && (
              <ScanApproval
                elements={scannedElements}
                user={user}
                onDone={handleScanApproval}
                markerNumber={scannedElements.length > 0 ? scannedElements[0].marker_number : ''}
              />
            )}
          </>
        );
      case 'Zmiana parametrów':
        return (
          <ParameterSettings
            tolerance={tolerance}
            onToleranceChange={setTolerance}
            username={user.username}
          />
        );
      case "Zarządzaj użytkownikami":
        return <UserManager />;
      case "Zarządzaj komentarzami":
        return <CommentManager />;
      case "Wyloguj się":
        onLogout();
        return null
      default:
        return <div style={{ padding: 20 }}><h2>Wybierz opcję z lewej strony</h2></div>;
    }
  };

  return (
    <div className="main-panel">
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

      <div className="right-panel">
        {renderRightPanel()}
      </div>
    </div>
  );
}
