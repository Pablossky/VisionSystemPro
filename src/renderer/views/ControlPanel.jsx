import React, { useState } from 'react';
import Select from 'react-select';
import ShapeAccuracyCalculator from './../components/ShapeAccuracyCalculator';
import ContourData from './../components/ContourData';
import cvApi from '../../api/CvApiService';
import markerElements from '../../data/data';

// 🔹 Popup do wyboru podobnych elementów
function SimilarElementChooser({ options, onSelect }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 8 }}>
        <h4>Wybierz model elementu</h4>
        <ul>
          {options.map(opt => (
            <li key={opt} style={{ margin: 5 }}>
              <button onClick={() => onSelect(opt.replace('.json', ''))}>
                {opt.replace('.json', '')}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function ControlPanel({ onStartScan, user }) {
  const [markerNumber, setMarkerNumber] = useState('');
  const [elements, setElements] = useState([]);
  const [selectedElements, setSelectedElements] = useState(new Set());
  const [error, setError] = useState('');
  const [pendingChoice, setPendingChoice] = useState(null);

  const markerOptions = Object.keys(markerElements).map((m) => ({
    value: m,
    label: `Marker ${m}`
  }));

  const handleLoadElements = async () => {
    setError('');
    setElements([]);
    setSelectedElements(new Set());

    try {
      await cvApi.takeMeasurementPhotos();
      await cvApi.detectElements();
      const { detectedElements } = await cvApi.getDetectedElements();

      if (!detectedElements || detectedElements.length === 0) {
        setError('Nie wykryto żadnych elementów dla tego markera');
        return;
      }

      const calculator = new ShapeAccuracyCalculator();

      for (let index = 0; index < detectedElements.length; index++) {
        const el = detectedElements[index];
        const accuracy = calculator.calculateAccuracy(el.elementBox);
        const similar = await cvApi.findSimilarElements(el.elementBox);

        let element_name = `Element ${index + 1}`;

        if (similar.length === 1) {
          element_name = similar[0].replace('.json', '');
        } else if (similar.length > 1) {
          setPendingChoice({
            options: similar,
            onSelect: (selected) => {
              const name = selected.replace('.json', '');
              setElements(prev => {
                const newElements = [...prev];
                newElements[index] = { ...newElements[index], element_name: name };
                return newElements;
              });
            }
          });
        }

        enriched.push({
          id: index,
          element_name,   // ✔ zawsze coś jest tu
          data: el.elementBox,
          accuracy
        });
      }

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
        const shapeId = el.element_name;
        await cvApi.measureElement(el.id, shapeId, 0);
        await cvApi.getMeasuredElement(el.id);
      }

      onStartScan(selectedElemsArray);

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

      {/* 🔹 Render popup, jeśli jest pendingChoice */}
      {pendingChoice && (
        <SimilarElementChooser
          options={pendingChoice.options}
          onSelect={(chosen) => {
            pendingChoice.onSelect(chosen);
            setPendingChoice(null);
          }}
        />
      )}
    </div>
  );
}
