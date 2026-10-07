import React, { useState } from 'react';
import { X, ShoppingBag, Check, ShieldCheck, Truck, ArrowLeft, Tag } from 'lucide-react';

export function ProductDetailModal({ product, onClose, onAddToCart, isAddingToCart }) {
  if (!product) return null;

  const [selectedImage, setSelectedImage] = useState(
    product.mainImage || (product.gallery && product.gallery[0]) || ''
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState(product.defaultVariantId);
  const [addedNotice, setAddedNotice] = useState(false);

  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.mainImage].filter(Boolean);

  const handleAddToCart = async () => {
    await onAddToCart(product, quantity, { variantId: selectedVariantId });
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="product-detail-modal">
      <div 
        className="modal-content product-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close product details"
        >
          <X size={20} />
        </button>

        <div className="product-modal-grid">
          {/* Left Column: Gallery */}
          <div className="product-modal-gallery">
            <div className="product-modal-main-img-wrap">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="product-modal-main-img"
                />
              ) : (
                <div className="product-image-placeholder">
                  <ShoppingBag size={56} opacity={0.3} />
                </div>
              )}

              {product.ribbon ? (
                <span className="badge badge-ribbon product-modal-ribbon">
                  <Tag size={12} />
                  <span>{product.ribbon}</span>
                </span>
              ) : null}
            </div>

            {images.length > 1 ? (
              <div className="product-modal-thumbs">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`product-thumb-btn ${selectedImage === img ? 'active' : ''}`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Right Column: Info & Actions */}
          <div className="product-modal-info">
            <div className="product-modal-header">
              <span className={`badge ${product.inStock ? 'badge-in-stock' : 'badge-out-of-stock'}`}>
                {product.inStock ? 'In Stock (Wix Stores)' : 'Out of Stock'}
              </span>

              <h2 className="product-modal-title">{product.name}</h2>

              <div className="product-modal-pricing">
                <span className="product-modal-price">{product.formattedPrice}</span>
                {product.sku ? (
                  <span className="product-sku">SKU: {product.sku}</span>
                ) : null}
              </div>
            </div>

            {/* Product Variants (Options) if available */}
            {product.options && product.options.length > 0 ? (
              <div className="product-options-section">
                {product.options.map((opt, optIdx) => (
                  <div key={optIdx} className="product-option-group">
                    <label className="product-option-label">{opt.name}:</label>
                    <div className="product-option-choices">
                      {(opt.choices || []).map((choice, cIdx) => {
                        // Find matching variant
                        const matchingVariant = (product.variants || []).find(
                          (v) => v.choices && v.choices[opt.name] === choice.value
                        );
                        const isSelected = matchingVariant
                          ? selectedVariantId === matchingVariant._id
                          : cIdx === 0;

                        return (
                          <button
                            key={cIdx}
                            type="button"
                            className={`choice-btn ${isSelected ? 'active' : ''}`}
                            onClick={() => {
                              if (matchingVariant) {
                                setSelectedVariantId(matchingVariant._id);
                              }
                            }}
                          >
                            <span>{choice.description || choice.value}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Description */}
            <div className="product-modal-desc">
              <h4 className="section-mini-heading">Description</h4>
              <p>{product.description}</p>
            </div>

            {/* Quantity & Add to Cart Controls */}
            <div className="product-purchase-box">
              <div className="quantity-control-wrap">
                <label className="quantity-label">Quantity</label>
                <div className="quantity-stepper">
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity-value">{quantity}</span>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <button
                  type="button"
                  className={`btn btn-primary btn-block btn-modal-add ${isAddingToCart ? 'loading' : ''} ${addedNotice ? 'success' : ''}`}
                  disabled={!product.inStock || isAddingToCart}
                  onClick={handleAddToCart}
                >
                  {addedNotice ? (
                    <>
                      <Check size={16} />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} />
                      <span>{isAddingToCart ? 'Updating Cart...' : 'Add to Cart'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Trust Features */}
            <div className="product-modal-trust">
              <div className="trust-item">
                <ShieldCheck size={16} className="trust-icon" />
                <span>Encrypted &amp; Secure Checkout</span>
              </div>
              <div className="trust-item">
                <Truck size={16} className="trust-icon" />
                <span>Standard Delivery &amp; Real-time Stock Sync</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
