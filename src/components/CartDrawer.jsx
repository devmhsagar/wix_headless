import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onNavigateToProducts,
}) {
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState(null);

  if (!isOpen) return null;

  const handleCheckoutClick = async () => {
    setCheckingOut(true);
    setCheckoutNotice(null);

    try {
      const result = await onCheckout();
      if (result?.url) {
        window.location.href = result.url;
      } else if (result?.checkoutId) {
        setCheckoutNotice({
          type: 'info',
          title: 'Checkout Session Initialized',
          message: result.message || `Checkout session created (ID: ${result.checkoutId}). Ready for secure payment processing.`,
        });
      }
    } catch (err) {
      setCheckoutNotice({
        type: 'error',
        title: 'Checkout Error',
        message: err.message || 'Unable to create checkout session.',
      });
    } finally {
      setCheckingOut(false);
    }
  };

  const lineItems = cart?.lineItems || [];
  const isEmpty = lineItems.length === 0;

  return (
    <div className="cart-drawer-overlay" onClick={onClose} id="cart-drawer-backdrop">
      <div 
        className="cart-drawer-container"
        onClick={(e) => e.stopPropagation()}
        id="cart-drawer"
      >
        {/* Drawer Header */}
        <div className="cart-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="step-icon" style={{ margin: 0, width: '36px', height: '36px' }}>
              <ShoppingBag size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Your Cart</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {cart?.totalItems || 0} item{cart?.totalItems === 1 ? '' : 's'} &bull; Studio Store
              </span>
            </div>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close cart drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="cart-drawer-body">
          {checkoutNotice ? (
            <div className={`checkout-notice ${checkoutNotice.type}`}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                {checkoutNotice.type === 'error' ? (
                  <AlertCircle size={18} className="notice-icon" />
                ) : (
                  <CheckCircle2 size={18} className="notice-icon" />
                )}
                <div>
                  <strong>{checkoutNotice.title}</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', lineHeight: 1.4 }}>
                    {checkoutNotice.message}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {isEmpty ? (
            <div className="cart-empty-state">
              <div className="state-icon-wrapper info" style={{ width: '64px', height: '64px', margin: '0 auto 1rem' }}>
                <ShoppingBag size={30} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Your cart is empty
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Explore the latest products from the Wix Stores catalog and add them to your cart.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  onClose();
                  onNavigateToProducts();
                }}
              >
                <span>Browse Products</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {lineItems.map((item) => (
                <div key={item.id} className="cart-item-row">
                  {/* Thumbnail */}
                  <div className="cart-item-thumb">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="product-image-placeholder" style={{ height: '60px' }}>
                        <ShoppingBag size={20} opacity={0.4} />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="cart-item-details">
                    <h4 className="cart-item-name">{item.name}</h4>
                    {item.descriptionLines && item.descriptionLines.length > 0 ? (
                      <div className="cart-item-variants">
                        {item.descriptionLines.map((dl, i) => (
                          <span key={i} className="cart-item-variant-tag">
                            {dl.name}: {dl.value}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="cart-item-meta">
                      <span className="cart-item-price">{item.price}</span>

                      {/* Stepper */}
                      <div className="quantity-stepper cart-stepper">
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          title="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="quantity-value">{item.quantity}</span>
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          title="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        className="cart-remove-btn"
                        onClick={() => onRemoveItem(item.id)}
                        title="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer / Checkout Summary */}
        {!isEmpty ? (
          <div className="cart-drawer-footer">
            <div className="cart-summary-row">
              <span className="summary-label">Subtotal</span>
              <span className="summary-amount">{cart?.subtotal || '৳0.00'}</span>
            </div>

            <p className="cart-tax-note">
              Taxes &amp; shipping calculated during checkout.
            </p>

            <button
              type="button"
              className={`btn btn-primary btn-block btn-checkout ${checkingOut ? 'loading' : ''}`}
              onClick={handleCheckoutClick}
              disabled={checkingOut}
            >
              <span>{checkingOut ? 'Preparing Checkout...' : 'Proceed to Checkout'}</span>
              <ArrowRight size={16} />
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={onClearCart}
                style={{ color: 'var(--text-muted)' }}
              >
                Clear Entire Cart
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
