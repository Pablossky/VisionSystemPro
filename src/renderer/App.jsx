import React, { useState } from 'react';
import Login from './views/Login';
import MainMenu from './views/MainMenu';

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <>
      {!user ? (
        <Login onLogin={setUser} />
      ) : (
        <MainMenu user={user} />
      )}
    </>
  );
}
