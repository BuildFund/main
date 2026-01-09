import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import BorrowerDashboard from './BorrowerDashboard';
import LenderDashboard from './LenderDashboard';
import AdminDashboard from './AdminDashboard';
import Chatbot from '../components/Chatbot';
import api from '../api';

function Dashboard({ role, onLogout }) {
  const [showChatbot, setShowChatbot] = useState(false);
  const [onboardingProgress, setOnboardingProgress] = useState(null);

  useEffect(() => {
    checkOnboardingProgress();
  }, []);

  async function checkOnboardingProgress() {
    try {
      const res = await api.get('/api/onboarding/progress/');
      setOnboardingProgress(res.data);
      
      // Show chatbot if onboarding is not complete
      // This works for both Borrower and Lender roles
      if (!res.data.is_complete && res.data.completion_percentage < 100) {
        // Show after a short delay to not be intrusive
        setTimeout(() => {
          setShowChatbot(true);
        }, 3000);
      }
    } catch (err) {
      console.error('Failed to check onboarding progress:', err);
      // If progress check fails, still allow manual chatbot trigger
    }
  }

  function handleChatbotComplete() {
    setShowChatbot(false);
    checkOnboardingProgress();
  }

  const dashboardContent = (() => {
    if (role === 'Borrower') {
      return <BorrowerDashboard onboardingProgress={onboardingProgress} onStartOnboarding={() => setShowChatbot(true)} />;
    }
    if (role === 'Lender') {
      return <LenderDashboard onboardingProgress={onboardingProgress} onStartOnboarding={() => setShowChatbot(true)} />;
    }
    if (role === 'Admin') {
      return <AdminDashboard />;
    }
    if (role === 'Consultant') {
      return <Navigate to="/consultant/dashboard" />;
    }
    
    // Fallback for unknown roles
    return (
      <div style={{ padding: '1rem' }}>
        <h2>Dashboard</h2>
        <p>You are logged in as <strong>{role || 'User'}</strong>.</p>
      </div>
    );
  })();

  return (
    <Layout role={role} onLogout={onLogout}>
      {dashboardContent}
      {showChatbot && (
        <Chatbot
          onComplete={handleChatbotComplete}
          onClose={() => setShowChatbot(false)}
        />
      )}
    </Layout>
  );
}

export default Dashboard;