import React from 'react';
import { 
  ArrowRight, 
  Sparkles,
  ShoppingBag,
  Calendar,
  BookOpen,
  MessageSquareQuote,
  ShieldCheck,
  Zap,
  Code2,
  Compass,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { PostCard } from '../components/PostCard';
import { TestimonialCard } from '../components/TestimonialCard';
import { ProductCard } from '../components/ProductCard';
import { LoadingSkeleton } from '../components/StatusStates';

export function HomePage({
  posts = [],
  loading = false,
  error = null,
  testimonials = [],
  testimonialsLoading = false,
  products = [],
  productsLoading = false,
  services = [],
  servicesLoading = false,
  onAddToCart,
  addingProductId,
  onSelectProduct,
  onNavigate,
  onSelectPost,
}) {
  const latestPosts = posts.slice(0, 3);
  const latestTestimonials = testimonials.slice(0, 3);
  const latestProducts = products.slice(0, 3);
  const featuredServices = services.slice(0, 3);

  return (
    <div className="home-page" id="page-home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-pill">
            <Sparkles size={14} className="pulse-icon" />
            <span>Digital Product Architecture &amp; Strategic Advisory</span>
          </div>

          <h1 className="hero-title">
            Architecting High-Impact <br />
            <span className="gradient-text">Digital Systems &amp; Experiences</span>
          </h1>

          <p className="hero-subtitle">
            Aura Studio partners with founders and technology leaders to build resilient design systems, 
            high-conversion headless commerce, and scalable digital architectures built for exponential growth.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate('bookings')}
              id="hero-btn-explore-services"
            >
              <span>Explore Advisory &amp; Services</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onNavigate('products')}
              id="hero-btn-catalog"
            >
              <ShoppingBag size={15} />
              <span>Browse Studio Store</span>
            </button>
          </div>

          {/* Metric / Credibility Strip */}
          <div className="hero-metrics-strip">
            <div className="metric-item">
              <span className="metric-number">$45M+</span>
              <span className="metric-label">Transaction Volume</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <span className="metric-number">99.98%</span>
              <span className="metric-label">Architecture Uptime</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <span className="metric-number">35+</span>
              <span className="metric-label">Enterprise Projects</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <span className="metric-number">100%</span>
              <span className="metric-label">Headless Native</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Advisory Pillars Section */}
      <section className="capabilities-section">
        <div className="container">
          <div className="section-header-centered">
            <span className="section-eyebrow">Studio Capabilities</span>
            <h2 className="section-title">Built for Performance &amp; Longevity</h2>
            <p className="section-description">
              We operate at the intersection of technical engineering, product design, and business strategy.
            </p>
          </div>

          <div className="capabilities-grid">
            <div className="capability-card">
              <div className="capability-icon">
                <Compass size={22} />
              </div>
              <h3 className="capability-title">Strategic Product Advisory</h3>
              <p className="capability-desc">
                High-level roadmapping, technology stack evaluation, and architectural guidance for scaling software teams.
              </p>
            </div>

            <div className="capability-card">
              <div className="capability-icon">
                <Zap size={22} />
              </div>
              <h3 className="capability-title">Headless Commerce Architecture</h3>
              <p className="capability-desc">
                Decoupled storefronts with sub-second page loads, internationalization, and robust transactional backends.
              </p>
            </div>

            <div className="capability-card">
              <div className="capability-icon">
                <Code2 size={22} />
              </div>
              <h3 className="capability-title">Scalable Design Systems</h3>
              <p className="capability-desc">
                Atomic token architectures and reusable component libraries that bridge design and engineering seamlessly.
              </p>
            </div>

            <div className="capability-card">
              <div className="capability-icon">
                <ShieldCheck size={22} />
              </div>
              <h3 className="capability-title">Performance Audits &amp; Optimization</h3>
              <p className="capability-desc">
                Deep-dive diagnostic audits into Core Web Vitals, API latency, database query profiles, and security posture.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services & Booking Preview */}
      <section className="services-preview-section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">Advisory Engagements</span>
              <h2 className="section-title">Book a 1-on-1 Consultation</h2>
              <p className="section-description">
                Schedule dedicated advisory sessions, system architecture reviews, or specialized workshops with live availability.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('bookings')}
              id="btn-view-all-services"
            >
              <span>View All Services</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {servicesLoading && services.length === 0 ? (
            <LoadingSkeleton count={3} />
          ) : (
            <div className="services-preview-grid">
              {featuredServices.map((service) => (
                <div key={service.id} className="service-preview-card">
                  <div className="service-preview-header">
                    <span className="service-tag">{service.type || 'ADVISORY'}</span>
                    <span className="service-preview-price">{service.priceFormatted || 'Custom'}</span>
                  </div>
                  <h3 className="service-preview-title">{service.name}</h3>
                  <p className="service-preview-desc">
                    {service.tagLine || service.description || 'Specialized advisory engagement designed for high-impact outcomes.'}
                  </p>
                  <div className="service-preview-footer">
                    <div className="service-preview-meta">
                      <Clock size={14} />
                      <span>{service.durationFormatted || '60 mins'}</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-xs"
                      onClick={() => onNavigate('bookings')}
                    >
                      <span>Select Date &amp; Time</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products / Studio Catalog */}
      <section className="products-spotlight-section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">Studio Store</span>
              <h2 className="section-title">Developer Toolkits &amp; Essentials</h2>
              <p className="section-description">
                Proprietary design frameworks, technical documentation manuals, and hardware tools curated for practitioners.
              </p>
            </div>

            {products.length > 0 && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigate('products')}
                id="btn-view-all-products"
              >
                <span>Browse Full Store ({products.length})</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          {productsLoading && products.length === 0 ? (
            <LoadingSkeleton count={3} />
          ) : (
            <div className="products-grid">
              {latestProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelect={onSelectProduct}
                  onAddToCart={onAddToCart}
                  isAddingToCart={addingProductId === p.id}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Studio Philosophy / About Section */}
      <section className="philosophy-section">
        <div className="container">
          <div className="philosophy-card">
            <div className="philosophy-content">
              <span className="section-eyebrow">Our Philosophy</span>
              <h2 className="philosophy-title">
                Uncompromising Quality &amp; Disciplined Engineering
              </h2>
              <p className="philosophy-text">
                We believe exceptional software is neither an accident nor a cosmetic layer. It is the natural consequence of rigorous architectural discipline, deep domain curiosity, and obsessive attention to detail.
              </p>
              <div className="philosophy-points">
                <div className="philosophy-point">
                  <div className="point-icon"><Sparkles size={16} /></div>
                  <div>
                    <strong>Precision Craftsmanship</strong>
                    <p>Every interface and API contract is designed with clear intent, zero fluff, and enduring usability.</p>
                  </div>
                </div>
                <div className="philosophy-point">
                  <div className="point-icon"><ShieldCheck size={16} /></div>
                  <div>
                    <strong>Future-Proof Architectures</strong>
                    <p>We build decoupled systems that evolve effortlessly alongside changing organizational needs.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="philosophy-cta-box">
              <div className="cta-box-badge">Advisory Retainers</div>
              <h3>Collaborate With Aura Studio</h3>
              <p>Direct access to our senior engineering and strategy directors for high-stakes product launches.</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onNavigate('contact')}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span>Initiate Discussion</span>
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Client Stories / Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">Client Endorsements</span>
              <h2 className="section-title">Trusted by Engineering Leaders</h2>
              <p className="section-description">
                Direct feedback from founders, executives, and technical partners who have built with us.
              </p>
            </div>

            {testimonials.length > 0 && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigate('testimonials')}
                id="btn-view-all-testimonials"
              >
                <span>Read All ({testimonials.length}) Stories</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          {testimonialsLoading && testimonials.length === 0 ? (
            <LoadingSkeleton count={3} />
          ) : (
            <div className="testimonials-grid">
              {latestTestimonials.map((t) => (
                <TestimonialCard key={t.id} testimonial={t} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Perspectives & Insights (Blog) */}
      <section className="journal-section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">Journal &amp; Insights</span>
              <h2 className="section-title">Perspectives on Modern Software</h2>
              <p className="section-description">
                Essays and case studies covering headless architecture, design engineering, and digital commerce.
              </p>
            </div>

            {posts.length > 0 && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigate('blog')}
                id="btn-view-all-posts"
              >
                <span>View Full Journal ({posts.length})</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          {loading && posts.length === 0 ? (
            <LoadingSkeleton count={3} />
          ) : (
            <div className="posts-grid">
              {latestPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onSelectPost={onSelectPost}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Final Action Banner */}
      <section className="final-cta-section">
        <div className="container">
          <div className="final-cta-card">
            <span className="hero-pill" style={{ marginBottom: '1.25rem' }}>
              <Sparkles size={14} />
              <span>Let's Build Something Exceptional</span>
            </span>
            <h2 className="final-cta-title">
              Ready to Transform Your Digital Infrastructure?
            </h2>
            <p className="final-cta-subtitle">
              Whether you are architecting a headless commerce platform, establishing enterprise design systems, 
              or seeking strategic product advisory, our studio is ready to collaborate.
            </p>
            <div className="final-cta-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onNavigate('bookings')}
                id="final-cta-book-btn"
              >
                <span>Schedule Consultation</span>
                <Calendar size={16} />
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onNavigate('contact')}
                id="final-cta-contact-btn"
              >
                <span>Contact Studio</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
