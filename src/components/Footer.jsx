import React from 'react';
import { Sparkles, ArrowUpRight, ShieldCheck, Mail, MapPin } from 'lucide-react';

export function Footer({ onNavigate }) {
  const handleNav = (page) => {
    if (onNavigate) {
      onNavigate(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="site-footer">
      <div className="container">
        {/* Main Footer Grid */}
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-col footer-brand-col">
            <div className="brand-link" style={{ marginBottom: '1rem' }}>
              <div className="brand-icon">
                <Sparkles size={18} />
              </div>
              <div className="brand-text">
                <span className="brand-title">Aura Studio</span>
                <span className="brand-subtitle">Digital Architecture &amp; Advisory</span>
              </div>
            </div>
            <p className="footer-bio">
              We partner with innovative technology brands and venture-backed organizations 
              to architect resilient digital ecosystems, scalable design systems, and headless commerce infrastructure.
            </p>
            <div className="footer-status-tag">
              <span className="status-dot live-status" />
              <span>Studio Advisory: Accepting Q4/Q1 Engagements</span>
            </div>
          </div>

          {/* Column 2: Solutions */}
          <div className="footer-col">
            <h4 className="footer-col-title">Services &amp; Advisory</h4>
            <ul className="footer-links">
              <li>
                <button type="button" onClick={() => handleNav('bookings')} className="footer-link-btn">
                  <span>Strategy &amp; Consulting</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('bookings')} className="footer-link-btn">
                  <span>Design Systems Workshop</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('bookings')} className="footer-link-btn">
                  <span>Full-Stack Engineering</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('bookings')} className="footer-link-btn">
                  <span>Headless Commerce Setup</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('bookings')} className="footer-link-btn">
                  <span>Performance Architecture</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform & Products */}
          <div className="footer-col">
            <h4 className="footer-col-title">Platform &amp; Journal</h4>
            <ul className="footer-links">
              <li>
                <button type="button" onClick={() => handleNav('products')} className="footer-link-btn">
                  <span>Studio Hardware &amp; Toolkits</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('blog')} className="footer-link-btn">
                  <span>Perspectives &amp; Insights</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('testimonials')} className="footer-link-btn">
                  <span>Client Case Studies</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('contact')} className="footer-link-btn">
                  <span>Direct Communication</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Studio Info */}
          <div className="footer-col">
            <h4 className="footer-col-title">Studio Presence</h4>
            <div className="footer-contact-info">
              <div className="footer-info-item">
                <MapPin size={15} className="footer-info-icon" />
                <span>San Francisco &bull; London &bull; Remote</span>
              </div>
              <div className="footer-info-item">
                <Mail size={15} className="footer-info-icon" />
                <span>advisory@aurastudio.design</span>
              </div>
              <div className="footer-info-item">
                <ShieldCheck size={15} className="footer-info-icon" />
                <span>Enterprise SLA &bull; Confidential NDA</span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '1.25rem', width: '100%', justifyContent: 'center' }}
              onClick={() => handleNav('contact')}
            >
              <span>Initiate Project Inquiry</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-copy">
            &copy; {new Date().getFullYear()} Aura Studio &amp; Advisory Inc. All rights reserved.
          </div>
          <div className="footer-legal-links">
            <span className="footer-legal-link">Privacy Policy</span>
            <span className="footer-legal-divider">&bull;</span>
            <span className="footer-legal-link">Terms of Engagement</span>
            <span className="footer-legal-divider">&bull;</span>
            <span className="footer-legal-link">Security Disclosures</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
