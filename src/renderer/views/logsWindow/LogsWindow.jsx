import React, { useEffect, useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function LogsWindow({ onClose }) {
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
    const users = new Set(logs.map(log => log.user).filter(Boolean));
    return Array.from(users);
  }, [logs]);

  const filteredLogs = useMemo(() => {
    let filtered = logs;

    if (filterUser) {
      filtered = filtered.filter(log => log.user?.toLowerCase().includes(filterUser.toLowerCase()));
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

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Raport logów systemowych", 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [['Data', 'Użytkownik', 'Akcja', 'Szczegóły']],
      body: filteredLogs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.user || '',
        log.action || '',
        log.details || '',
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [40, 40, 40] },
    });
    doc.save(`logi_${filterDate || 'wszystkie'}.pdf`);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', color: 'white',
      padding: 20, zIndex: 1000, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <button onClick={onClose} style={{ padding: '6px 12px' }}>Zamknij</button>
        <button onClick={generatePDF} style={{ padding: '6px 12px', backgroundColor: '#222', color: 'white' }}>
          Generuj PDF
        </button>
      </div>

      <h2>Logi systemowe</h2>

      {/* Filtry */}
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
              <th style={{ padding: '8px', borderBottom: '1px solid #555' }}>Data i czas</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #555' }}>Użytkownik</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #555' }}>Akcja</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #555' }}>Szczegóły</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 && !loading && (
              <tr><td colSpan={4} style={{ padding: '12px', textAlign: 'center', color: '#aaa' }}>Brak logów spełniających kryteria</td></tr>
            )}
            {filteredLogs.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid #444' }}>
                <td style={{ padding: '6px 8px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td style={{ padding: '6px 8px', verticalAlign: 'top' }}>{log.user}</td>
                <td style={{ padding: '6px 8px', verticalAlign: 'top' }}>{log.action}</td>
                <td style={{ padding: '6px 8px', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
