import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api.js';
import { 
  Sparkles, Globe, FileText, Receipt, ShieldAlert, Settings, 
  Plus, Trash2, Download, Save, PlusCircle, Check, DollarSign
} from 'lucide-react';

export default function InvoiceTool() {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Active form state for invoice compilation
  const [activeInvoice, setActiveInvoice] = useState({
    clientName: '', clientEmail: '', clientAddress: '',
    items: [{ description: '', quantity: 1, rate: 0 }],
    taxRate: 0, discount: 0, notes: '', dueDate: ''
  });

  const loadInvoices = async () => {
    try {
      const res = await api.invoices.getAll();
      if (res.success) {
        setInvoices(res.invoices);
      }
    } catch (err) {
      setError('Could not retrieve client invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Pro Tier check
    if (user?.plan === 'free') {
      setError('Freelancer invoicing is a Premium Pro feature. Upgrade to create client invoices.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.invoices.create(activeInvoice);
      if (res.success) {
        setSuccess(`Invoice ${res.invoice.invoiceNumber} created successfully!`);
        // reset form
        setActiveInvoice({
          clientName: '', clientEmail: '', clientAddress: '',
          items: [{ description: '', quantity: 1, rate: 0 }],
          taxRate: 0, discount: 0, notes: '', dueDate: ''
        });
        loadInvoices();
      }
    } catch (err) {
      setError(err.message || 'Invoice compilation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invoice permanently?')) return;
    try {
      await api.invoices.delete(id);
      setInvoices(prev => prev.filter(inv => inv._id !== id));
      setSuccess('Invoice deleted successfully.');
    } catch (err) {
      setError('Failed to delete invoice.');
    }
  };

  // Real-time calculations
  const calculateTotals = () => {
    const subtotal = activeInvoice.items.reduce((acc, item) => acc + item.quantity * item.rate, 0);
    const discountAmount = subtotal * (activeInvoice.discount / 100);
    const taxAmount = (subtotal - discountAmount) * (activeInvoice.taxRate / 100);
    const total = subtotal - discountAmount + taxAmount;
    return { subtotal, discountAmount, taxAmount, total };
  };

  const { subtotal, discountAmount, taxAmount, total } = calculateTotals();

  // Items fields handlers
  const updateItem = (idx, field, value) => {
    const newItems = [...activeInvoice.items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setActiveInvoice({ ...activeInvoice, items: newItems });
  };

  const addItemRow = () => {
    setActiveInvoice({
      ...activeInvoice,
      items: [...activeInvoice.items, { description: '', quantity: 1, rate: 0 }]
    });
  };

  const removeItemRow = (idx) => {
    setActiveInvoice({
      ...activeInvoice,
      items: activeInvoice.items.filter((_, i) => i !== idx)
    });
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
          <Link to="/dashboard" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
            <Globe size={18} /> Portfolios
          </Link>
          <Link to="/resume" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
            <FileText size={18} /> Resume Builder
          </Link>
          <Link to="/invoices" className="btn btn-ghost" style={{ justifyContent: 'flex-start', background: 'rgba(37, 99, 235, 0.08)', color: 'var(--primary)', fontWeight: 600 }}>
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
              <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Invoicing Manager</h1>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Generate and track professional freelancer invoices.</p>
            </div>
            
            <button 
              onClick={toggleTheme} 
              style={{ padding: '8px 12px', borderRadius: '50%', background: 'rgba(120, 120, 120, 0.1)', color: 'var(--text-main)' }}
            >
              {darkMode ? '🌙' : '☀️'}
            </button>
          </div>
        </header>

        {/* Contents splitted */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* Left Panel: Invoice Creator */}
          <div style={{ width: '55%', padding: '32px', overflowY: 'auto', borderRight: '1px solid var(--border-color)' }}>
            
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

            {user?.plan === 'free' && (
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', border: '1px dashed var(--warning)', background: 'rgba(245, 158, 11, 0.05)', marginBottom: '24px' }}>
                <h4 style={{ color: '#d97706', fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>Upgrade to Premium Plan</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>Free tier accounts cannot issue client sheets. Subscribe or use settings simulate page to unlock full billing functions.</p>
                <Link to="/settings" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }}>Go to Settings</Link>
              </div>
            )}

            <form onSubmit={handleCreateInvoice}>
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Client Billing Details</h3>
                
                <div className="form-group">
                  <label>Client Name</label>
                  <input type="text" required className="form-control" placeholder="e.g. Acme Corp" value={activeInvoice.clientName} onChange={(e) => setActiveInvoice({ ...activeInvoice, clientName: e.target.value })} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Client Email</label>
                    <input type="email" required className="form-control" placeholder="client@acme.com" value={activeInvoice.clientEmail} onChange={(e) => setActiveInvoice({ ...activeInvoice, clientEmail: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Due Date</label>
                    <input type="date" required className="form-control" value={activeInvoice.dueDate} onChange={(e) => setActiveInvoice({ ...activeInvoice, dueDate: e.target.value })} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Client Office Address</label>
                  <input type="text" className="form-control" placeholder="123 Tech Blvd, CA" value={activeInvoice.clientAddress} onChange={(e) => setActiveInvoice({ ...activeInvoice, clientAddress: e.target.value })} />
                </div>

                {/* Items Row list */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>Services & Items</label>
                    <button type="button" onClick={addItemRow} style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: 600 }}>+ Add Line</button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {activeInvoice.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input type="text" required className="form-control" placeholder="Service description" value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} style={{ flex: 2 }} />
                        <input type="number" required min="1" className="form-control" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value))} style={{ flex: 0.5, textAlign: 'center' }} />
                        <input type="number" required min="0" className="form-control" placeholder="Rate" value={item.rate} onChange={(e) => updateItem(idx, 'rate', parseFloat(e.target.value))} style={{ flex: 0.8, textAlign: 'right' }} />
                        
                        {activeInvoice.items.length > 1 && (
                          <button type="button" onClick={() => removeItemRow(idx)} style={{ color: 'var(--danger)' }}><Trash2 size={16} /></button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tax Rate & Discounts */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Tax Rate (%)</label>
                    <input type="number" min="0" max="100" className="form-control" value={activeInvoice.taxRate} onChange={(e) => setActiveInvoice({ ...activeInvoice, taxRate: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Discount Rate (%)</label>
                    <input type="number" min="0" max="100" className="form-control" value={activeInvoice.discount} onChange={(e) => setActiveInvoice({ ...activeInvoice, discount: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Notes / Terms</label>
                  <input type="text" className="form-control" placeholder="Thank you for your business." value={activeInvoice.notes} onChange={(e) => setActiveInvoice({ ...activeInvoice, notes: e.target.value })} />
                </div>

                {/* Subtotal Display block */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end', fontSize: '13px' }}>
                  <p>Subtotal: <strong>${subtotal.toFixed(2)}</strong></p>
                  {discountAmount > 0 && <p style={{ color: 'var(--success)' }}>Discount ({activeInvoice.discount}%): <strong>-${discountAmount.toFixed(2)}</strong></p>}
                  {taxAmount > 0 && <p>Tax ({activeInvoice.taxRate}%): <strong>+${taxAmount.toFixed(2)}</strong></p>}
                  <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}>Total: ${total.toFixed(2)}</p>
                </div>

                <button type="submit" disabled={submitting || user?.plan === 'free'} className="btn btn-primary" style={{ width: '100%', padding: '12px', fontWeight: 600 }}>
                  {submitting ? 'Generating...' : 'Save & Generate Invoice'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Panel: Invoice list history */}
          <div style={{ width: '45%', padding: '32px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Invoices History</h3>

            {loading ? (
              <div>Loading sheets...</div>
            ) : invoices.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>No client invoices issued.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {invoices.map((inv) => (
                  <div key={inv._id} className="glass-panel" style={{ padding: '20px', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 700 }}>{inv.invoiceNumber}</h4>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>To: {inv.clientName}</span>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>${inv.totalAmount.toFixed(2)}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '10px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Due: {new Date(inv.dueDate).toLocaleDateString()}</span>
                      
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <a href={api.invoices.getPdfUrl(inv._id)} download className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '11px', gap: '4px' }}>
                          <Download size={12} /> PDF
                        </a>
                        <button onClick={() => handleDelete(inv._id)} style={{ color: 'var(--danger)', padding: '6px 8px', border: '1px solid var(--border-color)', borderRadius: '4px' }}><Trash2 size={12} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
