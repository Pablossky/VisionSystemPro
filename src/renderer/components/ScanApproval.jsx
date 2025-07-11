import React, { useState } from 'react';

export default function ScanApproval({ elements, user, onDone, markerNumber }) {
  const [comment, setComment] = useState('');
  const [scanConfirmed, setScanConfirmed] = useState(null); // 'approved' | 'rejected' | null

  if (!elements || elements.length === 0) {
    return <p>Brak elementów do zatwierdzenia.</p>;
  }

  const handleConfirm = (approved) => {
    const status = approved ? 'Zatwierdzono' : 'Odrzucono';

    const description = elements.map(el => {
      const name = el.element_name || `Element ${el.id}`;
      const acc = typeof el.accuracy === 'number' ? `${el.accuracy.toFixed(1)}%` : 'brak danych';
      return `${name}, Accuracy: ${acc}`;
    }).join('\n');

    const logDetails = `Marker: ${markerNumber}\nStatus: ${status}\nKomentarz: ${comment || '-'}\n${description}`;

    window.electronAPI.logAction({
      username: user.username,
      action: `${status} skan`,
      details: logDetails,
    });

    setScanConfirmed(status.toLowerCase());
    setTimeout(() => {
      onDone();
      setScanConfirmed(null);
      setComment('');
    }, 1500); // po 1.5s czyścimy i wracamy
  };

  return (
    <div style={{ marginTop: 20, borderTop: '1px solid #ccc', paddingTop: 12 }}>
      <h3>Zatwierdź lub odrzuć skan</h3>
      <textarea
        placeholder="Dodaj komentarz..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={3}
        style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
      />
      <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
        <button
          style={{ backgroundColor: 'green', color: 'white', padding: '8px 12px', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          onClick={() => handleConfirm(true)}
          disabled={scanConfirmed === 'zatwierdzono'}
        >
          Zatwierdź skan
        </button>
        <button
          style={{ backgroundColor: 'red', color: 'white', padding: '8px 12px', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          onClick={() => handleConfirm(false)}
          disabled={scanConfirmed === 'odrzucono'}
        >
          Odrzuć skan
        </button>
      </div>
      {scanConfirmed && (
        <p style={{ marginTop: 10, fontWeight: 'bold', color: scanConfirmed === 'zatwierdzono' ? 'green' : 'red' }}>
          Skan został {scanConfirmed}.
        </p>
      )}
    </div>
  );
}
