import React, { useState } from 'react';
import Login from './views/loginPanel/Login.jsx';
import MainMenu from './views/mainMenu/MainMenu';

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (loggedUser) => {
    setUser(loggedUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <>
      {user ? (
        <MainMenu user={user} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </>
  );
}
