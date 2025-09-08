import React, { useEffect, useState } from 'react';

export default function UserManager({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', role: 'operator' });
  const [message, setMessage] = useState('');
  const actor = currentUser?.username || 'nieznany';


  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const data = await window.electronAPI.getAllUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
      setMessage('Błąd podczas pobierania użytkowników');
    }
  }

  async function handleAddUser(e) {
    e.preventDefault();
    try {
      const res = await window.electronAPI.addUser(form);
      if (res.success) {
        // Dodanie logu przez handler 'log-action'
        try {
          await window.electronAPI.logAction({
            username: actor,
            action: 'Utworzono nowy profil',
            details: `Użytkownik ${actor} utworzył profil ${form.username} z rolą ${form.role}`
          });
        } catch (logError) {
          console.error('Błąd zapisu logu:', logError);
        }

        setMessage('Utworzono nowy profil');
        fetchUsers();
        setForm({ username: '', password: '', role: 'operator' });
      } else {
        setMessage(res.message || 'Błąd przy dodawaniu użytkownika');
      }
    } catch (err) {
      console.error(err);
      setMessage('Błąd podczas dodawania użytkownika');
    }
  }

  async function handleRoleChange(username, newRole) {
    const oldUser = users.find(u => u.username === username);
    const oldRole = oldUser?.role || 'nieznana';
    try {
      const res = await window.electronAPI.updateUserRole({ username, newRole });
      if (res.success) {
        // Dodanie logu przez handler 'log-action'
        try {
          await window.electronAPI.logAction({
            username: actor,
            action: 'Zmiana roli',
            details: `Użytkownik ${actor} zmienił rolę użytkownika ${username} z ${oldRole} na ${newRole}`
          });
        } catch (logError) {
          console.error('Błąd zapisu logu:', logError);
        }

        setMessage('Zmieniono rolę');
        fetchUsers();
      } else {
        setMessage(res.message || 'Błąd przy zmianie roli');
      }
    } catch (err) {
      console.error(err);
      setMessage('Błąd podczas zmiany roli');
    }
  }

  return (
    <div
      style={{
        backgroundColor: '#1e1e2f',
        color: '#fff',
        padding: 20,
        borderRadius: 12,
        maxWidth: 800,
        margin: '20px auto',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        fontFamily: 'Segoe UI, sans-serif'
      }}
    >
      <h2 style={{ marginBottom: 20, borderBottom: '2px solid #333', paddingBottom: 10 }}>
        Zarządzanie użytkownikami
      </h2>

      <form
        onSubmit={handleAddUser}
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 20,
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <input
          placeholder="Nazwa użytkownika"
          value={form.username}
          onChange={e => setForm({ ...form, username: e.target.value })}
          required
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #444',
            backgroundColor: '#2c2c3c',
            color: '#fff',
            flex: '1 1 200px'
          }}
        />
        <input
          type="password"
          placeholder="Hasło"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          required
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #444',
            backgroundColor: '#2c2c3c',
            color: '#fff',
            flex: '1 1 150px'
          }}
        />
        <select
          value={form.role}
          onChange={e => setForm({ ...form, role: e.target.value })}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #444',
            backgroundColor: '#2c2c3c',
            color: '#fff',
            flex: '1 1 130px'
          }}
        >
          <option value="programmer">programmer</option>
          <option value="service">service</option>
          <option value="admin">admin</option>
          <option value="operator">operator</option>
        </select>
        <button
          type="submit"
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: '#2196f3',
            color: '#fff',
            cursor: 'pointer',
            transition: '0.2s',
            flex: '0 0 auto'
          }}
        >
          Dodaj użytkownika
        </button>
      </form>

      {message && (
        <p style={{ color: '#64ffda', marginBottom: 20, fontWeight: 500 }}>{message}</p>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: '#2c2c3c',
            borderRadius: 10,
            overflow: 'hidden'
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#353656' }}>
              <th style={{ padding: 10, textAlign: 'left' }}>Użytkownik</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Rola</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Zmień rolę</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #444' }}>
                <td style={{ padding: 10 }}>{u.username}</td>
                <td style={{ padding: 10 }}>{u.role}</td>
                <td style={{ padding: 10 }}>
                  <select
                    value={u.role}
                    onChange={e => handleRoleChange(u.username, e.target.value)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      border: '1px solid #555',
                      backgroundColor: '#1f1f35',
                      color: '#fff'
                    }}
                  >
                    <option value="programmer">programmer</option>
                    <option value="service">service</option>
                    <option value="admin">admin</option>
                    <option value="operator">operator</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
