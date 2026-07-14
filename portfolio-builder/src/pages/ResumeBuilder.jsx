import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api.js';
import { 
  Sparkles, Globe, FileText, Receipt, ShieldAlert, ArrowLeft, Settings, 
  Plus, Trash2, Download, Save, Wand2, PlusCircle, Check
} from 'lucide-react';

export default function ResumeBuilder() {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // AI states
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await api.resumes.get();
        if (res.success) {
          setResume(res.resume);
        }
      } catch (err) {
        setError('Failed to retrieve resume details.');
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, []);

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const res = await api.resumes.update(resume);
      if (res.success) {
        setSuccess('Resume configuration saved successfully.');
        setResume(res.resume);
      }
    } catch (err) {
      setError('Failed to save resume details.');
    } finally {
      setSaving(false);
    }
  };

  const handleAiSummary = async () => {
    if (!resume?.personalDetails?.fullName) return;
    setError('');
    setAiGenerating(true);
    try {
      const res = await api.ai.resumeSummary({
        role: resume.title || 'Developer',
        yearsExp: '3',
        accomplishments: resume.skills.slice(0, 3).join(', '),
      });
      if (res.success) {
        setResume(prev => ({
          ...prev,
          personalDetails: { ...prev.personalDetails, summary: res.text }
        }));
        setSuccess('Summary statement drafted by AI.');
      }
    } catch (err) {
      setError('AI summary writer failed.');
    } finally {
      setAiGenerating(false);
    }
  };

  // List fields array managers
  const updatePersonalDetails = (field, value) => {
    setResume(prev => ({
      ...prev,
      personalDetails: { ...prev.personalDetails, [field]: value }
    }));
  };

  const addJob = () => {
    setResume(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, { company: '', position: '', startDate: '', endDate: '', current: false, description: '' }]
    }));
  };

  const updateJob = (idx, field, value) => {
    setResume(prev => {
      const jobs = [...prev.workExperience];
      jobs[idx] = { ...jobs[idx], [field]: value };
      return { ...prev, workExperience: jobs };
    });
  };

  const deleteJob = (idx) => {
    setResume(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== idx)
    }));
  };

  const addEdu = () => {
    setResume(prev => ({
      ...prev,
      education: [...prev.education, { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', description: '' }]
    }));
  };

  const updateEdu = (idx, field, value) => {
    setResume(prev => {
      const edus = [...prev.education];
      edus[idx] = { ...edus[idx], [field]: value };
      return { ...prev, education: edus };
    });
  };

  const deleteEdu = (idx) => {
    setResume(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== idx)
    }));
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>Loading resume builder panel...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-main)' }}>
      
      {/* Sidebar Panel */}
      <aside style={{ width: '260px', borderRight: '1px solid var(--border-color)', background: 'var(--bg-card)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '18px', color: 'var(--primary)', marginBottom: '40px' }}>
          <Sparkles size={22} />
          <span>Builder Suite</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <Link to="/dashboard" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
            <Globe size={18} /> Portfolios
          </Link>
          <Link to="/resume" className="btn btn-ghost" style={{ justifyContent: 'flex-start', background: 'rgba(37, 99, 235, 0.08)', color: 'var(--primary)', fontWeight: 600 }}>
            <FileText size={18} /> Resume Builder
          </Link>
          <Link to="/invoices" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
            <Receipt size={18} /> Invoicing Tool
          </Link>
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <Link to="/settings" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
            <Settings size={18} /> Settings
          </Link>
        </div>
      </aside>

      {/* Main Workspace split */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header Bar */}
        <header className="sticky-navbar" style={{ position: 'static' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Resume Builder</h1>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Build print-ready resumes dynamically.</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button 
                onClick={toggleTheme} 
                style={{ padding: '8px 12px', borderRadius: '50%', background: 'rgba(120, 120, 120, 0.1)', color: 'var(--text-main)' }}
              >
                {darkMode ? '🌙' : '☀️'}
              </button>

              <button onClick={handleSave} disabled={saving} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                <Save size={14} /> {saving ? 'Saving...' : 'Save Draft'}
              </button>

              <a 
                href={api.resumes.getPdfUrl()} 
                download
                className="btn btn-primary" 
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                <Download size={14} /> Download PDF
              </a>
            </div>
          </div>
        </header>

        {/* Builder Fields Splitted View */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* Left: Input forms */}
          <div style={{ width: '50%', padding: '32px', overflowY: 'auto', borderRight: '1px solid var(--border-color)' }}>
            
            {success && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '12px 16px', borderRadius: '6px', fontSize: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={14} /> <span>{success}</span>
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px 16px', borderRadius: '6px', fontSize: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={14} /> <span>{error}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Core Resume Settings */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Resume General</h3>
                <div className="form-group">
                  <label>Resume Document Title</label>
                  <input type="text" className="form-control" value={resume.title || ''} onChange={(e) => setResume({ ...resume, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Layout Style Template</label>
                  <select className="form-control" value={resume.templateType || 'modern'} onChange={(e) => setResume({ ...resume, templateType: e.target.value })}>
                    <option value="classic">Classic Editorial</option>
                    <option value="modern">Modern Tech Column</option>
                    <option value="minimal">Minimal Single Spacing</option>
                  </select>
                </div>
              </div>

              {/* Personal Details */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Personal Information</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" className="form-control" value={resume.personalDetails?.fullName || ''} onChange={(e) => updatePersonalDetails('fullName', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" className="form-control" value={resume.personalDetails?.email || ''} onChange={(e) => updatePersonalDetails('email', e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="text" className="form-control" value={resume.personalDetails?.phone || ''} onChange={(e) => updatePersonalDetails('phone', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Location (City, Country)</label>
                    <input type="text" className="form-control" value={resume.personalDetails?.location || ''} onChange={(e) => updatePersonalDetails('location', e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label>Professional Summary</label>
                    <button type="button" onClick={handleAiSummary} disabled={aiGenerating} style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}>
                      <Wand2 size={11} /> {aiGenerating ? 'Writing...' : 'Write with AI'}
                    </button>
                  </div>
                  <textarea className="form-control" style={{ height: '100px', resize: 'none' }} value={resume.personalDetails?.summary || ''} onChange={(e) => updatePersonalDetails('summary', e.target.value)} />
                </div>
              </div>

              {/* Work Experience */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Work Experience</h3>
                  <button type="button" onClick={addJob} className="btn btn-ghost" style={{ fontSize: '12px', padding: '4px 10px', color: 'var(--primary)' }}>
                    <PlusCircle size={14} /> Add Job
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {resume.workExperience.map((job, idx) => (
                    <div key={idx} style={{ padding: '14px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', position: 'relative' }}>
                      <button type="button" onClick={() => deleteJob(idx)} style={{ position: 'absolute', top: '10px', right: '10px', color: 'var(--danger)' }}>
                        <Trash2 size={14} />
                      </button>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Company</label>
                          <input type="text" className="form-control" value={job.company} onChange={(e) => updateJob(idx, 'company', e.target.value)} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Position</label>
                          <input type="text" className="form-control" value={job.position} onChange={(e) => updateJob(idx, 'position', e.target.value)} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Start Date</label>
                          <input type="text" className="form-control" placeholder="e.g. Jan 2022" value={job.startDate} onChange={(e) => updateJob(idx, 'startDate', e.target.value)} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>End Date</label>
                          <input type="text" className="form-control" placeholder="e.g. Present" value={job.endDate} onChange={(e) => updateJob(idx, 'endDate', e.target.value)} />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Roles & Accomplishments</label>
                        <textarea className="form-control" style={{ height: '70px', resize: 'none' }} value={job.description} onChange={(e) => updateJob(idx, 'description', e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Education</h3>
                  <button type="button" onClick={addEdu} className="btn btn-ghost" style={{ fontSize: '12px', padding: '4px 10px', color: 'var(--primary)' }}>
                    <PlusCircle size={14} /> Add Edu
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {resume.education.map((edu, idx) => (
                    <div key={idx} style={{ padding: '14px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', position: 'relative' }}>
                      <button type="button" onClick={() => deleteEdu(idx)} style={{ position: 'absolute', top: '10px', right: '10px', color: 'var(--danger)' }}>
                        <Trash2 size={14} />
                      </button>

                      <div className="form-group">
                        <label>Institution</label>
                        <input type="text" className="form-control" value={edu.institution} onChange={(e) => updateEdu(idx, 'institution', e.target.value)} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Degree</label>
                          <input type="text" className="form-control" placeholder="e.g. BS" value={edu.degree} onChange={(e) => updateEdu(idx, 'degree', e.target.value)} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Field of Study</label>
                          <input type="text" className="form-control" placeholder="e.g. Computer Science" value={edu.fieldOfStudy} onChange={(e) => updateEdu(idx, 'fieldOfStudy', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Right: Modern CV Preview pane */}
          <div style={{ width: '50%', padding: '32px', background: 'rgba(120, 120, 120, 0.02)', overflowY: 'auto' }}>
            <div style={{ width: '100%', minHeight: '100%', background: 'white', color: '#111827', boxShadow: 'var(--shadow-premium)', padding: '40px', borderRadius: '4px', fontFamily: 'serif' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e3a8a' }}>{resume.personalDetails?.fullName || 'Your Name'}</h2>
                <p style={{ fontSize: '11px', color: '#4b5563', marginTop: '6px' }}>
                  {resume.personalDetails?.email} | {resume.personalDetails?.phone} | {resume.personalDetails?.location}
                </p>
              </div>

              {resume.personalDetails?.summary && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '11px', fontWeight: 700, borderBottom: '1px solid #d1d5db', paddingBottom: '3px', color: '#1e3a8a', letterSpacing: '1px' }}>SUMMARY</h4>
                  <p style={{ fontSize: '11px', lineHeight: 1.6, marginTop: '6px', color: '#374151', textAlign: 'justify' }}>{resume.personalDetails.summary}</p>
                </div>
              )}

              {resume.workExperience.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '11px', fontWeight: 700, borderBottom: '1px solid #d1d5db', paddingBottom: '3px', color: '#1e3a8a', letterSpacing: '1px' }}>EXPERIENCE</h4>
                  {resume.workExperience.map((job, idx) => (
                    <div key={idx} style={{ marginTop: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                        <span>{job.position || 'Position'} - {job.company || 'Company'}</span>
                        <span style={{ color: '#6b7280' }}>{job.startDate} - {job.endDate}</span>
                      </div>
                      <p style={{ fontSize: '10.5px', lineHeight: 1.5, marginTop: '4px', color: '#374151' }}>{job.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {resume.education.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '11px', fontWeight: 700, borderBottom: '1px solid #d1d5db', paddingBottom: '3px', color: '#1e3a8a', letterSpacing: '1px' }}>EDUCATION</h4>
                  {resume.education.map((edu, idx) => (
                    <div key={idx} style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <div>
                        <strong style={{ display: 'block' }}>{edu.degree} in {edu.fieldOfStudy}</strong>
                        <span style={{ color: '#4b5563' }}>{edu.institution}</span>
                      </div>
                      <span style={{ color: '#6b7280' }}>{edu.startDate} - {edu.endDate}</span>
                    </div>
                  ))}
                </div>
              )}

              {resume.skills.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '11px', fontWeight: 700, borderBottom: '1px solid #d1d5db', paddingBottom: '3px', color: '#1e3a8a', letterSpacing: '1px' }}>SKILLS</h4>
                  <p style={{ fontSize: '11px', marginTop: '6px', color: '#374151' }}>{resume.skills.join(', ')}</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
