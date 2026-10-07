import React, { useEffect } from 'react';
import { X, Calendar, Clock, ExternalLink, Image as ImageIcon } from 'lucide-react';

export function PostDetailModal({ post, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!post) return null;

  const {
    title,
    excerpt,
    contentText,
    publishedDate,
    featuredImage,
    minutesToRead,
    url,
    slug,
  } = post;

  return (
    <div className="modal-overlay" onClick={onClose} id="post-detail-modal">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
          id="btn-close-modal"
        >
          <X size={20} />
        </button>

        {featuredImage ? (
          <img src={featuredImage} alt={title} className="modal-hero-image" />
        ) : (
          <div className="post-media" style={{ height: '180px' }}>
            <div className="post-image-placeholder">
              <ImageIcon size={32} />
              <span>Studio Publication</span>
            </div>
          </div>
        )}

        <div className="modal-body">
          <div className="modal-post-meta">
            <div className="meta-item">
              <Calendar size={14} />
              <span>Published: {publishedDate}</span>
            </div>
            {minutesToRead ? (
              <div className="meta-item">
                <Clock size={14} />
                <span>{minutesToRead} min read</span>
              </div>
            ) : null}
            {slug ? (
              <div className="meta-item">
                <span className="wix-source-tag">/{slug}</span>
              </div>
            ) : null}
          </div>

          <h2 className="modal-post-title">{title}</h2>

          {excerpt ? (
            <div
              style={{
                fontStyle: 'italic',
                color: '#94a3b8',
                marginBottom: '1.5rem',
                borderLeft: '3px solid var(--accent-primary)',
                paddingLeft: '1rem',
              }}
            >
              {excerpt}
            </div>
          ) : null}

          <div className="modal-post-body">
            {contentText ? (
              contentText
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>
                Full article publication is available online.
              </p>
            )}
          </div>

          {url ? (
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <span>Read Full Publication</span>
                <ExternalLink size={14} />
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
