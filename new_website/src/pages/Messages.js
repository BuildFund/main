import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import { theme, commonStyles } from '../styles/theme';
import Button from '../components/Button';
import Textarea from '../components/Textarea';
import Input from '../components/Input';
import Badge from '../components/Badge';

function Messages() {
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get('application_id');
  
  const [messages, setMessages] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(applicationId || '');
  const [newMessage, setNewMessage] = useState({ subject: '', body: '', recipient: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadApplications();
    if (applicationId) {
      setSelectedApplication(applicationId);
      loadMessages(applicationId);
    } else {
      setLoading(false);
    }
  }, [applicationId]);

  async function loadApplications() {
    try {
      const res = await api.get('/api/applications/');
      setApplications(res.data || []);
    } catch (err) {
      console.error('Messages loadApplications error:', err);
    }
  }

  async function loadMessages(appId) {
    if (!appId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/messaging/messages/by_application/?application_id=${appId}`);
      setMessages(res.data || []);
    } catch (err) {
      console.error('Messages loadMessages error:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }

  const handleSelectApplication = (e) => {
    const appId = e.target.value;
    setSelectedApplication(appId);
    if (appId) {
      loadMessages(appId);
      // Find the application to get recipient info
      const app = applications.find(a => a.id.toString() === appId);
      if (app) {
        // Determine recipient based on user role
        const userRole = localStorage.getItem('role');
        let recipientId = '';
        if (userRole === 'Borrower') {
          recipientId = app.lender_details?.user?.id || app.lender_details?.user || '';
        } else if (userRole === 'Lender') {
          recipientId = app.borrower_details?.user?.id || app.borrower_details?.user || '';
        }
        // Auto-populate subject with project reference if available
        const projectRef = app.project_details?.project_reference || '';
        const defaultSubject = projectRef 
          ? `Re: Project ${projectRef}`
          : `Re: ${app.project_details?.address || 'Project'}`;
        setNewMessage({ 
          ...newMessage, 
          recipient: recipientId,
          subject: newMessage.subject || defaultSubject,
        });
      }
    } else {
      setMessages([]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedApplication || !newMessage.body.trim()) {
      setError('Please select an application and enter a message');
      return;
    }

    setSending(true);
    setError(null);
    try {
      const app = applications.find(a => a.id.toString() === selectedApplication);
      if (!app) {
        throw new Error('Application not found');
      }

      await api.post('/api/messaging/messages/', {
        application: selectedApplication,
        recipient: newMessage.recipient,
        subject: newMessage.subject || `Re: ${app.project_details?.address || 'Project'}`,
        body: newMessage.body,
      });

      setNewMessage({ subject: '', body: '', recipient: '' });
      await loadMessages(selectedApplication);
    } catch (err) {
      console.error('Messages handleSendMessage error:', err);
      setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getOtherPartyName = (message) => {
    const currentUserId = parseInt(localStorage.getItem('user_id') || '0');
    if (message.sender === currentUserId) {
      return message.recipient_username || 'Recipient';
    }
    return message.sender_username || 'Sender';
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
          Messages
        </h1>
        <p style={{
          color: theme.colors.textSecondary,
          fontSize: theme.typography.fontSize.base,
          margin: 0,
        }}>
          Communicate with borrowers and lenders about applications
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: theme.spacing.xl }}>
        {/* Application Selection */}
        <div style={commonStyles.card}>
          <h2 style={{
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.semibold,
            margin: `0 0 ${theme.spacing.md} 0`,
          }}>
            Select Application
          </h2>
          <select
            value={selectedApplication}
            onChange={handleSelectApplication}
            style={{
              width: '100%',
              padding: theme.spacing.sm,
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.gray300}`,
              fontSize: theme.typography.fontSize.base,
            }}
          >
            <option value="">-- Select an application --</option>
            {applications.map((app) => {
              const projectRef = app.project_details?.project_reference || '';
              const address = app.project_details?.address || `Project #${app.project}`;
              const otherParty = app.lender_details?.organisation_name || app.borrower_details?.company_name || 'N/A';
              return (
                <option key={app.id} value={app.id}>
                  {projectRef ? `[${projectRef}] ` : ''}{address} - {otherParty}
                </option>
              );
            })}
          </select>
        </div>

        {/* Messages */}
        <div style={commonStyles.card}>
          {!selectedApplication ? (
            <div style={{ textAlign: 'center', padding: theme.spacing['2xl'] }}>
              <p style={{ color: theme.colors.textSecondary }}>
                Select an application to view messages
              </p>
            </div>
          ) : loading ? (
            <div style={{ textAlign: 'center', padding: theme.spacing['2xl'] }}>
              <p style={{ color: theme.colors.textSecondary }}>Loading messages...</p>
            </div>
          ) : (
            <>
              <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                marginBottom: theme.spacing.lg,
                padding: theme.spacing.md,
                background: theme.colors.gray50,
                borderRadius: theme.borderRadius.md,
              }}>
                {messages.length === 0 ? (
                  <p style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
                    No messages yet. Start the conversation below.
                  </p>
                ) : (
                  messages.map((message) => {
                    const isSent = message.sender_username === localStorage.getItem('username');
                    return (
                      <div
                        key={message.id}
                        style={{
                          marginBottom: theme.spacing.md,
                          padding: theme.spacing.md,
                          background: isSent ? theme.colors.primaryLight : theme.colors.white,
                          borderRadius: theme.borderRadius.md,
                          border: `1px solid ${theme.colors.gray200}`,
                          marginLeft: isSent ? '20%' : '0',
                          marginRight: isSent ? '0' : '20%',
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: theme.spacing.xs,
                        }}>
                          <div>
                            <strong>{message.subject}</strong>
                            {message.project_reference && (
                              <Badge variant="info" style={{ marginLeft: theme.spacing.sm }}>
                                Ref: {message.project_reference}
                              </Badge>
                            )}
                          </div>
                          <span style={{
                            fontSize: theme.typography.fontSize.sm,
                            color: theme.colors.textSecondary,
                          }}>
                            {new Date(message.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p style={{ margin: 0, color: theme.colors.textPrimary }}>
                          {message.body}
                        </p>
                        <div style={{
                          marginTop: theme.spacing.xs,
                          fontSize: theme.typography.fontSize.sm,
                          color: theme.colors.textSecondary,
                        }}>
                          From: {message.sender_username || 'Unknown'}
                          {message.project_reference && (
                            <span style={{ marginLeft: theme.spacing.md }}>
                              • Project: {message.project_reference}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Send Message Form */}
              <form onSubmit={handleSendMessage}>
                <Input
                  label="Subject"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                  placeholder="Message subject"
                />
                <Textarea
                  label="Message"
                  value={newMessage.body}
                  onChange={(e) => setNewMessage({ ...newMessage, body: e.target.value })}
                  placeholder="Type your message here..."
                  rows={4}
                  required
                />
                <Button
                  type="submit"
                  disabled={sending || !newMessage.body.trim()}
                  variant="primary"
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;
