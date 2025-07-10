import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await window.electronAPI.invoke('login-user', { username, password });
    if (response.success) {
      onLogin(response.user);
    } else {
      setError(response.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Logowanie</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Login"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Zaloguj się</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
