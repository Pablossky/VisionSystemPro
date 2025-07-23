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
    if (!id) return null;
    return id.replace(/\.json$/i, '');
  };

  const extractElementName = (details) => {
    if (!details) return null;
    const match = details.match(/element[:\s]*([A-Za-z0-9\-_\.]+)/i);
    if (!match) return null;
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
    if (!logs) return;

    const today = new Date().toISOString().slice(0, 10);
    const todayLogs = logs.filter(
      (log) =>
        log.timestamp?.startsWith(today) &&
        log.action?.toLowerCase().includes('zatwierdzono skan')
    );

    const countMap = {};
    todayLogs.forEach((log) => {
      const rawId = log.elementId || extractElementName(log.details);
      const id = normalizeId(rawId);
      if (!id) return;
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
      const updated = {
        ...prev,
        [normId]: { name: newGoalName, count: parseInt(newGoalCount) },
      };
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
      const updated = {
        ...prev,
        [id]: { ...prev[id], count: parseInt(value) || 0 },
      };
      localStorage.setItem('scanGoalsById', JSON.stringify(updated));
      return updated;
    });
  };

  const removeGoal = (id) => {
    setGoals((prev) => {
      const updated = { ...prev };
      delete updated[id];
      localStorage.setItem('scanGoalsById', JSON.stringify(updated));
      return updated;
    });
  };

  const currentGoals = [];
  const finishedGoals = [];
  for (const [id, { name, count }] of Object.entries(goals)) {
    const done = scannedToday[id] || 0;
    if (done >= count) finishedGoals.push({ id, name, count, done });
    else currentGoals.push({ id, name, count, done });
  }
  currentGoals.sort((a, b) => a.name.localeCompare(b.name));
  finishedGoals.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div
      className="main-panel"
      style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Tytuł panelu */}
      <header
        style={{
          marginBottom: 30,
          borderBottom: '2px solid #333',
          paddingBottom: 10,
          flexShrink: 0,
        }}
      >
        <h1 style={{ margin: 0 }}>Panel zleceń skanowania</h1>
      </header>

      {/* Główna zawartość */}
      <main style={{ flexGrow: 1 }}>
        {/* Sekcja dodawania zlecenia */}
        {!isOperator && (
          <section style={{ marginBottom: 40 }}>
            {!showAddForm && (
              <Button onClick={() => setShowAddForm(true)} variant="primary" className="mb-3">
                Dodaj zlecenie
              </Button>
            )}
            {showAddForm && (
              <>
                <TemplateFileSelector
                  onSelectElements={(selected) => {
                    if (selected.length > 0) {
                      const first = selected[0];
                      setNewGoalId(first.id);
                      setNewGoalName(first.name);
                      setError('');
                    }
                  }}
                  preselectedElementIds={newGoalId ? [newGoalId] : []}
                />

                <Form.Group
                  as={Row}
                  className="mt-3"
                  controlId="goalCount"
                  style={{ alignItems: 'center' }}
                >
                  <Form.Label column sm={4} style={{ fontWeight: '600' }}>
                    Ilość do zeskanowania
                  </Form.Label>
                  <Col sm={4} md={3}>
                    <Form.Control
                      type="number"
                      min="1"
                      value={newGoalCount}
                      onChange={(e) => setNewGoalCount(e.target.value)}
                      placeholder="Liczba"
                    />
                  </Col>
                  <Col sm={4} md={5} style={{ display: 'flex', gap: 10 }}>
                    <Button variant="success" onClick={addNewGoal}>
                      Zapisz
                    </Button>
                    <Button variant="outline-secondary" onClick={() => setShowAddForm(false)}>
                      Anuluj
                    </Button>
                  </Col>
                </Form.Group>

                {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
              </>
            )}
            {isOperator && <p>Operatorzy nie mogą dodawać zleceń.</p>}
          </section>
        )}

        {/* Wrapper z flexem dla dwóch sekcji */}
        <div
          style={{
            display: 'flex',
            gap: 20,
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          {/* Aktualne zlecenia */}
          <section
            style={{
              flex: 1,
              maxWidth: '48%',
              maxHeight: 400,
              overflowY: 'auto',
              border: '1px solid #ccc',
              borderRadius: 8,
              padding: 10,
            }}
          >
            <h3>🕒 Aktualne zlecenia</h3>
            {currentGoals.length === 0 ? (
              <p>Brak aktualnych zleceń do zrobienia.</p>
            ) : (
              <div
                className="goal-card-container"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 15,
                }}
              >
                {currentGoals.map(({ id, name, count, done }) => {
                  const remaining = Math.max(count - done, 0);
                  const percent = Math.min(100, Math.round((done / count) * 100));

                  return (
                    <div
                      key={id}
                      className="goal-card"
                      style={{
                        flex: '1 1 220px',
                        border: '1px solid #ddd',
                        borderRadius: 8,
                        padding: 12,
                        boxShadow: '0 2px 5px rgb(0 0 0 / 0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <h5 style={{ marginBottom: 6 }}>{name}</h5>
                        <p style={{ fontWeight: '600', marginBottom: 8 }}>
                          {done} / {count} zeskanowano
                        </p>

                        <div
                          className="progress-bar-container"
                          style={{
                            height: 10,
                            backgroundColor: '#eee',
                            borderRadius: 10,
                            overflow: 'hidden',
                            marginBottom: 10,
                          }}
                        >
                          <div
                            className="progress-bar"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: '#2196f3',
                              height: '100%',
                              borderRadius: '10px 0 0 10px',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>

                        <span style={{ color: '#555', fontStyle: 'italic', fontSize: 13 }}>
                          Pozostało: {remaining}
                        </span>
                      </div>

                      {!isOperator && (
                        <div
                          style={{
                            marginTop: 10,
                            display: 'flex',
                            gap: 8,
                            alignItems: 'center',
                          }}
                        >
                          <Form.Control
                            type="number"
                            min="0"
                            value={count}
                            onChange={(e) => updateGoalCount(id, e.target.value)}
                            style={{ maxWidth: 70, fontSize: 14 }}
                            aria-label={`Edytuj ilość celu ${name}`}
                          />
                          <Button variant="outline-danger" onClick={() => removeGoal(id)} size="sm">
                            Usuń
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Skończone zadania */}
          <section
            style={{
              flex: 1,
              maxWidth: '48%',
              maxHeight: 400,
              overflowY: 'auto',
              border: '1px solid #ccc',
              borderRadius: 8,
              padding: 10,
            }}
          >
            <h3>✔️ Skończone zadania</h3>
            {finishedGoals.length === 0 ? (
              <p>Brak zakończonych zadań.</p>
            ) : (
              <div className="goal-card-container" style={{ display: 'flex', flexWrap: 'wrap', gap: 15 }}>
                {finishedGoals.map(({ id, name, count, done }) => (
                  <div
                    key={id}
                    className="goal-card"
                    style={{
                      flex: '1 1 220px',
                      border: '1px solid #ddd',
                      borderRadius: 8,
                      padding: 12,
                      boxShadow: '0 2px 5px rgb(0 0 0 / 0.1)',
                    }}
                  >
                    <h5 style={{ marginBottom: 6 }}>{name}</h5>
                    <p style={{ fontWeight: '600', marginBottom: 8 }}>
                      {done} / {count} zeskanowano
                    </p>

                    <div
                      className="progress-bar-container"
                      style={{
                        height: 10,
                        backgroundColor: '#eee',
                        borderRadius: 10,
                        overflow: 'hidden',
                        marginBottom: 10,
                      }}
                    >
                      <div
                        className="progress-bar"
                        style={{
                          width: `100%`,
                          backgroundColor: '#4caf50',
                          height: '100%',
                          borderRadius: 10,
                        }}
                      />
                    </div>

                    <span style={{ color: '#388e3c', fontWeight: '600', fontSize: 14 }}>
                      Zadanie zakończone
                    </span>

                    {!isOperator && (
                      <div style={{ marginTop: 10 }}>
                        <Button variant="outline-danger" onClick={() => removeGoal(id)} size="sm">
                          Usuń
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
