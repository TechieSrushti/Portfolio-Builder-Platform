import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api.js';
import { 
  Sparkles, Globe, FileText, Receipt, ShieldAlert, Settings, 
  ArrowLeft, Eye, Users, Monitor, Compass, MapPin
} from 'lucide-react';

export default function AnalyticsPage() {
  const { id } = useParams();
  const { darkMode, toggleTheme } = useTheme();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.analytics.get(id);
        if (res.success) {
          setAnalytics(res);
        }
      } catch (err) {
        setError('Failed to load portfolio analytics. Ensure user is subscribed to Pro plan.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [id]);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>Gathering analytics metrics...</div>;
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--primary)' }}>
              <Sparkles size={18} />
              <span>Real-time Analytics</span>
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
        
        {error ? (
          <div className="glass-panel" style={{ padding: '40px 24px', borderRadius: '12px', textAlign: 'center' }}>
            <ShieldAlert size={48} style={{ color: 'var(--danger)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Pro Features Locked</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Detailed analytics logs require a premium Pro subscription tier.</p>
            <Link to="/settings" className="btn btn-primary">Upgrade Settings</Link>
          </div>
        ) : !analytics || analytics.summary?.totalViews === 0 ? (
          <div className="glass-panel" style={{ padding: '60px 24px', borderRadius: '12px', textAlign: 'center' }}>
            <Eye size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <h3>No Page Views Yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Publish your website and share the link to start collecting analytics metrics.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Summary counters */}
            <div className="grid-cols-2" style={{ gap: '20px' }}>
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', padding: '12px', borderRadius: '8px' }}><Eye size={24} /></div>
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Page Views</p>
                  <h3 style={{ fontSize: '24px', fontWeight: 800 }}>{analytics.summary.totalViews}</h3>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '12px', borderRadius: '8px' }}><Users size={24} /></div>
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Unique Visitors</p>
                  <h3 style={{ fontSize: '24px', fontWeight: 800 }}>{analytics.summary.totalUniqueVisitors}</h3>
                </div>
              </div>
            </div>

            {/* Custom SVG Views Timeline Chart */}
            <div className="glass-panel" style={{ padding: '28px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>Visitor Traffic History (Last 30 Days)</h3>
              
              <div style={{ height: '220px', width: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                {analytics.chartData.map((pt, idx) => {
                  // calculate percentage height
                  const maxVal = Math.max(...analytics.chartData.map(d => d.views), 1);
                  const pctHeight = (pt.views / maxVal) * 160; // scale to max 160px
                  
                  return (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '9px', marginBottom: '4px', fontWeight: 600 }}>{pt.views}</span>
                      <div 
                        style={{ 
                          width: '100%', height: `${pctHeight}px`, 
                          background: 'linear-gradient(to top, var(--primary), var(--secondary))',
                          borderRadius: '4px 4px 0 0', minHeight: '6px'
                        }}
                      ></div>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '6px', whiteSpace: 'nowrap' }}>{pt.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed metrics grids */}
            <div className="grid-cols-3" style={{ gap: '20px' }}>
              
              {/* Countries */}
              <div className="glass-panel" style={{ padding: '20px', borderRadius: '10px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} style={{ color: 'var(--primary)' }} /> Countries
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  {analytics.countries.map((c, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                      <span>{c.name}</span>
                      <strong>{c.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Referrers */}
              <div className="glass-panel" style={{ padding: '20px', borderRadius: '10px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Compass size={14} style={{ color: 'var(--primary)' }} /> Traffic Sources
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  {analytics.sources.map((s, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                      <span style={{ wordBreak: 'break-all' }}>{s.name}</span>
                      <strong>{s.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Devices */}
              <div className="glass-panel" style={{ padding: '20px', borderRadius: '10px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Monitor size={14} style={{ color: 'var(--primary)' }} /> Devices
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  {analytics.devices.map((d, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                      <span>{d.name}</span>
                      <strong>{d.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

    </div>
  );
}
