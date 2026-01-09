import React, { useEffect, useState } from 'react';
import api from '../api';

/**
 * Display matched lender products for each borrower project.  The user
 * selects a project from a dropdown, and the component fetches and
 * displays matching products returned by the backend's matched‑products
 * endpoint.  Borrowers cannot apply directly; this view is for
 * informational purposes.
 */
function BorrowerMatches() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await api.get('/api/projects/');
        setProjects(res.data);
      } catch (err) {
        setError('Failed to load projects');
      }
    }
    fetchProjects();
  }, []);

  const handleSelectProject = async (e) => {
    const projectId = e.target.value;
    setSelectedProject(projectId);
    setMatches([]);
    if (!projectId) return;
    try {
      const res = await api.get(`/api/projects/${projectId}/matched-products/`);
      setMatches(res.data);
    } catch (err) {
      setError('Failed to load matched products');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Matched Products</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div>
        <label>Select Project:</label>{' '}
        <select value={selectedProject} onChange={handleSelectProject}>
          <option value="">-- Select a project --</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.description || p.address}
            </option>
          ))}
        </select>
      </div>
      {selectedProject && (
        <div style={{ marginTop: '1rem' }}>
          {matches.length === 0 ? (
            <p>No matches found for this project.</p>
          ) : (
            <table border="1" cellPadding="4" cellSpacing="0" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Funding Type</th>
                  <th>Property Type</th>
                  <th>Loan Range (£)</th>
                  <th>Interest Rate (%)</th>
                  <th>LTV Ratio (%)</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.funding_type}</td>
                    <td>{product.property_type}</td>
                    <td>
                      {product.min_loan_amount} - {product.max_loan_amount}
                    </td>
                    <td>
                      {product.interest_rate_min} - {product.interest_rate_max}
                    </td>
                    <td>{product.max_ltv_ratio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default BorrowerMatches;