import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api.js';
import { 
  Sparkles, Plus, Globe, Settings, Eye, Trash2, Edit2, ShieldAlert,
  ArrowRight, FileText, Receipt, LogOut, Check, Activity, BarChart3
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Create portfolio modal states
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTemplate, setNewTemplate] = useState('minimal');
  const [newUsername, setNewUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const res = await api.portfolios.getAll();
      if (res.success) {
        setPortfolios(res.portfolios);
      }
    } catch (err) {
      setError('Could not retrieve portfolios. Check server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    
    // Plan limit validation (Free users can only create 1 portfolio)
    if (user?.plan === 'free' && portfolios.length >= 1) {
      setError('Free starter plan is limited to 1 published website. Pro/Lifetime memberships allow unlimited sites.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.portfolios.create({
        title: newTitle,
        templateType: newTemplate,
        username: newUsername,
      });

      if (res.success) {
        setShowModal(false);
        setNewTitle('');
        setNewUsername('');
        // Redirect straight to visual editor
        navigate(`/builder/${res.portfolio._id}`);
      }
    } catch (err) {
      setError(err.message || 'Creating portfolio failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this portfolio? This cannot be undone.')) return;
    try {
      await api.portfolios.delete(id);
      setPortfolios(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      setError('Failed to delete portfolio.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-main)' }}>
      
      {/* Sidebar Panel */}
      <aside style={{ width: '260px', borderRight: '1px solid var(--border-color)', background: 'var(--bg-card)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '18px', color: 'var(--primary)', marginBottom: '40px' }}>
          <Sparkles size={22} />
          <span>Builder Suite</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <Link to="/dashboard" className="btn btn-ghost" style={{ justifyContent: 'flex-start', background: 'rgba(37, 99, 235, 0.08)', color: 'var(--primary)', fontWeight: 600 }}>
            <Globe size={18} /> Portfolios
          </Link>
          <Link to="/resume" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
            <FileText size={18} /> Resume Builder
          </Link>
          <Link to="/invoices" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
            <Receipt size={18} /> Invoicing Tool
          </Link>
          
          {user?.role === 'admin' && (
            <Link to="/admin" className="btn btn-ghost" style={{ justifyContent: 'flex-start', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)' }}>
              <ShieldAlert size={18} /> Admin Portal
            </Link>
          )}
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <Link to="/settings" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
            <Settings size={18} /> Settings
          </Link>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ justifyContent: 'flex-start', color: 'var(--danger)' }}>
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Header Bar */}
        <header className="sticky-navbar" style={{ position: 'static' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Hello, {user?.name}</h1>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Account plan: <strong style={{ color: 'var(--primary)', textTransform: 'uppercase' }}>{user?.plan}</strong>
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button 
                onClick={toggleTheme} 
                style={{ padding: '8px 12px', borderRadius: '50%', background: 'rgba(120, 120, 120, 0.1)', color: 'var(--text-main)' }}
              >
                {darkMode ? '🌙' : '☀️'}
              </button>
              
              {user?.plan === 'free' && (
                <Link to="/settings" className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '13px', background: 'linear-gradient(135deg, var(--warning), #ea580c)' }}>
                  Upgrade Plan
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Contents Grid */}
        <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
          
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '14px 18px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '24px' }}>
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700 }}>My Portfolios</h2>
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              <Plus size={18} /> Create New Site
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>Loading portfolios...</div>
          ) : portfolios.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px 24px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <Globe size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>No Portfolios Yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Create your first designer/developer portfolio in just a few clicks.</p>
              <button onClick={() => setShowModal(true)} className="btn btn-primary">
                Create Portfolio
              </button>
            </div>
          ) : (
            <div className="grid-responsive">
              {portfolios.map((p) => (
                <div key={p._id} className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '140px', background: `linear-gradient(135deg, ${p.colors?.primary || 'var(--primary)'}, ${p.colors?.secondary || 'var(--secondary)'})`, padding: '24px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <span style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.2)', fontSize: '11px', padding: '4px 10px', borderRadius: '12px', textTransform: 'capitalize' }}>
                      {p.templateType} Theme
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{p.title}</h3>
                  </div>
                  
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Shareable URL</p>
                      <a href={`http://localhost:5173/p/${p.username}`} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 500, wordBreak: 'break-all' }}>
                        /p/{p.username}
                      </a>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: 'auto' }}>
                      <Link to={`/builder/${p._id}`} className="btn btn-secondary" style={{ flex: 1, padding: '8px 0', fontSize: '12px' }}>
                        <Edit2 size={12} /> Edit
                      </Link>
                      
                      <Link to={`/analytics/${p._id}`} className="btn btn-ghost" style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '30px' }} title="Analytics">
                        <BarChart3 size={14} />
                      </Link>

                      <button onClick={() => handleDelete(p._id)} className="btn btn-ghost" style={{ color: 'var(--danger)', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '30px' }} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      {/* Create Portfolio Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '32px', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Create New Portfolio</h3>
            
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Portfolio Title</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. My Creative Space"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    // Autofill username slug
                    setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                  }}
                />
              </div>

              <div className="form-group">
                <label>Vanity URL Username Slug</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. john-doe"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Resulting link: http://localhost:5173/p/{newUsername || 'slug'}
                </span>
              </div>

              <div className="form-group">
                <label>Theme Template</label>
                <select 
                  className="form-control"
                  value={newTemplate}
                  onChange={(e) => setNewTemplate(e.target.value)}
                >
                  <option value="minimal">Minimalist Layout</option>
                  <option value="developer">Software Developer Template</option>
                  <option value="photographer">Photography Showcase</option>
                  <option value="dark">Sleek Dark Theme</option>
                  <option value="creative">Vibrant Creative Grid</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 1 }}>
                  {submitting ? 'Creating...' : 'Initialize'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
