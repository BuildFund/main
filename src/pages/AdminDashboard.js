import React, { useEffect, useState } from 'react';
import api from '../api';

/**
 * Admin dashboard showing pending projects and products.  Administrators
 * can approve items directly from this page.  Approval updates the
 * status to "approved" (projects) or "active" (products).  If
 * approval fails the error is displayed.
 */
function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  async function loadData() {
    setError(null);
    try {
      const projRes = await api.get('/api/projects/');
      const prodRes = await api.get('/api/products/');
      setProjects(projRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      setError('Failed to load data');
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const approveProject = async (id) => {
    try {
      await api.post(`/api/projects/${id}/approve/`);
      // Refresh list
      await loadData();
    } catch (err) {
      setError('Failed to approve project');
    }
  };

  const approveProduct = async (id) => {
    try {
      await api.post(`/api/products/${id}/approve/`);
      await loadData();
    } catch (err) {
      setError('Failed to approve product');
    }
  };

  const pendingProjects = projects.filter((p) => p.status === 'pending_review');
  const pendingProducts = products.filter((p) => p.status === 'pending');

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Admin Dashboard</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <h3>Pending Projects</h3>
      {pendingProjects.length === 0 ? (
        <p>No pending projects.</p>
      ) : (
        <table border="1" cellPadding="4" cellSpacing="0" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Description</th>
              <th>Address</th>
              <th>Loan Amount</th>
              <th>Term</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingProjects.map((p) => (
              <tr key={p.id}>
                <td>{p.description || p.development_extent}</td>
                <td>{p.address}</td>
                <td>{p.loan_amount_required}</td>
                <td>{p.term_required_months}</td>
                <td>
                  <button onClick={() => approveProject(p.id)}>Approve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h3 style={{ marginTop: '2rem' }}>Pending Products</h3>
      {pendingProducts.length === 0 ? (
        <p>No pending products.</p>
      ) : (
        <table border="1" cellPadding="4" cellSpacing="0" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Funding Type</th>
              <th>Property Type</th>
              <th>Loan Range (£)</th>
              <th>Interest (%)</th>
              <th>LTV (%)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingProducts.map((prod) => (
              <tr key={prod.id}>
                <td>{prod.name}</td>
                <td>{prod.funding_type}</td>
                <td>{prod.property_type}</td>
                <td>
                  {prod.min_loan_amount} - {prod.max_loan_amount}
                </td>
                <td>
                  {prod.interest_rate_min} - {prod.interest_rate_max}
                </td>
                <td>{prod.max_ltv_ratio}</td>
                <td>
                  <button onClick={() => approveProduct(prod.id)}>Approve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminDashboard;