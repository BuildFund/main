import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { theme, commonStyles } from '../styles/theme';
import Wizard from '../components/Wizard';
import Input from '../components/Input';
import Select from '../components/Select';
import Textarea from '../components/Textarea';
import Button from '../components/Button';

function LenderProductWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    funding_type: 'mortgage',
    property_type: 'residential',
    repayment_structure: 'interest_only',
    min_loan_amount: '',
    max_loan_amount: '',
    interest_rate_min: '',
    interest_rate_max: '',
    term_min_months: '',
    term_max_months: '',
    max_ltv_ratio: '',
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
    setLoading(true);
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
      console.error('Product creation error:', err);
      setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Basic Information', 'Loan Parameters', 'Fees & Eligibility'];

  return (
    <Wizard steps={steps} currentStep={step}>
      <div style={{ padding: theme.spacing.xl }}>
        <h1 style={{
          fontSize: theme.typography.fontSize['3xl'],
          fontWeight: theme.typography.fontWeight.bold,
          margin: `0 0 ${theme.spacing.lg} 0`,
          color: theme.colors.textPrimary,
        }}>
          Create New Product
        </h1>

        {error && (
          <div style={{
            background: theme.colors.errorLight,
            color: theme.colors.errorDark,
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.md,
            marginBottom: theme.spacing.lg,
            border: `1px solid ${theme.colors.error}`,
          }}>
            {error}
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 style={{
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.semibold,
              margin: `0 0 ${theme.spacing.xl} 0`,
              color: theme.colors.textPrimary,
            }}>
              Basic Information
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: theme.spacing.lg }}>
              <Input
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter product name"
                style={{ gridColumn: '1 / -1' }}
              />

              <Select
                label="Funding Type"
                name="funding_type"
                value={formData.funding_type}
                onChange={handleChange}
                required
              >
                <option value="mortgage">Mortgage Finance</option>
                <option value="senior_debt">Senior Debt/Development Finance</option>
                <option value="equity">Equity Finance</option>
              </Select>

              <Select
                label="Property Type"
                name="property_type"
                value={formData.property_type}
                onChange={handleChange}
                required
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="mixed">Mixed</option>
                <option value="industrial">Industrial</option>
              </Select>

              <Select
                label="Repayment Structure"
                name="repayment_structure"
                value={formData.repayment_structure}
                onChange={handleChange}
              >
                <option value="interest_only">Interest Only</option>
                <option value="amortising">Amortising</option>
              </Select>
            </div>

            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the product..."
              style={{ marginTop: theme.spacing.lg }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: theme.spacing.md, marginTop: theme.spacing.xl }}>
              <Button variant="primary" size="lg" onClick={nextStep}>
                Next →
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.semibold,
              margin: `0 0 ${theme.spacing.xl} 0`,
              color: theme.colors.textPrimary,
            }}>
              Loan Parameters
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: theme.spacing.lg }}>
              <Input
                label="Minimum Loan Amount (£)"
                type="number"
                name="min_loan_amount"
                value={formData.min_loan_amount}
                onChange={handleChange}
                required
                placeholder="0.00"
              />

              <Input
                label="Maximum Loan Amount (£)"
                type="number"
                name="max_loan_amount"
                value={formData.max_loan_amount}
                onChange={handleChange}
                required
                placeholder="0.00"
              />

              <Input
                label="Interest Rate Minimum (%)"
                type="number"
                step="0.01"
                name="interest_rate_min"
                value={formData.interest_rate_min}
                onChange={handleChange}
                required
                placeholder="0.00"
              />

              <Input
                label="Interest Rate Maximum (%)"
                type="number"
                step="0.01"
                name="interest_rate_max"
                value={formData.interest_rate_max}
                onChange={handleChange}
                required
                placeholder="0.00"
              />

              <Input
                label="Term Minimum (months)"
                type="number"
                name="term_min_months"
                value={formData.term_min_months}
                onChange={handleChange}
                required
                placeholder="12"
              />

              <Input
                label="Term Maximum (months)"
                type="number"
                name="term_max_months"
                value={formData.term_max_months}
                onChange={handleChange}
                required
                placeholder="60"
              />

              <Input
                label="Maximum LTV Ratio (%)"
                type="number"
                step="0.01"
                name="max_ltv_ratio"
                value={formData.max_ltv_ratio}
                onChange={handleChange}
                required
                placeholder="0.00"
                style={{ gridColumn: '1 / -1' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: theme.spacing.xl }}>
              <Button variant="outline" size="lg" onClick={prevStep}>
                ← Back
              </Button>
              <Button variant="primary" size="lg" onClick={nextStep}>
                Next →
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.semibold,
              margin: `0 0 ${theme.spacing.xl} 0`,
              color: theme.colors.textPrimary,
            }}>
              Fees & Eligibility
            </h2>

            <div style={{ 
              marginBottom: theme.spacing.lg, 
              padding: theme.spacing.lg, 
              background: theme.colors.gray50,
              borderRadius: theme.borderRadius.md,
            }}>
              <h3 style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                margin: `0 0 ${theme.spacing.md} 0`,
              }}>
                Fees (Optional)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: theme.spacing.lg }}>
                <Input
                  label="Arrangement Fee (£)"
                  type="number"
                  step="0.01"
                  name="arrangement_fee"
                  value={formData.arrangement_fee}
                  onChange={handleChange}
                  placeholder="0.00"
                />

                <Input
                  label="Admin Fee (£)"
                  type="number"
                  step="0.01"
                  name="admin_fee"
                  value={formData.admin_fee}
                  onChange={handleChange}
                  placeholder="0.00"
                />

                <Input
                  label="CHAPS Fee (£)"
                  type="number"
                  step="0.01"
                  name="chaps_fee"
                  value={formData.chaps_fee}
                  onChange={handleChange}
                  placeholder="0.00"
                />

                <Input
                  label="Surveyor Fee (£)"
                  type="number"
                  step="0.01"
                  name="surveyor_fee"
                  value={formData.surveyor_fee}
                  onChange={handleChange}
                  placeholder="0.00"
                />

                <Input
                  label="Insurance Fee (£)"
                  type="number"
                  step="0.01"
                  name="insurance_fee"
                  value={formData.insurance_fee}
                  onChange={handleChange}
                  placeholder="0.00"
                />

                <Input
                  label="Exit Fee (£)"
                  type="number"
                  step="0.01"
                  name="exit_fee"
                  value={formData.exit_fee}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
            </div>

            <Textarea
              label="Eligibility Criteria"
              name="eligibility_criteria"
              value={formData.eligibility_criteria}
              onChange={handleChange}
              rows={6}
              placeholder="Describe the eligibility criteria for this product..."
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: theme.spacing.xl }}>
              <Button variant="outline" size="lg" onClick={prevStep}>
                ← Back
              </Button>
              <Button variant="primary" size="lg" onClick={handleSubmit} loading={loading}>
                {loading ? 'Creating...' : 'Create Product'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Wizard>
  );
}

export default LenderProductWizard;
