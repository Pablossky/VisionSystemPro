import React, { useEffect, useState } from 'react';
import { Button, Form, Alert, Row, Col } from 'react-bootstrap';
import TemplateFileSelector from './../../components/templateFileSelector/TemplateFileSelector';
import './GoalsPanel.css';
export default function GoalsPanel({ logs, userRole }) {
    const [goals, setGoals] = useState({});
    const [scannedToday, setScannedToday] = useState({});
    const [newGoalId, setNewGoalId] = useState(null);
    const [newGoalName, setNewGoalName] = useState('');
    const [newGoalCount, setNewGoalCount] = useState('');
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const isOperator = userRole === 'operator';
    const normalizeId = (id) => {
        if (!id)
            return null;
        return id.replace(/\.json$/i, '');
    };
    const extractElementName = (details) => {
        if (!details)
            return null;
        const match = details.match(/element[:\s]*([A-Za-z0-9\-_\.]+)/i);
        if (!match)
            return null;
        return normalizeId(match[1]);
    };
    useEffect(() => {
        const savedRaw = JSON.parse(localStorage.getItem('scanGoalsById')) || {};
        const savedNormalized = {};
        for (const [key, val] of Object.entries(savedRaw)) {
            const normKey = normalizeId(key);
            savedNormalized[normKey] = val;
        }
        setGoals(savedNormalized);
    }, []);
    useEffect(() => {
        if (!logs)
            return;
        const today = new Date().toISOString().slice(0, 10);
        const todayLogs = logs.filter((log) => {
            var _a, _b;
            return ((_a = log.timestamp) === null || _a === void 0 ? void 0 : _a.startsWith(today)) &&
                ((_b = log.action) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes('zatwierdzono skan'));
        });
        const countMap = {};
        todayLogs.forEach((log) => {
            const rawId = log.elementId || extractElementName(log.details);
            const id = normalizeId(rawId);
            if (!id)
                return;
            countMap[id] = (countMap[id] || 0) + 1;
        });
        setScannedToday(countMap);
    }, [logs]);
    const addNewGoal = () => {
        if (!newGoalId || !newGoalName || !newGoalCount) {
            setError('Wypełnij wszystkie pola.');
            return;
        }
        if (isNaN(newGoalCount) || parseInt(newGoalCount) <= 0) {
            setError('Ilość musi być dodatnią liczbą całkowitą.');
            return;
        }
        setError('');
        const normId = normalizeId(newGoalId);
        setGoals((prev) => {
            const updated = Object.assign(Object.assign({}, prev), { [normId]: { name: newGoalName, count: parseInt(newGoalCount) } });
            localStorage.setItem('scanGoalsById', JSON.stringify(updated));
            return updated;
        });
        setNewGoalId(null);
        setNewGoalName('');
        setNewGoalCount('');
        setShowAddForm(false);
    };
    const updateGoalCount = (id, value) => {
        setGoals((prev) => {
            const updated = Object.assign(Object.assign({}, prev), { [id]: Object.assign(Object.assign({}, prev[id]), { count: parseInt(value) || 0 }) });
            localStorage.setItem('scanGoalsById', JSON.stringify(updated));
            return updated;
        });
    };
    const removeGoal = (id) => {
        setGoals((prev) => {
            const updated = Object.assign({}, prev);
            delete updated[id];
            localStorage.setItem('scanGoalsById', JSON.stringify(updated));
            return updated;
        });
    };
    const currentGoals = [];
    const finishedGoals = [];
    for (const [id, { name, count }] of Object.entries(goals)) {
        const done = scannedToday[id] || 0;
        if (done >= count)
            finishedGoals.push({ id, name, count, done });
        else
            currentGoals.push({ id, name, count, done });
    }
    currentGoals.sort((a, b) => a.name.localeCompare(b.name));
    finishedGoals.sort((a, b) => a.name.localeCompare(b.name));
    return (React.createElement("div", { className: "main-panel", style: {
            maxWidth: 900,
            borderRadius: 10,
            margin: '0 auto',
            padding: 10,
            display: 'flex',
            flexDirection: 'column',
        } },
        React.createElement("header", { style: {
                marginBottom: 15,
                borderBottom: '1px solid #333',
                paddingBottom: 5,
                flexShrink: 0,
            } },
            React.createElement("h2", { style: { margin: 0, fontSize: '1em' } }, "Panel zlece\u0144 skanowania")),
        React.createElement("main", { style: { flexGrow: 1 } },
            !isOperator && !showAddForm && (React.createElement(Button, { onClick: () => setShowAddForm(true), variant: "primary", style: { marginBottom: 10, fontSize: '0.85em', padding: '5px 10px' } }, "Dodaj zlecenie")),
            showAddForm && !isOperator && (React.createElement("div", { style: { marginBottom: 10 } },
                React.createElement(TemplateFileSelector, { onSelectElements: (selected) => {
                        if (selected.length > 0) {
                            const first = selected[0];
                            setNewGoalId(first.id);
                            setNewGoalName(first.name);
                            setError('');
                        }
                    }, preselectedElementIds: newGoalId ? [newGoalId] : [] }),
                React.createElement(Form.Group, { as: Row, className: "mt-2", controlId: "goalCount", style: { alignItems: 'center' } },
                    React.createElement(Form.Label, { column: true, sm: 4, style: { fontWeight: 600, fontSize: '0.85em' } }, "Ilo\u015B\u0107"),
                    React.createElement(Col, { sm: 4, md: 3 },
                        React.createElement(Form.Control, { type: "number", min: "1", value: newGoalCount, onChange: (e) => setNewGoalCount(e.target.value), placeholder: "Liczba", style: { fontSize: '0.85em', padding: '3px 5px' } })),
                    React.createElement(Col, { sm: 4, md: 5, style: { display: 'flex', gap: 5 } },
                        React.createElement(Button, { variant: "success", onClick: addNewGoal, style: { fontSize: '0.8em', padding: '3px 8px' } }, "Zapisz"),
                        React.createElement(Button, { variant: "outline-secondary", onClick: () => setShowAddForm(false), style: { fontSize: '0.8em', padding: '3px 8px' } }, "Anuluj"))),
                error && React.createElement(Alert, { variant: "danger", style: { marginTop: 5, fontSize: '0.8em' } }, error))),
            isOperator && React.createElement("p", { style: { fontSize: '0.85em' } }, "Operatorzy nie mog\u0105 dodawa\u0107 zlece\u0144."),
            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
                React.createElement("section", { style: {
                        maxHeight: 300,
                        overflowY: 'auto',
                        border: '1px solid #444',
                        borderRadius: 6,
                        padding: 5,
                    } },
                    React.createElement("h4", { style: { margin: '3px 0', fontSize: '0.9em' } }, "\uD83D\uDD52 Aktualne zlecenia"),
                    currentGoals.length === 0 ? (React.createElement("p", { style: { fontSize: '0.8em' } }, "Brak aktualnych zlece\u0144.")) : (React.createElement("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                            gap: 5,
                        } }, currentGoals.map(({ id, name, count, done }) => {
                        const remaining = Math.max(count - done, 0);
                        const percent = Math.min(100, Math.round((done / count) * 100));
                        return (React.createElement("div", { key: id, style: {
                                border: '1px solid #555',
                                borderRadius: 6,
                                padding: 5,
                                boxShadow: '0 1px 2px rgb(0 0 0 / 0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                fontSize: '0.8em',
                            } },
                            React.createElement("strong", null, name),
                            React.createElement("p", { style: { margin: 2 } },
                                done,
                                " / ",
                                count,
                                " zeskanowano"),
                            React.createElement("div", { style: {
                                    height: 6,
                                    backgroundColor: '#333',
                                    borderRadius: 6,
                                    overflow: 'hidden',
                                    marginBottom: 3,
                                } },
                                React.createElement("div", { style: {
                                        width: `${percent}%`,
                                        backgroundColor: '#2196f3',
                                        height: '100%',
                                        borderRadius: 6,
                                    } })),
                            React.createElement("span", { style: { fontSize: '0.75em', color: '#aaa' } },
                                "Pozosta\u0142o: ",
                                remaining),
                            !isOperator && (React.createElement("div", { style: { marginTop: 4, display: 'flex', gap: 3, alignItems: 'center' } },
                                React.createElement(Form.Control, { type: "number", min: "0", value: count, onChange: (e) => updateGoalCount(id, e.target.value), style: { maxWidth: 45, fontSize: '0.75em', padding: '2px 4px' } }),
                                React.createElement(Button, { variant: "outline-danger", onClick: () => removeGoal(id), size: "sm", style: { fontSize: '0.7em', padding: '2px 5px' } }, "Usu\u0144")))));
                    })))),
                React.createElement("section", { style: {
                        maxHeight: 300,
                        overflowY: 'auto',
                        border: '1px solid #444',
                        borderRadius: 6,
                        padding: 5,
                    } },
                    React.createElement("h4", { style: { margin: '3px 0', fontSize: '0.9em' } }, "\u2714\uFE0F Sko\u0144czone"),
                    finishedGoals.length === 0 ? (React.createElement("p", { style: { fontSize: '0.8em' } }, "Brak zako\u0144czonych zada\u0144.")) : (React.createElement("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                            gap: 5,
                        } }, finishedGoals.map(({ id, name, count, done }) => (React.createElement("div", { key: id, style: {
                            border: '1px solid #555',
                            borderRadius: 6,
                            padding: 5,
                            boxShadow: '0 1px 2px rgb(0 0 0 / 0.1)',
                            fontSize: '0.8em',
                        } },
                        React.createElement("strong", null, name),
                        React.createElement("p", { style: { margin: 2 } },
                            done,
                            " / ",
                            count,
                            " zeskanowano"),
                        React.createElement("div", { style: {
                                height: 6,
                                backgroundColor: '#333',
                                borderRadius: 6,
                                overflow: 'hidden',
                                marginBottom: 3,
                            } },
                            React.createElement("div", { style: {
                                    width: '100%',
                                    backgroundColor: '#4caf50',
                                    height: '100%',
                                    borderRadius: 6,
                                } })),
                        React.createElement("span", { style: { fontSize: '0.75em', color: '#4caf50', fontWeight: 600 } }, "Zadanie zako\u0144czone"),
                        !isOperator && (React.createElement("div", { style: { marginTop: 3 } },
                            React.createElement(Button, { variant: "outline-danger", onClick: () => removeGoal(id), size: "sm", style: { fontSize: '0.7em', padding: '2px 5px' } }, "Usu\u0144")))))))))))));
}
