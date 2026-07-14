import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api.js';
import { Sparkles, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setLoading(false);
        setMessage('Missing verification token in URL parameters.');
        return;
      }

      try {
        const res = await api.auth.verifyEmail(token);
        if (res.success) {
          setSuccess(true);
          setMessage('Your email address has been successfully verified.');
        } else {
          setMessage(res.message || 'Verification failed.');
        }
      } catch (err) {
        setMessage(err.message || 'Failed to connect to verification services.');
      } finally {
        setLoading(false);
      }
    };

    performVerification();
  }, [token]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', padding: '24px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '40px 32px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
        
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '22px', color: 'var(--primary)' }}>
            <Sparkles size={26} />
            <span>Portfolio Builder</span>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <Loader2 size={40} className="fade-in" style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Verifying your email...</h3>
          </div>
        ) : (
          <div className="fade-in">
            {success ? (
              <div style={{ color: 'var(--success)' }}>
                <CheckCircle2 size={56} style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>Email Verified!</h3>
              </div>
            ) : (
              <div style={{ color: 'var(--danger)' }}>
                <XCircle size={56} style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>Verification Failed</h3>
              </div>
            )}
            
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '12px', marginBottom: '32px', lineHeight: 1.6 }}>
              {message}
            </p>

            <Link to="/login" className="btn btn-primary" style={{ width: '100%', padding: '12px 0', fontWeight: 600 }}>
              Proceed to Sign In
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
