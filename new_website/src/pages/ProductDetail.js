import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { theme, commonStyles } from '../styles/theme';
import Button from '../components/Button';
import Badge from '../components/Badge';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProduct();
  }, [id]);

  async function loadProduct() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/products/${id}/`);
      setProduct(res.data);
    } catch (err) {
      console.error('ProductDetail loadProduct error:', err);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { variant: 'success', label: 'Active' },
      pending: { variant: 'warning', label: 'Pending Approval' },
      inactive: { variant: 'info', label: 'Inactive' },
    };
    const statusInfo = statusMap[status] || { variant: 'info', label: status };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div style={commonStyles.container}>
        <p style={{ textAlign: 'center', color: theme.colors.textSecondary }}>Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={commonStyles.container}>
        <div style={{
          ...commonStyles.card,
          background: theme.colors.errorLight,
          color: theme.colors.errorDark,
          padding: theme.spacing.lg,
        }}>
          <p>{error || 'Product not found'}</p>
          <Button onClick={() => navigate('/lender/products')} variant="primary">
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={commonStyles.container}>
      <div style={{ marginBottom: theme.spacing.lg, display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
        <Button onClick={() => navigate('/lender/products')} variant="outline">
          ← Back
        </Button>
        <h1 style={{
          margin: 0,
          fontSize: theme.typography.fontSize['3xl'],
          fontWeight: theme.typography.fontWeight.bold,
        }}>
          {product.name}
        </h1>
        {getStatusBadge(product.status)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: theme.spacing.xl }}>
        {/* Main Details */}
        <div>
          <div style={{ ...commonStyles.card, marginBottom: theme.spacing.lg }}>
            <h2 style={{ margin: `0 0 ${theme.spacing.lg} 0`, fontSize: theme.typography.fontSize['2xl'] }}>
              Product Information
            </h2>

            {product.description && (
              <div style={{ marginBottom: theme.spacing.lg }}>
                <p style={{ margin: `${theme.spacing.xs} 0`, color: theme.colors.textSecondary }}>
                  <strong>Description:</strong>
                </p>
                <p style={{ margin: 0, lineHeight: theme.typography.lineHeight.relaxed }}>
                  {product.description}
                </p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
              <div>
                <p style={{ margin: `${theme.spacing.xs} 0`, color: theme.colors.textSecondary }}>
                  <strong>Funding Type:</strong>
                </p>
                <p style={{ margin: 0 }}>{product.funding_type}</p>
              </div>

              <div>
                <p style={{ margin: `${theme.spacing.xs} 0`, color: theme.colors.textSecondary }}>
                  <strong>Property Type:</strong>
                </p>
                <p style={{ margin: 0 }}>{product.property_type}</p>
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div style={{ ...commonStyles.card, marginBottom: theme.spacing.lg }}>
            <h3 style={{ margin: `0 0 ${theme.spacing.lg} 0` }}>Financial Terms</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
              <div>
                <p style={{ margin: `${theme.spacing.xs} 0`, color: theme.colors.textSecondary }}>
                  <strong>Loan Amount Range:</strong>
                </p>
                <p style={{ margin: 0, fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.semibold }}>
                  £{parseFloat(product.min_loan_amount || 0).toLocaleString()} - £{parseFloat(product.max_loan_amount || 0).toLocaleString()}
                </p>
              </div>

              <div>
                <p style={{ margin: `${theme.spacing.xs} 0`, color: theme.colors.textSecondary }}>
                  <strong>Interest Rate Range:</strong>
                </p>
                <p style={{ margin: 0, fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.semibold }}>
                  {product.interest_rate_min}% - {product.interest_rate_max}%
                </p>
              </div>

              <div>
                <p style={{ margin: `${theme.spacing.xs} 0`, color: theme.colors.textSecondary }}>
                  <strong>Term Range:</strong>
                </p>
                <p style={{ margin: 0 }}>
                  {product.term_min_months} - {product.term_max_months} months
                </p>
              </div>

              <div>
                <p style={{ margin: `${theme.spacing.xs} 0`, color: theme.colors.textSecondary }}>
                  <strong>Max LTV Ratio:</strong>
                </p>
                <p style={{ margin: 0 }}>{product.max_ltv_ratio}%</p>
              </div>

              <div>
                <p style={{ margin: `${theme.spacing.xs} 0`, color: theme.colors.textSecondary }}>
                  <strong>Repayment Structure:</strong>
                </p>
                <p style={{ margin: 0 }}>{product.repayment_structure}</p>
              </div>
            </div>
          </div>

          {/* Eligibility Criteria */}
          {product.eligibility_criteria && (
            <div style={commonStyles.card}>
              <h3 style={{ margin: `0 0 ${theme.spacing.lg} 0` }}>Eligibility Criteria</h3>
              <p style={{ margin: 0, lineHeight: theme.typography.lineHeight.relaxed }}>
                {product.eligibility_criteria}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <div style={commonStyles.card}>
            <h3 style={{ margin: `0 0 ${theme.spacing.lg} 0` }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
              <Link to={`/lender/applications?product_id=${product.id}`} style={{ textDecoration: 'none' }}>
                <Button variant="primary" style={{ width: '100%' }}>
                  View Applications
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
