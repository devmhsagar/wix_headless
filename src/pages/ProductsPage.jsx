import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  SlidersHorizontal, 
  Sparkles
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { 
  LoadingSkeleton, 
  ErrorState 
} from '../components/StatusStates';

export function ProductsPage({
  products = [],
  loading = false,
  error = null,
  onRefresh,
  onAddToCart,
  addingProductId,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.ribbon && p.ribbon.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.numericPrice - b.numericPrice);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.numericPrice - a.numericPrice);
    } else if (sortBy === 'name_asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [products, searchTerm, sortBy]);

  return (
    <div className="products-page" id="page-products">
      {/* Products Header Section */}
      <section className="page-header-section" style={{ paddingTop: '3.5rem', paddingBottom: '2.5rem' }}>
        <div className="container">
          <div className="page-header-content">
            <span className="section-eyebrow">Studio Store</span>
            <h1 className="page-title" style={{ marginTop: '0.4rem', marginBottom: '0.75rem' }}>
              Toolkits, Publications &amp; Gear
            </h1>
            <p className="page-subtitle" style={{ maxWidth: '680px' }}>
              Engineered architecture manuals, design system starter kits, and premium desk hardware curated by our studio team.
            </p>
          </div>
        </div>
      </section>

      {/* Main Catalog & Filter Section */}
      <section className="catalog-section" style={{ paddingBottom: '5rem' }}>
        <div className="container">
          {/* Controls Bar: Search & Sort */}
          <div className="blog-toolbar" style={{ marginBottom: '2.5rem' }}>
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search products, kits, manuals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                id="search-products-input"
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
                id="sort-products-select"
              >
                <option value="featured">Featured First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Alphabetical (A-Z)</option>
              </select>

              <span className="badge badge-neutral" style={{ marginLeft: '6px' }}>
                {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>

          {/* Content States */}
          {loading && products.length === 0 ? (
            <LoadingSkeleton count={6} />
          ) : error ? (
            <ErrorState error={error} onRetry={onRefresh} />
          ) : filteredProducts.length === 0 ? (
            <div className="state-box">
              <div className="state-icon-wrapper info">
                <ShoppingBag size={28} />
              </div>
              <h3 className="state-title">No Matching Products</h3>
              <p className="state-description">
                We couldn't find any store products matching "{searchTerm}".
              </p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSearchTerm('')}
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="products-grid" id="products-catalog-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={setSelectedProduct}
                  onAddToCart={onAddToCart}
                  isAddingToCart={addingProductId === product.id}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={onAddToCart}
          isAddingToCart={addingProductId === selectedProduct.id}
        />
      )}
    </div>
  );
}

export default ProductsPage;
