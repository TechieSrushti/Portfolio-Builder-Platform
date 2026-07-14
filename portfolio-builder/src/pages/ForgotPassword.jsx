import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api.js';
import { Sparkles, Mail, Lock, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // If token exists, we are in reset mode

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [simUrl, setSimUrl] = useState('');

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSimUrl('');
    setLoading(true);

    try {
      const res = await api.auth.forgotPassword({ email });
      if (res.success) {
        setSuccess('Reset link generated! Dev URL simulated below.');
        if (res.devResetUrl) {
          setSimUrl(res.devResetUrl);
        }
      }
    } catch (err) {
      setError(err.message || 'Error executing request');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      const res = await api.auth.resetPassword(token, { password });
      if (res.success) {
        setSuccess('Password updated successfully! You can now log in.');
      }
    } catch (err) {
      setError(err.message || 'Error executing request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', padding: '24px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '40px 32px', borderRadius: 'var(--radius-lg)' }}>
        
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '22px', color: 'var(--primary)' }}>
            <Sparkles size={26} />
            <span>Portfolio Builder</span>
          </Link>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginTop: '20px', marginBottom: '8px' }}>
            {token ? 'Reset Password' : 'Forgot Password'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {token ? 'Enter your new password below.' : 'Retrieve access to your user panel.'}
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '20px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '14px 18px', borderRadius: 'var(--radius-md)', fontSize: '13px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '6px' }}>
              <CheckCircle size={16} />
              <span>Request Completed</span>
            </div>
            <p>{success}</p>
            {simUrl && (
              <a 
                href={simUrl} 
                style={{ display: 'block', background: 'var(--primary)', color: 'white', textAlign: 'center', fontWeight: 700, padding: '8px', borderRadius: '4px', marginTop: '10px', textDecoration: 'none' }}
              >
                Go to Simulated Reset Page
              </a>
            )}
            {token && (
              <Link to="/login" className="btn btn-primary" style={{ width: '100%', marginTop: '14px', padding: '8px 0' }}>
                Go to Login
              </Link>
            )}
          </div>
        )}

        {!success && !token && (
          <form onSubmit={handleForgotSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  required
                  className="form-control"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '48px', width: '100%' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', marginTop: '24px', fontWeight: 600 }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        {!success && token && (
          <form onSubmit={handleResetSubmit}>
            <div className="form-group">
              <label>New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  className="form-control"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '48px', width: '100%' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  className="form-control"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '48px', width: '100%' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', marginTop: '24px', fontWeight: 600 }}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '28px' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
