import React, { useState } from 'react';
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

  const handleNavClick = (page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="container nav-container">
        {/* Brand */}
        <div 
          className="brand-link" 
          onClick={() => handleNavClick('home')} 
          style={{ cursor: 'pointer' }}
          id="nav-brand"
        >
          <div className="brand-icon">
            <Sparkles size={18} />
          </div>
          <div className="brand-text">
            <span className="brand-title">Aura Studio</span>
            <span className="brand-subtitle">Digital Architecture &amp; Advisory</span>
          </div>
        </div>

        {/* Desktop Navigation Items */}
        <nav className="nav-links">
          <button
            type="button"
            className={`nav-link ${activePage === 'home' ? 'active' : ''}`}
            onClick={() => handleNavClick('home')}
            id="nav-home-btn"
          >
            <Home size={15} />
            <span>Home</span>
          </button>

          <button
            type="button"
            className={`nav-link ${activePage === 'bookings' ? 'active' : ''}`}
            onClick={() => handleNavClick('bookings')}
            id="nav-bookings-btn"
          >
            <Calendar size={15} />
            <span>Services</span>
            {typeof bookingCount === 'number' && bookingCount > 0 ? (
              <span className="badge badge-neutral" style={{ padding: '2px 6px', fontSize: '0.68rem' }}>
                {bookingCount}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            className={`nav-link ${activePage === 'products' ? 'active' : ''}`}
            onClick={() => handleNavClick('products')}
            id="nav-products-btn"
          >
            <ShoppingBag size={15} />
            <span>Products</span>
            {typeof productCount === 'number' && productCount > 0 ? (
              <span className="badge badge-neutral" style={{ padding: '2px 6px', fontSize: '0.68rem' }}>
                {productCount}
              </span>
            ) : null}
          </button>
          
          <button
            type="button"
            className={`nav-link ${activePage === 'blog' ? 'active' : ''}`}
            onClick={() => handleNavClick('blog')}
            id="nav-blog-btn"
          >
            <BookOpen size={15} />
            <span>Insights</span>
            {typeof postCount === 'number' && postCount > 0 ? (
              <span className="badge badge-neutral" style={{ padding: '2px 6px', fontSize: '0.68rem' }}>
                {postCount}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            className={`nav-link ${activePage === 'testimonials' ? 'active' : ''}`}
            onClick={() => handleNavClick('testimonials')}
            id="nav-testimonials-btn"
          >
            <MessageSquareQuote size={15} />
            <span>Client Stories</span>
            {typeof testimonialCount === 'number' && testimonialCount > 0 ? (
              <span className="badge badge-neutral" style={{ padding: '2px 6px', fontSize: '0.68rem' }}>
                {testimonialCount}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            className={`nav-link ${activePage === 'contact' ? 'active' : ''}`}
            onClick={() => handleNavClick('contact')}
            id="nav-contact-btn"
          >
            <Mail size={15} />
            <span>Contact</span>
          </button>
        </nav>

        {/* Action & Status */}
        <div className="nav-actions">
          {/* Cart Drawer Trigger Button */}
          <button
            type="button"
            className="btn-cart-trigger"
            onClick={onOpenCart}
            title="View Shopping Cart"
            id="nav-cart-btn"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag size={18} />
            <span className="cart-badge">{cartItemCount}</span>
          </button>

          {/* Primary CTA: Schedule Consultation */}
          <button
            type="button"
            className="btn btn-primary btn-sm desktop-only-cta"
            onClick={() => handleNavClick('bookings')}
            id="nav-cta-schedule"
          >
            <span>Book Consultation</span>
            <ArrowRight size={13} />
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
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

          <div style={{ padding: '0.75rem 1rem 0' }}>
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
      )}
    </header>
  );
}

export default Navbar;
