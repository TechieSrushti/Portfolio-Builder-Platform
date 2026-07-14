import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api.js';
import { 
  Sparkles, Globe, FileText, Receipt, ShieldAlert, Settings, 
  ArrowLeft, Users, Trash2, Edit, CheckCircle, ShieldCheck
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [portfoliosList, setPortfoliosList] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const res = await api.admin.getDashboard();
      if (res.success) {
        setStats(res.stats);
        
        const usersRes = await api.admin.getUsers();
        if (usersRes.success) setUsersList(usersRes.users);

        const portRes = await api.admin.getPortfolios();
        if (portRes.success) setPortfoliosList(portRes.portfolios);
      }
    } catch (err) {
      setError('Failed to fetch admin resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    } else {
      loadData();
    }
  }, [user]);

  const handlePlanChange = async (userId, plan) => {
    setError('');
    setSuccess('');
    try {
      const res = await api.admin.updateUserPlan(userId, plan);
      if (res.success) {
        setSuccess('User plan updated successfully.');
        setUsersList(prev => prev.map(u => u._id === userId ? { ...u, plan } : u));
      }
    } catch (err) {
      setError('Plan update failed.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user and all their portfolios and invoices?')) return;
    setError('');
    setSuccess('');
    try {
      const res = await api.admin.deleteUser(userId);
      if (res.success) {
        setSuccess('User and data deleted successfully.');
        setUsersList(prev => prev.filter(u => u._id !== userId));
        loadData(); // reload stats
      }
    } catch (err) {
      setError('User deletion failed.');
    }
  };

  const handleToggleFeature = async (portfolioId) => {
    setError('');
    setSuccess('');
    try {
      const res = await api.admin.featurePortfolio(portfolioId);
      if (res.success) {
        setSuccess('Featured portfolio state toggled!');
        setPortfoliosList(prev => prev.map(p => {
          if (p._id === portfolioId) {
            return { ...p, templateType: p.templateType === 'featured' ? 'minimal' : 'featured' };
          }
          return p;
        }));
      }
    } catch (err) {
      setError('Failed to feature portfolio.');
    }
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>Entering administrative control panel...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      
      {/* Header Bar */}
      <header className="sticky-navbar" style={{ position: 'static' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '14px' }}>
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <span style={{ height: '20px', width: '1px', background: 'var(--border-color)' }}></span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--danger)' }}>
              <ShieldCheck size={18} />
              <span>Admin Control Center</span>
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

      {/* Main Stats Portal */}
      <main className="container" style={{ flex: 1, padding: '40px 0', maxWidth: '1000px' }}>
        
        {success && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '12px 16px', borderRadius: '6px', fontSize: '12px', marginBottom: '24px' }}>
            {success}
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px 16px', borderRadius: '6px', fontSize: '12px', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {/* Dashboard counters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '10px' }}>
            <h4 style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Registered Members</h4>
            <h2 style={{ fontSize: '26px', fontWeight: 800 }}>{stats?.totalUsers || 0}</h2>
          </div>
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '10px' }}>
            <h4 style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Portfolios Published</h4>
            <h2 style={{ fontSize: '26px', fontWeight: 800 }}>{stats?.totalPortfolios || 0}</h2>
          </div>
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '10px' }}>
            <h4 style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Invoices Drafted</h4>
            <h2 style={{ fontSize: '26px', fontWeight: 800 }}>{stats?.totalInvoices || 0}</h2>
          </div>
        </div>

        {/* Users list management panel */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} /> Manage Users & Billing Plans
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>Name</th>
                  <th style={{ padding: '12px' }}>Email</th>
                  <th style={{ padding: '12px' }}>Active Plan</th>
                  <th style={{ padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '12px' }}>{u.email}</td>
                    <td style={{ padding: '12px' }}>
                      <select 
                        value={u.plan} 
                        onChange={(e) => handlePlanChange(u._id, e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '4px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', fontSize: '11px', textTransform: 'uppercase' }}
                      >
                        <option value="free">Free</option>
                        <option value="pro_monthly">Pro Monthly</option>
                        <option value="pro_yearly">Pro Yearly</option>
                        <option value="lifetime">Lifetime</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {u._id !== user.id && (
                        <button onClick={() => handleDeleteUser(u._id)} style={{ color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Trash2 size={12} /> Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Portfolios list featuring panel */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} /> Manage Published Websites
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>Portfolio Title</th>
                  <th style={{ padding: '12px' }}>Creator</th>
                  <th style={{ padding: '12px' }}>Link Path</th>
                  <th style={{ padding: '12px' }}>Featured Status</th>
                </tr>
              </thead>
              <tbody>
                {portfoliosList.map((p) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{p.title}</td>
                    <td style={{ padding: '12px' }}>{p.user?.name || 'Unknown'}</td>
                    <td style={{ padding: '12px' }}>
                      <a href={`/p/${p.username}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>/p/{p.username}</a>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button 
                        onClick={() => handleToggleFeature(p._id)}
                        className={`btn ${p.templateType === 'featured' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '4px 12px', fontSize: '10px' }}
                      >
                        {p.templateType === 'featured' ? 'FEATURED' : 'MARK FEATURED'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

    </div>
  );
}
