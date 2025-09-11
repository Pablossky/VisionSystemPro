var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
            filtered = filtered.filter(log => { var _a; return (_a = log.username) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(filterUser.toLowerCase()); });
        }
        if (filterAction) {
            filtered = filtered.filter(log => { var _a; return (_a = log.action) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(filterAction.toLowerCase()); });
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
        if (!Array.isArray(filteredLogs))
            return summary;
        filteredLogs.forEach(log => {
            var _a;
            const action = ((_a = log.action) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
            if (action.includes('zatwierdzono skan'))
                summary.zatwierdzone++;
            else if (action.includes('odrzucono skan'))
                summary.odrzucone++;
            else if (action.includes('do sprawdzenia'))
                summary.doSprawdzenia++;
            else if (action.includes('weryfikacja'))
                summary.weryfikacje++;
            else if (action.includes('zmiana roli'))
                summary.zmianaRoli++;
            else if (action.includes('utworzono nowy profil'))
                summary.nowyProfil++;
        });
        return summary;
    }, [filteredLogs]);
    const generatePDF = () => __awaiter(this, void 0, void 0, function* () {
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
        const result = yield window.electronAPI.savePDF(pdfBase64, `logi_${filterDate || 'wszystkie'}.pdf`);
        if (result.success)
            alert(`PDF zapisano w: ${result.path}`);
        else
            alert(`Nie udało się zapisać PDF: ${result.error}`);
    });
    return (React.createElement("div", { style: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', color: 'white',
            padding: 20, zIndex: 1000, display: 'flex', flexDirection: 'column',
        } },
        React.createElement("div", { style: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 10 } },
            React.createElement("button", { onClick: generatePDF, style: { padding: '6px 12px', backgroundColor: '#222', color: 'white' } }, "Generuj PDF"),
            React.createElement("button", { onClick: onClose, style: { padding: '6px 12px' } }, "Zamknij")),
        React.createElement("h2", null, "Logi systemowe"),
        React.createElement("div", { style: {
                backgroundColor: '#111',
                border: '1px solid #333',
                borderRadius: 6,
                padding: 12,
                marginBottom: 15,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                justifyContent: 'flex-start'
            } },
            React.createElement("div", null,
                React.createElement("strong", null, "\uD83D\uDCC5 Data:"),
                " ",
                filterDate || 'Brak wybranej daty'),
            React.createElement("div", null,
                React.createElement("strong", { style: { color: '#4caf50' } }, "\u2714\uFE0F Zatwierdzone:"),
                " ",
                actionSummary.zatwierdzone),
            React.createElement("div", null,
                React.createElement("strong", { style: { color: '#f44336' } }, "\u274C Odrzucone:"),
                " ",
                actionSummary.odrzucone),
            React.createElement("div", null,
                React.createElement("strong", { style: { color: '#ffeb3b' } }, "\u26A0\uFE0F Do sprawdzenia:"),
                " ",
                actionSummary.doSprawdzenia),
            React.createElement("div", null,
                React.createElement("strong", { style: { color: '#66bb6a' } }, "\uD83E\uDDEA Weryfikacje:"),
                " ",
                actionSummary.weryfikacje),
            React.createElement("div", null,
                React.createElement("strong", { style: { color: '#2196f3' } }, "\uD83D\uDC64 Zmiana roli:"),
                " ",
                actionSummary.zmianaRoli),
            React.createElement("div", null,
                React.createElement("strong", { style: { color: '#64ffda' } }, "\u2795 Nowy profil:"),
                " ",
                actionSummary.nowyProfil)),
        React.createElement("div", { style: { marginBottom: 15, display: 'flex', gap: 12, flexWrap: 'wrap' } },
            React.createElement("input", { type: "text", placeholder: "Filtruj po u\u017Cytkowniku", value: filterUser, onChange: e => setFilterUser(e.target.value), style: { padding: '6px', borderRadius: 4, border: '1px solid #ccc', minWidth: 150 }, list: "users-list" }),
            React.createElement("datalist", { id: "users-list" }, uniqueUsers.map(u => React.createElement("option", { key: u, value: u }))),
            React.createElement("input", { type: "text", placeholder: "Filtruj po akcji (np. skanowanie)", value: filterAction, onChange: e => setFilterAction(e.target.value), style: { padding: '6px', borderRadius: 4, border: '1px solid #ccc', minWidth: 150 } }),
            React.createElement("input", { type: "date", value: filterDate, onChange: e => setFilterDate(e.target.value), style: { padding: '6px', borderRadius: 4, border: '1px solid #ccc' } }),
            React.createElement("button", { onClick: () => setSortAsc(!sortAsc), style: { padding: '6px 12px', borderRadius: 4, border: 'none', cursor: 'pointer', backgroundColor: '#444', color: 'white' } },
                "Sortuj: ",
                sortAsc ? 'rosnąco' : 'malejąco')),
        loading && React.createElement("p", null, "\u0141adowanie log\u00F3w..."),
        error && React.createElement("p", { style: { color: 'red' } }, error),
        React.createElement("div", { style: { flex: 1, overflowY: 'auto', border: '1px solid #444', borderRadius: 6 } },
            React.createElement("table", { style: { width: '100%', borderCollapse: 'collapse', color: 'white' } },
                React.createElement("thead", { style: { position: 'sticky', top: 0, backgroundColor: '#222' } },
                    React.createElement("tr", null,
                        React.createElement("th", { style: { padding: '8px', borderBottom: '1px solid #555' } }, "ID logu"),
                        React.createElement("th", { style: { padding: '8px', borderBottom: '1px solid #555' } }, "Related ID"),
                        React.createElement("th", { style: { padding: '8px', borderBottom: '1px solid #555' } }, "Data i czas"),
                        React.createElement("th", { style: { padding: '8px', borderBottom: '1px solid #555' } }, "U\u017Cytkownik"),
                        React.createElement("th", { style: { padding: '8px', borderBottom: '1px solid #555' } }, "Akcja"),
                        React.createElement("th", { style: { padding: '8px', borderBottom: '1px solid #555' } }, "Szczeg\u00F3\u0142y"),
                        React.createElement("th", { style: { padding: '8px', borderBottom: '1px solid #555' } }, "Weryfikacja"))),
                React.createElement("tbody", null,
                    filteredLogs.length === 0 && !loading && (React.createElement("tr", null,
                        React.createElement("td", { colSpan: 7, style: { padding: '12px', textAlign: 'center', color: '#aaa' } }, "Brak log\u00F3w spe\u0142niaj\u0105cych kryteria"))),
                    filteredLogs.map(log => {
                        var _a;
                        const actionLower = ((_a = log.action) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
                        const isReviewRequest = actionLower.includes('do sprawdzenia');
                        const isVerificationLog = actionLower.includes('weryfikacja');
                        const isScanRelated = [
                            'skanowanie',
                            'do sprawdzenia skan',
                            'zatwierdzono skan',
                            'odrzucono skan',
                            'weryfikacja'
                        ].some(type => actionLower.includes(type));
                        return (React.createElement("tr", { key: log.id, style: {
                                borderBottom: '1px solid #444',
                                backgroundColor: isVerificationLog ? '#225522' // ciemna zieleń dla logów weryfikacji
                                    : isReviewRequest ? '#665500' // żółto-brązowy dla "do sprawdzenia"
                                        : 'transparent'
                            } },
                            React.createElement("td", { style: { padding: '6px 8px', verticalAlign: 'top', whiteSpace: 'nowrap', fontFamily: 'monospace' } }, log.id),
                            React.createElement("td", { style: { padding: '6px 8px', verticalAlign: 'top', whiteSpace: 'nowrap', fontFamily: 'monospace' } }, log.related_log_id || '-'),
                            React.createElement("td", { style: { padding: '6px 8px', verticalAlign: 'top', whiteSpace: 'nowrap' } }, new Date(log.timestamp).toLocaleString()),
                            React.createElement("td", { style: { padding: '6px 8px', verticalAlign: 'top' } }, log.username),
                            React.createElement("td", { style: { padding: '6px 8px', verticalAlign: 'top', fontWeight: isReviewRequest ? 'bold' : 'normal' } },
                                log.action,
                                " ",
                                isReviewRequest && React.createElement("span", { style: { color: 'yellow' } }, "\u26A0\uFE0F")),
                            React.createElement("td", { style: {
                                    padding: '6px 8px',
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'monospace',
                                    color: isReviewRequest ? '#fff8c6' : 'inherit'
                                } }, log.details),
                            React.createElement("td", null, isScanRelated && (React.createElement("button", { onClick: () => {
                                    if (log.scan_data) {
                                        try {
                                            const parsed = JSON.parse(log.scan_data);
                                            console.log("parsed scan_data:", parsed);
                                            onReplayScan(parsed, log.details, { isVerificationMode: true, originalLogId: log.id, relatedLogId: log.related_log_id });
                                        }
                                        catch (e) {
                                            alert(`Błąd parsowania danych skanu:\n${e.message}`);
                                        }
                                    }
                                    else {
                                        alert(`Brak danych skanu.\n\nSzczegóły logu:\n${log.details || '(brak)'}`);
                                    }
                                }, style: {
                                    padding: '4px 8px',
                                    backgroundColor: log.scan_data ? '#444' : '#222',
                                    color: log.scan_data ? 'white' : '#888',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: log.scan_data ? 'pointer' : 'default'
                                } }, "Sprawd\u017A")))));
                    }))))));
}
