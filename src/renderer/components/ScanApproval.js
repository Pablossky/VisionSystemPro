var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { useState, useEffect } from 'react';
export default function ScanApproval({ elements, user, onDone, markerNumber, isVerificationMode = false, originalLogId = null }) {
    const [comment, setComment] = useState('');
    const [scanConfirmed, setScanConfirmed] = useState(null);
    const [predefinedComments, setPredefinedComments] = useState([]);
    useEffect(() => {
        function fetchComments() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const comments = yield window.electronAPI.invoke('get-approval-comments');
                    setPredefinedComments(comments.map(c => c.text));
                }
                catch (err) {
                    console.error('Nie udało się pobrać komentarzy:', err);
                }
            });
        }
        fetchComments();
    }, []);
    if (!elements || elements.length === 0) {
        return React.createElement("p", null, "Brak element\u00F3w do zatwierdzenia.");
    }
    const handleConfirm = (status) => __awaiter(this, void 0, void 0, function* () {
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
            var _a;
            const name = el.marker_number || ((_a = el.data) === null || _a === void 0 ? void 0 : _a.name) || `Element ${el.id || ''}`;
            const acc = typeof el.accuracy === 'number' ? `${el.accuracy.toFixed(1)}%` : 'brak danych';
            return `${name}, Accuracy: ${acc}`;
        }).join('\n');
        const logDetails = `Marker: ${markerNumber}\nStatus: ${statusLabel}\nKomentarz: ${comment || '-'}\n${description}`;
        try {
            const result = yield window.electronAPI.logAction({
                username: user.username,
                action: actionText,
                details: logDetails,
                scanData: JSON.stringify(elements),
                related_log_id: isVerificationMode ? originalLogId : null,
            });
            console.log('Zapisano log o id:', result.id);
        }
        catch (e) {
            alert('Błąd zapisu logu');
            return;
        }
        setScanConfirmed(status);
        setTimeout(() => {
            onDone();
            setScanConfirmed(null);
            setComment('');
        }, 1500);
    });
    // Pozostała część bez zmian
    const statusColors = {
        approved: 'green',
        rejected: 'red',
        review: 'orange',
    };
    const statusTexts = {
        approved: 'zatwierdzony',
        rejected: 'odrzucony',
        review: 'oznaczony do sprawdzenia',
    };
    return (React.createElement("div", { style: { marginTop: 20, borderTop: '1px solid #ccc', paddingTop: 12 } },
        React.createElement("h3", null, isVerificationMode ? 'Weryfikacja skanu' : 'Zatwierdź lub odrzuć skan'),
        React.createElement("div", { style: { display: 'flex', gap: 10 } },
            React.createElement("textarea", { placeholder: "Dodaj komentarz...", value: comment, onChange: e => setComment(e.target.value), rows: 3, style: {
                    flex: 1,
                    padding: 8,
                    borderRadius: 4,
                    border: '1px solid #ccc'
                } }),
            React.createElement("select", { value: "", onChange: (e) => setComment(e.target.value), style: {
                    width: 200,
                    padding: 6,
                    borderRadius: 4,
                    border: '1px solid #ccc',
                    background: '#f5f5f5',
                    cursor: 'pointer',
                } },
                React.createElement("option", { value: "", disabled: true }, "Wybierz gotowy komentarz"),
                predefinedComments.map((c, i) => (React.createElement("option", { key: i, value: c }, c || '[brak]'))))),
        React.createElement("div", { style: { marginTop: 10, display: 'flex', gap: 10 } },
            React.createElement("button", { style: { backgroundColor: 'green', color: 'white', padding: '8px 12px', border: 'none', borderRadius: 4, cursor: 'pointer' }, onClick: () => handleConfirm('approved'), disabled: scanConfirmed === 'approved' }, "Zatwierd\u017A skan"),
            React.createElement("button", { style: { backgroundColor: 'red', color: 'white', padding: '8px 12px', border: 'none', borderRadius: 4, cursor: 'pointer' }, onClick: () => handleConfirm('rejected'), disabled: scanConfirmed === 'rejected' }, "Odrzu\u0107 skan"),
            React.createElement("button", { style: { backgroundColor: 'goldenrod', color: 'black', padding: '8px 12px', border: 'none', borderRadius: 4, cursor: 'pointer' }, onClick: () => handleConfirm('review'), disabled: scanConfirmed === 'review' }, "Do sprawdzenia")),
        scanConfirmed && (React.createElement("p", { style: { marginTop: 10, fontWeight: 'bold', color: statusColors[scanConfirmed] } },
            "Skan zosta\u0142 ",
            statusTexts[scanConfirmed],
            "."))));
}
