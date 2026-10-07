import React, { useState } from 'react';
import { X, Star, User, Building2, Briefcase, Image as ImageIcon, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { submitTestimonialReview } from '../api/testimonialService';

export function WriteReviewModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    rating: 5,
    review: '',
    image: '',
  });

  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

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
    if (!formData.review.trim()) {
      setError('Please provide your review feedback.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await submitTestimonialReview({
        name: formData.name.trim(),
        role: formData.role.trim() || 'Client Partner',
        company: formData.company.trim() || '',
        rating: formData.rating,
        message: formData.review.trim(),
        image: formData.image.trim() || undefined,
      });

      setSuccess(true);
      if (onSuccess) {
        await onSuccess();
      }
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({
          name: '',
          role: '',
          company: '',
          rating: 5,
          review: '',
          image: '',
        });
      }, 1500);
    } catch (err) {
      console.error('[WriteReviewModal Error]:', err);
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="write-review-modal">
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px', width: '92%', padding: '2rem' }}
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close Review Modal"
        >
          <X size={20} />
        </button>

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div 
              className="state-icon-wrapper" 
              style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', margin: '0 auto 1.25rem', width: '56px', height: '56px' }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              Endorsement Published!
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Your feedback was saved directly to the Wix CMS collection and is now live on the site.
            </p>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <span className="section-eyebrow">Client Endorsement</span>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '0.2rem', marginBottom: '0.35rem' }}>
                Write a Review
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Share your perspective on collaborating with the Aura Studio team. Submissions are saved to our Wix CMS.
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {/* Rating Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Rating <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '4px',
                        cursor: 'pointer',
                        color: (hoverRating || formData.rating) >= star ? '#fbbf24' : '#475569',
                        transition: 'transform 0.15s ease, color 0.15s ease',
                      }}
                      title={`${star} Star${star > 1 ? 's' : ''}`}
                    >
                      <Star size={24} fill={(hoverRating || formData.rating) >= star ? '#fbbf24' : 'none'} />
                    </button>
                  ))}
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                    {formData.rating} of 5 Stars
                  </span>
                </div>
              </div>

              {/* Name & Role */}
              <div className="form-grid-2">
                <div className="config-input-group">
                  <label htmlFor="review-name">
                    <User size={13} style={{ display: 'inline', marginRight: '5px' }} />
                    Full Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="review-name"
                    name="name"
                    type="text"
                    className="config-input"
                    placeholder="e.g. Marcus Aurelius"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="config-input-group">
                  <label htmlFor="review-role">
                    <Briefcase size={13} style={{ display: 'inline', marginRight: '5px' }} />
                    Role / Title
                  </label>
                  <input
                    id="review-role"
                    name="role"
                    type="text"
                    className="config-input"
                    placeholder="e.g. VP of Product"
                    value={formData.role}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Company & Avatar Image */}
              <div className="form-grid-2">
                <div className="config-input-group">
                  <label htmlFor="review-company">
                    <Building2 size={13} style={{ display: 'inline', marginRight: '5px' }} />
                    Company / Organization
                  </label>
                  <input
                    id="review-company"
                    name="company"
                    type="text"
                    className="config-input"
                    placeholder="e.g. Stripe, Acme Corp"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>

                <div className="config-input-group">
                  <label htmlFor="review-image">
                    <ImageIcon size={13} style={{ display: 'inline', marginRight: '5px' }} />
                    Avatar Image URL <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>(optional)</span>
                  </label>
                  <input
                    id="review-image"
                    name="image"
                    type="url"
                    className="config-input"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Review Text */}
              <div className="config-input-group">
                <label htmlFor="review-text">
                  Your Review / Endorsement <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  id="review-text"
                  name="review"
                  rows={4}
                  className="config-input"
                  placeholder="Describe the impact of the engagement, architectural quality, and teamwork..."
                  required
                  value={formData.review}
                  onChange={handleChange}
                  style={{ resize: 'vertical', minHeight: '100px' }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn btn-primary btn-sm ${submitting ? 'loading' : ''}`}
                  disabled={submitting}
                  id="btn-submit-review"
                >
                  <Send size={14} />
                  <span>{submitting ? 'Saving to Wix CMS...' : 'Publish Endorsement'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default WriteReviewModal;
