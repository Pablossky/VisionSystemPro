import React, { useEffect, useState } from 'react';
import { Tabs, Tab, Button, Form, Alert } from 'react-bootstrap';
import TemplateFileSelector from './../../components/templateFileSelector/TemplateFileSelector';
import './GoalsPanel.css';

export default function GoalsPanel({ logs, userRole }) {
  const [goals, setGoals] = useState({});
  const [scannedToday, setScannedToday] = useState({});
  const [activeTab, setActiveTab] = useState('add');
  const [newGoalId, setNewGoalId] = useState(null);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalCount, setNewGoalCount] = useState('');
  const [error, setError] = useState('');
  const isOperator = userRole === 'operator';

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('scanGoalsById')) || {};
    setGoals(saved);
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayLogs = logs.filter(
      (log) =>
        log.timestamp?.startsWith(today) &&
        log.action?.toLowerCase().includes('zatwierdzono skan')
    );

    const countMap = {};
    todayLogs.forEach((log) => {
      const id = log.elementId || extractElementName(log.details);
      if (!id) return;
      countMap[id] = (countMap[id] || 0) + 1;
    });

    setScannedToday(countMap);
    localStorage.setItem('scanProgressToday', JSON.stringify(countMap));
  }, [logs]);

  const extractElementName = (details) => {
    if (!details) return null;
    const match = details.match(/element[:\s]*([A-Za-z0-9\-_\.]+)/i);
    if (!match) return null;
    return match[1].replace(/\.json$/, '');
  };

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

    setGoals((prev) => {
      const updated = {
        ...prev,
        [newGoalId]: { name: newGoalName, count: parseInt(newGoalCount) },
      };
      localStorage.setItem('scanGoalsById', JSON.stringify(updated));
      return updated;
    });

    setNewGoalId(null);
    setNewGoalName('');
    setNewGoalCount('');
    setActiveTab('current');
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
    <div className="main-panel">
      <h2>Panel zleceń skanowania</h2>
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
        <Tab eventKey="add" title="➕ Dodaj zlecenie">
          {!isOperator ? (
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

              <Form.Group className="mt-3" controlId="goalCount">
                <Form.Label>Ilość do zeskanowania</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={newGoalCount}
                  onChange={(e) => setNewGoalCount(e.target.value)}
                />
              </Form.Group>

              {error && <Alert variant="danger" className="mt-2">{error}</Alert>}

              <Button className="mt-3" onClick={addNewGoal}>
                Dodaj zlecenie
              </Button>
            </>
          ) : (
            <p>Operatorzy nie mogą dodawać zleceń.</p>
          )}
        </Tab>

        <Tab eventKey="current" title="🕒 Aktualne zlecenia">
          {currentGoals.length === 0 ? (
            <p>Brak aktualnych zleceń do zrobienia.</p>
          ) : (
            <div className="goal-card-container">
              {currentGoals.map(({ id, name, count, done }) => {
                const remaining = Math.max(count - done, 0);
                const percent = Math.min(100, Math.round((done / count) * 100));

                return (
                  <div key={id} className="goal-card">
                    <h4>{name}</h4>
                    <p>{done} / {count}</p>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: '#2196f3',
                        }}
                      />
                    </div>
                    <span className="remaining">Pozostało: {remaining}</span>

                    {!isOperator && (
                      <div className="mt-2">
                        <Form.Control
                          type="number"
                          min="0"
                          value={count}
                          onChange={(e) => updateGoalCount(id, e.target.value)}
                          style={{ width: '80px', display: 'inline-block', marginRight: '10px' }}
                        />
                        <Button variant="danger" onClick={() => removeGoal(id)}>
                          Usuń
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Tab>

        <Tab eventKey="finished" title="✔️ Skończone zadania">
          {finishedGoals.length === 0 ? (
            <p>Brak zakończonych zadań.</p>
          ) : (
            <div className="goal-card-container">
              {finishedGoals.map(({ id, name, count, done }) => (
                <div key={id} className="goal-card">
                  <h4>{name}</h4>
                  <p>{done} / {count}</p>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar"
                      style={{
                        width: `100%`,
                        backgroundColor: '#4caf50',
                      }}
                    />
                  </div>
                  <span className="remaining">Zadanie zakończone</span>

                  {!isOperator && (
                    <Button
                      variant="danger"
                      onClick={() => removeGoal(id)}
                      className="mt-2"
                    >
                      Usuń
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Tab>
      </Tabs>
    </div>
  );
}
