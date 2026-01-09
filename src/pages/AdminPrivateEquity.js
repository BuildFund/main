import React, { useEffect, useState } from 'react';
import api from '../api';

/**
 * Admin Private Equity page
 *
 * Administrators can view all private equity opportunities and approve
 * submissions that are pending review.  Approval will make the
 * opportunity available to lenders.  Decline actions are not
 * implemented in this minimal example but could be added in the
 * future.
 */
function AdminPrivateEquity() {
  const [opportunities, setOpportunities] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOpportunities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchOpportunities() {
    try {
      const res = await api.get('/api/private-equity/opportunities/');
      setOpportunities(res.data);
    } catch (err) {
      setError('Failed to load opportunities');
    }
  }

  const handleApprove = async (id) => {
    setError(null);
    try {
      await api.post(`/api/private-equity/opportunities/${id}/approve/`);
      // Refresh list
      fetchOpportunities();
    } catch (err) {
      setError('Failed to approve opportunity');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Private Equity Opportunities (Admin)</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {opportunities.length === 0 ? (
        <p>No private equity opportunities found.</p>
      ) : (
        <table border="1" cellPadding="4" cellSpacing="0" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Borrower</th>
              <th>Funding Required (£)</th>
              <th>Valuation (£)</th>
              <th>Share Offered (%)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((opp) => (
              <tr key={opp.id}>
                <td>{opp.title}</td>
                <td>{opp.borrower}</td>
                <td>{opp.funding_required}</td>
                <td>{opp.valuation || '—'}</td>
                <td>{opp.share_offered}</td>
                <td>{opp.status}</td>
                <td>
                  {opp.status === 'approved' ? (
                    '—'
                  ) : (
                    <button type="button" onClick={() => handleApprove(opp.id)}>
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminPrivateEquity;