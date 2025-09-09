import React, { useEffect, useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { robotoNormal } from "./Roboto-Regular.js";
import { robotoBold } from "./Roboto-Bold.js";


export default function LogsWindow({ onClose, onReplayScan }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    window.electronAPI.getLogs()
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Błąd podczas pobierania logów');
        setLoading(false);
      });
  }, []);

  const uniqueUsers = useMemo(() => {
    const users = new Set(logs.map(log => log.username).filter(Boolean));
    return Array.from(users);
  }, [logs]);


  const filteredLogs = useMemo(() => {
    let filtered = logs;

    if (filterUser) {
      filtered = filtered.filter(log => log.username?.toLowerCase().includes(filterUser.toLowerCase()));
    }
    if (filterAction) {
      filtered = filtered.filter(log => log.action?.toLowerCase().includes(filterAction.toLowerCase()));
    }
    if (filterDate) {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp).toISOString().split('T')[0];
        return logDate === filterDate;
      });
    }

    return filtered.sort((a, b) => {
      return sortAsc
        ? new Date(a.timestamp) - new Date(b.timestamp)
        : new Date(b.timestamp) - new Date(a.timestamp);
    });
  }, [logs, filterUser, filterAction, filterDate, sortAsc]);

  const actionSummary = useMemo(() => {
    const summary = {
      zatwierdzone: 0,
      odrzucone: 0,
      doSprawdzenia: 0,
      weryfikacje: 0,

      zmianaRoli: 0,
      nowyProfil: 0
    };

    if (!Array.isArray(filteredLogs)) return summary;

    filteredLogs.forEach(log => {
      const action = log.action?.toLowerCase() || '';
      if (action.includes('zatwierdzono skan')) summary.zatwierdzone++;
      else if (action.includes('odrzucono skan')) summary.odrzucone++;
      else if (action.includes('do sprawdzenia')) summary.doSprawdzenia++;
      else if (action.includes('weryfikacja')) summary.weryfikacje++;
      else if (action.includes('zmiana roli')) summary.zmianaRoli++;
      else if (action.includes('utworzono nowy profil')) summary.nowyProfil++;
    });

    return summary;
  }, [filteredLogs]);


  const generatePDF = async () => {
    const doc = new jsPDF();

    // Dodanie czcionek (już w Base64)
    doc.addFileToVFS("Roboto-Regular.ttf", robotoNormal);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.addFileToVFS("Roboto-Bold.ttf", robotoBold);
    doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");

    doc.setFont("Roboto", "normal");
    doc.setFontSize(12);
    doc.text("Raport logów systemowych", 14, 14);

    autoTable(doc, {
      startY: 20,
      head: [['Data', 'Użytkownik', 'Akcja', 'Szczegóły']],
      body: filteredLogs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.username || '',
        log.action || '',
        log.details || ''
      ]),
      styles: { font: 'Roboto', fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [40, 40, 40] },
    });

    const pdfBase64 = doc.output('datauristring').split(',')[1];
    const result = await window.electronAPI.savePDF(pdfBase64, `logi_${filterDate || 'wszystkie'}.pdf`);

    if (result.success) alert(`PDF zapisano w: ${result.path}`);
    else alert(`Nie udało się zapisać PDF: ${result.error}`);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', color: 'white',
      padding: 20, zIndex: 1000, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 10 }}>
        <button
          onClick={generatePDF}
          style={{ padding: '6px 12px', backgroundColor: '#222', color: 'white' }}
        >
          Generuj PDF
        </button>

        <button
          onClick={onClose}
          style={{ padding: '6px 12px' }}
        >
          Zamknij
        </button>
      </div>

      <h2>Logi systemowe</h2>

      <div style={{
        backgroundColor: '#111',
        border: '1px solid #333',
        borderRadius: 6,
        padding: 12,
        marginBottom: 15,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'flex-start'
      }}>
        <div><strong>📅 Data:</strong> {filterDate || 'Brak wybranej daty'}</div>
        <div><strong style={{ color: '#4caf50' }}>✔️ Zatwierdzone:</strong> {actionSummary.zatwierdzone}</div>
        <div><strong style={{ color: '#f44336' }}>❌ Odrzucone:</strong> {actionSummary.odrzucone}</div>
        <div><strong style={{ color: '#ffeb3b' }}>⚠️ Do sprawdzenia:</strong> {actionSummary.doSprawdzenia}</div>
        <div><strong style={{ color: '#66bb6a' }}>🧪 Weryfikacje:</strong> {actionSummary.weryfikacje}</div>
        <div><strong style={{ color: '#2196f3' }}>👤 Zmiana roli:</strong> {actionSummary.zmianaRoli}</div>
        <div><strong style={{ color: '#64ffda' }}>➕ Nowy profil:</strong> {actionSummary.nowyProfil}</div>
      </div>


      <div style={{ marginBottom: 15, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Filtruj po użytkowniku"
          value={filterUser}
          onChange={e => setFilterUser(e.target.value)}
          style={{ padding: '6px', borderRadius: 4, border: '1px solid #ccc', minWidth: 150 }}
          list="users-list"
        />
        <datalist id="users-list">
          {uniqueUsers.map(u => <option key={u} value={u} />)}
        </datalist>

        <input
          type="text"
          placeholder="Filtruj po akcji (np. skanowanie)"
          value={filterAction}
          onChange={e => setFilterAction(e.target.value)}
          style={{ padding: '6px', borderRadius: 4, border: '1px solid #ccc', minWidth: 150 }}
        />

        <input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          style={{ padding: '6px', borderRadius: 4, border: '1px solid #ccc' }}
        />

        <button
          onClick={() => setSortAsc(!sortAsc)}
          style={{ padding: '6px 12px', borderRadius: 4, border: 'none', cursor: 'pointer', backgroundColor: '#444', color: 'white' }}
        >
          Sortuj: {sortAsc ? 'rosnąco' : 'malejąco'}
        </button>
      </div>

      {loading && <p>Ładowanie logów...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #444', borderRadius: 6 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#222' }}>
            <tr>
              <th style={{ padding: '8px', borderBottom: '1px solid #555' }}>ID logu</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #555' }}>Related ID</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #555' }}>Data i czas</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #555' }}>Użytkownik</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #555' }}>Akcja</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #555' }}>Szczegóły</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #555' }}>Weryfikacja</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 && !loading && (
              <tr><td colSpan={7} style={{ padding: '12px', textAlign: 'center', color: '#aaa' }}>Brak logów spełniających kryteria</td></tr>
            )}
            {filteredLogs.map(log => {
              const actionLower = log.action?.toLowerCase() || '';
              const isReviewRequest = actionLower.includes('do sprawdzenia');
              const isVerificationLog = actionLower.includes('weryfikacja');
              const isScanRelated = [
                'skanowanie',
                'do sprawdzenia skan',
                'zatwierdzono skan',
                'odrzucono skan',
                'weryfikacja'
              ].some(type => actionLower.includes(type));

              return (
                <tr
                  key={log.id}
                  style={{
                    borderBottom: '1px solid #444',
                    backgroundColor: isVerificationLog ? '#225522' // ciemna zieleń dla logów weryfikacji
                      : isReviewRequest ? '#665500' // żółto-brązowy dla "do sprawdzenia"
                        : 'transparent'
                  }}
                >
                  <td style={{ padding: '6px 8px', verticalAlign: 'top', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                    {log.id}
                  </td>
                  <td style={{ padding: '6px 8px', verticalAlign: 'top', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                    {log.related_log_id || '-'}
                  </td>
                  <td style={{ padding: '6px 8px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: '6px 8px', verticalAlign: 'top' }}>{log.username}</td>
                  <td style={{ padding: '6px 8px', verticalAlign: 'top', fontWeight: isReviewRequest ? 'bold' : 'normal' }}>
                    {log.action} {isReviewRequest && <span style={{ color: 'yellow' }}>⚠️</span>}
                  </td>
                  <td style={{
                    padding: '6px 8px',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    color: isReviewRequest ? '#fff8c6' : 'inherit'
                  }}>
                    {log.details}
                  </td>
                  <td>
                    {isScanRelated && (
                      <button
                        onClick={() => {
                          if (log.scan_data) {
                            try {
                              const parsed = JSON.parse(log.scan_data);
                              console.log("parsed scan_data:", parsed);
                              onReplayScan(parsed, log.details, { isVerificationMode: true, originalLogId: log.id, relatedLogId: log.related_log_id });
                            } catch (e) {
                              alert(`Błąd parsowania danych skanu:\n${e.message}`);
                            }
                          } else {
                            alert(`Brak danych skanu.\n\nSzczegóły logu:\n${log.details || '(brak)'}`);
                          }
                        }}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: log.scan_data ? '#444' : '#222',
                          color: log.scan_data ? 'white' : '#888',
                          border: 'none',
                          borderRadius: 4,
                          cursor: log.scan_data ? 'pointer' : 'default'
                        }}
                      >
                        Sprawdź
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
