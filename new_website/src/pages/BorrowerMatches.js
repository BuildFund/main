import React, { useEffect, useState } from 'react';
import api from '../api';
import { theme, commonStyles } from '../styles/theme';
import Select from '../components/Select';
import Button from '../components/Button';
import Textarea from '../components/Textarea';

function BorrowerMatches() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submittingEnquiry, setSubmittingEnquiry] = useState({});
  const [enquiryNotes, setEnquiryNotes] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await api.get('/api/projects/');
        setProjects(res.data || []);
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
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    if (!projectId) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get(`/api/projects/${projectId}/matched-products/`);
      setMatches(res.data || []);
    } catch (err) {
      setError('Failed to load matched products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEnquiry = async (productId) => {
    if (!selectedProject) {
      setError('Please select a project first');
      return;
    }

    setSubmittingEnquiry({ ...submittingEnquiry, [productId]: true });
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await api.post(`/api/projects/${selectedProject}/submit-enquiry/`, {
        product_id: productId,
        notes: enquiryNotes[productId] || '',
      });
      
      setSuccessMessage(`Enquiry submitted successfully! The lender will be notified and you can now message them.`);
      // Remove the product from matches since enquiry is submitted
      setMatches(matches.filter(p => p.id !== productId));
      setEnquiryNotes({ ...enquiryNotes, [productId]: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Failed to submit enquiry';
      setError(errorMsg);
    } finally {
      setSubmittingEnquiry({ ...submittingEnquiry, [productId]: false });
    }
  };

  return (
    <div style={commonStyles.container}>
      <div style={{ marginBottom: theme.spacing.xl }}>
        <h1 style={{
          fontSize: theme.typography.fontSize['4xl'],
          fontWeight: theme.typography.fontWeight.bold,
          margin: `0 0 ${theme.spacing.sm} 0`,
          color: theme.colors.textPrimary,
        }}>
          Matched Products
        </h1>
        <p style={{
          color: theme.colors.textSecondary,
          fontSize: theme.typography.fontSize.base,
          margin: 0,
        }}>
          View lender products that match your projects
        </p>
      </div>

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

      {successMessage && (
        <div style={{
          background: theme.colors.successLight,
          color: theme.colors.successDark,
          padding: theme.spacing.md,
          borderRadius: theme.borderRadius.md,
          marginBottom: theme.spacing.lg,
          border: `1px solid ${theme.colors.success}`,
        }}>
          {successMessage}
        </div>
      )}

      <div style={{ ...commonStyles.card, marginBottom: theme.spacing.xl }}>
        <Select
          label="Select Project"
          value={selectedProject}
          onChange={handleSelectProject}
        >
          <option value="">-- Select a project --</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.description || p.address || `Project #${p.id}`}
            </option>
          ))}
        </Select>
      </div>

      {selectedProject && (
        <div>
          {loading ? (
            <div style={{ ...commonStyles.card, textAlign: 'center', padding: theme.spacing['2xl'] }}>
              <p style={{ color: theme.colors.textSecondary }}>Loading matches...</p>
            </div>
          ) : matches.length === 0 ? (
            <div style={{ ...commonStyles.card, textAlign: 'center', padding: theme.spacing['2xl'] }}>
              <p style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.lg }}>
                No matches found for this project.
              </p>
            </div>
          ) : (
            <div style={{ ...commonStyles.card, padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={commonStyles.table}>
                  <thead style={commonStyles.tableHeader}>
                    <tr>
                      <th style={commonStyles.tableCell}>Product Name</th>
                      <th style={commonStyles.tableCell}>Funding Type</th>
                      <th style={commonStyles.tableCell}>Property Type</th>
                      <th style={commonStyles.tableCell}>Loan Range (£)</th>
                      <th style={commonStyles.tableCell}>Interest Rate (%)</th>
                      <th style={commonStyles.tableCell}>LTV Ratio (%)</th>
                      <th style={commonStyles.tableCell}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((product) => (
                      <tr key={product.id} style={{ borderBottom: `1px solid ${theme.colors.gray200}` }}>
                        <td style={{ ...commonStyles.tableCell, fontWeight: theme.typography.fontWeight.semibold }}>
                          {product.name}
                        </td>
                        <td style={commonStyles.tableCell}>{product.funding_type}</td>
                        <td style={commonStyles.tableCell}>{product.property_type}</td>
                        <td style={commonStyles.tableCell}>
                          £{parseFloat(product.min_loan_amount || 0).toLocaleString()} - £{parseFloat(product.max_loan_amount || 0).toLocaleString()}
                        </td>
                        <td style={commonStyles.tableCell}>
                          {product.interest_rate_min}% - {product.interest_rate_max}%
                        </td>
                        <td style={commonStyles.tableCell}>{product.max_ltv_ratio}%</td>
                        <td style={commonStyles.tableCell}>
                          <Button
                            onClick={() => handleSubmitEnquiry(product.id)}
                            disabled={submittingEnquiry[product.id]}
                            size="sm"
                          >
                            {submittingEnquiry[product.id] ? 'Submitting...' : 'Submit Enquiry'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BorrowerMatches;
