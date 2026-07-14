import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api.js';
import { 
  Sparkles, Lock, ShieldAlert, Heart, MessageSquare, Send, Check, 
  SendIcon, Github, Linkedin, Twitter, PhoneCall
} from 'lucide-react';

export default function PortfolioView() {
  const { username } = useParams();
  
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Password protection state
  const [passwordNeeded, setPasswordNeeded] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [pwError, setPwError] = useState('');

  // Likes & comments state
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');

  const fetchPortfolio = async (pwd = '') => {
    try {
      const res = await api.portfolios.getPublished(username, pwd);
      if (res.success) {
        setPortfolio(res.portfolio);
        setLikesCount(res.portfolio.likes?.length || 0);
        setComments(res.portfolio.comments || []);
        setPasswordNeeded(false);
      }
    } catch (err) {
      if (err.message && err.message.includes('password protected')) {
        setPasswordNeeded(true);
      } else {
        setPwError(err.message || 'Error loading page.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [username]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPwError('');
    setLoading(true);
    fetchPortfolio(passwordInput);
  };

  const handleLike = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in or register an account to like portfolios.');
      return;
    }

    try {
      const res = await api.portfolios.like(portfolio._id);
      if (res.success) {
        setLiked(res.liked);
        setLikesCount(res.likesCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentError('');
    const token = localStorage.getItem('token');
    
    if (!token) {
      return setCommentError('You must log in to submit reviews.');
    }

    setCommentSubmitting(true);
    try {
      const res = await api.portfolios.comment(portfolio._id, newComment);
      if (res.success) {
        setComments(res.comments);
        setNewComment('');
      }
    } catch (err) {
      setCommentError('Comment submit failed.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>Loading website...</div>;
  }

  // Password Prompt screen
  if (passwordNeeded) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', padding: '24px' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '32px', borderRadius: '12px', textAlign: 'center' }}>
          <Lock size={48} style={{ color: 'var(--warning)', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Password Protected</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>This portfolio is set to private. Enter password to view.</p>
          
          {pwError && (
            <div style={{ color: 'var(--danger)', fontSize: '12px', background: 'rgba(239, 68, 68, 0.05)', padding: '8px', borderRadius: '4px', marginBottom: '12px' }}>
              {pwError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <input 
                type="password" 
                required 
                className="form-control" 
                placeholder="Enter password..." 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                style={{ textAlign: 'center' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px 0', marginTop: '12px' }}>
              Unlock Page
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', padding: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <ShieldAlert size={48} style={{ color: 'var(--danger)', margin: '0 auto 16px' }} />
          <h2>Portfolio Offline</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '8px 0 24px' }}>The requested website does not exist or is set to draft.</p>
          <Link to="/" className="btn btn-primary">Go to Landing Page</Link>
        </div>
      </div>
    );
  }

  // Visual custom styles
  const pageStyle = {
    background: portfolio.colors?.background || '#ffffff',
    color: portfolio.colors?.text || '#1f2937',
    fontFamily: portfolio.font || 'Poppins',
    minHeight: '100vh'
  };

  return (
    <div style={pageStyle}>
      
      {/* Tiny top navbar overlay for liking/commenting panel options */}
      <div className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 100, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
          <span style={{ fontSize: '13px', fontWeight: 700 }}>Published via Portfolio Builder</span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: liked ? 'var(--danger)' : 'inherit' }}>
              <Heart size={16} style={{ fill: liked ? 'var(--danger)' : 'none' }} /> {likesCount} Likes
            </button>
            <a href="#comments" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}>
              <MessageSquare size={16} /> Comments ({comments.length})
            </a>
          </div>
        </div>
      </div>

      {/* RENDER PORTFOLIO CUSTOM SECTIONS */}
      <div className="container" style={{ padding: '60px 24px', maxWidth: '800px' }}>
        
        {portfolio.sections.filter(s => s.visible).map((sec) => (
          <section key={sec.id} style={{ padding: '40px 0', borderBottom: '1px solid rgba(120, 120, 120, 0.1)' }}>
            
            {sec.type === 'Hero' && (
              <div>
                <h1 style={{ fontSize: '40px', fontWeight: 800, color: portfolio.colors?.primary }}>
                  {sec.content?.headline}
                </h1>
                <h3 style={{ fontSize: '20px', fontWeight: 500, color: portfolio.colors?.secondary, margin: '10px 0 20px' }}>
                  {sec.content?.subheadline}
                </h3>
                <p style={{ fontSize: '15px', lineHeight: 1.7, opacity: 0.85 }}>
                  {sec.content?.description}
                </p>
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                  <a href="#contact-1" className="btn btn-primary" style={{ background: portfolio.colors?.primary }}>
                    Get in Touch
                  </a>
                </div>
              </div>
            )}

            {sec.type === 'About Me' && (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: portfolio.colors?.primary, marginBottom: '16px' }}>
                  {sec.content?.title || 'About Me'}
                </h2>
                <p style={{ fontSize: '14px', lineHeight: 1.8, opacity: 0.9 }}>
                  {sec.content?.description}
                </p>
              </div>
            )}

            {sec.type === 'Skills' && (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: portfolio.colors?.primary, marginBottom: '16px' }}>
                  Skills & Expertise
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(sec.content?.skillsList || []).map((sk, skIdx) => (
                    <span 
                      key={skIdx} 
                      style={{ padding: '6px 16px', background: 'rgba(120,120,120,0.06)', borderRadius: '30px', fontSize: '12px', fontWeight: 500 }}
                    >
                      {sk.name} ({sk.level}%)
                    </span>
                  ))}
                </div>
              </div>
            )}

            {sec.type === 'Projects' && (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: portfolio.colors?.primary, marginBottom: '24px' }}>
                  Featured Works
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {(sec.content?.projectsList || []).map((proj, pIdx) => (
                    <div key={pIdx} style={{ padding: '24px', background: 'rgba(120, 120, 120, 0.03)', borderRadius: '10px', border: '1px solid rgba(120, 120, 120, 0.1)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 700, color: portfolio.colors?.secondary }}>{proj.title}</h4>
                      <p style={{ fontSize: '12px', margin: '8px 0 16px', opacity: 0.85 }}>{proj.description}</p>
                      
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        {(proj.tech || []).map((t, tIdx) => (
                          <span key={tIdx} style={{ fontSize: '10px', color: portfolio.colors?.primary, fontWeight: 600 }}>#{t}</span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: '12px' }}>
                        {proj.liveLink && <a href={proj.liveLink} target="_blank" rel="noreferrer" style={{ fontSize: '11px', fontWeight: 600, color: portfolio.colors?.primary }}>Live Demo</a>}
                        {proj.githubLink && <a href={proj.githubLink} target="_blank" rel="noreferrer" style={{ fontSize: '11px', fontWeight: 600, color: 'inherit', opacity: 0.8 }}>Code Repository</a>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sec.type === 'Gallery' && (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: portfolio.colors?.primary, marginBottom: '20px' }}>
                  Portfolio Images
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {(sec.content?.images || []).map((img, imgIdx) => (
                    <div key={imgIdx} style={{ overflow: 'hidden', borderRadius: '6px' }}>
                      <img src={img.url} alt={img.caption} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sec.type === 'Contact' && (
              <div id="contact-1">
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: portfolio.colors?.primary, marginBottom: '16px' }}>
                  Get In Touch
                </h2>
                
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {sec.content?.email && (
                    <a href={`mailto:${sec.content.email}`} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '12px', color: portfolio.colors?.primary, borderColor: portfolio.colors?.primary }}>
                      Email Me
                    </a>
                  )}

                  {sec.content?.whatsapp && (
                    <a 
                      href={`https://wa.me/${sec.content.whatsapp}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn btn-primary" 
                      style={{ padding: '8px 16px', fontSize: '12px', background: '#25d366', border: 'none', color: 'white' }}
                    >
                      <PhoneCall size={14} /> WhatsApp
                    </a>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)' }}>
                  {sec.content?.socials?.github && <a href={sec.content.socials.github} target="_blank" rel="noreferrer"><Github size={20} /></a>}
                  {sec.content?.socials?.linkedin && <a href={sec.content.socials.linkedin} target="_blank" rel="noreferrer"><Linkedin size={20} /></a>}
                  {sec.content?.socials?.twitter && <a href={sec.content.socials.twitter} target="_blank" rel="noreferrer"><Twitter size={20} /></a>}
                </div>
              </div>
            )}

            {sec.type === 'Footer' && (
              <div style={{ textAlign: 'center', paddingTop: '20px', fontSize: '12px', opacity: 0.7 }}>
                {sec.content?.copyrightText || '© Copyright All Rights Reserved.'}
              </div>
            )}

          </section>
        ))}

        {/* COMMENTS FEEDBACK THREAD */}
        <section id="comments" style={{ padding: '40px 0' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Visitor Comments & Feedback</h3>
          
          <form onSubmit={handleCommentSubmit} style={{ marginBottom: '28px' }}>
            {commentError && <p style={{ color: 'var(--danger)', fontSize: '12px', marginBottom: '8px' }}>{commentError}</p>}
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                required 
                placeholder="Leave feedback on this portfolio..."
                className="form-control"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" disabled={commentSubmitting} className="btn btn-primary" style={{ padding: '12px 20px', background: portfolio.colors?.primary }}>
                <Send size={14} /> Submit
              </button>
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>Requires active login to comment.</span>
          </form>

          {comments.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No comments yet. Be the first to share your thoughts!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {comments.map((c, cIdx) => (
                <div key={cIdx} style={{ padding: '14px', background: 'rgba(120, 120, 120, 0.03)', border: '1px solid rgba(120, 120, 120, 0.08)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    <span>{c.userName}</span>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p style={{ fontSize: '13px', lineHeight: 1.5 }}>{c.text}</p>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

    </div>
  );
}
