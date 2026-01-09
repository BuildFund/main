import React, { useEffect, useState } from 'react';
import api from '../api';

/**
 * Borrower Private Equity page
 *
 * This component allows a borrower to view and create private equity
 * opportunities.  An opportunity represents a business or asset that
 * requires investment, including details such as the funding required
 * and the equity share offered.  When a new opportunity is created
 * it is automatically submitted for review by an administrator.
 */
function BorrowerPrivateEquity() {
  const [opportunities, setOpportunities] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    industry: '',
    funding_required: '',
    valuation: '',
    share_offered: '',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOpportunities() {
      try {
        const res = await api.get('/api/private-equity/opportunities/');
        setOpportunities(res.data);
      } catch (err) {
        setError('Failed to load opportunities');
      }
    }
    fetchOpportunities();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // Convert numeric fields to numbers
      const payload = {
        title: formData.title,
        description: formData.description,
        industry: formData.industry,
        funding_required: parseFloat(formData.funding_required) || 0,
        valuation: formData.valuation ? parseFloat(formData.valuation) : null,
        share_offered: parseFloat(formData.share_offered) || 0,
      };
      const res = await api.post('/api/private-equity/opportunities/', payload);
      // Append new opportunity to list and reset form
      setOpportunities([...opportunities, res.data]);
      setFormData({
        title: '',
        description: '',
        industry: '',
        funding_required: '',
        valuation: '',
        share_offered: '',
      });
    } catch (err) {
      setError('Failed to create opportunity');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Private Equity Opportunities</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {opportunities.length === 0 ? (
        <p>No private equity opportunities found.</p>
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
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h3 style={{ marginTop: '2rem' }}>Create New Opportunity</h3>
      <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
        <div>
          <label>Title</label>
          <input name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div>
          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} />
        </div>
        <div>
          <label>Industry</label>
          <input name="industry" value={formData.industry} onChange={handleChange} />
        </div>
        <div>
          <label>Funding Required (£)</label>
          <input
            type="number"
            name="funding_required"
            step="0.01"
            value={formData.funding_required}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Valuation (£)</label>
          <input
            type="number"
            name="valuation"
            step="0.01"
            value={formData.valuation}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Share Offered (%)</label>
          <input
            type="number"
            name="share_offered"
            step="0.01"
            value={formData.share_offered}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" style={{ marginTop: '1rem' }}>Create Opportunity</button>
      </form>
    </div>
  );
}

export default BorrowerPrivateEquity;