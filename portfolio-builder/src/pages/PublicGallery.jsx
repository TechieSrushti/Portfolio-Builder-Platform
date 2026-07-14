import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api.js';
import { Sparkles, Search, Heart, ArrowRight, ArrowLeft } from 'lucide-react';

export default function PublicGallery() {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('recent');

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await api.portfolios.getGallery(search, category, sort);
      if (res.success) {
        setPortfolios(res.portfolios);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, [category, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchGallery();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar */}
      <header className="sticky-navbar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '20px', color: 'var(--primary)' }}>
            <Sparkles size={24} />
            <span>Portfolio Gallery</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/dashboard" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Dashboard</Link>
            <button 
              onClick={toggleTheme} 
              style={{ padding: '8px 12px', borderRadius: '50%', background: 'rgba(120, 120, 120, 0.1)', color: 'var(--text-main)' }}
            >
              {darkMode ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </header>

      {/* Main content grid */}
      <main className="container" style={{ flex: 1, padding: '40px 0' }}>
        
        {/* Gallery Title & Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Explore Creative Portfolios</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Discover published profiles of top engineers, writers, and designers.</p>
          </div>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search creators..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '36px', width: '220px', paddingY: '10px' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '13px' }}>Search</button>
          </form>
        </div>

        {/* Filters and Sorting selectors */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Categories tag rows */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'developer', 'photographer', 'designer', 'creative', 'minimal'].map((cat) => (
              <button 
                key={cat}
                onClick={() => setCategory(cat)}
                style={{ 
                  padding: '6px 14px', borderRadius: '30px', fontSize: '12px', fontWeight: 500,
                  background: category === cat ? 'var(--primary)' : 'rgba(120, 120, 120, 0.05)',
                  color: category === cat ? 'white' : 'var(--text-main)',
                  border: category === cat ? 'none' : '1px solid var(--border-color)',
                  textTransform: 'capitalize'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sorting */}
          <select 
            className="form-control" 
            value={sort} 
            onChange={(e) => setSort(e.target.value)}
            style={{ width: '160px', padding: '6px 12px' }}
          >
            <option value="recent">Recently Published</option>
            <option value="popular">Most Liked Profiles</option>
          </select>

        </div>

        {/* Portfolios list grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>Loading public directory...</div>
        ) : portfolios.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px 24px', borderRadius: '12px', textAlign: 'center' }}>
            <Search size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h3>No Portfolios Found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Try refining your search terms or category toggles.</p>
          </div>
        ) : (
          <div className="grid-responsive">
            {portfolios.map((p) => (
              <div key={p._id} className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                
                {/* Visual header */}
                <div style={{ height: '120px', background: `linear-gradient(135deg, ${p.colors?.primary || 'var(--primary)'}, ${p.colors?.secondary || 'var(--secondary)'})`, padding: '20px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <span style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.2)', fontSize: '10px', padding: '4px 8px', borderRadius: '10px', textTransform: 'capitalize' }}>
                    {p.templateType}
                  </span>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{p.title}</h3>
                </div>

                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Creator: <strong>{p.user?.name}</strong></p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: 'auto' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <Heart size={14} style={{ color: 'var(--danger)', fill: p.likes?.length > 0 ? 'var(--danger)' : 'none' }} />
                      {p.likes?.length || 0} Likes
                    </span>

                    <Link to={`/p/${p.username}`} target="_blank" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '11px' }}>
                      Visit Profile <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </main>

    </div>
  );
}
