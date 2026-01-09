import React, { useEffect, useState } from 'react';
import api from '../api';

function BorrowerProjects() {
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    funding_type: 'mortgage',
    property_type: 'residential',
    address: '',
    town: '',
    county: '',
    postcode: '',
    description: '',
    development_extent: 'light_refurb',
    tenure: 'freehold',
    loan_amount_required: '',
    term_required_months: '',
    repayment_method: 'sale',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await api.get('/api/projects/');
        setProjects(response.data);
      } catch (e) {
        console.error(e);
      }
    }
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await api.post('/api/projects/', {
        ...formData,
        unit_counts: {},
      });
      setProjects([...projects, response.data]);
      setFormData({
        funding_type: 'mortgage',
        property_type: 'residential',
        address: '',
        town: '',
        county: '',
        postcode: '',
        description: '',
        development_extent: 'light_refurb',
        tenure: 'freehold',
        loan_amount_required: '',
        term_required_months: '',
        repayment_method: 'sale',
      });
    } catch (e) {
      setError('Failed to create project');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>My Projects</h2>
      <p>
        <a href="/borrower/projects/new">Create with Wizard</a>
      </p>
      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <ul>
          {projects.map((project) => (
            <li key={project.id}>{project.description || project.address}</li>
          ))}
        </ul>
      )}
      <h3>Create New Project</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Funding Type</label>
          <select name="funding_type" value={formData.funding_type} onChange={handleChange}>
            <option value="mortgage">Mortgage Finance</option>
            <option value="senior_debt">Senior Debt/Development Finance</option>
            <option value="equity">Equity Finance</option>
          </select>
        </div>
        <div>
          <label>Property Type</label>
          <select name="property_type" value={formData.property_type} onChange={handleChange}>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="mixed">Mixed</option>
            <option value="industrial">Industrial</option>
          </select>
        </div>
        <div>
          <label>Address</label>
          <input name="address" value={formData.address} onChange={handleChange} required />
        </div>
        <div>
          <label>Town</label>
          <input name="town" value={formData.town} onChange={handleChange} required />
        </div>
        <div>
          <label>County</label>
          <input name="county" value={formData.county} onChange={handleChange} required />
        </div>
        <div>
          <label>Postcode</label>
          <input name="postcode" value={formData.postcode} onChange={handleChange} required />
        </div>
        <div>
          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} />
        </div>
        <div>
          <label>Development Extent</label>
          <select name="development_extent" value={formData.development_extent} onChange={handleChange}>
            <option value="light_refurb">Light Refurb</option>
            <option value="heavy_refurb">Heavy Refurb</option>
            <option value="conversion">Conversion</option>
            <option value="new_build">New Build</option>
          </select>
        </div>
        <div>
          <label>Tenure</label>
          <select name="tenure" value={formData.tenure} onChange={handleChange}>
            <option value="freehold">Freehold</option>
            <option value="leasehold">Leasehold</option>
          </select>
        </div>
        <div>
          <label>Loan Amount (£)</label>
          <input
            type="number"
            name="loan_amount_required"
            value={formData.loan_amount_required}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Term (months)</label>
          <input
            type="number"
            name="term_required_months"
            value={formData.term_required_months}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Repayment Method</label>
          <select name="repayment_method" value={formData.repayment_method} onChange={handleChange}>
            <option value="sale">Sale</option>
            <option value="refinance">Refinance</option>
          </select>
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

export default BorrowerProjects;