import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

// Pages
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Sign from './pages/Sign.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import ProfileSettings from './pages/ProfileSettings.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PortfolioBuilder from './pages/PortfolioBuilder.jsx';
import ResumeBuilder from './pages/ResumeBuilder.jsx';
import InvoiceTool from './pages/InvoiceTool.jsx';
import PublicGallery from './pages/PublicGallery.jsx';
import PortfolioView from './pages/PortfolioView.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

// Private Route Guard Helper
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        Loading session...
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Marketing Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/gallery" element={<PublicGallery />} />
        <Route path="/p/:username" element={<PortfolioView />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Sign />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Protected Dashboard/App Routes */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/builder/:id" 
          element={
            <PrivateRoute>
              <PortfolioBuilder />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/resume" 
          element={
            <PrivateRoute>
              <ResumeBuilder />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/invoices" 
          element={
            <PrivateRoute>
              <InvoiceTool />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/analytics/:id" 
          element={
            <PrivateRoute>
              <AnalyticsPage />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/settings" 
          element={
            <PrivateRoute>
              <ProfileSettings />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/admin" 
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}