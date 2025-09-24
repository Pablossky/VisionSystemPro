import React, { useState, useEffect } from 'react';

export default function ScanApproval({
  elements = [],
  user,
  onDone,
  markerNumber,
  isVerificationMode = false,
  originalLogId = null,
  selectedElementIdx,
  onSelectElement,
  onHighlightElements // callback do rysowania ramek
}) {
  const [commentSuffix, setCommentSuffix] = useState('');
  const [scanConfirmed, setScanConfirmed] = useState(null);
  const [predefinedComments, setPredefinedComments] = useState([]);
  const [checkedElements, setCheckedElements] = useState([]);

  // Pobranie gotowych komentarzy
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

  // Aktualizacja komentarza po zmianie zaznaczonych checkboxów
  useEffect(() => {
    // Wywołanie callbacku do rysowania ramek
    if (onHighlightElements) {
      onHighlightElements(checkedElements.map(idx => elements[idx]));
    }
  }, [checkedElements, elements, onHighlightElements]);

  const handleCheckboxChange = (idx) => {
    setCheckedElements(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const handleConfirm = async (status) => {
    const actionText = isVerificationMode ? 'Weryfikacja' : {
      approved: 'Zatwierdzono skan',
      rejected: 'Odrzucono skan',
      review: 'Do sprawdzenia skan',
    }[status];

    const statusLabel = {
      approved: 'Zatwierdzono',
      rejected: 'Odrzucono',
      review: 'Do sprawdzenia',
    }[status] || 'Akcja';

    const description = elements.map(el => {
      const name = el.marker_number || el.data?.name || `Element ${el.id || ''}`;
      const acc = typeof el.accuracy === 'number' ? `${el.accuracy.toFixed(1)}%` : 'brak danych';
      return `${name}, Accuracy: ${acc}`;
    }).join('\n');

    const selectedNames = checkedElements.map(idx => elements[idx]?.element_name || `Element ${idx}`);
    const fullComment = `Komentarz do: ${selectedNames.join(', ')} ${commentSuffix}`.trim();

    const logDetails = `Marker: ${markerNumber}\nStatus: ${statusLabel}\nKomentarz: ${fullComment || '-'}\n${description}`;

    try {
      const result = await window.electronAPI.logAction({
        username: user.username,
        action: actionText,
        details: logDetails,
        scanData: JSON.stringify(elements),
        related_log_id: isVerificationMode ? originalLogId : null,
      });
      console.log('Zapisano log o id:', result.id);
    } catch (e) {
      alert('Błąd zapisu logu');
      return;
    }

    setScanConfirmed(status);
    setTimeout(() => {
      onDone();
      setScanConfirmed(null);
      setCommentSuffix('');
      setCheckedElements([]);
    }, 1500);
  };

  const statusColors = { approved: 'green', rejected: 'red', review: 'orange' };
  const statusTexts = { approved: 'zatwierdzony', rejected: 'odrzucony', review: 'oznaczony do sprawdzenia' };

  const selectedNames = checkedElements.map(idx => elements[idx]?.element_name || `Element ${idx}`);
  const fixedCommentPrefix = `Komentarz do: ${selectedNames.join(', ')}`;

  return (
    <div style={{ marginTop: 20, borderTop: '1px solid #ccc', paddingTop: 12 }}>
      {elements.length === 0 ? (
        <p>Brak elementów do zatwierdzenia.</p>
      ) : (
        <>
          <h3>Lista elementów</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {elements.map((el, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                <input
                  type="checkbox"
                  checked={checkedElements.includes(i)}
                  onChange={() => handleCheckboxChange(i)}
                  style={{ marginRight: 8 }}
                />
                <span
                  onClick={() => onSelectElement(i)}
                  style={{
                    cursor: 'pointer',
                    fontWeight: i === selectedElementIdx ? 'bold' : 'normal',
                    backgroundColor: i === selectedElementIdx ? '#444' : 'transparent',
                    padding: '2px 6px',
                    borderRadius: 4,
                  }}
                >
                  {el.element_name || `Element ${i}`}
                </span>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 10 }}>
            <h3>{isVerificationMode ? 'Weryfikacja skanu' : 'Dodaj komentarz i zatwierdź skan'}</h3>
            <div style={{ display: 'flex', gap: 10 }}>
              <textarea
                placeholder="Dodaj komentarz..."
                value={`${fixedCommentPrefix} ${commentSuffix}`}
                onChange={e => {
                  const newSuffix = e.target.value.replace(fixedCommentPrefix, '').trimStart();
                  setCommentSuffix(newSuffix);
                }}
                rows={3}
                style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
              />
              <select
                value=""
                onChange={(e) => setCommentSuffix(e.target.value)}
                style={{ width: 200, padding: 6, borderRadius: 4, border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }}
              >
                <option value="" disabled>Wybierz gotowy komentarz</option>
                {predefinedComments.map((c, i) => (
                  <option key={i} value={c}>{c || '[brak]'}</option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
              <button style={{ backgroundColor: 'green', color: 'white', padding: '8px 12px', border: 'none', borderRadius: 4, cursor: 'pointer' }} onClick={() => handleConfirm('approved')} disabled={scanConfirmed === 'approved'}>Zatwierdź skan</button>
              <button style={{ backgroundColor: 'red', color: 'white', padding: '8px 12px', border: 'none', borderRadius: 4, cursor: 'pointer' }} onClick={() => handleConfirm('rejected')} disabled={scanConfirmed === 'rejected'}>Odrzuć skan</button>
              <button style={{ backgroundColor: 'goldenrod', color: 'black', padding: '8px 12px', border: 'none', borderRadius: 4, cursor: 'pointer' }} onClick={() => handleConfirm('review')} disabled={scanConfirmed === 'review'}>Do sprawdzenia</button>
            </div>

            {scanConfirmed && <p style={{ marginTop: 10, fontWeight: 'bold', color: statusColors[scanConfirmed]}}>Skan został {statusTexts[scanConfirmed]}.</p>}
          </div>
        </>
      )}
    </div>
  );
}