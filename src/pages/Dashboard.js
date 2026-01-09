import React from 'react';
import { Link } from 'react-router-dom';

function Dashboard({ role, onLogout }) {
  return (
    <div style={{ padding: '1rem' }}>
      <h2>Dashboard</h2>
      <p>You are logged in as <strong>{role || 'User'}</strong>.</p>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {role === 'Borrower' && (
            <>
              <li>
                <Link to="/borrower/profile">Profile</Link>
              </li>
              <li>
                <Link to="/borrower/projects">My Projects</Link>
              </li>
              <li>
                <Link to="/borrower/matches">Matched Products</Link>
              </li>
              <li>
                <Link to="/borrower/private-equity">Private Equity</Link>
              </li>
            </>
          )}
          {role === 'Lender' && (
            <>
              <li>
                <Link to="/lender/profile">Profile</Link>
              </li>
              <li>
                <Link to="/lender/products">My Products</Link>
              </li>
              <li>
                <Link to="/lender/applications">Applications</Link>
              </li>
              <li>
                <Link to="/lender/private-equity">Private Equity</Link>
              </li>
            </>
          )}
          {role === 'Admin' && (
            <>
              <li>
                <Link to="/admin/dashboard">Admin Dashboard</Link>
              </li>
              <li>
                <Link to="/admin/private-equity">Private Equity</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
      <button onClick={onLogout}>Log out</button>
    </div>
  );
}

export default Dashboard;