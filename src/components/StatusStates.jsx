import React from 'react';
import { AlertCircle, FileText, RefreshCw } from 'lucide-react';

/**
 * Loading skeleton representation of cards.
 */
export function LoadingSkeleton({ count = 3 }) {
  return (
    <div className="posts-grid" id="loading-skeletons">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="skeleton-card">
          <div className="skeleton-media" />
          <div className="skeleton-body">
            <div className="skeleton-line" style={{ width: '40%', height: '14px' }} />
            <div className="skeleton-line" style={{ width: '85%', height: '24px' }} />
            <div className="skeleton-line" style={{ width: '95%', height: '16px' }} />
            <div className="skeleton-line" style={{ width: '70%', height: '16px' }} />
            <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
              <div className="skeleton-line" style={{ width: '30%', height: '16px' }} />
              <div className="skeleton-line" style={{ width: '25%', height: '16px' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state when no published items are returned.
 */
export function EmptyPostsState({ onRefresh }) {
  return (
    <div className="state-box" id="empty-state">
      <div className="state-icon-wrapper info">
        <FileText size={32} />
      </div>
      <h3 className="state-title">No Articles Published</h3>
      <p className="state-description">
        Check back soon for newly published architecture perspectives and strategic analysis.
      </p>

      {onRefresh && (
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={onRefresh} id="btn-refresh-empty">
            <RefreshCw size={14} />
            Refresh Feed
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Clean Error state.
 */
export function ErrorState({ error, onRetry }) {
  const errorMessage = error?.message || 'Unable to retrieve live content. Please try again.';
  
  return (
    <div className="state-box" id="error-state">
      <div className="state-icon-wrapper error">
        <AlertCircle size={32} />
      </div>
      <h3 className="state-title">Content Temporarily Unavailable</h3>
      <p className="state-description">
        We encountered an unexpected connection issue retrieving live items.
      </p>

      <div className="code-snippet" style={{ color: '#f87171' }}>
        {errorMessage}
      </div>

      {onRetry && (
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '1rem' }}>
          <button className="btn btn-primary btn-sm" onClick={onRetry} id="btn-retry-fetch">
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

export default {
  LoadingSkeleton,
  EmptyPostsState,
  ErrorState,
};
