import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers, Palette, Globe, Award, Sparkles, Check, Play, BookOpen, Quote } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Landing() {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const pricingPlans = [
    {
      name: 'Free Starter',
      price: '$0',
      period: 'forever',
      features: ['1 Published Portfolio', 'Access to Standard Templates', 'Standard Portfolio Builder', 'Basic Analytics logs', 'Contact form integrations'],
      btnText: 'Get Started Free',
      popular: false,
    },
    {
      name: 'Pro Member',
      price: '$15',
      period: 'monthly',
      features: ['Unlimited Portfolios', 'Unlock All Premium Templates', 'Stripe Client Invoicing', 'Full Analytics Dashboard', 'Custom Domain Mapping', 'AI Copywriter (Bio & Headline)', 'Priority Tech Support'],
      btnText: 'Start Pro Trial',
      popular: true,
    },
    {
      name: 'Lifetime Growth',
      price: '$299',
      period: 'once',
      features: ['Everything in Pro plan', 'Lifetime ownership', 'Zero recurring fees', '10 free resume PDF exports', 'Exclusive Beta Templates access', 'Premium custom themes builder'],
      btnText: 'Claim Lifetime Access',
      popular: false,
    }
  ];

  const showcaseTemplates = [
    { name: 'Developer Grid', category: 'Software Engineers', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80', badge: 'Popular' },
    { name: 'Visual Photographer', category: 'Creators & Artists', image: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?auto=format&fit=crop&w=400&q=80', badge: 'Creative' },
    { name: 'Minimal Writer', category: 'Freelancers', image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=400&q=80', badge: 'Clean' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky Navigation */}
      <header className="sticky-navbar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '20px', color: 'var(--primary)' }}>
            <Sparkles size={24} />
            <span>Portfolio Builder</span>
          </Link>
          
          <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <a href="#features" style={{ fontWeight: 500, fontSize: '15px', color: 'var(--text-muted)' }}>Features</a>
            <a href="#templates" style={{ fontWeight: 500, fontSize: '15px', color: 'var(--text-muted)' }}>Templates</a>
            <a href="#pricing" style={{ fontWeight: 500, fontSize: '15px', color: 'var(--text-muted)' }}>Pricing</a>
            <Link to="/gallery" style={{ fontWeight: 500, fontSize: '15px', color: 'var(--text-muted)' }}>Gallery</Link>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={toggleTheme} 
              style={{ padding: '8px 12px', borderRadius: '50%', background: 'rgba(120, 120, 120, 0.1)', color: 'var(--text-main)', fontSize: '14px' }}
            >
              {darkMode ? '🌙' : '☀️'}
            </button>

            {user ? (
              <Link to="/dashboard" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '14px' }}>
                Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/login" style={{ fontWeight: 500, color: 'var(--text-main)' }}>Sign In</Link>
                <Link to="/signup" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '14px' }}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '90px 0 60px', background: 'radial-gradient(circle at 80% 20%, rgba(37, 99, 235, 0.08) 0%, transparent 40%)' }}>
        <div className="container grid-cols-2" style={{ alignItems: 'center' }}>
          <div className="fade-in">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', padding: '6px 14px', borderRadius: '30px', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
              <Sparkles size={14} /> AI-Powered Builder Launching Today
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1.15, marginBottom: '20px' }}>
              Create a Stunning Portfolio <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Without Code</span>.
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '17px', lineHeight: 1.7, marginBottom: '32px' }}>
              The premium SaaS platform designed for designers, developers, photographers, and writers to build responsive, SEO-optimized portfolios, generate resumes, and invoice clients—all in one place.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link to={user ? "/dashboard" : "/signup"} className="btn btn-primary" style={{ padding: '14px 28px' }}>
                Build Your Portfolio <ArrowRight size={18} />
              </Link>
              <a href="#templates" className="btn btn-secondary" style={{ padding: '14px 28px' }}>
                View Showcase
              </a>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <img 
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=700&q=80" 
              alt="Dashboard mock" 
              style={{ width: '100%', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-premium)', border: '1px solid var(--border-color)' }}
            />
            <div className="glass-panel" style={{ position: 'absolute', bottom: '-20px', left: '-20px', padding: '16px 20px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'var(--success)', width: '12px', height: '12px', borderRadius: '50%' }}></div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Live Portfolios Built</p>
                <p style={{ fontSize: '18px', fontWeight: 700 }}>24,900+ Sites</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ padding: '80px 0', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 60px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>Packed With Premium SaaS Features</h2>
            <p style={{ color: 'var(--text-muted)' }}>Everything you need to launch a beautiful profile, land clients, and showcase your achievements.</p>
          </div>

          <div className="grid-cols-3">
            <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ color: 'var(--primary)', marginBottom: '16px' }}><Palette size={32} /></div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>Drag & Drop Builder</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Customize, reorder, duplicate, or hide sections easily. Custom colors, typography, layout configuration with a visual handle.</p>
            </div>
            <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ color: 'var(--primary)', marginBottom: '16px' }}><Globe size={32} /></div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>Custom Subdomains</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Publish instantly with custom subdomains or map your own custom root domain for premium professional branding.</p>
            </div>
            <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ color: 'var(--primary)', marginBottom: '16px' }}><Sparkles size={32} /></div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>AI Copywriter</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Draft professional summaries, headlines, and project copy with our integrated Gemini assistant helper.</p>
            </div>
            <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ color: 'var(--primary)', marginBottom: '16px' }}><BookOpen size={32} /></div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>Resume Exporter</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Instantly compile your profile achievements into standard PDF structures to send to hiring managers.</p>
            </div>
            <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ color: 'var(--primary)', marginBottom: '16px' }}><Layers size={32} /></div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>Client Invoicing</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Draft service invoices with custom tax rates, discount values, and output PDF items directly to your clients.</p>
            </div>
            <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ color: 'var(--primary)', marginBottom: '16px' }}><Award size={32} /></div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>Analytics Metrics</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Track unique visitors, country referrers, device distributions, and timeline views in real-time dashboards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Showcase */}
      <section id="templates" style={{ padding: '80px 0', background: 'var(--bg-card)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 60px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>Stunning Pre-made Templates</h2>
            <p style={{ color: 'var(--text-muted)' }}>Choose from our range of developer, photographer, and designer themes designed to turn heads.</p>
          </div>

          <div className="grid-responsive">
            {showcaseTemplates.map((t, idx) => (
              <div key={idx} className="glass-panel" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', padding: '12px' }}>
                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
                  <img src={t.image} alt={t.name} style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
                  <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'var(--primary)', color: 'white', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '12px' }}>
                    {t.badge}
                  </span>
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 700 }}>{t.name}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>{t.category}</p>
                <Link to={user ? "/dashboard" : "/signup"} className="btn btn-secondary" style={{ width: '100%', padding: '8px 0', fontSize: '13px' }}>
                  Use Template
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 50px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>What Creators Are Saying</h2>
            <p style={{ color: 'var(--text-muted)' }}>Read how professionals use our tools to enhance their branding.</p>
          </div>

          <div className="grid-cols-2">
            <div className="glass-panel" style={{ padding: '36px', borderRadius: 'var(--radius-lg)', position: 'relative' }}>
              <Quote size={40} style={{ opacity: 0.1, position: 'absolute', top: '20px', right: '20px' }} />
              <p style={{ fontSize: '15px', fontStyle: 'italic', marginBottom: '24px', lineHeight: 1.8 }}>
                "As a freelance UI Designer, presenting my work clearly was always a headache. With the Portfolio Builder, I compiled my projects, mapped my custom domain, and sent my first invoice in just 20 minutes."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80" alt="Client avatar" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h5 style={{ fontWeight: 700, fontSize: '14px' }}>Elena Rostova</h5>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Freelance UX Architect</p>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '36px', borderRadius: 'var(--radius-lg)', position: 'relative' }}>
              <Quote size={40} style={{ opacity: 0.1, position: 'absolute', top: '20px', right: '20px' }} />
              <p style={{ fontSize: '15px', fontStyle: 'italic', marginBottom: '24px', lineHeight: 1.8 }}>
                "The developer templates are incredibly clean. Having standard layouts that allow me to customize the code parameters without having to write HTML sections from scratch is a massive productivity booster."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80" alt="Client avatar" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h5 style={{ fontWeight: 700, fontSize: '14px' }}>Marcus Sterling</h5>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Staff Web Dev</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: '80px 0', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 60px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>Transparent, Simple Pricing</h2>
            <p style={{ color: 'var(--text-muted)' }}>Choose the plan that fits your growth. Upgrade or downgrade anytime.</p>
          </div>

          <div className="grid-cols-3">
            {pricingPlans.map((p, idx) => (
              <div 
                key={idx} 
                className="glass-panel" 
                style={{ 
                  padding: '40px 30px', 
                  borderRadius: 'var(--radius-lg)', 
                  position: 'relative',
                  border: p.popular ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  boxShadow: p.popular ? 'var(--shadow-premium)' : 'var(--shadow-md)',
                }}
              >
                {p.popular && (
                  <span style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'white', fontSize: '12px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px' }}>
                    MOST POPULAR
                  </span>
                )}
                <h4 style={{ fontSize: '18px', fontWeight: 700, color: p.popular ? 'var(--primary)' : 'var(--text-main)' }}>{p.name}</h4>
                <div style={{ display: 'flex', alignItems: 'baseline', margin: '20px 0' }}>
                  <span style={{ fontSize: '36px', fontWeight: 800 }}>{p.price}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>/ {p.period}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '24px 0 36px' }}>
                  {p.features.map((f, fIdx) => (
                    <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <Check size={16} style={{ color: 'var(--success)' }} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <Link 
                  to={user ? "/dashboard" : "/signup"} 
                  className={`btn ${p.popular ? 'btn-primary' : 'btn-secondary'}`} 
                  style={{ width: '100%', padding: '12px 0' }}
                >
                  {p.btnText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0b0f19', color: '#94a3b8', padding: '60px 0 40px', borderTop: '1px solid #1e293b' }}>
        <div className="container">
          <div className="grid-responsive" style={{ gap: '40px', marginBottom: '40px' }}>
            <div>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '20px', color: 'white', marginBottom: '16px' }}>
                <Sparkles size={24} style={{ color: 'var(--primary)' }} />
                <span>Portfolio Builder</span>
              </Link>
              <p style={{ fontSize: '13px', lineHeight: 1.7 }}>
                The code-free design ecosystem helping creators deploy high-impact portfolios, generate clean resume sheets, and manage invoicing.
              </p>
            </div>
            <div>
              <h5 style={{ color: 'white', fontWeight: 600, fontSize: '14px', marginBottom: '16px' }}>Resources</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <Link to="/gallery">Public Gallery</Link>
                <a href="#templates">Showcase Themes</a>
                <a href="#pricing">Upgrade Plans</a>
              </div>
            </div>
            <div>
              <h5 style={{ color: 'white', fontWeight: 600, fontSize: '14px', marginBottom: '16px' }}>Support</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <a href="mailto:support@portfolio.com">Technical Support</a>
                <a href="#faq">Builder FAQs</a>
                <a href="/terms">Terms of Service</a>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
            <span>© {new Date().getFullYear()} Portfolio Builder Platform. All Rights Reserved.</span>
            <span>Made with precision by Antigravity</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
