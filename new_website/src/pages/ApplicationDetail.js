import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { theme, commonStyles } from '../styles/theme';
import Button from '../components/Button';
import Badge from '../components/Badge';
import ApplicationProgress from '../components/ApplicationProgress';
import Select from '../components/Select';
import Textarea from '../components/Textarea';
import Input from '../components/Input';

function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [statusUpdateForm, setStatusUpdateForm] = useState({ status: '', feedback: '' });
  const [docUploadForm, setDocUploadForm] = useState({ description: '' });
  const [dragActive, setDragActive] = useState(false);
  const role = localStorage.getItem('role');
  const isLender = role === 'Lender';

  useEffect(() => {
    loadApplication();
  }, [id]);

  async function loadApplication() {
    setLoading(true);
    setError(null);
    try {
      const [appRes, historyRes, docsRes, messagesRes] = await Promise.all([
        api.get(`/api/applications/${id}/`),
        api.get(`/api/applications/${id}/status_history/`).catch(() => ({ data: [] })),
        api.get(`/api/applications/${id}/documents/`).catch(() => ({ data: [] })),
        api.get(`/api/messages/?application=${id}`).catch(() => ({ data: [] })),
      ]);
      setApplication(appRes.data);
      setStatusHistory(historyRes.data || []);
      setDocuments(docsRes.data || []);
      setMessages(messagesRes.data || []);
    } catch (err) {
      console.error('ApplicationDetail loadApplication error:', err);
      setError('Failed to load application details');
    } finally {
      setLoading(false);
    }
  }

  async function handleDocumentUpload(files) {
    if (!files || files.length === 0) return;
    
    setUploadingDoc(true);
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    formData.append('description', docUploadForm.description);
    
    try {
      await api.post(`/api/applications/${id}/documents/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await loadApplication();
      setDocUploadForm({ description: '' });
    } catch (err) {
      console.error('Document upload error:', err);
      alert('Failed to upload document: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploadingDoc(false);
    }
  }

  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleDocumentUpload(e.dataTransfer.files);
    }
  }

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
        <p style={{ textAlign: 'center', color: theme.colors.textSecondary }}>Loading application...</p>
      </div>
    );
  }

  if (error || !application) {
    const backPath = role === 'Borrower' ? '/borrower/applications' : '/lender/applications';
    return (
      <div style={commonStyles.container}>
        <div style={{
          ...commonStyles.card,
          background: theme.colors.errorLight,
          color: theme.colors.errorDark,
          padding: theme.spacing.lg,
        }}>
          <p>{error || 'Application not found'}</p>
          <Button onClick={() => navigate(backPath)} variant="primary">
            Back to Applications
          </Button>
        </div>
      </div>
    );
  }

  const backPath = role === 'Borrower' ? '/borrower/applications' : '/lender/applications';

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'messages', label: `Messages (${messages.length})` },
    { id: 'documents', label: `Documents (${documents.length})` },
    { id: 'progress', label: 'Progress' },
  ];

  return (
    <div style={commonStyles.container}>
      <div style={{ marginBottom: theme.spacing.lg, display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
        <Button onClick={() => navigate(backPath)} variant="outline">
          ← Back
        </Button>
        <h1 style={{
          margin: 0,
          fontSize: theme.typography.fontSize['3xl'],
          fontWeight: theme.typography.fontWeight.bold,
        }}>
          Application #{application.id}
        </h1>
        {getStatusBadge(application.status)}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: theme.spacing.sm,
        borderBottom: `2px solid ${theme.colors.gray200}`,
        marginBottom: theme.spacing.xl,
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: `${theme.spacing.md} ${theme.spacing.lg}`,
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? `3px solid ${theme.colors.primary}` : '3px solid transparent',
              color: activeTab === tab.id ? theme.colors.primary : theme.colors.textSecondary,
              fontWeight: activeTab === tab.id ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal,
              cursor: 'pointer',
              fontSize: theme.typography.fontSize.base,
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: theme.spacing.xl }}>
          {/* Main Details */}
          <div>
            {/* Application Terms */}
            <div style={{ ...commonStyles.card, marginBottom: theme.spacing.lg }}>
              <h2 style={{ margin: `0 0 ${theme.spacing.lg} 0`, fontSize: theme.typography.fontSize['2xl'] }}>
                Application Terms
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
                <div>
                  <p style={{ margin: `${theme.spacing.xs} 0`, color: theme.colors.textSecondary }}>
                    <strong>Loan Amount:</strong>
                  </p>
                  <p style={{ margin: 0, fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.semibold }}>
                    £{parseFloat(application.proposed_loan_amount || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p style={{ margin: `${theme.spacing.xs} 0`, color: theme.colors.textSecondary }}>
                    <strong>Interest Rate:</strong>
                  </p>
                  <p style={{ margin: 0, fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.semibold }}>
                    {application.proposed_interest_rate ? `${application.proposed_interest_rate}%` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p style={{ margin: `${theme.spacing.xs} 0`, color: theme.colors.textSecondary }}>
                    <strong>Term:</strong>
                  </p>
                  <p style={{ margin: 0 }}>{application.proposed_term_months} months</p>
                </div>
                <div>
                  <p style={{ margin: `${theme.spacing.xs} 0`, color: theme.colors.textSecondary }}>
                    <strong>LTV Ratio:</strong>
                  </p>
                  <p style={{ margin: 0 }}>
                    {application.proposed_ltv_ratio ? `${application.proposed_ltv_ratio}%` : 'N/A'}
                  </p>
                </div>
              </div>
              {application.notes && (
                <div style={{ marginTop: theme.spacing.lg }}>
                  <p style={{ margin: `${theme.spacing.xs} 0`, color: theme.colors.textSecondary }}>
                    <strong>Notes:</strong>
                  </p>
                  <p style={{ margin: 0, lineHeight: theme.typography.lineHeight.relaxed }}>
                    {application.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Project Details */}
            {application.project_details && (
              <div style={{ ...commonStyles.card, marginBottom: theme.spacing.lg }}>
                <h3 style={{ margin: `0 0 ${theme.spacing.lg} 0` }}>Project Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
                  <div>
                    <p style={{ margin: `${theme.spacing.xs} 0`, color: theme.colors.textSecondary }}>
                      <strong>Address:</strong>
                    </p>
                    <p style={{ margin: 0 }}>
                      {application.project_details.address}<br />
                      {application.project_details.town}, {application.project_details.county}<br />
                      {application.project_details.postcode}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: `${theme.spacing.xs} 0`, color: theme.colors.textSecondary }}>
                      <strong>Funding Type:</strong>
                    </p>
                    <p style={{ margin: 0 }}>{application.project_details.funding_type}</p>
                    <p style={{ margin: `${theme.spacing.md} 0 ${theme.spacing.xs}`, color: theme.colors.textSecondary }}>
                      <strong>Property Type:</strong>
                    </p>
                    <p style={{ margin: 0 }}>{application.project_details.property_type}</p>
                  </div>
                </div>
                {application.project_details.project_reference && (
                  <div style={{ marginTop: theme.spacing.md }}>
                    <Badge variant="info">
                      Project Reference: {application.project_details.project_reference}
                    </Badge>
                  </div>
                )}
              </div>
            )}

            {/* Borrower/Lender Details */}
            {role === 'Lender' && application.borrower_details && (
              <div style={commonStyles.card}>
                <h3 style={{ margin: `0 0 ${theme.spacing.lg} 0` }}>Borrower Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
                  <div>
                    <p style={{ margin: `${theme.spacing.xs} 0`, color: theme.colors.textSecondary }}>
                      <strong>Company Name:</strong>
                    </p>
                    <p style={{ margin: 0 }}>{application.borrower_details.company_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p style={{ margin: `${theme.spacing.xs} 0`, color: theme.colors.textSecondary }}>
                      <strong>Contact:</strong>
                    </p>
                    <p style={{ margin: 0 }}>{application.borrower_details.user_email || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {role === 'Borrower' && application.lender_details && (
              <div style={commonStyles.card}>
                <h3 style={{ margin: `0 0 ${theme.spacing.lg} 0` }}>Lender Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
                  <div>
                    <p style={{ margin: `${theme.spacing.xs} 0`, color: theme.colors.textSecondary }}>
                      <strong>Organisation:</strong>
                    </p>
                    <p style={{ margin: 0 }}>{application.lender_details.organisation_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p style={{ margin: `${theme.spacing.xs} 0`, color: theme.colors.textSecondary }}>
                      <strong>Contact:</strong>
                    </p>
                    <p style={{ margin: 0 }}>{application.lender_details.contact_email || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Status Update (Lender only) */}
            {isLender && (
              <div style={{ ...commonStyles.card, marginBottom: theme.spacing.lg }}>
                <h3 style={{ margin: `0 0 ${theme.spacing.lg} 0` }}>Update Status</h3>
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
                  style={{ width: '100%' }}
                  onClick={async () => {
                    if (!statusUpdateForm.status) {
                      alert('Please select a status');
                      return;
                    }
                    setUpdatingStatus(true);
                    try {
                      await api.post(`/api/applications/${id}/update_status/`, {
                        status: statusUpdateForm.status,
                        feedback: statusUpdateForm.feedback,
                      });
                      await loadApplication();
                      setStatusUpdateForm({ status: '', feedback: '' });
                    } catch (err) {
                      console.error('Status update error:', err);
                      alert('Failed to update status: ' + (err.response?.data?.error || err.message));
                    } finally {
                      setUpdatingStatus(false);
                    }
                  }}
                  disabled={updatingStatus || !statusUpdateForm.status}
                >
                  {updatingStatus ? 'Updating...' : 'Update Status'}
                </Button>
              </div>
            )}

            <div style={commonStyles.card}>
              <h3 style={{ margin: `0 0 ${theme.spacing.lg} 0` }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                <Link 
                  to={`/${role.toLowerCase()}/messages?application_id=${application.id}`} 
                  style={{ textDecoration: 'none' }}
                >
                  <Button variant="primary" style={{ width: '100%' }}>
                    Message {role === 'Borrower' ? 'Lender' : 'Borrower'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div style={commonStyles.card}>
          <h2 style={{ margin: `0 0 ${theme.spacing.lg} 0` }}>Messages</h2>
          {messages.length === 0 ? (
            <p style={{ color: theme.colors.textSecondary }}>No messages yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
              {messages.map(msg => (
                <div key={msg.id} style={{
                  padding: theme.spacing.md,
                  background: msg.sender === role ? theme.colors.primaryLight : theme.colors.gray50,
                  borderRadius: theme.borderRadius.md,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: theme.spacing.xs }}>
                    <strong>{msg.sender_username || 'Unknown'}</strong>
                    <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ margin: 0 }}>{msg.body}</p>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: theme.spacing.lg }}>
            <Link to={`/${role.toLowerCase()}/messages?application_id=${application.id}`}>
              <Button variant="primary">Go to Messages</Button>
            </Link>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div>
          <div style={{ ...commonStyles.card, marginBottom: theme.spacing.lg }}>
            <h2 style={{ margin: `0 0 ${theme.spacing.lg} 0` }}>Shared Documents</h2>
            
            {/* Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{
                marginBottom: theme.spacing.lg,
                padding: theme.spacing.xl,
                border: `2px dashed ${dragActive ? theme.colors.primary : theme.colors.gray300}`,
                borderRadius: theme.borderRadius.md,
                textAlign: 'center',
                background: dragActive ? theme.colors.primaryLight : theme.colors.gray50,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <input
                id="file-upload"
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => handleDocumentUpload(e.target.files)}
              />
              <div style={{ fontSize: '32px', marginBottom: theme.spacing.sm }}>📎</div>
              <p style={{ margin: 0, color: theme.colors.textSecondary }}>
                Drag and drop files here or click to browse
              </p>
            </div>

            <Input
              label="Document Description (Optional)"
              name="description"
              value={docUploadForm.description}
              onChange={(e) => setDocUploadForm({ ...docUploadForm, description: e.target.value })}
              placeholder="e.g., Proof of income, Property valuation"
            />

            {uploadingDoc && (
              <p style={{ color: theme.colors.textSecondary, marginTop: theme.spacing.sm }}>
                Uploading...
              </p>
            )}
          </div>

          {/* Documents List */}
          <div style={commonStyles.card}>
            <h3 style={{ margin: `0 0 ${theme.spacing.lg} 0` }}>Uploaded Documents</h3>
            {documents.length === 0 ? (
              <p style={{ color: theme.colors.textSecondary }}>No documents uploaded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                {documents.map(doc => (
                  <div key={doc.id} style={{
                    padding: theme.spacing.md,
                    border: `1px solid ${theme.colors.gray200}`,
                    borderRadius: theme.borderRadius.md,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: theme.typography.fontWeight.semibold }}>
                        {doc.file_name}
                      </p>
                      {doc.description && (
                        <p style={{ margin: `${theme.spacing.xs} 0 0`, fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
                          {doc.description}
                        </p>
                      )}
                      <p style={{ margin: `${theme.spacing.xs} 0 0`, fontSize: theme.typography.fontSize.xs, color: theme.colors.textMuted }}>
                        Uploaded by {doc.uploaded_by} on {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: theme.spacing.sm, alignItems: 'center' }}>
                      <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
                        {(doc.file_size / 1024).toFixed(2)} KB
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'progress' && (
        <div style={commonStyles.card}>
          <h2 style={{ margin: `0 0 ${theme.spacing.lg} 0` }}>Application Progress</h2>
          <ApplicationProgress application={application} statusHistory={statusHistory} />
        </div>
      )}
    </div>
  );
}

export default ApplicationDetail;
