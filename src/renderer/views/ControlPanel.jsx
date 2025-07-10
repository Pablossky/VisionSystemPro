import React, { useState } from 'react';

export default function ControlPanel({ onStartScan }) {
  const [markerNumber, setMarkerNumber] = useState('');
  const [elements, setElements] = useState([]);
  const [selectedElements, setSelectedElements] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMarkerChange = (e) => {
    setMarkerNumber(e.target.value);
    setError('');
  };

  const handleLoadElements = async () => {
    if (!markerNumber.trim()) {
      setError('Proszę wpisać numer markera');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const marker = await window.electronAPI.getMarker(markerNumber.trim());
      if (!marker) {
        setError('Nie znaleziono markera');
        setElements([]);
        setSelectedElements(new Set());
        setLoading(false);
        return;
      }
      const elems = await window.electronAPI.getElementsByMarker(markerNumber.trim());
      if (elems && elems.length > 0) {
        setElements(elems.slice(0, 5)); // max 5 elementów
        setSelectedElements(new Set()); // wyczyść zaznaczenia po nowym załadowaniu
        setError('');
      } else {
        setElements([]);
        setSelectedElements(new Set());
        setError('Nie znaleziono elementów dla podanego markera');
      }
    } catch (err) {
      setError('Błąd podczas pobierania danych');
      setElements([]);
      setSelectedElements(new Set());
    } finally {
      setLoading(false);
    }
  };

  const toggleElementSelection = (elementId) => {
    setSelectedElements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(elementId)) newSet.delete(elementId);
      else newSet.add(elementId);
      return newSet;
    });
  };

  const handleStartScanClick = () => {
    if (selectedElements.size === 0) {
      setError('Proszę zaznaczyć przynajmniej jeden element do skanowania');
      return;
    }
    const selectedElemsArray = elements.filter(el => selectedElements.has(el.id));
    onStartScan(selectedElemsArray);
  };

  return (
    <div className="control-panel">
      <h2>Kontrola elementów</h2>
      <input
        type="text"
        placeholder="Wpisz lub zeskanuj numer markera"
        value={markerNumber}
        onChange={handleMarkerChange}
        disabled={loading}
      />
      <button onClick={handleLoadElements} disabled={loading}>
        Załaduj elementy
      </button>

      {loading && <p>Ładowanie danych...</p>}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {elements.length > 0 && (
        <div>
          <h3>Elementy do kontroli:</h3>
          <ul>
            {elements.map((el) => (
              <li key={el.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedElements.has(el.id)}
                    onChange={() => toggleElementSelection(el.id)}
                  />
                  {el.element_name || `Element ${el.id}`}
                </label>
              </li>
            ))}
          </ul>
          <button onClick={handleStartScanClick}>START/SCAN</button>
        </div>
      )}
    </div>
  );
}
