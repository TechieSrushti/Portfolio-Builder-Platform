import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBuilder, BuilderProvider } from '../context/BuilderContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api.js';
import { 
  Sparkles, ArrowLeft, Save, Globe, Eye, Undo, Redo, LayoutGrid, Palette, Type, 
  Plus, Trash2, Copy, EyeOff, GripVertical, ChevronUp, ChevronDown, Check,
  QrCode, AlertCircle, Wand2, RefreshCw, Lock
} from 'lucide-react';

export default function PortfolioBuilder() {
  return (
    <BuilderProvider>
      <BuilderEditorInner />
    </BuilderProvider>
  );
}

function BuilderEditorInner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const {
    portfolio, loadPortfolio, updatePortfolioState, updateSectionContent, 
    updateSectionSettings, addSection, deleteSection, duplicateSection, 
    toggleSectionVisibility, reorderSections, updateColors, updateFont, 
    undo, redo, canUndo, canRedo
  } = useBuilder();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Navigation tabs for editor sidebar
  const [sidebarTab, setSidebarTab] = useState('sections'); // sections, style, settings, history
  
  // Modal states for AI generation
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiType, setAiType] = useState('bio'); // bio, headline, projectDesc, skills
  const [aiPromptData, setAiPromptData] = useState({ name: user?.name || '', role: 'Software Engineer', skills: 'React, Node.js', tone: 'professional', title: '', description: '' });
  const [aiResult, setAiResult] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  // Active section to edit properties
  const [activeSectionId, setActiveSectionId] = useState(null);

  // Load portfolio state
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await api.portfolios.getById(id);
        if (res.success) {
          loadPortfolio(res.portfolio);
        }
      } catch (err) {
        setError('Failed to fetch portfolio data.');
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [id, loadPortfolio]);

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const res = await api.portfolios.update(portfolio._id, portfolio);
      if (res.success) {
        setSuccess('All portfolio changes saved successfully.');
        loadPortfolio(res.portfolio); // reload to get new version index
      }
    } catch (err) {
      setError(err.message || 'Saving failed.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    setPublishing(true);
    try {
      const newState = !portfolio.isPublished;
      const res = await api.portfolios.publish(portfolio._id, newState);
      if (res.success) {
        updatePortfolioState(prev => ({ ...prev, isPublished: newState }));
        setSuccess(newState ? 'Portfolio is now LIVE!' : 'Portfolio set to draft.');
      }
    } catch (err) {
      setError('Publish operation failed.');
    } finally {
      setPublishing(false);
    }
  };

  const handleAiGenerate = async (e) => {
    e.preventDefault();
    setAiGenerating(true);
    setAiResult('');
    
    try {
      let res;
      if (aiType === 'bio') {
        res = await api.ai.bio(aiPromptData);
      } else if (aiType === 'headline') {
        res = await api.ai.headline(aiPromptData);
      } else if (aiType === 'project-desc') {
        res = await api.ai.projectDesc(aiPromptData);
      }
      
      if (res.success) {
        if (aiType === 'headline') {
          // Join headlines options
          setAiResult(res.headlines.join('\n\n'));
        } else {
          setAiResult(res.text);
        }
      }
    } catch (err) {
      setError('AI service failed to generate copy. Try again.');
    } finally {
      setAiGenerating(false);
    }
  };

  const restorePreviousVersion = async (versionNo) => {
    if (!window.confirm(`Are you sure you want to restore to version #${versionNo}?`)) return;
    setLoading(true);
    try {
      const res = await api.portfolios.restoreVersion(portfolio._id, versionNo);
      if (res.success) {
        loadPortfolio(res.portfolio);
        setSuccess(`Restored successfully to version #${versionNo}.`);
      }
    } catch (err) {
      setError('Restore failed.');
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop HTML5 reorder helpers
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    reorderSections(draggedIndex, index);
    setDraggedIndex(null);
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>Loading editor panel...</div>;
  }

  if (!portfolio) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>Portfolio not found.</div>;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      
      {/* Top Editor Bar */}
      <header className="sticky-navbar" style={{ position: 'static' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <ArrowLeft size={16} /> Exit Editor
            </Link>
            <span style={{ height: '18px', width: '1px', background: 'var(--border-color)' }}></span>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700 }}>{portfolio.title}</h2>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {portfolio.isPublished ? '🔴 Live' : '📁 Draft'} (Version #{portfolio.currentVersionNumber})
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            
            {/* Undo/Redo */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(120, 120, 120, 0.05)', padding: '4px', borderRadius: '30px' }}>
              <button onClick={undo} disabled={!canUndo} style={{ padding: '6px 10px', borderRadius: '50%', color: canUndo ? 'var(--text-main)' : 'var(--text-muted)' }} title="Undo">
                <Undo size={14} />
              </button>
              <button onClick={redo} disabled={!canRedo} style={{ padding: '6px 10px', borderRadius: '50%', color: canRedo ? 'var(--text-main)' : 'var(--text-muted)' }} title="Redo">
                <Redo size={14} />
              </button>
            </div>

            <button onClick={handleSave} disabled={saving} className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '13px' }}>
              <Save size={14} /> {saving ? 'Saving...' : 'Save Draft'}
            </button>

            <button 
              onClick={handlePublishToggle} 
              disabled={publishing} 
              className="btn btn-primary" 
              style={{ padding: '8px 18px', fontSize: '13px', background: portfolio.isPublished ? 'var(--danger)' : 'var(--primary)' }}
            >
              <Globe size={14} /> {portfolio.isPublished ? 'Unpublish' : 'Publish Live'}
            </button>

          </div>
        </div>
      </header>

      {/* Main Workspace split */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* LEFT BAR: Section lists, style variables, versions */}
        <aside style={{ width: '380px', background: 'var(--bg-card)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          
          {/* Tabs header */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-main)' }}>
            <button 
              onClick={() => setSidebarTab('sections')}
              style={{ flex: 1, padding: '14px 0', fontSize: '12px', fontWeight: 600, borderBottom: sidebarTab === 'sections' ? '2px solid var(--primary)' : 'none', color: sidebarTab === 'sections' ? 'var(--primary)' : 'var(--text-muted)' }}
            >
              <LayoutGrid size={14} style={{ display: 'block', margin: '0 auto 4px' }} />
              Sections
            </button>
            <button 
              onClick={() => setSidebarTab('style')}
              style={{ flex: 1, padding: '14px 0', fontSize: '12px', fontWeight: 600, borderBottom: sidebarTab === 'style' ? '2px solid var(--primary)' : 'none', color: sidebarTab === 'style' ? 'var(--primary)' : 'var(--text-muted)' }}
            >
              <Palette size={14} style={{ display: 'block', margin: '0 auto 4px' }} />
              Visual Styling
            </button>
            <button 
              onClick={() => setSidebarTab('settings')}
              style={{ flex: 1, padding: '14px 0', fontSize: '12px', fontWeight: 600, borderBottom: sidebarTab === 'settings' ? '2px solid var(--primary)' : 'none', color: sidebarTab === 'settings' ? 'var(--primary)' : 'var(--text-muted)' }}
            >
              <Globe size={14} style={{ display: 'block', margin: '0 auto 4px' }} />
              SEO/Domain
            </button>
            <button 
              onClick={() => setSidebarTab('history')}
              style={{ flex: 1, padding: '14px 0', fontSize: '12px', fontWeight: 600, borderBottom: sidebarTab === 'history' ? '2px solid var(--primary)' : 'none', color: sidebarTab === 'history' ? 'var(--primary)' : 'var(--text-muted)' }}
            >
              <RefreshCw size={14} style={{ display: 'block', margin: '0 auto 4px' }} />
              Versions
            </button>
          </div>

          {/* Tab contents (Scrollable area) */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            
            {success && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '10px 14px', borderRadius: '4px', fontSize: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={14} /> <span>{success}</span>
              </div>
            )}

            {/* SECTIONS TAB */}
            {sidebarTab === 'sections' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Page Sections</h3>
                  <button onClick={() => setShowAiModal(true)} className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '11px', gap: '4px' }}>
                    <Sparkles size={11} /> AI Writer
                  </button>
                </div>

                {/* Drag and Drop instructions */}
                <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '12px' }}>Drag sections to reorder list.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {portfolio.sections.map((sec, idx) => (
                    <div 
                      key={sec.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', 
                        background: activeSectionId === sec.id ? 'rgba(37,99,235,0.05)' : 'var(--bg-main)',
                        border: activeSectionId === sec.id ? '1px solid var(--primary)' : '1px solid var(--border-color)', 
                        borderRadius: '8px', cursor: 'grab', opacity: draggedIndex === idx ? 0.5 : 1
                      }}
                    >
                      <div style={{ color: 'var(--text-muted)' }}><GripVertical size={14} /></div>
                      <div onClick={() => setActiveSectionId(sec.id)} style={{ flex: 1, cursor: 'pointer' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 600 }}>{sec.title}</h4>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{sec.type}</span>
                      </div>
                      
                      {/* Section controls */}
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => toggleSectionVisibility(sec.id)} style={{ color: 'var(--text-muted)' }} title="Toggle visibility">
                          {sec.visible ? <Eye size={12} /> : <EyeOff size={12} style={{ color: 'var(--danger)' }} />}
                        </button>
                        <button onClick={() => duplicateSection(sec.id)} style={{ color: 'var(--text-muted)' }} title="Duplicate">
                          <Copy size={12} />
                        </button>
                        <button onClick={() => deleteSection(sec.id)} style={{ color: 'var(--danger)' }} title="Delete">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>Add Layout Section</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {['About Me', 'Skills', 'Experience', 'Education', 'Projects', 'Services', 'Testimonials', 'Gallery'].map((type) => (
                      <button 
                        key={type} 
                        onClick={() => addSection(type)}
                        style={{ padding: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}
                      >
                        <Plus size={12} /> {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STYLE TAB */}
            {sidebarTab === 'style' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Typography Font</h3>
                  <select 
                    className="form-control" 
                    value={portfolio.font}
                    onChange={(e) => updateFont(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="Poppins">Poppins (Modern Clean)</option>
                    <option value="Inter">Inter (Neo-minimalist)</option>
                    <option value="Roboto">Roboto (Technical Standard)</option>
                    <option value="Outfit">Outfit (Premium Bold)</option>
                  </select>
                </div>

                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Color Palette</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px' }}>Background Color</span>
                      <input 
                        type="color" 
                        value={portfolio.colors?.background || '#ffffff'}
                        onChange={(e) => updateColors({ background: e.target.value })}
                        style={{ width: '40px', height: '24px', border: 'none', cursor: 'pointer' }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px' }}>Primary Accent</span>
                      <input 
                        type="color" 
                        value={portfolio.colors?.primary || '#2563eb'}
                        onChange={(e) => updateColors({ primary: e.target.value })}
                        style={{ width: '40px', height: '24px', border: 'none', cursor: 'pointer' }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px' }}>Secondary Highlight</span>
                      <input 
                        type="color" 
                        value={portfolio.colors?.secondary || '#3b82f6'}
                        onChange={(e) => updateColors({ secondary: e.target.value })}
                        style={{ width: '40px', height: '24px', border: 'none', cursor: 'pointer' }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px' }}>Text Base</span>
                      <input 
                        type="color" 
                        value={portfolio.colors?.text || '#1f2937'}
                        onChange={(e) => updateColors({ text: e.target.value })}
                        style={{ width: '40px', height: '24px', border: 'none', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {sidebarTab === 'settings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Custom Domain Mapping</h3>
                  {user?.plan === 'free' ? (
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', padding: '12px', borderRadius: '6px', fontSize: '11px', display: 'flex', alignItems: 'start', gap: '8px' }}>
                      <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <p>Custom Domain mapping is a premium feature. Please upgrade your dashboard plan to link your own domain name (e.g. www.john.com).</p>
                    </div>
                  ) : (
                    <div>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. www.myname.com"
                        value={portfolio.customDomain || ''}
                        onChange={(e) => updatePortfolioState(prev => ({ ...prev, customDomain: e.target.value.toLowerCase() }))}
                        style={{ width: '100%', marginBottom: '8px' }}
                      />
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Configure your DNS records to point CNAME to mapping.portfolio.com.</span>
                    </div>
                  )}
                </div>

                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Password Protection</h3>
                  <div style={{ position: 'relative' }}>
                    <Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder="Leave blank to unlock page"
                      value={portfolio.password || ''}
                      onChange={(e) => updatePortfolioState(prev => ({ ...prev, password: e.target.value }))}
                      style={{ width: '100%', paddingLeft: '32px' }}
                    />
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>SEO Tags configuration</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Meta Title</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={portfolio.seo?.metaTitle || ''} 
                        onChange={(e) => updateSeo({ metaTitle: e.target.value })} 
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Meta Description</label>
                      <textarea 
                        className="form-control" 
                        style={{ height: '80px', resize: 'none' }}
                        value={portfolio.seo?.metaDescription || ''} 
                        onChange={(e) => updateSeo({ metaDescription: e.target.value })} 
                      />
                    </div>
                  </div>
                </div>

                {portfolio.isPublished && (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>QR Code Share Link</h3>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=http://localhost:5173/p/${portfolio.username}`} 
                      alt="Portfolio QR code" 
                      style={{ margin: '0 auto 10px', display: 'block', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                    />
                    <a href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=http://localhost:5173/p/${portfolio.username}`} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>
                      Download High-res QR
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* VERSION HISTORY TAB */}
            {sidebarTab === 'history' && (
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Version History</h3>
                {!portfolio.versions || portfolio.versions.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No previous versions recorded. Save changes to begin tracking revisions history.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {portfolio.versions.map((ver, idx) => (
                      <div key={idx} style={{ padding: '14px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ fontSize: '12px', fontWeight: 700 }}>Version #{ver.versionNumber}</h4>
                          <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(ver.updatedAt).toLocaleString()}</p>
                        </div>
                        <button onClick={() => restorePreviousVersion(ver.versionNumber)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }}>
                          Restore
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* EDIT PROPERTIES DRAWER FOR THE ACTIVE SECTION */}
          {activeSectionId && (
            <div style={{ borderTop: '2px solid var(--border-color)', background: 'var(--bg-main)', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 700 }}>Edit Content: {portfolio.sections.find(s => s.id === activeSectionId)?.title}</h3>
                <button onClick={() => setActiveSectionId(null)} style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Close</button>
              </div>
              
              {/* Dynamic input fields based on active section */}
              {portfolio.sections.find(s => s.id === activeSectionId)?.type === 'Hero' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Headline</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={portfolio.sections.find(s => s.id === activeSectionId)?.content?.headline || ''}
                      onChange={(e) => updateSectionContent(activeSectionId, { headline: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Subheadline</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={portfolio.sections.find(s => s.id === activeSectionId)?.content?.subheadline || ''}
                      onChange={(e) => updateSectionContent(activeSectionId, { subheadline: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Brief Description</label>
                    <textarea 
                      className="form-control" 
                      value={portfolio.sections.find(s => s.id === activeSectionId)?.content?.description || ''}
                      onChange={(e) => updateSectionContent(activeSectionId, { description: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {portfolio.sections.find(s => s.id === activeSectionId)?.type === 'About Me' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Narrative Title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={portfolio.sections.find(s => s.id === activeSectionId)?.content?.title || ''}
                      onChange={(e) => updateSectionContent(activeSectionId, { title: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Narrative Details</label>
                    <textarea 
                      className="form-control" 
                      value={portfolio.sections.find(s => s.id === activeSectionId)?.content?.description || ''}
                      onChange={(e) => updateSectionContent(activeSectionId, { description: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {portfolio.sections.find(s => s.id === activeSectionId)?.type === 'Skills' && (
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>Manage skills using the text editor in full detail.</p>
                </div>
              )}
            </div>
          )}

        </aside>

        {/* RIGHT AREA: LIVE PREVIEW CANVAS */}
        <section style={{ flex: 1, padding: '40px', overflowY: 'auto', background: 'var(--bg-main)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', background: portfolio.colors?.background || '#ffffff', color: portfolio.colors?.text || '#1f2937', fontFamily: portfolio.font || 'Poppins', borderRadius: '12px', boxShadow: 'var(--shadow-premium)', minHeight: '80vh', padding: '48px', transition: 'all 0.3s ease' }}>
            
            {/* Loop and render mockup elements */}
            {portfolio.sections.filter(s => s.visible).map((sec) => (
              <div 
                key={sec.id}
                onClick={() => setActiveSectionId(sec.id)}
                style={{ 
                  padding: '24px 0', borderBottom: '1px dashed var(--border-color)', cursor: 'pointer',
                  position: 'relative', transition: 'background-color 0.2s'
                }}
                className="preview-section-block"
              >
                
                {/* Visual Label hover indicator */}
                <div style={{ position: 'absolute', top: 0, left: 0, background: 'var(--primary)', color: 'white', fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderBottomRightRadius: '4px', opacity: 0.8 }}>
                  {sec.title} (Edit Click)
                </div>

                {sec.type === 'Hero' && (
                  <div style={{ paddingTop: '20px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: portfolio.colors?.primary || 'var(--primary)' }}>
                      {sec.content?.headline || 'Welcome'}
                    </h1>
                    <h3 style={{ fontSize: '18px', fontWeight: 500, color: portfolio.colors?.secondary || 'var(--secondary)', margin: '8px 0 16px' }}>
                      {sec.content?.subheadline}
                    </h3>
                    <p style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.85 }}>
                      {sec.content?.description}
                    </p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                      <button style={{ padding: '8px 16px', borderRadius: '20px', background: portfolio.colors?.primary || 'var(--primary)', color: 'white', fontWeight: 500, border: 'none' }}>
                        {sec.content?.primaryBtnText || 'Contact'}
                      </button>
                    </div>
                  </div>
                )}

                {sec.type === 'About Me' && (
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: portfolio.colors?.primary || 'var(--primary)', marginBottom: '12px' }}>
                      {sec.content?.title || 'About Me'}
                    </h2>
                    <p style={{ fontSize: '13px', lineHeight: 1.7, opacity: 0.9 }}>
                      {sec.content?.description}
                    </p>
                  </div>
                )}

                {sec.type === 'Skills' && (
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: portfolio.colors?.primary || 'var(--primary)', marginBottom: '12px' }}>
                      My Skills
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {(sec.content?.skillsList || []).map((sk, skIdx) => (
                        <span 
                          key={skIdx}
                          style={{ padding: '4px 12px', background: 'rgba(120, 120, 120, 0.08)', borderRadius: '20px', fontSize: '11px', fontWeight: 500 }}
                        >
                          {sk.name} ({sk.level}%)
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {sec.type === 'Projects' && (
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: portfolio.colors?.primary || 'var(--primary)', marginBottom: '16px' }}>
                      Projects
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      {(sec.content?.projectsList || []).map((proj, pIdx) => (
                        <div key={pIdx} style={{ padding: '16px', background: 'rgba(120, 120, 120, 0.04)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 700, color: portfolio.colors?.secondary || 'var(--secondary)' }}>{proj.title}</h4>
                          <p style={{ fontSize: '11px', margin: '4px 0 10px', opacity: 0.85 }}>{proj.description}</p>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {(proj.tech || []).map((t, tIdx) => (
                              <span key={tIdx} style={{ fontSize: '9px', color: 'var(--primary)', fontWeight: 600 }}>#{t}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {sec.type === 'Gallery' && (
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: portfolio.colors?.primary || 'var(--primary)', marginBottom: '16px' }}>
                      Gallery
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {(sec.content?.images || []).map((img, imgIdx) => (
                        <div key={imgIdx} style={{ overflow: 'hidden', borderRadius: '4px' }}>
                          <img src={img.url} alt={img.caption} style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {sec.type === 'Contact' && (
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: portfolio.colors?.primary || 'var(--primary)', marginBottom: '8px' }}>
                      Get In Touch
                    </h2>
                    <p style={{ fontSize: '12px' }}>Email: {sec.content?.email || 'myemail@mail.com'}</p>
                    {sec.content?.whatsapp && <p style={{ fontSize: '12px' }}>WhatsApp: {sec.content?.whatsapp}</p>}
                  </div>
                )}

                {sec.type === 'Footer' && (
                  <div style={{ textAlign: 'center', paddingTop: '16px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    {sec.content?.copyrightText || '© Copyright All Rights Reserved.'}
                  </div>
                )}

              </div>
            ))}

          </div>
        </section>

      </div>

      {/* AI ASSIST MODAL */}
      {showAiModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: 'var(--primary)' }} /> AI Copywriting Assistant
            </h3>
            
            <form onSubmit={handleAiGenerate}>
              <div className="form-group">
                <label>Assistant Type</label>
                <select 
                  className="form-control" 
                  value={aiType}
                  onChange={(e) => setAiType(e.target.value)}
                >
                  <option value="bio">Professional Bio</option>
                  <option value="headline">Catchy Landing Headlines</option>
                  <option value="project-desc">Impactful Project Summary</option>
                </select>
              </div>

              <div className="form-group">
                <label>Job Title / Role</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={aiPromptData.role}
                  onChange={(e) => setAiPromptData({ ...aiPromptData, role: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Core Skills (comma separated)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={aiPromptData.skills}
                  onChange={(e) => setAiPromptData({ ...aiPromptData, skills: e.target.value })}
                />
              </div>

              {aiType === 'project-desc' && (
                <>
                  <div className="form-group">
                    <label>Project Title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={aiPromptData.title}
                      onChange={(e) => setAiPromptData({ ...aiPromptData, title: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Core Project Feature notes</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. real-time database, chat interface"
                      value={aiPromptData.description}
                      onChange={(e) => setAiPromptData({ ...aiPromptData, description: e.target.value })}
                    />
                  </div>
                </>
              )}

              {aiType !== 'project-desc' && (
                <div className="form-group">
                  <label>Writing Style Tone</label>
                  <select 
                    className="form-control"
                    value={aiPromptData.tone}
                    onChange={(e) => setAiPromptData({ ...aiPromptData, tone: e.target.value })}
                  >
                    <option value="professional">Professional & Technical</option>
                    <option value="creative">Creative & Enthusiastic</option>
                    <option value="startup">Action-Oriented Founder</option>
                  </select>
                </div>
              )}

              {aiResult && (
                <div style={{ marginTop: '16px', background: 'var(--bg-main)', padding: '14px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <h5 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>GENERATED RESULT:</h5>
                  <p style={{ fontSize: '12px', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{aiResult}</p>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginTop: '10px' }}>Copy text above and paste into section edits block.</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                <button type="button" onClick={() => setShowAiModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>
                  Close
                </button>
                <button type="submit" disabled={aiGenerating} className="btn btn-primary" style={{ flex: 1 }}>
                  {aiGenerating ? 'Generating...' : 'Generate Copy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
