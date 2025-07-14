import React, { useState, useEffect } from 'react';

export default function ScanApproval({ elements, user, onDone, markerNumber }) {
  const [comment, setComment] = useState('');
  const [scanConfirmed, setScanConfirmed] = useState(null);
  const [predefinedComments, setPredefinedComments] = useState([]);

  useEffect(() => {
    async function fetchComments() {
      try {
        const comments = await window.electronAPI.invoke('get-approval-comments');
        setPredefinedComments(comments.map(c => c.text));
      } catch (err) {
        console.error('Nie udało się pobrać komentarzy:', err);
      }
    }
    fetchComments();
  }, []);

  if (!elements || elements.length === 0) {
    return <p>Brak elementów do zatwierdzenia.</p>;
  }

  const handleConfirm = (status) => {
    const statusText = {
      approved: 'Zatwierdzono',
      rejected: 'Odrzucono',
      review: 'Do sprawdzenia',
    }[status];

    const description = elements.map(el => {
      const name = el.element_name || `Element ${el.id}`;
      const acc = typeof el.accuracy === 'number' ? `${el.accuracy.toFixed(1)}%` : 'brak danych';
      return `${name}, Accuracy: ${acc}`;
    }).join('\n');

    const logDetails = `Marker: ${markerNumber}\nStatus: ${statusText}\nKomentarz: ${comment || '-'}\n${description}`;

    window.electronAPI.logAction({
      username: user.username,
      action: `${statusText} skan`,
      details: logDetails,
    });

    setScanConfirmed(status);
    setTimeout(() => {
      onDone();
      setScanConfirmed(null);
      setComment('');
    }, 1500);
  };


  return (
    <div style={{ marginTop: 20, borderTop: '1px solid #ccc', paddingTop: 12 }}>
      <h3>Zatwierdź lub odrzuć skan</h3>
      <div style={{ display: 'flex', gap: 10 }}>
        <textarea
          placeholder="Dodaj komentarz..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 4,
            border: '1px solid #ccc'
          }}
        />
        <select
          value=""
          onChange={(e) => setComment(e.target.value)}
          style={{
            width: 200,
            padding: 6,
            borderRadius: 4,
            border: '1px solid #ccc',
            background: '#f5f5f5',
            cursor: 'pointer',
          }}
        >
          <option value="" disabled>Wybierz gotowy komentarz</option>
          {predefinedComments.map((c, i) => (
            <option key={i} value={c}>{c || '[brak]'}</option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
        <button
          style={{ backgroundColor: 'green', color: 'white', padding: '8px 12px', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          onClick={() => handleConfirm('approved')}
          disabled={scanConfirmed === 'approved'}
        >
          Zatwierdź skan
        </button>
        <button
          style={{ backgroundColor: 'red', color: 'white', padding: '8px 12px', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          onClick={() => handleConfirm('rejected')}
          disabled={scanConfirmed === 'rejected'}
        >
          Odrzuć skan
        </button>
        <button
          style={{ backgroundColor: 'goldenrod', color: 'black', padding: '8px 12px', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          onClick={() => handleConfirm('review')}
          disabled={scanConfirmed === 'review'}
        >
          Do sprawdzenia
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
