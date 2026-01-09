import React, { useEffect, useState } from 'react';
import api from '../api';

/**
 * Lender Private Equity page
 *
 * Lenders can browse approved private equity opportunities and make
 * investments by specifying an amount and equity share.  The page
 * also lists existing investments made by the lender.  All API
 * interactions are handled server‑side; the keys remain on the
 * server as per security best practices.
 */
function LenderPrivateEquity() {
  const [opportunities, setOpportunities] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [investmentData, setInvestmentData] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchOpportunities();
    fetchInvestments();
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

  async function fetchInvestments() {
    try {
      const res = await api.get('/api/private-equity/investments/');
      setInvestments(res.data);
    } catch (err) {
      // No need to set error here; leave list empty if fail
    }
  }

  const handleChange = (id, e) => {
    const { name, value } = e.target;
    setInvestmentData({
      ...investmentData,
      [id]: {
        ...investmentData[id],
        [name]: value,
      },
    });
  };

  const handleInvest = async (id) => {
    setError(null);
    setSuccess(null);
    const data = investmentData[id] || {};
    if (!data.amount || !data.share) {
      setError('Please enter both amount and share');
      return;
    }
    try {
      await api.post('/api/private-equity/investments/', {
        opportunity: id,
        amount: parseFloat(data.amount),
        share: parseFloat(data.share),
        notes: data.notes || '',
      });
      setSuccess('Investment submitted');
      // Refresh investments list
      fetchInvestments();
      // Clear input values for this opportunity
      setInvestmentData({ ...investmentData, [id]: {} });
    } catch (err) {
      setError('Failed to submit investment');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Private Equity Opportunities</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      {opportunities.length === 0 ? (
        <p>No approved opportunities available.</p>
      ) : (
        <table border="1" cellPadding="4" cellSpacing="0" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Industry</th>
              <th>Funding Required (£)</th>
              <th>Valuation (£)</th>
              <th>Share Offered (%)</th>
              <th>Status</th>
              <th>Invest</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((opp) => (
              <tr key={opp.id}>
                <td>{opp.title}</td>
                <td>{opp.industry}</td>
                <td>{opp.funding_required}</td>
                <td>{opp.valuation || '—'}</td>
                <td>{opp.share_offered}</td>
                <td>{opp.status}</td>
                <td>
                  {opp.status !== 'approved' ? (
                    'Not available'
                  ) : (
                    <div>
                      <input
                        type="number"
                        name="amount"
                        placeholder="Amount (£)"
                        value={(investmentData[opp.id] && investmentData[opp.id].amount) || ''}
                        onChange={(e) => handleChange(opp.id, e)}
                        style={{ width: '80px' }}
                      />
                      <input
                        type="number"
                        name="share"
                        step="0.01"
                        placeholder="Share (%)"
                        value={(investmentData[opp.id] && investmentData[opp.id].share) || ''}
                        onChange={(e) => handleChange(opp.id, e)}
                        style={{ width: '60px', marginLeft: '4px' }}
                      />
                      <input
                        type="text"
                        name="notes"
                        placeholder="Notes"
                        value={(investmentData[opp.id] && investmentData[opp.id].notes) || ''}
                        onChange={(e) => handleChange(opp.id, e)}
                        style={{ width: '120px', marginLeft: '4px' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleInvest(opp.id)}
                        style={{ marginLeft: '4px' }}
                      >
                        Invest
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h3 style={{ marginTop: '2rem' }}>My Investments</h3>
      {investments.length === 0 ? (
        <p>No investments made yet.</p>
      ) : (
        <table border="1" cellPadding="4" cellSpacing="0" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Opportunity</th>
              <th>Amount (£)</th>
              <th>Share (%)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {investments.map((inv) => (
              <tr key={inv.id}>
                <td>{inv.opportunity}</td>
                <td>{inv.amount}</td>
                <td>{inv.share}</td>
                <td>{inv.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default LenderPrivateEquity;