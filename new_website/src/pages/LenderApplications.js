import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { theme, commonStyles } from '../styles/theme';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Select from '../components/Select';
import Textarea from '../components/Textarea';

function LenderApplications() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedApp, setExpandedApp] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [statusUpdateForm, setStatusUpdateForm] = useState({ status: '', feedback: '' });

  useEffect(() => {
    async function fetchApplications() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/api/applications/');
        setApplications(res.data || []);
      } catch (err) {
        console.error('LenderApplications fetchApplications error:', err);
        setError('Failed to load applications');
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, []);

  const getStatusBadge = (status) => {
    const statusMap = {
      submitted: { variant: 'info', label: 'Submitted' },
      opened: { variant: 'info', label: 'Opened' },
      under_review: { variant: 'warning', label: 'Under Review' },
      further_info_required: { variant: 'warning', label: 'Further Info Required' },
      credit_check: { variant: 'info', label: 'Credit Check' },
      approved: { variant: 'success', label: 'Approved' },
      accepted: { variant: 'success', label: 'Accepted' },
      declined: { variant: 'error', label: 'Declined' },
      withdrawn: { variant: 'info', label: 'Withdrawn' },
      completed: { variant: 'success', label: 'Completed' },
    };
    const statusInfo = statusMap[status] || { variant: 'info', label: status };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div style={commonStyles.container}>
        <p style={{ textAlign: 'center', color: theme.colors.textSecondary }}>Loading applications...</p>
      </div>
    );
  }

  return (
    <div style={commonStyles.container}>
      <div style={{ marginBottom: theme.spacing.xl }}>
        <h1 style={{
          fontSize: theme.typography.fontSize['4xl'],
          fontWeight: theme.typography.fontWeight.bold,
          margin: `0 0 ${theme.spacing.sm} 0`,
          color: theme.colors.textPrimary,
        }}>
          Applications & Enquiries
        </h1>
        <p style={{
          color: theme.colors.textSecondary,
          fontSize: theme.typography.fontSize.base,
          margin: 0,
        }}>
          View applications you've submitted and enquiries from borrowers
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

      {applications.length === 0 ? (
        <div style={{
          ...commonStyles.card,
          textAlign: 'center',
          padding: theme.spacing['3xl'],
        }}>
          <p style={{ 
            color: theme.colors.textSecondary, 
            fontSize: theme.typography.fontSize.lg,
            margin: 0,
          }}>
            No applications found.
          </p>
        </div>
      ) : (
        <div style={{ ...commonStyles.card, padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={commonStyles.table}>
              <thead style={commonStyles.tableHeader}>
                <tr>
                  <th style={commonStyles.tableCell}>Type</th>
                  <th style={commonStyles.tableCell}>Project</th>
                  <th style={commonStyles.tableCell}>Product</th>
                  <th style={commonStyles.tableCell}>Loan Amount (£)</th>
                  <th style={commonStyles.tableCell}>Status</th>
                  <th style={commonStyles.tableCell}>Submitted</th>
                  <th style={commonStyles.tableCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <React.Fragment key={app.id}>
                    <tr style={{ borderBottom: `1px solid ${theme.colors.gray200}`, cursor: 'pointer' }}
                        onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)}>
                      <td style={commonStyles.tableCell}>
                        <Badge variant={app.initiated_by === 'borrower' ? 'info' : 'secondary'}>
                          {app.initiated_by === 'borrower' ? 'Enquiry' : 'Application'}
                        </Badge>
                      </td>
                      <td style={commonStyles.tableCell}>
                        {app.project_details?.address || `Project #${app.project}`}
                      </td>
                      <td style={commonStyles.tableCell}>
                        {app.product_details?.name || app.product || 'N/A'}
                      </td>
                      <td style={commonStyles.tableCell}>
                        £{parseFloat(app.proposed_loan_amount || 0).toLocaleString()}
                      </td>
                      <td style={commonStyles.tableCell}>{getStatusBadge(app.status)}</td>
                      <td style={{ ...commonStyles.tableCell, fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
                        {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={commonStyles.tableCell}>
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); setExpandedApp(expandedApp === app.id ? null : app.id); }}>
                          {expandedApp === app.id ? 'Hide' : 'View Details'}
                        </Button>
                      </td>
                    </tr>
                    {expandedApp === app.id && (
                      <tr>
                        <td colSpan="7" style={{ padding: theme.spacing.lg, background: theme.colors.gray50 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.lg }}>
                            {/* Borrower Details */}
                            {app.borrower_details && (
                              <div>
                                <h3 style={{ marginTop: 0, marginBottom: theme.spacing.md }}>Borrower Details</h3>
                                <div style={{ ...commonStyles.card, padding: theme.spacing.md }}>
                                  <p><strong>Name:</strong> {app.borrower_details.first_name} {app.borrower_details.last_name}</p>
                                  <p><strong>Company:</strong> {app.borrower_details.company_name || 'N/A'}</p>
                                  <p><strong>Email:</strong> {app.borrower_details.user?.email || 'N/A'}</p>
                                  <p><strong>Phone:</strong> {app.borrower_details.phone_number || 'N/A'}</p>
                                  <p><strong>Experience:</strong> {app.borrower_details.experience_description || 'N/A'}</p>
                                </div>
                              </div>
                            )}
                            
                            {/* Project Details */}
                            {app.project_details && (
                              <div>
                                <h3 style={{ marginTop: 0, marginBottom: theme.spacing.md }}>Project Details</h3>
                                <div style={{ ...commonStyles.card, padding: theme.spacing.md }}>
                                  <p><strong>Address:</strong> {app.project_details.address}, {app.project_details.town}</p>
                                  <p><strong>Postcode:</strong> {app.project_details.postcode}</p>
                                  <p><strong>Funding Type:</strong> {app.project_details.funding_type}</p>
                                  <p><strong>Property Type:</strong> {app.project_details.property_type}</p>
                                  <p><strong>Loan Required:</strong> £{parseFloat(app.project_details.loan_amount_required || 0).toLocaleString()}</p>
                                  <p><strong>Term:</strong> {app.project_details.term_required_months} months</p>
                                  <p><strong>Description:</strong> {app.project_details.description || 'N/A'}</p>
                                </div>
                              </div>
                            )}
                            
                            {/* Application Details */}
                            <div style={{ gridColumn: '1 / -1' }}>
                              <h3 style={{ marginTop: 0, marginBottom: theme.spacing.md }}>Application Details</h3>
                              <div style={{ ...commonStyles.card, padding: theme.spacing.md }}>
                                <p><strong>Proposed Loan:</strong> £{parseFloat(app.proposed_loan_amount || 0).toLocaleString()}</p>
                                <p><strong>Interest Rate:</strong> {app.proposed_interest_rate ? `${app.proposed_interest_rate}%` : 'To be determined'}</p>
                                <p><strong>Term:</strong> {app.proposed_term_months} months</p>
                                <p><strong>LTV Ratio:</strong> {app.proposed_ltv_ratio ? `${app.proposed_ltv_ratio}%` : 'N/A'}</p>
                                {app.notes && <p><strong>Notes:</strong> {app.notes}</p>}
                              </div>
                            </div>
                            
                            {/* Status Update Section (for lenders) */}
                            <div style={{ gridColumn: '1 / -1', marginTop: theme.spacing.md }}>
                              <h4 style={{ margin: `0 0 ${theme.spacing.md} 0` }}>Update Application Status</h4>
                              <div style={{
                                ...commonStyles.card,
                                padding: theme.spacing.md,
                                background: theme.colors.gray50,
                              }}>
                                <div style={{ marginBottom: theme.spacing.md }}>
                                  <label style={{
                                    display: 'block',
                                    marginBottom: theme.spacing.xs,
                                    fontWeight: theme.typography.fontWeight.medium,
                                  }}>
                                    New Status
                                  </label>
                                  <Select
                                    value={statusUpdateForm.status}
                                    onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, status: e.target.value })}
                                    style={{ width: '100%' }}
                                  >
                                    <option value="">Select status...</option>
                                    <option value="opened">Opened</option>
                                    <option value="under_review">Under Review</option>
                                    <option value="further_info_required">Further Information Required</option>
                                    <option value="credit_check">Credit Check/Underwriting</option>
                                    <option value="approved">Approved</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="declined">Declined</option>
                                    <option value="withdrawn">Withdrawn</option>
                                    <option value="completed">Completed</option>
                                  </Select>
                                </div>
                                <div style={{ marginBottom: theme.spacing.md }}>
                                  <label style={{
                                    display: 'block',
                                    marginBottom: theme.spacing.xs,
                                    fontWeight: theme.typography.fontWeight.medium,
                                  }}>
                                    Feedback/Notes (optional)
                                  </label>
                                  <Textarea
                                    value={statusUpdateForm.feedback}
                                    onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, feedback: e.target.value })}
                                    placeholder="Add feedback or notes about this status change..."
                                    rows={3}
                                  />
                                </div>
                                <Button
                                  variant="primary"
                                  onClick={async () => {
                                    if (!statusUpdateForm.status) {
                                      alert('Please select a status');
                                      return;
                                    }
                                    setUpdatingStatus(app.id);
                                    try {
                                      await api.post(`/api/applications/${app.id}/update_status/`, {
                                        status: statusUpdateForm.status,
                                        status_feedback: statusUpdateForm.feedback,
                                      });
                                      // Reload applications
                                      const res = await api.get('/api/applications/');
                                      setApplications(res.data || []);
                                      setStatusUpdateForm({ status: '', feedback: '' });
                                      setExpandedApp(null);
                                    } catch (err) {
                                      console.error('Status update error:', err);
                                      alert('Failed to update status: ' + (err.response?.data?.error || err.message));
                                    } finally {
                                      setUpdatingStatus(null);
                                    }
                                  }}
                                  disabled={updatingStatus === app.id || !statusUpdateForm.status}
                                >
                                  {updatingStatus === app.id ? 'Updating...' : 'Update Status'}
                                </Button>
                              </div>
                            </div>
                            
                            {/* Messaging Link */}
                            <div style={{ gridColumn: '1 / -1', marginTop: theme.spacing.md }}>
                              <Link to={`/lender/messages?application_id=${app.id}`}>
                                <Button variant="outline">Message Borrower</Button>
                              </Link>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default LenderApplications;
