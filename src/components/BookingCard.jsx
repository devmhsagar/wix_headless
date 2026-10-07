import React, { useState } from 'react';
import { Calendar, Clock, DollarSign, ArrowRight, CheckCircle2 } from 'lucide-react';

export function BookingCard({ service, onBook }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!service) return null;

  return (
    <article className="booking-card" id={`booking-card-${service.id}`}>
      {/* Service Image Banner */}
      <div 
        className="booking-image-wrap"
        onClick={() => onBook(service)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onBook(service)}
        title={`Book ${service.name}`}
      >
        {service.image ? (
          <img
            src={service.image}
            alt={service.name}
            className={`booking-image ${imageLoaded ? 'loaded' : ''}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className="booking-image-placeholder">
            <Calendar size={44} opacity={0.3} />
          </div>
        )}

        {/* Type Badge */}
        <span className="badge badge-booking-type">
          {service.typeLabel}
        </span>
      </div>

      {/* Service Body */}
      <div className="booking-content">
        <h3 
          className="booking-title"
          onClick={() => onBook(service)}
        >
          {service.name}
        </h3>

        {service.tagLine ? (
          <p className="booking-tagline">{service.tagLine}</p>
        ) : null}

        <p className="booking-desc">
          {service.description}
        </p>

        {/* Meta badges: Duration & Price */}
        <div className="booking-meta-row">
          <div className="booking-meta-pill">
            <Clock size={13} className="meta-icon" />
            <span>{service.durationFormatted}</span>
          </div>

          <div className="booking-meta-pill price">
            <span>{service.formattedPrice}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="booking-footer">
          <button
            type="button"
            className="btn btn-primary btn-block btn-sm"
            onClick={() => onBook(service)}
            id={`btn-book-${service.id}`}
          >
            <Calendar size={14} />
            <span>Book Session</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}
