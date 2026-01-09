import React, { useEffect, useState } from 'react';
import api from '../api';
import { theme, commonStyles } from '../styles/theme';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import Button from '../components/Button';

function LenderProfile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    organisation_name: '',
    company_number: '',
    fca_registration_number: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    company_story: '',
    number_of_employees: '',
    financial_licences: '',
    membership_bodies: '',
    key_personnel: '',
    risk_compliance_details: '',
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get('/api/lenders/profiles/');
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        if (data) {
          setProfile(data);
          setFormData({
            organisation_name: data.organisation_name || '',
            company_number: data.company_number || '',
            fca_registration_number: data.fca_registration_number || '',
            contact_email: data.contact_email || '',
            contact_phone: data.contact_phone || '',
            website: data.website || '',
            company_story: data.company_story || '',
            number_of_employees: data.number_of_employees || '',
            financial_licences: data.financial_licences || '',
            membership_bodies: data.membership_bodies || '',
            key_personnel: data.key_personnel
              ? JSON.stringify(data.key_personnel, null, 2)
              : '',
            risk_compliance_details: data.risk_compliance_details
              ? JSON.stringify(data.risk_compliance_details, null, 2)
              : '',
          });
        }
      } catch (err) {
        console.error(err);
        setMessage('Failed to load lender profile');
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile) return;
    setMessage(null);
    setLoading(true);
    try {
      let keyPersonnel = [];
      let riskDetails = {};
      try {
        keyPersonnel = formData.key_personnel ? JSON.parse(formData.key_personnel) : [];
      } catch (err) {
        setMessage('Key personnel must be valid JSON');
        setLoading(false);
        return;
      }
      try {
        riskDetails = formData.risk_compliance_details ? JSON.parse(formData.risk_compliance_details) : {};
      } catch (err) {
        setMessage('Risk compliance details must be valid JSON');
        setLoading(false);
        return;
      }
      const payload = {
        organisation_name: formData.organisation_name,
        company_number: formData.company_number,
        fca_registration_number: formData.fca_registration_number,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        website: formData.website,
        company_story: formData.company_story,
        number_of_employees: formData.number_of_employees || null,
        financial_licences: formData.financial_licences,
        membership_bodies: formData.membership_bodies,
        key_personnel: keyPersonnel,
        risk_compliance_details: riskDetails,
      };
      await api.put(`/api/lenders/profiles/${profile.id}/`, payload);
      setMessage('Profile updated successfully');
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
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
          My Profile
        </h1>
        <p style={{
          color: theme.colors.textSecondary,
          fontSize: theme.typography.fontSize.base,
          margin: 0,
        }}>
          Update your organisation information
        </p>
      </div>

      {message && (
        <div style={{
          background: message.includes('success') ? theme.colors.successLight : theme.colors.errorLight,
          color: message.includes('success') ? theme.colors.successDark : theme.colors.errorDark,
          padding: theme.spacing.md,
          borderRadius: theme.borderRadius.md,
          marginBottom: theme.spacing.lg,
          border: `1px solid ${message.includes('success') ? theme.colors.success : theme.colors.error}`,
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{
          ...commonStyles.card,
          marginBottom: theme.spacing.xl,
        }}>
          <h2 style={{
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.semibold,
            margin: `0 0 ${theme.spacing.lg} 0`,
            color: theme.colors.textPrimary,
          }}>
            Organisation Details
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: theme.spacing.lg }}>
            <Input
              label="Organisation Name"
              name="organisation_name"
              value={formData.organisation_name}
              onChange={handleChange}
              required
              style={{ gridColumn: '1 / -1' }}
            />
            <Input
              label="Company Number"
              name="company_number"
              value={formData.company_number}
              onChange={handleChange}
            />
            <Input
              label="FCA Registration Number"
              name="fca_registration_number"
              value={formData.fca_registration_number}
              onChange={handleChange}
            />
            <Input
              label="Number of Employees"
              type="number"
              name="number_of_employees"
              value={formData.number_of_employees}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{
          ...commonStyles.card,
          marginBottom: theme.spacing.xl,
        }}>
          <h2 style={{
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.semibold,
            margin: `0 0 ${theme.spacing.lg} 0`,
            color: theme.colors.textPrimary,
          }}>
            Contact Information
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: theme.spacing.lg }}>
            <Input
              label="Contact Email"
              type="email"
              name="contact_email"
              value={formData.contact_email}
              onChange={handleChange}
              required
            />
            <Input
              label="Contact Phone"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleChange}
            />
            <Input
              label="Website"
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
              style={{ gridColumn: '1 / -1' }}
            />
          </div>
        </div>

        <div style={{
          ...commonStyles.card,
          marginBottom: theme.spacing.xl,
        }}>
          <h2 style={{
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.semibold,
            margin: `0 0 ${theme.spacing.lg} 0`,
            color: theme.colors.textPrimary,
          }}>
            Additional Information
          </h2>
          <Textarea
            label="Company Story"
            name="company_story"
            value={formData.company_story}
            onChange={handleChange}
            rows={4}
            placeholder="Tell us about your organisation..."
          />
          <Input
            label="Financial Licences"
            name="financial_licences"
            value={formData.financial_licences}
            onChange={handleChange}
            placeholder="Comma-separated list of licences"
          />
          <Input
            label="Membership Bodies"
            name="membership_bodies"
            value={formData.membership_bodies}
            onChange={handleChange}
            placeholder="Comma-separated list of memberships"
          />
          <Textarea
            label="Key Personnel (JSON)"
            name="key_personnel"
            value={formData.key_personnel}
            onChange={handleChange}
            rows={6}
            placeholder='[{"name": "John Doe", "role": "CEO"}]'
            helperText="Enter valid JSON array format"
          />
          <Textarea
            label="Risk & Compliance Details (JSON)"
            name="risk_compliance_details"
            value={formData.risk_compliance_details}
            onChange={handleChange}
            rows={6}
            placeholder='{"risk_rating": "low", "compliance_status": "compliant"}'
            helperText="Enter valid JSON format"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: theme.spacing.md }}>
          <Button variant="primary" size="lg" type="submit" loading={loading}>
            {loading ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default LenderProfile;
