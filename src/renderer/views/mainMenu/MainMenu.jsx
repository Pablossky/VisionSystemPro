import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import ControlPanel from '../ControlPanel';
import LogsWindow from '../logsWindow/LogsWindow';
import MarkerSearch from '../../components/MarkerSearch';
import ContourViewer from '../contourViewer/ContourViewer';
import ScanApproval from '../../components/ScanApproval';
import ParameterSettings from '../parameterPanel/ParameterSettings';
import ShapeAccuracyCalculator from '../../components/ShapeAccuracyCalculator';
import CommentManager from '../../components/CommentManager';
import UserManager from '../../components/UserManager';
import TemplateFileSelector from '../../components/templateFileSelector/TemplateFileSelector';
import GoalsPanel from '../goals/GoalsPanel';
import CalibrationPanel from '../calibrationPanel/CalibrationPanel';
import ToleranceSettings from '../tolerancePanel/ToleranceSettings';
import GeneralSettings from '../generalSettings/GeneralSettings';
import './MainMenu.css';
import logo from '../../../assets/LOGO.png';

const groupedOptionsByRole = {
  programmer: [
    { label: "Procedury kontroli", children: ["Logi", "Skanuj elementy", "Wyszukaj marker", "Podgląd konturu", "Cele skanowania"] },
    { label: "Parametry", children: ["Zmiana parametrów", "Tolerancja"] },
    { label: "Ustawienia", children: ["Zarządzaj użytkownikami", "Zarządzaj komentarzami", "Kalibracja", "Ustawienia ogólne"] }
  ],
  service: [
    { label: "Procedury kontroli", children: ["Logi", "Skanuj elementy", "Wyszukaj marker", "Podgląd konturu", "Cele skanowania"] },
    { label: "Parametry", children: ["Zmiana parametrów", "Tolerancja"] },
    { label: "Ustawienia", children: ["Zarządzaj użytkownikami", "Zarządzaj komentarzami", "Kalibracja", "Ustawienia ogólne"] }
  ],
  admin: [
    { label: "Logi" },
    { label: "Skanuj elementy" },
    { label: "Wyszukaj marker" },
    { label: "Podgląd konturu" },
    { label: "Parametry", children: ["Zmiana parametrów", "Tolerancja"] },
    { label: "Ustawienia", children: ["Zarządzaj użytkownikami", "Zarządzaj komentarzami", "Kalibracja"] },
    { label: "Cele skanowania" }
  ],
  operator: [
    { label: "Skanuj elementy" },
    { label: "Wyszukaj marker" },
    { label: "Podgląd konturu" },
    { label: "Tolerancja" },
    { label: "Cele skanowania" }
  ]
};

export default function MainMenu({ user, onLogout }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [openGroup, setOpenGroup] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [scannedElements, setScannedElements] = useState([]);
  const [elementsWithAccuracy, setElementsWithAccuracy] = useState([]);
  const [tolerance, setTolerance] = useState(2.0);
  const [logs, setLogs] = useState([]);
  const [lineWidthModel, setLineWidthModel] = useState(1);
  const [lineWidthReal, setLineWidthReal] = useState(1);
  const [outlierPointSize, setOutlierPointSize] = useState(1);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [workspaceColor, setWorkspaceColor] = useState('#006400');
  const [fontSize, setFontSize] = useState(16);
  const [tolerances, setTolerances] = useState({
    Points: { value: 2.0, color: '#ffffff' },
    Vcuts: { value: 2.0, color: '#00ff00' },
    Additional: { value: 1.0, color: '#0000ff' },
  });

  const userInfoRef = useRef();

  useEffect(() => {
    async function loadTolerance() {
      try {
        const storedTolerance = await window.electronAPI.invoke('get-parameter', 'tolerance');
        if (storedTolerance !== undefined && storedTolerance !== null) {
          setTolerance(parseFloat(storedTolerance));
        }
      } catch {
        console.warn('Nie udało się wczytać tolerancji, używam domyślnej');
      }
    }
    loadTolerance();
  }, []);

  useEffect(() => {
    const calculator = new ShapeAccuracyCalculator(tolerance);
    setElementsWithAccuracy(
      scannedElements.map(el => ({
        ...el,
        accuracy: calculator.calculateAccuracy(el.data),
      }))
    );
  }, [scannedElements, tolerance]);

  useEffect(() => {
    if (selectedOption === "Cele skanowania") {
      fetchLogs();
    }
  }, [selectedOption]);

  // Zamykanie menu po kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userInfoRef.current && !userInfoRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartScan = (elements) => {
    setScannedElements(elements);
    setSelectedOption("Podgląd konturu");
  };

  const handleScanApproval = () => {
    setScannedElements([]);
    setSelectedOption(null);
  };

  const fetchLogs = async () => {
    try {
      const data = await window.electronAPI.getLogs();
      setLogs(data);
    } catch (error) {
      console.error("Błąd podczas pobierania logów:", error);
    }
  };

  const renderRightPanel = () => {
    switch (selectedOption) {
      case "Logi": return <LogsWindow onClose={() => setSelectedOption(null)} />;
      case "Wyszukaj marker": return <MarkerSearch />;
      case "Kalibracja": return <CalibrationPanel onClose={() => setSelectedOption(null)} />;
      case "Ustawienia ogólne":
        return (
          <GeneralSettings
            workspaceColor={workspaceColor}
            setWorkspaceColor={setWorkspaceColor}
            fontSize={fontSize}
            setFontSize={setFontSize}
          />
        );
      case "Skanuj elementy":
        return (
          <>
            <ControlPanel onStartScan={handleStartScan} user={user} />
            <TemplateFileSelector onSelectElements={handleStartScan} />
          </>
        );
      case "Podgląd konturu":
        return (
          <div className="dynamic-panel">
            <div className="panel-bottom">
              <ScanApproval
                elements={elementsWithAccuracy}
                user={user}
                onDone={handleScanApproval}
              />
            </div>
          </div>
        );
      case "Zmiana parametrów":
        return (
          <ParameterSettings
            tolerance={tolerance}
            onToleranceChange={setTolerance}
            username={user.username}
            lineWidthModel={lineWidthModel}
            lineWidthReal={lineWidthReal}
            onLineWidthModelChange={setLineWidthModel}
            onLineWidthRealChange={setLineWidthReal}
            outlierPointSize={outlierPointSize}
            onOutlierPointSizeChange={setOutlierPointSize}
          />
        );
      case "Tolerancja":
        return <ToleranceSettings initialTolerances={tolerances} onSave={setTolerances} username={user.username} />;
      case "Zarządzaj użytkownikami": return <UserManager />;
      case "Zarządzaj komentarzami": return <CommentManager />;
      case "Cele skanowania": return <GoalsPanel logs={logs} />;
      default: return null;
    }
  };

  const groups = groupedOptionsByRole[user.role] || [];

  return (
    <div className="main-panel">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="app-logo" />
      </div>

      <div className="left-panel">
        <ContourViewer
          elements={elementsWithAccuracy}
          tolerances={tolerances}
          lineWidthModel={lineWidthModel}
          lineWidthReal={lineWidthReal}
          outlierPointSize={outlierPointSize}
          workspaceColor={workspaceColor}  // <-- nowy props
          fontSize={fontSize}              // <-- nowy props
        />

      </div>

      <div className="right-panel">
        <div className="right-panel-top">
          <div className="card user-info" ref={userInfoRef}>
            <h2 onClick={() => setUserMenuOpen(!userMenuOpen)}>
              Użytkownik: {user.username}
              {selectedOption && <span className="current-tab"> — {selectedOption}</span>}
            </h2>
            <p>Rola: <strong>{user.role}</strong></p>

            {userMenuOpen &&
              <div className="user-info-popup">
                <div
                  className="popup-item"
                  onClick={() => {
                    setUserMenuOpen(false);
                    onLogout();
                  }}
                >
                  Wyloguj się
                </div>
              </div>
            }
          </div>



          <div className="card access-panel">
            <h3>Dostępne opcje</h3>
            <div className="options-grid">
              {groups.map(group => (
                <div key={group.label} className="option-wrapper">
                  <div
                    className={`card option-card ${selectedOption === group.label || group.children?.includes(selectedOption) ? 'selected' : ''}`}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setDropdownPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
                      setOpenGroup(openGroup === group.label ? null : group.label);
                    }}
                  >
                    {group.label}
                  </div>

                  {group.children && openGroup === group.label &&
                    ReactDOM.createPortal(
                      <div
                        className="popup-menu"
                        style={{
                          position: 'absolute',
                          top: dropdownPosition.top,
                          left: dropdownPosition.left,
                          zIndex: 1000
                        }}
                      >
                        {group.children.map(child => (
                          <div
                            key={child}
                            className={`popup-item ${selectedOption === child ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedOption(child);
                              setOpenGroup(null);
                            }}
                          >
                            {child}
                          </div>
                        ))}
                      </div>,
                      document.body
                    )
                  }
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="right-panel-bottom">
          {renderRightPanel()}
        </div>
      </div>
    </div>
  );
}
