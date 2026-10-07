import React from 'react';
import { Star, Building2, User } from 'lucide-react';

export function TestimonialCard({ testimonial }) {
  if (!testimonial) return null;

  const { id, name, role, company, message, rating, image } = testimonial;

  return (
    <div className="testimonial-card" id={`testimonial-${id}`}>
      {/* Header: Avatar, Name, Role, Company */}
      <div className="testimonial-header">
        <div className="testimonial-avatar-wrapper">
          {image ? (
            <img
              src={image}
              alt={name}
              className="testimonial-avatar"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextElementSibling) {
                  e.currentTarget.nextElementSibling.style.display = 'flex';
                }
              }}
            />
          ) : null}
          <div
            className="testimonial-avatar-fallback"
            style={{ display: image ? 'none' : 'flex' }}
          >
            <User size={20} />
          </div>
        </div>

        <div className="testimonial-meta">
          <h4 className="testimonial-name">{name}</h4>
          <div className="testimonial-title">
            <span>{role}</span>
            {role && company ? <span className="meta-dot">&bull;</span> : null}
            {company ? (
              <span className="testimonial-company">
                <Building2 size={12} style={{ display: 'inline', marginRight: '3px', verticalAlign: '-1px' }} />
                {company}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Star Rating */}
      <div className="testimonial-rating" aria-label={`Rating: ${rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, idx) => (
          <Star
            key={idx}
            size={16}
            className={idx < rating ? 'star-filled' : 'star-empty'}
          />
        ))}
      </div>

      {/* Message */}
      <p className="testimonial-message">"{message}"</p>

      {/* Footer */}
      <div className="testimonial-footer">
        <span className="wix-cms-badge" style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Verified Partner</span>
      </div>
    </div>
  );
}
