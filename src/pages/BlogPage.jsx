import React, { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, BookOpen } from 'lucide-react';
import { PostCard } from '../components/PostCard';
import { 
  LoadingSkeleton, 
  EmptyPostsState, 
  ErrorState 
} from '../components/StatusStates';

export function BlogPage({
  posts = [],
  loading = false,
  error = null,
  isConfigured = true,
  onRefresh,
  onSelectPost,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Trigger fresh fetch on page mount
  useEffect(() => {
    if (isConfigured && onRefresh) {
      onRefresh();
    }
  }, [isConfigured, onRefresh]);

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.excerpt?.toLowerCase().includes(q) ||
          p.contentText?.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      const dateA = a.raw?.firstPublishedDate || a.raw?.lastPublishedDate || 0;
      const dateB = b.raw?.firstPublishedDate || b.raw?.lastPublishedDate || 0;
      const timeA = new Date(dateA).getTime() || 0;
      const timeB = new Date(dateB).getTime() || 0;

      if (sortBy === 'newest') return timeB - timeA;
      if (sortBy === 'oldest') return timeA - timeB;
      return 0;
    });

    return result;
  }, [posts, searchQuery, sortBy]);

  return (
    <div className="blog-page" id="page-blog">
      <section className="posts-section" style={{ paddingTop: '3.5rem', paddingBottom: '5rem' }}>
        <div className="container">
          {/* Header */}
          <div className="section-header" style={{ marginBottom: '2.5rem' }}>
            <div>
              <span className="section-eyebrow">Perspectives &amp; Insights</span>
              <h1 className="page-title" style={{ marginTop: '0.4rem', marginBottom: '0.6rem' }}>
                Studio Journal &amp; Articles
              </h1>
              <p className="section-description" style={{ maxWidth: '640px' }}>
                Technical essays, architecture deep-dives, and strategic analyses on building resilient modern software.
              </p>
            </div>
          </div>

          {/* Search & Sort Toolbar */}
          {!error && (
            <div className="blog-toolbar">
              <div className="search-input-wrapper">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search articles by title, topic, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  id="search-posts-input"
                />
              </div>

              <div className="toolbar-controls">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <SlidersHorizontal size={14} />
                  <span>Sort:</span>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="search-input"
                  style={{ width: 'auto', paddingLeft: '12px', paddingRight: '12px' }}
                  id="sort-posts-select"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>

                <span className="badge badge-neutral" style={{ marginLeft: '6px' }}>
                  {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
                </span>
              </div>
            </div>
          )}

          {/* Content States */}
          {loading && posts.length === 0 ? (
            <LoadingSkeleton count={6} />
          ) : error ? (
            <ErrorState error={error} onRetry={onRefresh} />
          ) : posts.length === 0 ? (
            <EmptyPostsState onRefresh={onRefresh} />
          ) : filteredPosts.length === 0 ? (
            <div className="state-box">
              <h3 className="state-title">No Matching Articles</h3>
              <p className="state-description">
                No articles found matching "{searchQuery}". Try a different keyword or reset your filter.
              </p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="posts-grid" id="blog-posts-grid">
              {filteredPosts.map((post) => (
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
    </div>
  );
}

export default BlogPage;
