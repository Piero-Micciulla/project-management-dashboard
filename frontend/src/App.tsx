// src/App.tsx
import React, { useState } from 'react';
import './App.css';
import Register from './components/Register';
import Login from './components/Login';

const App = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const handleLogin = (newToken: string) => {
    setToken(newToken);
  };

  return (
    <div className="App">
      <h1>Project Management Dashboard</h1>
      {!token ? (
        <div>
          <Register />
          <Login onLogin={handleLogin} />
        </div>
      ) : (
        <div>
          <h2>Welcome to the Dashboard!</h2>
          <button onClick={() => setToken(null)}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default App;
