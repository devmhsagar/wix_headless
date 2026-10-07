import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Home, 
  ShoppingBag, 
  Calendar, 
  Mail, 
  MessageSquareQuote,
  Menu,
  X,
  ArrowRight
} from 'lucide-react';

export function Navbar({
  activePage,
  onNavigate,
  postCount,
  testimonialCount,
  productCount,
  bookingCount,
  cartItemCount = 0,
  onOpenCart,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="site-header" id="main-header">
      <div className="container nav-container">
        {/* Brand Identity */}
        <div 
          className="brand-link" 
          onClick={() => handleNavClick('home')} 
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleNavClick('home')}
          id="nav-brand"
          aria-label="Aura Studio Home"
        >
          <div className="brand-icon">
            <Sparkles size={17} />
          </div>
          <div className="brand-text">
            <span className="brand-title">Aura Studio</span>
            <span className="brand-subtitle">Advisory</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="nav-links" aria-label="Main Navigation">
          <button
            type="button"
            className={`nav-link ${activePage === 'home' ? 'active' : ''}`}
            onClick={() => handleNavClick('home')}
            id="nav-home-btn"
          >
            <Home size={14} />
            <span>Home</span>
          </button>

          <button
            type="button"
            className={`nav-link ${activePage === 'bookings' ? 'active' : ''}`}
            onClick={() => handleNavClick('bookings')}
            id="nav-bookings-btn"
          >
            <Calendar size={14} />
            <span>Services</span>
            {typeof bookingCount === 'number' && bookingCount > 0 ? (
              <span className="nav-badge">{bookingCount}</span>
            ) : null}
          </button>

          <button
            type="button"
            className={`nav-link ${activePage === 'products' ? 'active' : ''}`}
            onClick={() => handleNavClick('products')}
            id="nav-products-btn"
          >
            <ShoppingBag size={14} />
            <span>Products</span>
            {typeof productCount === 'number' && productCount > 0 ? (
              <span className="nav-badge">{productCount}</span>
            ) : null}
          </button>
          
          <button
            type="button"
            className={`nav-link ${activePage === 'blog' ? 'active' : ''}`}
            onClick={() => handleNavClick('blog')}
            id="nav-blog-btn"
          >
            <BookOpen size={14} />
            <span>Insights</span>
            {typeof postCount === 'number' && postCount > 0 ? (
              <span className="nav-badge">{postCount}</span>
            ) : null}
          </button>

          <button
            type="button"
            className={`nav-link ${activePage === 'testimonials' ? 'active' : ''}`}
            onClick={() => handleNavClick('testimonials')}
            id="nav-testimonials-btn"
          >
            <MessageSquareQuote size={14} />
            <span>Stories</span>
            {typeof testimonialCount === 'number' && testimonialCount > 0 ? (
              <span className="nav-badge">{testimonialCount}</span>
            ) : null}
          </button>

          <button
            type="button"
            className={`nav-link ${activePage === 'contact' ? 'active' : ''}`}
            onClick={() => handleNavClick('contact')}
            id="nav-contact-btn"
          >
            <Mail size={14} />
            <span>Contact</span>
          </button>
        </nav>

        {/* Header Right Actions */}
        <div className="nav-actions">
          {/* Cart Trigger Button — ALWAYS VISIBLE across Desktop, Tablet & Mobile */}
          <button
            type="button"
            className="btn-cart-trigger"
            onClick={onOpenCart}
            title="Shopping Cart"
            id="nav-cart-btn"
            aria-label={`Shopping Cart (${cartItemCount} items)`}
          >
            <ShoppingBag size={18} />
            <span className="cart-badge" aria-hidden="true">{cartItemCount}</span>
          </button>

          {/* Large Screen Primary CTA: Hidden on tablets / mobile to avoid overcrowding */}
          <button
            type="button"
            className="btn btn-primary btn-sm desktop-cta-btn"
            onClick={() => handleNavClick('bookings')}
            id="nav-cta-schedule"
          >
            <span>Book Session</span>
            <ArrowRight size={13} />
          </button>

          {/* Mobile/Tablet Menu Hamburger Button */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
            id="mobile-nav-toggle-btn"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Full Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-backdrop" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="mobile-nav-drawer" 
            onClick={(e) => e.stopPropagation()}
            id="mobile-nav-menu"
          >
            <div className="mobile-nav-list">
              <button
                type="button"
                className={`mobile-nav-link ${activePage === 'home' ? 'active' : ''}`}
                onClick={() => handleNavClick('home')}
              >
                <Home size={17} />
                <span>Home</span>
              </button>

              <button
                type="button"
                className={`mobile-nav-link ${activePage === 'bookings' ? 'active' : ''}`}
                onClick={() => handleNavClick('bookings')}
              >
                <Calendar size={17} />
                <span>Services &amp; Advisory</span>
                {bookingCount > 0 && <span className="mobile-count-badge">{bookingCount}</span>}
              </button>

              <button
                type="button"
                className={`mobile-nav-link ${activePage === 'products' ? 'active' : ''}`}
                onClick={() => handleNavClick('products')}
              >
                <ShoppingBag size={17} />
                <span>Store &amp; Products</span>
                {productCount > 0 && <span className="mobile-count-badge">{productCount}</span>}
              </button>

              <button
                type="button"
                className={`mobile-nav-link ${activePage === 'blog' ? 'active' : ''}`}
                onClick={() => handleNavClick('blog')}
              >
                <BookOpen size={17} />
                <span>Insights &amp; Journal</span>
                {postCount > 0 && <span className="mobile-count-badge">{postCount}</span>}
              </button>

              <button
                type="button"
                className={`mobile-nav-link ${activePage === 'testimonials' ? 'active' : ''}`}
                onClick={() => handleNavClick('testimonials')}
              >
                <MessageSquareQuote size={17} />
                <span>Client Stories</span>
                {testimonialCount > 0 && <span className="mobile-count-badge">{testimonialCount}</span>}
              </button>

              <button
                type="button"
                className={`mobile-nav-link ${activePage === 'contact' ? 'active' : ''}`}
                onClick={() => handleNavClick('contact')}
              >
                <Mail size={17} />
                <span>Contact Studio</span>
              </button>
            </div>

            <div className="mobile-drawer-footer">
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => handleNavClick('bookings')}
              >
                <span>Book Consultation</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
