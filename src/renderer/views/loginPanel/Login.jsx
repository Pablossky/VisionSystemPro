import React, { useState } from 'react';
import './Login.css';
import Logo from './../../../assets/LOGO.png';


export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState('password'); // 'password' lub 'qr'
  const [qrCode, setQrCode] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'password') {
      const response = await window.electronAPI.invoke('login-user', { username, password });
      if (response.success) {
        onLogin(response.user);
      } else {
        setError(response.message);
      }
    } else if (mode === 'qr') {
      if (!qrCode) {
        setError('Proszę zeskanować kod QR');
        return;
      }
      const response = await window.electronAPI.invoke('login-user-qr', { qrCode });
      if (response.success) {
        onLogin(response.user);
      } else {
        setError(response.message);
      }
    }
  };

  const simulateQrScan = () => {
    setQrCode('PRZYKLADOWY_KOD_QR_123456');
    setError('');
  };

  return (
    <div className="login-wrapper">
      <img src={Logo} alt="Logo" style={{ width: '600px', height: 'auto', paddingRight: '10%' }} />
      <div className="login-panel card">
        <h2>Panel logowania</h2>

        <div className="mode-switcher">
          <button
            className={mode === 'password' ? 'active' : ''}
            onClick={() => { setMode('password'); setError(''); }}
          >
            Login i hasło
          </button>
          <button
            className={mode === 'qr' ? 'active' : ''}
            onClick={() => { setMode('qr'); setError(''); }}
          >
            Logowanie QR
          </button>
        </div>

        <form onSubmit={handleLogin}>
          {mode === 'password' && (
            <>
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
            </>
          )}

          {mode === 'qr' && (
            <div className="qr-login">
              <p>Kliknij przycisk, aby zasymulować skanowanie kodu QR</p>
              <button type="button" onClick={simulateQrScan} className="qr-scan-button">
                Skanuj kod QR
              </button>
              {qrCode && <p className="qr-code-text">Zeskanowany kod: {qrCode}</p>}
            </div>
          )}

          <button type="submit" className="log-button">
            Zaloguj się
          </button>
          {error && <p className="error-text">{error}</p>}
        </form>
      </div>
    </div>
  );
}
