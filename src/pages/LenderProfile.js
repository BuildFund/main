import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

/**
 * Page for lenders to view and update their organisation details.  This form
 * allows editing of company data, contact information and narrative
 * fields.  Complex fields such as key personnel and risk compliance
 * details are handled as JSON strings for simplicity.  On save the
 * profile is persisted via the REST API.
 */
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
  const navigate = useNavigate();

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
    // Parse JSON fields
    let keyPersonnel = formData.key_personnel;
    let riskDetails = formData.risk_compliance_details;
    try {
      keyPersonnel = formData.key_personnel
        ? JSON.parse(formData.key_personnel)
        : [];
    } catch (err) {
      setMessage('Key personnel must be valid JSON');
      return;
    }
    try {
      riskDetails = formData.risk_compliance_details
        ? JSON.parse(formData.risk_compliance_details)
        : {};
    } catch (err) {
      setMessage('Risk compliance details must be valid JSON');
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
    try {
      await api.put(`/api/lenders/profiles/${profile.id}/`, payload);
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
      <h2>Lender Profile</h2>
      {message && <div style={{ color: message.includes('successfully') ? 'green' : 'red' }}>{message}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Organisation Name</label>
          <input
            name="organisation_name"
            value={formData.organisation_name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Company Number</label>
          <input name="company_number" value={formData.company_number} onChange={handleChange} />
        </div>
        <div>
          <label>FCA Registration Number</label>
          <input
            name="fca_registration_number"
            value={formData.fca_registration_number}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Contact Email</label>
          <input
            type="email"
            name="contact_email"
            value={formData.contact_email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Contact Phone</label>
          <input name="contact_phone" value={formData.contact_phone} onChange={handleChange} />
        </div>
        <div>
          <label>Website</label>
          <input name="website" value={formData.website} onChange={handleChange} />
        </div>
        <div>
          <label>Company Story</label>
          <textarea
            name="company_story"
            value={formData.company_story}
            onChange={handleChange}
            rows={3}
          />
        </div>
        <div>
          <label>Number of Employees</label>
          <input
            type="number"
            name="number_of_employees"
            value={formData.number_of_employees}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Financial Licences</label>
          <input
            name="financial_licences"
            value={formData.financial_licences}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Membership Bodies</label>
          <input
            name="membership_bodies"
            value={formData.membership_bodies}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Key Personnel (JSON List)</label>
          <textarea
            name="key_personnel"
            value={formData.key_personnel}
            onChange={handleChange}
            rows={3}
          />
        </div>
        <div>
          <label>Risk Compliance Details (JSON)</label>
          <textarea
            name="risk_compliance_details"
            value={formData.risk_compliance_details}
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

export default LenderProfile;