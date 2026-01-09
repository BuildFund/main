import React, { useEffect, useState } from 'react';
import api from '../api';

function LenderProducts() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    funding_type: 'mortgage',
    property_type: 'residential',
    min_loan_amount: '',
    max_loan_amount: '',
    interest_rate_min: '',
    interest_rate_max: '',
    term_min_months: '',
    term_max_months: '',
    max_ltv_ratio: '',
    repayment_structure: 'interest_only',
    eligibility_criteria: '',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await api.get('/api/products/');
        setProducts(response.data);
      } catch (e) {
        console.error(e);
      }
    }
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await api.post('/api/products/', formData);
      setProducts([...products, response.data]);
      setFormData({
        name: '',
        description: '',
        funding_type: 'mortgage',
        property_type: 'residential',
        min_loan_amount: '',
        max_loan_amount: '',
        interest_rate_min: '',
        interest_rate_max: '',
        term_min_months: '',
        term_max_months: '',
        max_ltv_ratio: '',
        repayment_structure: 'interest_only',
        eligibility_criteria: '',
      });
    } catch (e) {
      setError('Failed to create product');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>My Products</h2>
      <p>
        <a href="/lender/products/new">Create with Wizard</a>
      </p>
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product.id}>{product.name}</li>
          ))}
        </ul>
      )}
      <h3>Create New Product</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} />
        </div>
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
          <label>Minimum Loan Amount (£)</label>
          <input
            type="number"
            name="min_loan_amount"
            value={formData.min_loan_amount}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Maximum Loan Amount (£)</label>
          <input
            type="number"
            name="max_loan_amount"
            value={formData.max_loan_amount}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Interest Rate Min (%)</label>
          <input
            type="number"
            name="interest_rate_min"
            step="0.01"
            value={formData.interest_rate_min}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Interest Rate Max (%)</label>
          <input
            type="number"
            name="interest_rate_max"
            step="0.01"
            value={formData.interest_rate_max}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Term Min (months)</label>
          <input
            type="number"
            name="term_min_months"
            value={formData.term_min_months}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Term Max (months)</label>
          <input
            type="number"
            name="term_max_months"
            value={formData.term_max_months}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Max LTV Ratio (%)</label>
          <input
            type="number"
            name="max_ltv_ratio"
            step="0.01"
            value={formData.max_ltv_ratio}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Repayment Structure</label>
          <select name="repayment_structure" value={formData.repayment_structure} onChange={handleChange}>
            <option value="interest_only">Interest‑Only</option>
            <option value="amortising">Amortising</option>
          </select>
        </div>
        <div>
          <label>Eligibility Criteria</label>
          <textarea name="eligibility_criteria" value={formData.eligibility_criteria} onChange={handleChange} />
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit">Create Product</button>
      </form>
    </div>
  );
}

export default LenderProducts;