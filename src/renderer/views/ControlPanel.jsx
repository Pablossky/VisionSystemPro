import React, { useState } from 'react';
import Select from 'react-select';
import ShapeAccuracyCalculator from './../components/ShapeAccuracyCalculator';
import ContourData from './../components/ContourData';
import cvApi from '../../api/CvApiService.ts'; // Twój nowy ICvApi wrapper
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

  const handleLoadElements = async () => {
    setError('');
    setElements([]);
    setSelectedElements(new Set());
    setScanConfirmed(null);
    setComment('');

    try {
      // 🔹 1. Zrób zdjęcia pomiarowe
      await cvApi.takeMeasurementPhotos();

      // 🔹 2. Wykryj elementy
      await cvApi.detectElements();

      // 🔹 3. Pobierz wykryte elementy
      const { detectedElements } = await cvApi.getDetectedElements();
      if (!detectedElements || detectedElements.length === 0) {
        setError('Nie wykryto żadnych elementów dla tego markera');
        return;
      }

      // 🔹 4. Mapowanie elementów do lokalnego formatu
      const calculator = new ShapeAccuracyCalculator(); // jeśli potrzebujesz tolerancji możesz przekazać
      const enriched = detectedElements.map((el, index) => ({
        id: index,
        element_name: el.shapeComparisons[0]?.shape?.name || `Element ${index + 1}`,
        data: el.elementBox,
        accuracy: calculator.calculateAccuracy(el.elementBox)
      }));

      setElements(enriched);
    } catch (err) {
      console.error('Błąd podczas ładowania elementów:', err);
      setError('Nie udało się pobrać elementów z API');
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

  const handleStartScanClick = async () => {
    if (selectedElements.size === 0) {
      setError('Proszę zaznaczyć przynajmniej jeden element do skanowania');
      return;
    }

    const selectedElemsArray = elements.filter(el => selectedElements.has(el.id));

    try {
      for (const el of selectedElemsArray) {
        const shapeId = el.element_name; // zakładamy ID modelu kształtu
        await cvApi.measureElement(el.id, shapeId, 0); // 0 = grubość materiału
        await cvApi.getMeasuredElement(el.id);
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
    } catch (err) {
      console.error('Błąd podczas skanowania elementów:', err);
      setError('Nie udało się wykonać pomiaru elementów');
    }
  };

  return (
    <div className="control-panel">
      <h2>Kontrola elementów</h2>

      <Select
        options={markerOptions}
        onChange={(selected) => setMarkerNumber(selected?.value || '')}
        placeholder="Wybierz marker..."
        isClearable
      />
      <button onClick={handleLoadElements}>Załaduj elementy</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {elements.length > 0 && (
        <>
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
                  {el.element_name} –{' '}
                  <span style={{
                    fontWeight: 'bold',
                    color: el.accuracy >= 95 ? 'green' : el.accuracy >= 80 ? 'orange' : 'red'
                  }}>
                    {el.accuracy}%
                  </span>
                </label>
              </li>
            ))}
          </ul>

          <button onClick={handleStartScanClick}>START/SCAN</button>
        </>
      )}
    </div>
  );
}
