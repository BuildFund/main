import React, { useEffect, useState } from 'react';
import api from '../api';

/**
 * Lists all applications submitted by the current lender.  Displays
 * key details and status for each application.  No editing is
 * available from this view.
 */
function LenderApplications() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchApplications() {
      try {
        const res = await api.get('/api/applications/');
        setApplications(res.data);
      } catch (err) {
        setError('Failed to load applications');
      }
    }
    fetchApplications();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h2>My Applications</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {applications.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <table border="1" cellPadding="4" cellSpacing="0" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Project</th>
              <th>Product</th>
              <th>Proposed Loan (£)</th>
              <th>Interest Rate (%)</th>
              <th>Term (months)</th>
              <th>LTV Ratio (%)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td>{app.project}</td>
                <td>{app.product}</td>
                <td>{app.proposed_loan_amount}</td>
                <td>{app.proposed_interest_rate}</td>
                <td>{app.proposed_term_months}</td>
                <td>{app.proposed_ltv_ratio}</td>
                <td>{app.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default LenderApplications;