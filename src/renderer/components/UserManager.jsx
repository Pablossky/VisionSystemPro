import React, { useEffect, useState } from 'react';

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', role: 'operator' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const data = await window.electronAPI.getAllUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAddUser(e) {
    e.preventDefault();
    const res = await window.electronAPI.addUser(form);
    if (res.success) {
      setMessage('Dodano użytkownika');
      fetchUsers();
      setForm({ username: '', password: '', role: 'operator' });
    } else {
      setMessage(res.message || 'Błąd');
    }
  }

  async function handleRoleChange(username, newRole) {
    const res = await window.electronAPI.updateUserRole({ username, newRole });
    if (res.success) {
      setMessage('Zmieniono rolę');
      fetchUsers();
    } else {
      setMessage(res.message || 'Błąd');
    }
  }

  return (
    <div>
      <h2>Zarządzanie użytkownikami</h2>

      <form onSubmit={handleAddUser}>
        <input
          placeholder="Nazwa użytkownika"
          value={form.username}
          onChange={e => setForm({ ...form, username: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Hasło"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          required
        />
        <select
          value={form.role}
          onChange={e => setForm({ ...form, role: e.target.value })}
        >
          <option value="programmer">programmer</option>
          <option value="service">service</option>
          <option value="admin">admin</option>
          <option value="operator">operator</option>
        </select>
        <button type="submit">Dodaj użytkownika</button>
      </form>

      {message && <p>{message}</p>}

      <table border="1" cellPadding="5" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>Użytkownik</th>
            <th>Rola</th>
            <th>Zmień rolę</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.username}</td>
              <td>{u.role}</td>
              <td>
                <select
                  value={u.role}
                  onChange={e => handleRoleChange(u.username, e.target.value)}
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
  );
}
