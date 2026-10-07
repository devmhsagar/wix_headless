import React from 'react';
import { Calendar, Clock, ArrowRight, Image as ImageIcon } from 'lucide-react';

export function PostCard({ post, onSelectPost }) {
  if (!post) return null;

  const {
    id,
    title,
    excerpt,
    publishedDate,
    featuredImage,
    minutesToRead,
  } = post;

  return (
    <article className="post-card" id={`post-${id}`}>
      {/* Featured Image */}
      <div className="post-media">
        {featuredImage ? (
          <img
            src={featuredImage}
            alt={title}
            className="post-image"
            loading="lazy"
            onError={(e) => {
              // Hide broken image and fallback to placeholder
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextElementSibling) {
                e.currentTarget.nextElementSibling.style.display = 'flex';
              }
            }}
          />
        ) : null}

        <div
          className="post-image-placeholder"
          style={{ display: featuredImage ? 'none' : 'flex' }}
        >
          <ImageIcon size={32} />
          <span>Studio Journal</span>
        </div>

        <div className="post-badge">
          <span>Insight</span>
        </div>
      </div>

      {/* Content */}
      <div className="post-content">
        <div className="post-meta">
          <div className="meta-item">
            <Calendar size={13} />
            <time dateTime={post.isoDate || undefined}>{publishedDate}</time>
          </div>
          {minutesToRead ? (
            <div className="meta-item">
              <Clock size={13} />
              <span>{minutesToRead} min read</span>
            </div>
          ) : null}
        </div>

        <h3 className="post-title" title={title}>
          {title}
        </h3>

        <p className="post-excerpt" title={excerpt}>
          {excerpt}
        </p>

        <div className="post-footer">
          <button
            type="button"
            className="read-more-btn"
            onClick={() => onSelectPost(post)}
            id={`btn-read-more-${id}`}
            aria-label={`Read full post: ${title}`}
          >
            <span>Read More</span>
            <ArrowRight size={15} />
          </button>

          <span className="wix-source-tag" style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)' }}>Insight</span>
        </div>
      </div>
    </article>
  );
}
