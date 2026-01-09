import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BorrowerProjects from './pages/BorrowerProjects';
import LenderProducts from './pages/LenderProducts';
import BorrowerMatches from './pages/BorrowerMatches';
import LenderApplications from './pages/LenderApplications';
import AdminDashboard from './pages/AdminDashboard';
import BorrowerProjectWizard from './pages/BorrowerProjectWizard';
import LenderProductWizard from './pages/LenderProductWizard';
import BorrowerPrivateEquity from './pages/BorrowerPrivateEquity';
import LenderPrivateEquity from './pages/LenderPrivateEquity';
import AdminPrivateEquity from './pages/AdminPrivateEquity';
import BorrowerProfile from './pages/BorrowerProfile';
import LenderProfile from './pages/LenderProfile';

function App() {
  const [token, setToken] = React.useState(() => localStorage.getItem('token'));
  const [role, setRole] = React.useState(() => localStorage.getItem('role'));

  const handleLogin = (tok, userRole) => {
    localStorage.setItem('token', tok);
    localStorage.setItem('role', userRole);
    setToken(tok);
    setRole(userRole);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
  };

  if (!token) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard role={role} onLogout={handleLogout} />} />
        <Route path="/borrower/projects" element={<BorrowerProjects />} />
        <Route path="/borrower/projects/new" element={<BorrowerProjectWizard />} />
        <Route path="/borrower/matches" element={<BorrowerMatches />} />
        <Route path="/borrower/private-equity" element={<BorrowerPrivateEquity />} />
      <Route path="/borrower/profile" element={<BorrowerProfile />} />
        <Route path="/lender/products" element={<LenderProducts />} />
        <Route path="/lender/products/new" element={<LenderProductWizard />} />
        <Route path="/lender/applications" element={<LenderApplications />} />
        <Route path="/lender/private-equity" element={<LenderPrivateEquity />} />
      <Route path="/lender/profile" element={<LenderProfile />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/private-equity" element={<AdminPrivateEquity />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;