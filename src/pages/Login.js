import React, { useState } from 'react';
import api from '../api';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      const response = await api.post('/api/auth/token/', {
        username,
        password,
      });
      const token = response.data.token;
      // Save token temporarily to call /accounts/me/
      localStorage.setItem('token', token);
      // Fetch current user details to determine role
      const meResp = await api.get('/api/accounts/me/');
      const roles = meResp.data.roles || [];
      let userRole = 'User';
      if (roles.includes('Admin')) userRole = 'Admin';
      else if (roles.includes('Lender')) userRole = 'Lender';
      else if (roles.includes('Borrower')) userRole = 'Borrower';
      onLogin(token, userRole);
    } catch (e) {
      setError('Invalid credentials');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Email or username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>
          Sign In
        </button>
      </form>
    </div>
  );
}

export default Login;