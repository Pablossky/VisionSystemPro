import React, { useState } from 'react';
import markerElements from '../../data/data';
import ShapeAccuracyCalculator from './../components/ShapeAccuracyCalculator';

export default function ControlPanel({ onStartScan, user }) {
  const [markerNumber, setMarkerNumber] = useState('');
  const [elements, setElements] = useState([]);
  const [selectedElements, setSelectedElements] = useState(new Set());
  const [error, setError] = useState('');

  // Nowe stany dla zatwierdzenia/odrzucenia
  const [scanConfirmed, setScanConfirmed] = useState(null); // null | 'approved' | 'rejected'
  const [comment, setComment] = useState('');

  const handleMarkerChange = (e) => {
    setMarkerNumber(e.target.value);
    setError('');
    setScanConfirmed(null);
    setComment('');
  };

  const handleLoadElements = () => {
    const markerId = markerNumber.trim();

    if (!markerId) {
      setError('Proszę wpisać numer markera');
      setElements([]);
      return;
    }

    const elems = markerElements[markerId];
    const calculator = new ShapeAccuracyCalculator(2.0);

    if (elems && elems.length > 0) {
      const enriched = elems.slice(0, 5).map(el => ({
        ...el,
        accuracy: calculator.calculateAccuracy(el.data)
      }));
      setElements(enriched);
      setSelectedElements(new Set());
      setError('');
      setScanConfirmed(null);
      setComment('');
    } else {
      setElements([]);
      setSelectedElements(new Set());
      setError('Nie znaleziono elementów dla podanego markera');
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

    // Przekazujemy do MainMenu (np. do ContourViewer)
    onStartScan(selectedElemsArray);

    // Logowanie skanowania
    setTimeout(() => {
      try {
        const description = selectedElemsArray.map(el => {
          const name = el.element_name || `Element ${el.id}`;
          const acc = typeof el.accuracy === 'number' ? `${el.accuracy.toFixed(1)}%` : 'brak danych';
          return `${name}, Accuracy: ${acc}`;
        }).join('\n');

        window.electronAPI.logAction({
          username: user.username,
          action: 'Skanowanie',
          details: `Marker: ${markerNumber.trim()}\n${description}`
        });
      } catch (err) {
        console.error('Nie udało się zapisać logu skanowania:', err);
      }
    }, 0);
  };

  // Funkcja zatwierdzająca lub odrzucająca skan z komentarzem i logiem
  const handleConfirmScan = (approved) => {
    const selectedElemsArray = elements.filter(el => selectedElements.has(el.id));
    if (selectedElemsArray.length === 0) {
      setError('Brak wybranych elementów do zatwierdzenia');
      return;
    }

    const status = approved ? 'Zatwierdzono' : 'Odrzucono';
    setScanConfirmed(approved ? 'approved' : 'rejected');

    const description = selectedElemsArray.map(el => {
      const name = el.element_name || `Element ${el.id}`;
      const acc = typeof el.accuracy === 'number' ? `${el.accuracy.toFixed(1)}%` : 'brak danych';
      return `${name}, Accuracy: ${acc}`;
    }).join('\n');

    const logDetails = `Marker: ${markerNumber.trim()}\nStatus: ${status}\nKomentarz: ${comment || '-'}` + `\n${description}`;

    window.electronAPI.logAction({
      username: user.username,
      action: `${status} skan`,
      details: logDetails,
    });

    // Możesz też tu dodać np. reset formularza po zatwierdzeniu
    // setSelectedElements(new Set());
    // setElements([]);
    // setMarkerNumber('');
    // setComment('');
  };

  return (
    <div className="control-panel">
      <h2>Kontrola elementów</h2>

      <input
        type="text"
        placeholder="Wpisz numer markera (np. 1)"
        value={markerNumber}
        onChange={handleMarkerChange}
      />
      <button onClick={handleLoadElements}>Załaduj elementy</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {elements.length > 0 && (
        <>
          <h3>Elementy do kontroli:</h3>
          <ul>
            {elements.map((el) => (
              <li key={el.id} style={{ marginBottom: 8 }}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedElements.has(el.id)}
                    onChange={() => toggleElementSelection(el.id)}
                  />
                  {el.element_name || `Element ${el.id}`} –{' '}
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

          <div style={{ marginTop: 20 }}>
            <textarea
              placeholder="Dodaj komentarz do zatwierdzenia/odrzucenia skanu..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            />
            <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
              <button
                style={{ backgroundColor: 'green', color: 'white', padding: '8px 12px', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                onClick={() => handleConfirmScan(true)}
                disabled={scanConfirmed === 'approved'}
              >
                Zatwierdź skan
              </button>
              <button
                style={{ backgroundColor: 'red', color: 'white', padding: '8px 12px', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                onClick={() => handleConfirmScan(false)}
                disabled={scanConfirmed === 'rejected'}
              >
                Odrzuć skan
              </button>
            </div>
            {scanConfirmed && (
              <p style={{ marginTop: 10, fontWeight: 'bold', color: scanConfirmed === 'approved' ? 'green' : 'red' }}>
                Skan został {scanConfirmed === 'approved' ? 'zatwierdzony' : 'odrzucony'}.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
