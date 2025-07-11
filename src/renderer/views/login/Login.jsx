import React, { useState } from 'react';
import './Login.css';

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
    <div className="login-wrapper">
      <div className="login-panel card">
        <h2>🔐 Panel logowania</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Login"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="login-input"
          />
          <input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />
          <button type="submit" className="log-button">Zaloguj się</button>
          {error && <p className="error-text">{error}</p>}
        </form>
      </div>
    </div>
  );
}
