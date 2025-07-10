import React, { useState } from 'react';
import ControlPanel from './ControlPanel';
import LogsWindow from './LogsWindow'; // import okna logów

const optionsByRole = {
  Programistyczny: [
    "Zmiana ustawień systemu",
    "Kalibracja",
    "Zarządzanie użytkownikami",
    "Zarządzanie bazą danych",
    "Dostęp do kamer",
    "Zdalne logi i aktualizacje",
    "Raporty"
  ],
  Serwisowy: [
    "Kalibracja",
    "Zarządzanie użytkownikami",
    "Zarządzanie bazą danych",
    "Dostęp do kamer",
    "Zdalne logi",
    "Raporty"
  ],
  Administrator: [
    "Zarządzanie bazą danych",
    "Zarządzanie użytkownikami",
    "Ustawienia tolerancji",
    "Raporty"
  ],
  Nadzorca: [
    "Kontrola operatorów",
    "Weryfikacja elementów NOK",
    "Raporty dzienne i statystyki"
  ],
  Operator: [
    "Skanuj marker",
    "Rozpocznij kontrolę",
    "Zatwierdź OK/NOK",
    "Historia kontroli"
  ]
};

export default function MainMenu({ user }) {
  const [showLogs, setShowLogs] = useState(false);

  const handleStartScan = (elements) => {
    // tutaj dodaj logikę, co się dzieje po starcie kontroli
    console.log('Start scanning elements:', elements);
  };

  const options = optionsByRole[user.role] || [];

  return (
    <>
      <div style={{ padding: 20 }}>
        <h2>Menu główne - {user.role}</h2>
        <ul>
          {options.map((opt, idx) => (
            <li key={idx}>{opt}</li>
          ))}
        </ul>
        <h2>Witaj, {user.username}!</h2>
        <p>Twoja rola: {user.role}</p>
        <ControlPanel onStartScan={handleStartScan} />

        <button onClick={() => setShowLogs(true)} style={{ marginTop: 20 }}>
          Pokaż logi
        </button>
      </div>

      {showLogs && <LogsWindow onClose={() => setShowLogs(false)} />}
    </>
  );
}
