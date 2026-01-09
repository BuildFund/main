import React, { useEffect, useState } from 'react';
import api from '../api';
import { theme, commonStyles } from '../styles/theme';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import Button from '../components/Button';

function BorrowerProfile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    company_name: '',
    registration_number: '',
    trading_name: '',
    phone_number: '',
    address_1: '',
    address_2: '',
    city: '',
    county: '',
    postcode: '',
    country: '',
    experience_description: '',
    income_details: '',
    expenses_details: '',
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get('/api/borrowers/profiles/');
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        if (data) {
          setProfile(data);
          setFormData({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            date_of_birth: data.date_of_birth || '',
            company_name: data.company_name || '',
            registration_number: data.registration_number || '',
            trading_name: data.trading_name || '',
            phone_number: data.phone_number || '',
            address_1: data.address_1 || '',
            address_2: data.address_2 || '',
            city: data.city || '',
            county: data.county || '',
            postcode: data.postcode || '',
            country: data.country || '',
            experience_description: data.experience_description || '',
            income_details: data.income_details
              ? JSON.stringify(data.income_details, null, 2)
              : '',
            expenses_details: data.expenses_details
              ? JSON.stringify(data.expenses_details, null, 2)
              : '',
          });
        }
      } catch (err) {
        console.error(err);
        setMessage('Failed to load profile');
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
      let income = {};
      let expenses = {};
      try {
        income = formData.income_details ? JSON.parse(formData.income_details) : {};
      } catch (err) {
        setMessage('Income details must be valid JSON');
        setLoading(false);
        return;
      }
      try {
        expenses = formData.expenses_details ? JSON.parse(formData.expenses_details) : {};
      } catch (err) {
        setMessage('Expenses details must be valid JSON');
        setLoading(false);
        return;
      }
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birth || null,
        company_name: formData.company_name,
        registration_number: formData.registration_number,
        trading_name: formData.trading_name,
        phone_number: formData.phone_number,
        address_1: formData.address_1,
        address_2: formData.address_2,
        city: formData.city,
        county: formData.county,
        postcode: formData.postcode,
        country: formData.country,
        experience_description: formData.experience_description,
        income_details: income,
        expenses_details: expenses,
      };
      await api.put(`/api/borrowers/profiles/${profile.id}/`, payload);
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
          Update your personal and company information
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
            Personal Information
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: theme.spacing.lg }}>
            <Input
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
            <Input
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
            <Input
              label="Date of Birth"
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
            />
            <Input
              label="Phone Number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="+44 20 1234 5678"
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
            Company Information
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: theme.spacing.lg }}>
            <Input
              label="Company Name"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              style={{ gridColumn: '1 / -1' }}
            />
            <Input
              label="Registration Number"
              name="registration_number"
              value={formData.registration_number}
              onChange={handleChange}
            />
            <Input
              label="Trading Name"
              name="trading_name"
              value={formData.trading_name}
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
            Address
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: theme.spacing.lg }}>
            <Input
              label="Address Line 1"
              name="address_1"
              value={formData.address_1}
              onChange={handleChange}
              style={{ gridColumn: '1 / -1' }}
            />
            <Input
              label="Address Line 2"
              name="address_2"
              value={formData.address_2}
              onChange={handleChange}
              style={{ gridColumn: '1 / -1' }}
            />
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
            <Input
              label="County"
              name="county"
              value={formData.county}
              onChange={handleChange}
            />
            <Input
              label="Postcode"
              name="postcode"
              value={formData.postcode}
              onChange={handleChange}
            />
            <Input
              label="Country"
              name="country"
              value={formData.country}
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
            Additional Information
          </h2>
          <Textarea
            label="Experience Description"
            name="experience_description"
            value={formData.experience_description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe your experience..."
          />
          <Textarea
            label="Income Details (JSON)"
            name="income_details"
            value={formData.income_details}
            onChange={handleChange}
            rows={6}
            placeholder='{"annual_income": 50000, "source": "salary"}'
            helperText="Enter valid JSON format"
          />
          <Textarea
            label="Expenses Details (JSON)"
            name="expenses_details"
            value={formData.expenses_details}
            onChange={handleChange}
            rows={6}
            placeholder='{"monthly_expenses": 2000, "categories": ["rent", "utilities"]}'
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

export default BorrowerProfile;
