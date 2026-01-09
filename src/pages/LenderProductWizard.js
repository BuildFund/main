import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

/**
 * Multi‑step wizard for lenders to create a new finance product.  The
 * wizard collects basic info, loan parameters and fee/eligibility
 * details.  After submission the product is created with status
 * "pending" and the user is redirected back to the products list.
 */
function LenderProductWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    funding_type: 'mortgage',
    property_type: 'residential',
    repayment_structure: 'interest_only',
    // Step 2
    min_loan_amount: '',
    max_loan_amount: '',
    interest_rate_min: '',
    interest_rate_max: '',
    term_min_months: '',
    term_max_months: '',
    max_ltv_ratio: '',
    // Step 3
    arrangement_fee: '',
    admin_fee: '',
    chaps_fee: '',
    surveyor_fee: '',
    insurance_fee: '',
    exit_fee: '',
    eligibility_criteria: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    setError(null);
    try {
      const fees = {
        arrangement_fee: formData.arrangement_fee || null,
        admin_fee: formData.admin_fee || null,
        chaps_fee: formData.chaps_fee || null,
        surveyor_fee: formData.surveyor_fee || null,
        insurance_fee: formData.insurance_fee || null,
        exit_fee: formData.exit_fee || null,
      };
      const payload = {
        name: formData.name,
        description: formData.description,
        funding_type: formData.funding_type,
        property_type: formData.property_type,
        repayment_structure: formData.repayment_structure,
        min_loan_amount: formData.min_loan_amount,
        max_loan_amount: formData.max_loan_amount,
        interest_rate_min: formData.interest_rate_min,
        interest_rate_max: formData.interest_rate_max,
        term_min_months: formData.term_min_months,
        term_max_months: formData.term_max_months,
        max_ltv_ratio: formData.max_ltv_ratio,
        fees: fees,
        eligibility_criteria: formData.eligibility_criteria,
      };
      await api.post('/api/products/', payload);
      navigate('/lender/products');
    } catch (err) {
      setError('Failed to create product');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Create New Product</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {step === 1 && (
        <div>
          <h3>Step 1: Basic Information</h3>
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
            <label>Repayment Structure</label>
            <select name="repayment_structure" value={formData.repayment_structure} onChange={handleChange}>
              <option value="interest_only">Interest Only</option>
              <option value="amortising">Amortising</option>
            </select>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button type="button" onClick={nextStep}>Next</button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div>
          <h3>Step 2: Loan Parameters</h3>
          <div>
            <label>Minimum Loan (£)</label>
            <input
              type="number"
              name="min_loan_amount"
              value={formData.min_loan_amount}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Maximum Loan (£)</label>
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
              step="0.01"
              name="interest_rate_min"
              value={formData.interest_rate_min}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Interest Rate Max (%)</label>
            <input
              type="number"
              step="0.01"
              name="interest_rate_max"
              value={formData.interest_rate_max}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Term Minimum (months)</label>
            <input
              type="number"
              name="term_min_months"
              value={formData.term_min_months}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Term Maximum (months)</label>
            <input
              type="number"
              name="term_max_months"
              value={formData.term_max_months}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Maximum LTV Ratio (%)</label>
            <input
              type="number"
              step="0.01"
              name="max_ltv_ratio"
              value={formData.max_ltv_ratio}
              onChange={handleChange}
              required
            />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button type="button" onClick={prevStep}>Back</button>{' '}
            <button type="button" onClick={nextStep}>Next</button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div>
          <h3>Step 3: Fees & Eligibility</h3>
          <div>
            <label>Arrangement Fee</label>
            <input
              type="number"
              step="0.01"
              name="arrangement_fee"
              value={formData.arrangement_fee}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Admin Fee</label>
            <input
              type="number"
              step="0.01"
              name="admin_fee"
              value={formData.admin_fee}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>CHAPS Fee</label>
            <input
              type="number"
              step="0.01"
              name="chaps_fee"
              value={formData.chaps_fee}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Surveyor Fee</label>
            <input
              type="number"
              step="0.01"
              name="surveyor_fee"
              value={formData.surveyor_fee}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Insurance Fee</label>
            <input
              type="number"
              step="0.01"
              name="insurance_fee"
              value={formData.insurance_fee}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Exit Fee</label>
            <input
              type="number"
              step="0.01"
              name="exit_fee"
              value={formData.exit_fee}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Eligibility Criteria</label>
            <textarea
              name="eligibility_criteria"
              value={formData.eligibility_criteria}
              onChange={handleChange}
            />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button type="button" onClick={prevStep}>Back</button>{' '}
            <button type="button" onClick={handleSubmit}>Submit</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LenderProductWizard;