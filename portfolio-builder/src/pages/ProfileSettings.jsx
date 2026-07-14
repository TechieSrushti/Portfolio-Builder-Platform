import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api.js';
import { Sparkles, User, Mail, Lock, Settings, Layout, DollarSign, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function ProfileSettings() {
  const { user, updateProfile, updatePlanLocally } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password && password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      const res = await updateProfile({ name, email, ...(password && { password }) });
      if (res.success) {
        setSuccess('Profile updated successfully!');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(res.error || 'Profile update failed.');
      }
    } catch (err) {
      setError(err.message || 'Error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const triggerSimulatedUpgrade = async (plan) => {
    setError('');
    setSuccess('');
    try {
      const res = await api.payments.simulateUpgrade(plan);
      if (res.success) {
        setSuccess(`Successfully simulated upgrade to ${plan}!`);
        updatePlanLocally(plan);
      }
    } catch (err) {
      setError(err.message || 'Upgrade simulation failed.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar */}
      <header className="sticky-navbar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '14px' }}>
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <span style={{ height: '20px', width: '1px', background: 'var(--border-color)' }}></span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--primary)' }}>
              <Settings size={18} />
              <span>System Settings</span>
            </div>
          </div>
          <button 
            onClick={toggleTheme} 
            style={{ padding: '8px 12px', borderRadius: '50%', background: 'rgba(120, 120, 120, 0.1)', color: 'var(--text-main)' }}
          >
            {darkMode ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      {/* Main Settings Portal */}
      <main className="container" style={{ flex: 1, padding: '40px 0', maxWidth: '800px' }}>
        
        {success && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '14px 18px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '24px' }}>
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '14px 18px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '24px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid-cols-2" style={{ gap: '32px', alignItems: 'start' }}>
          
          {/* Edit Profile Form */}
          <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} style={{ color: 'var(--primary)' }} /> Edit Profile
            </h3>
            
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>New Password (Optional)</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Leave blank to keep current"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Leave blank to keep current"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '12px', padding: '12px' }}>
                {loading ? 'Saving Updates...' : 'Save Settings'}
              </button>
            </form>
          </div>

          {/* Pricing tier & dev features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Active Subscription status */}
            <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={18} style={{ color: 'var(--primary)' }} /> Subscription Plan
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                You are currently on the <strong style={{ color: 'var(--primary)', textTransform: 'uppercase' }}>{user?.plan}</strong> plan.
              </p>
              
              {user?.plan === 'free' ? (
                <div style={{ background: 'rgba(37, 99, 235, 0.05)', border: '1px dashed var(--primary)', borderRadius: 'var(--radius-md)', padding: '16px', fontSize: '13px' }}>
                  <p style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '6px' }}>Unlock Premium features:</p>
                  <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <li>Unlimited portfolios publish</li>
                    <li>Custom domain hosting</li>
                    <li>AI Copywriting tools access</li>
                    <li>Freelancer invoicing manager</li>
                  </ul>
                </div>
              ) : (
                <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px dashed var(--success)', borderRadius: 'var(--radius-md)', padding: '16px', fontSize: '13px' }}>
                  <p style={{ fontWeight: 600, color: 'var(--success)', marginBottom: '4px' }}>All Premium features unlocked!</p>
                  <p style={{ color: 'var(--text-muted)' }}>Thank you for supporting the Portfolio Builder Platform.</p>
                </div>
              )}
            </div>

            {/* Sandbox Developer Bypass */}
            <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--warning)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} /> Sandbox Upgrade
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
                Simulate standard billing webhooks to review premium options (custom domain, AI, invoices) without connecting payment keys.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button onClick={() => triggerSimulatedUpgrade('pro_monthly')} className="btn btn-secondary" style={{ fontSize: '12px', padding: '8px 0' }}>
                  Set Pro Monthly
                </button>
                <button onClick={() => triggerSimulatedUpgrade('lifetime')} className="btn btn-secondary" style={{ fontSize: '12px', padding: '8px 0' }}>
                  Set Lifetime
                </button>
              </div>
              <button 
                onClick={() => triggerSimulatedUpgrade('free')} 
                className="btn btn-ghost" 
                style={{ width: '100%', fontSize: '12px', padding: '8px 0', marginTop: '8px', color: 'var(--danger)' }}
              >
                Revert to Free Starter
              </button>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
