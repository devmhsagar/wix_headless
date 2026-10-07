import React, { useState } from 'react';
import { ShoppingBag, Eye, Check, Tag } from 'lucide-react';

export function ProductCard({ product, onSelect, onAddToCart, isAddingToCart }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!product) return null;

  return (
    <article className="product-card" id={`product-card-${product.id}`}>
      {/* Product Image Wrapper */}
      <div 
        className="product-image-container"
        onClick={() => onSelect(product)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onSelect(product)}
        title={`View details for ${product.name}`}
      >
        {product.mainImage ? (
          <img
            src={product.mainImage}
            alt={product.name}
            className={`product-image ${imageLoaded ? 'loaded' : ''}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className="product-image-placeholder">
            <ShoppingBag size={40} opacity={0.3} />
          </div>
        )}

        {/* Badges Overlay */}
        <div className="product-badges">
          {product.ribbon ? (
            <span className="badge badge-ribbon">
              <Tag size={11} />
              <span>{product.ribbon}</span>
            </span>
          ) : null}

          <span className={`badge ${product.inStock ? 'badge-in-stock' : 'badge-out-of-stock'}`}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        {/* Hover Quick Action */}
        <div className="product-quick-action">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
          >
            <Eye size={14} />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Content */}
      <div className="product-content">
        <div className="product-header">
          <h3 
            className="product-title"
            onClick={() => onSelect(product)}
          >
            {product.name}
          </h3>
        </div>

        <p className="product-description">
          {product.description}
        </p>

        {/* Pricing & Add to Cart Action */}
        <div className="product-footer">
          <div className="product-pricing">
            <span className="product-price">{product.formattedPrice}</span>
            {product.hasDiscount && product.formattedDiscountedPrice ? (
              <span className="product-old-price">{product.formattedPrice}</span>
            ) : null}
          </div>

          <button
            type="button"
            className={`btn btn-primary btn-sm btn-add-cart ${isAddingToCart ? 'loading' : ''}`}
            disabled={!product.inStock || isAddingToCart}
            onClick={() => onAddToCart(product)}
            title={product.inStock ? 'Add to Cart' : 'Currently Out of Stock'}
          >
            <ShoppingBag size={14} />
            <span>{isAddingToCart ? 'Adding...' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
