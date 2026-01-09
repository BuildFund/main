import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

/**
 * Page for borrowers to view and update their personal and company details.
 * This form demonstrates how to collect borrower information including
 * names, company details, contact information and simple financial data.
 * It fetches the current user's profile via the API and allows updates
 * without exposing any sensitive keys client‑side.
 */
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
  const navigate = useNavigate();

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
    try {
      // Parse JSON fields if provided
      let income = formData.income_details;
      let expenses = formData.expenses_details;
      try {
        income = formData.income_details
          ? JSON.parse(formData.income_details)
          : {};
      } catch (err) {
        setMessage('Income details must be valid JSON');
        return;
      }
      try {
        expenses = formData.expenses_details
          ? JSON.parse(formData.expenses_details)
          : {};
      } catch (err) {
        setMessage('Expenses details must be valid JSON');
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
      setMessage('Error updating profile');
    }
  };

  if (!profile) {
    return <div style={{ padding: '1rem' }}>Loading profile...</div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '1rem auto' }}>
      <h2>Borrower Profile</h2>
      {message && <div style={{ color: message.includes('successfully') ? 'green' : 'red' }}>{message}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>First Name</label>
          <input name="first_name" value={formData.first_name} onChange={handleChange} required />
        </div>
        <div>
          <label>Last Name</label>
          <input name="last_name" value={formData.last_name} onChange={handleChange} required />
        </div>
        <div>
          <label>Date of Birth</label>
          <input type="date" name="date_of_birth" value={formData.date_of_birth || ''} onChange={handleChange} />
        </div>
        <div>
          <label>Company Name</label>
          <input name="company_name" value={formData.company_name} onChange={handleChange} />
        </div>
        <div>
          <label>Registration Number</label>
          <input name="registration_number" value={formData.registration_number} onChange={handleChange} />
        </div>
        <div>
          <label>Trading Name</label>
          <input name="trading_name" value={formData.trading_name} onChange={handleChange} />
        </div>
        <div>
          <label>Phone Number</label>
          <input name="phone_number" value={formData.phone_number} onChange={handleChange} />
        </div>
        <div>
          <label>Address 1</label>
          <input name="address_1" value={formData.address_1} onChange={handleChange} />
        </div>
        <div>
          <label>Address 2</label>
          <input name="address_2" value={formData.address_2} onChange={handleChange} />
        </div>
        <div>
          <label>City</label>
          <input name="city" value={formData.city} onChange={handleChange} />
        </div>
        <div>
          <label>County</label>
          <input name="county" value={formData.county} onChange={handleChange} />
        </div>
        <div>
          <label>Postcode</label>
          <input name="postcode" value={formData.postcode} onChange={handleChange} />
        </div>
        <div>
          <label>Country</label>
          <input name="country" value={formData.country} onChange={handleChange} />
        </div>
        <div>
          <label>Experience Description</label>
          <textarea
            name="experience_description"
            value={formData.experience_description}
            onChange={handleChange}
            rows={3}
          />
        </div>
        <div>
          <label>Income Details (JSON)</label>
          <textarea
            name="income_details"
            value={formData.income_details}
            onChange={handleChange}
            rows={3}
          />
        </div>
        <div>
          <label>Expenses Details (JSON)</label>
          <textarea
            name="expenses_details"
            value={formData.expenses_details}
            onChange={handleChange}
            rows={3}
          />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <button type="submit">Save Profile</button>
          <button type="button" style={{ marginLeft: '1rem' }} onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default BorrowerProfile;