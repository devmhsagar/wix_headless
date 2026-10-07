import React, { useEffect } from 'react';
import { MessageSquareQuote, AlertCircle } from 'lucide-react';
import { TestimonialCard } from '../components/TestimonialCard.jsx';
import { LoadingSkeleton } from '../components/StatusStates.jsx';

export function TestimonialsPage({
  testimonials = [],
  loading = false,
  error = null,
  isConfigured = true,
  onRefresh,
}) {
  useEffect(() => {
    if (isConfigured && onRefresh) {
      onRefresh();
    }
  }, [isConfigured, onRefresh]);

  return (
    <div className="testimonials-page" id="page-testimonials">
      <section className="posts-section" style={{ paddingTop: '3.5rem', paddingBottom: '5rem' }}>
        <div className="container">
          {/* Header */}
          <div className="section-header" style={{ marginBottom: '2.5rem' }}>
            <div>
              <span className="section-eyebrow">Client Proof &amp; Impact</span>
              <h1 className="page-title" style={{ marginTop: '0.4rem', marginBottom: '0.6rem' }}>
                Executive Endorsements
              </h1>
              <p className="section-description" style={{ maxWidth: '640px' }}>
                Verified testimonials and feedback from technology executives, engineering directors, and product teams.
              </p>
            </div>
          </div>

          {/* Content States */}
          {loading && testimonials.length === 0 ? (
            <LoadingSkeleton count={3} />
          ) : error ? (
            <div className="state-box" id="testimonials-error-state">
              <div className="state-icon-wrapper error">
                <AlertCircle size={32} />
              </div>
              <h3 className="state-title">Unable to Load Endorsements</h3>
              <p className="state-description">
                We encountered an issue retrieving testimonials. Please try again in a few moments.
              </p>
              <button className="btn btn-primary btn-sm" onClick={onRefresh} id="btn-retry-testimonials">
                Retry
              </button>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="state-box">
              <div className="state-icon-wrapper info">
                <MessageSquareQuote size={32} />
              </div>
              <h3 className="state-title">No Endorsements Available</h3>
              <p className="state-description">
                Check back shortly for newly published case studies and partner feedback.
              </p>
            </div>
          ) : (
            <div className="testimonials-grid" id="testimonials-full-grid">
              {testimonials.map((t) => (
                <TestimonialCard key={t.id} testimonial={t} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default TestimonialsPage;
