import React, { useState } from 'react';
import { 
  Send, 
  Mail, 
  Phone, 
  User, 
  FileText, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  MapPin, 
  ShieldCheck,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { submitContactInquiry } from '../api/contactService';

export function ContactPage({ isConfigured = true }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please provide your email address.');
      return;
    }
    if (!formData.message.trim()) {
      setError('Please enter your message.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await submitContactInquiry({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      });

      setSuccess(result);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      console.error('[ContactPage] Submission failed:', err);
      setError(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccess(null);
    setError(null);
  };

  return (
    <div className="contact-page-wrapper" id="page-contact">
      {/* Hero Section */}
      <section className="catalog-hero" style={{ padding: '3.5rem 1rem 2.5rem' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto' }}>
          <span className="section-eyebrow" style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
            Direct Studio Channel
          </span>

          <h1 className="hero-title" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginBottom: '1rem' }}>
            Initiate a <span className="gradient-text">Project Inquiry</span>
          </h1>

          <p className="hero-subtitle" style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Have an upcoming digital product launch, headless migration, or design system initiative? 
            Connect with our directors to discuss scope, timeline, and strategic alignment.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto 5rem', padding: '0 1.5rem' }}>
        <div className="contact-layout-grid">
          {/* Left: Studio Information Cards */}
          <div className="contact-info-column">
            <div className="contact-card glass-panel">
              <h3 className="contact-card-title">Studio Presence</h3>
              <p className="contact-card-desc">
                We partner with select venture-backed startups and growth enterprises worldwide.
              </p>

              <div className="contact-info-list">
                <div className="contact-info-item">
                  <div className="info-icon-wrapper">
                    <Mail size={18} />
                  </div>
                  <div className="info-text">
                    <span className="info-label">Direct Communication</span>
                    <a href="mailto:advisory@aurastudio.design" className="info-value">
                      advisory@aurastudio.design
                    </a>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="info-icon-wrapper">
                    <Phone size={18} />
                  </div>
                  <div className="info-text">
                    <span className="info-label">Studio Line</span>
                    <span className="info-value">+1 (415) 890-2871</span>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="info-icon-wrapper">
                    <Clock size={18} />
                  </div>
                  <div className="info-text">
                    <span className="info-label">Availability &amp; Hours</span>
                    <span className="info-value">Mon – Fri, 9:00 AM – 6:00 PM EST</span>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="info-icon-wrapper">
                    <MapPin size={18} />
                  </div>
                  <div className="info-text">
                    <span className="info-label">Hubs</span>
                    <span className="info-value">San Francisco &bull; London &bull; Remote</span>
                  </div>
                </div>
              </div>

              {/* Verified Badge */}
              <div className="contact-verified-badge">
                <ShieldCheck size={16} />
                <span>Confidential NDA &bull; Direct Partner Review</span>
              </div>
            </div>

            {/* Response Time Card */}
            <div className="contact-notice-card glass-panel" style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="status-dot live-status" />
                <strong style={{ fontSize: '0.9rem' }}>Response Commitment</strong>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.5 }}>
                All qualified project inquiries receive a tailored response from our technical directors within 24 business hours.
              </p>
            </div>
          </div>

          {/* Right: Interactive Contact Form */}
          <div className="contact-form-column">
            <div className="glass-panel contact-form-card">
              {success ? (
                /* Success State */
                <div className="contact-success-state" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
                  <div className="state-icon-wrapper" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', margin: '0 auto 1.5rem', width: '64px', height: '64px' }}>
                    <CheckCircle2 size={36} />
                  </div>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    Inquiry Received
                  </h3>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
                    Thank you for reaching out. Your project inquiry has been logged securely and forwarded to our leadership team.
                  </p>

                  <div className="booking-summary-card" style={{ maxWidth: '420px', margin: '0 auto 1.75rem', textAlign: 'left' }}>
                    <div className="summary-item">
                      <span className="summary-label">Reference ID</span>
                      <code className="summary-code">{success.submissionId}</code>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Status</span>
                      <span className="badge badge-connected" style={{ padding: '2px 8px' }}>
                        Confirmed &bull; Logged
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Routing</span>
                      <strong className="summary-value">Executive Advisory Desk</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleReset}
                    id="btn-send-another"
                  >
                    <RefreshCw size={14} />
                    <span>Send Another Inquiry</span>
                  </button>
                </div>
              ) : (
                /* Form State */
                <div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                      Send an Inquiry
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      Provide brief details regarding your team, current architecture, and timeline.
                    </p>
                  </div>

                  {error && (
                    <div className="checkout-notice error" style={{ marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="contact-form-inputs">
                    {/* Name & Email Row */}
                    <div className="form-grid-2">
                      <div className="config-input-group">
                        <label htmlFor="contact-name">
                          <User size={13} style={{ display: 'inline', marginRight: '5px' }} />
                          Full Name <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          id="contact-name"
                          name="name"
                          type="text"
                          className="config-input"
                          placeholder="e.g. Eleanor Vance"
                          required
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="config-input-group">
                        <label htmlFor="contact-email">
                          <Mail size={13} style={{ display: 'inline', marginRight: '5px' }} />
                          Email Address <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          className="config-input"
                          placeholder="eleanor@acme.com"
                          required
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* Phone & Subject Row */}
                    <div className="form-grid-2">
                      <div className="config-input-group">
                        <label htmlFor="contact-phone">
                          <Phone size={13} style={{ display: 'inline', marginRight: '5px' }} />
                          Phone Number <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(optional)</span>
                        </label>
                        <input
                          id="contact-phone"
                          name="phone"
                          type="tel"
                          className="config-input"
                          placeholder="+1 (415) 000-0000"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="config-input-group">
                        <label htmlFor="contact-subject">
                          <FileText size={13} style={{ display: 'inline', marginRight: '5px' }} />
                          Engagement Focus <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(optional)</span>
                        </label>
                        <input
                          id="contact-subject"
                          name="subject"
                          type="text"
                          className="config-input"
                          placeholder="e.g. Headless Commerce Architecture"
                          value={formData.subject}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div className="config-input-group">
                      <label htmlFor="contact-message">
                        <MessageSquare size={13} style={{ display: 'inline', marginRight: '5px' }} />
                        Project Brief &amp; Goals <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        rows={5}
                        className="config-input contact-textarea"
                        placeholder="Tell us about your team, tech stack, key bottlenecks, and target timeline..."
                        required
                        value={formData.message}
                        onChange={handleChange}
                        style={{ resize: 'vertical', minHeight: '120px' }}
                      />
                    </div>

                    {/* Submit Button */}
                    <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="submit"
                        className={`btn btn-primary ${loading ? 'loading' : ''}`}
                        disabled={loading || !isConfigured}
                        id="btn-submit-contact"
                        style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
                      >
                        <Send size={15} />
                        <span>{loading ? 'Transmitting Inquiry...' : 'Submit Project Inquiry'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
