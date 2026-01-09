import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

/**
 * Multi‑step wizard for creating a new borrower project.  This component
 * collects all project data in three steps and submits the project
 * to the backend when finished.  It provides simple navigation via
 * Next/Back buttons and basic validation.
 */
function BorrowerProjectWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  // Consolidated form data for all steps
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
    // Step 2
    planning_permission: false,
    planning_authority: '',
    planning_reference: '',
    planning_description: '',
    loan_amount_required: '',
    term_required_months: '',
    repayment_method: 'sale',
    // Step 3
    unit_counts: '',
    gross_internal_area: '',
    purchase_price: '',
    purchase_costs: '',
    build_cost: '',
    current_market_value: '',
    gross_development_value: '',
    funds_provided_by_applicant: '',
    source_of_funds: '',
    existing_mortgage: false,
    mortgage_company: '',
    mortgage_balance: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const nextStep = () => {
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    // Prepare project payload
    setError(null);
    try {
      // For unit_counts we expect a JSON; parse if provided
      let unitCounts = {};
      if (formData.unit_counts) {
        const units = parseInt(formData.unit_counts, 10);
        if (!isNaN(units)) {
          unitCounts.total = units;
        }
      }
      const payload = {
        funding_type: formData.funding_type,
        property_type: formData.property_type,
        address: formData.address,
        town: formData.town,
        county: formData.county,
        postcode: formData.postcode,
        description: formData.description,
        development_extent: formData.development_extent,
        tenure: formData.tenure,
        planning_permission: formData.planning_permission,
        planning_authority: formData.planning_authority,
        planning_reference: formData.planning_reference,
        planning_description: formData.planning_description,
        loan_amount_required: formData.loan_amount_required,
        term_required_months: formData.term_required_months,
        repayment_method: formData.repayment_method,
        unit_counts: unitCounts,
        gross_internal_area: formData.gross_internal_area || null,
        purchase_price: formData.purchase_price || null,
        purchase_costs: formData.purchase_costs || null,
        build_cost: formData.build_cost || null,
        current_market_value: formData.current_market_value || null,
        gross_development_value: formData.gross_development_value || null,
        funds_provided_by_applicant: formData.funds_provided_by_applicant || null,
        source_of_funds: formData.source_of_funds,
        existing_mortgage: formData.existing_mortgage,
        mortgage_company: formData.mortgage_company,
        mortgage_balance: formData.mortgage_balance || null,
      };
      await api.post('/api/projects/', payload);
      navigate('/borrower/projects');
    } catch (err) {
      setError('Failed to create project');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Create New Project</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {step === 1 && (
        <div>
          <h3>Step 1: Property Information</h3>
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
          <div style={{ marginTop: '1rem' }}>
            <button type="button" onClick={nextStep}>Next</button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div>
          <h3>Step 2: Planning & Loan Details</h3>
          <div>
            <label>
              <input
                type="checkbox"
                name="planning_permission"
                checked={formData.planning_permission}
                onChange={handleChange}
              />
              Has Planning Permission
            </label>
          </div>
          {formData.planning_permission && (
            <>
              <div>
                <label>Planning Authority</label>
                <input name="planning_authority" value={formData.planning_authority} onChange={handleChange} />
              </div>
              <div>
                <label>Reference Number</label>
                <input name="planning_reference" value={formData.planning_reference} onChange={handleChange} />
              </div>
              <div>
                <label>Planning Description</label>
                <textarea
                  name="planning_description"
                  value={formData.planning_description}
                  onChange={handleChange}
                />
              </div>
            </>
          )}
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
          <div style={{ marginTop: '1rem' }}>
            <button type="button" onClick={prevStep}>Back</button>{' '}
            <button type="button" onClick={nextStep}>Next</button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div>
          <h3>Step 3: Development & Financials</h3>
          <div>
            <label>Total Units</label>
            <input
              type="number"
              name="unit_counts"
              value={formData.unit_counts}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Gross Internal Area</label>
            <input
              type="number"
              step="0.01"
              name="gross_internal_area"
              value={formData.gross_internal_area}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Purchase Price (£)</label>
            <input
              type="number"
              name="purchase_price"
              value={formData.purchase_price}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Purchase Costs (£)</label>
            <input
              type="number"
              name="purchase_costs"
              value={formData.purchase_costs}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Build Cost (£)</label>
            <input
              type="number"
              name="build_cost"
              value={formData.build_cost}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Current Market Value (£)</label>
            <input
              type="number"
              name="current_market_value"
              value={formData.current_market_value}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Gross Development Value (£)</label>
            <input
              type="number"
              name="gross_development_value"
              value={formData.gross_development_value}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Funds Provided by Applicant (£)</label>
            <input
              type="number"
              name="funds_provided_by_applicant"
              value={formData.funds_provided_by_applicant}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Source of Funds</label>
            <input name="source_of_funds" value={formData.source_of_funds} onChange={handleChange} />
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                name="existing_mortgage"
                checked={formData.existing_mortgage}
                onChange={handleChange}
              />
              Existing Mortgage
            </label>
          </div>
          {formData.existing_mortgage && (
            <>
              <div>
                <label>Mortgage Company</label>
                <input name="mortgage_company" value={formData.mortgage_company} onChange={handleChange} />
              </div>
              <div>
                <label>Mortgage Balance (£)</label>
                <input
                  type="number"
                  name="mortgage_balance"
                  value={formData.mortgage_balance}
                  onChange={handleChange}
                />
              </div>
            </>
          )}
          <div style={{ marginTop: '1rem' }}>
            <button type="button" onClick={prevStep}>Back</button>{' '}
            <button type="button" onClick={handleSubmit}>Submit</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BorrowerProjectWizard;