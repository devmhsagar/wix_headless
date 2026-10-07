import { currentCart } from '@wix/ecom';
import { getWixClient } from './wixClient.js';
import { resolveProductImageUrl } from './productService.js';

export const WIX_STORES_APP_ID = '215238eb-22a5-4c36-9e7b-e7c08025e04e';

/**
 * Normalizes a Wix line item from currentCart.
 * @param {object} item
 * @returns {object}
 */
export function formatLineItem(item) {
  if (!item) return null;

  const image =
    resolveProductImageUrl(item.image) ||
    resolveProductImageUrl(item.media?.mainMedia?.image) ||
    null;

  return {
    id: item._id || item.id,
    catalogItemId: item.catalogReference?.catalogItemId,
    name: item.productName?.original || item.productName?.translated || item.productName || 'Product Item',
    quantity: item.quantity || 1,
    image,
    price: item.price?.formattedAmount || (item.price?.amount ? `৳${item.price.amount}` : '৳0.00'),
    numericPrice: parseFloat(item.price?.amount || 0),
    totalPrice: item.totalPrice?.formattedAmount || item.price?.formattedAmount || '৳0.00',
    descriptionLines: (item.descriptionLines || []).map((dl) => ({
      name: dl.name?.original || dl.name,
      value: dl.plainText?.original || dl.plainText || dl.colorInfo?.original,
    })),
    raw: item,
  };
}

/**
 * Standardizes a Wix cart object.
 * @param {object} rawCart
 * @returns {object}
 */
export function formatCart(rawCart) {
  if (!rawCart) {
    return {
      id: null,
      lineItems: [],
      subtotal: '৳0.00',
      numericSubtotal: 0,
      currency: 'BDT',
      totalItems: 0,
    };
  }

  const items = (rawCart.lineItems || []).map(formatLineItem).filter(Boolean);
  const totalItems = items.reduce((acc, curr) => acc + (curr.quantity || 1), 0);

  return {
    id: rawCart._id || rawCart.id,
    lineItems: items,
    subtotal: rawCart.subtotal?.formattedAmount || rawCart.subtotalAfterDiscounts?.formattedAmount || '৳0.00',
    numericSubtotal: parseFloat(rawCart.subtotal?.amount || 0),
    currency: rawCart.currency || 'BDT',
    totalItems,
    checkoutId: rawCart.checkoutId || null,
    raw: rawCart,
  };
}

/**
 * Retrieves the current visitor's cart from Wix eCommerce.
 * Gracefully handles 404 (OWNED_CART_NOT_FOUND) when no cart has been initialized yet.
 * @returns {Promise<object>}
 */
export async function getCurrentCart() {
  const client = getWixClient();

  try {
    const rawCart = await client.currentCart.getCurrentCart();
    return formatCart(rawCart);
  } catch (err) {
    // 404 or OWNED_CART_NOT_FOUND is standard when the visitor hasn't added items yet
    if (
      err?.status === 404 ||
      err?.message?.includes('not found') ||
      err?.details?.applicationError?.code === 'OWNED_CART_NOT_FOUND'
    ) {
      return formatCart(null);
    }
    console.warn('[Wix Cart] getCurrentCart notice:', err.message);
    return formatCart(null);
  }
}

/**
 * Adds a catalog product to the current Wix cart.
 * Automatically resolves variant ID if product has variants.
 * @param {object} product
 * @param {number} [quantity=1]
 * @param {object} [options={}]
 * @returns {Promise<object>}
 */
export async function addToCart(product, quantity = 1, options = {}) {
  if (!product || !product.id) {
    throw new Error('Product information is required to add to cart.');
  }

  const client = getWixClient();

  // Determine variant ID if product uses variants
  const variantId =
    options.variantId ||
    product.defaultVariantId ||
    product.variants?.[0]?._id ||
    null;

  const catalogReference = {
    appId: WIX_STORES_APP_ID,
    catalogItemId: product.id,
  };

  if (variantId) {
    catalogReference.options = { variantId };
  }

  console.log(`[Wix Cart] Adding ${quantity}x "${product.name}" to cart (Variant: ${variantId || 'None'})...`);

  const response = await client.currentCart.addToCurrentCart({
    lineItems: [
      {
        catalogReference,
        quantity,
      },
    ],
  });

  const updatedCart = formatCart(response.cart);
  console.log(`[Wix Cart] Successfully updated cart. Items count: ${updatedCart.totalItems}, Subtotal: ${updatedCart.subtotal}`);
  return updatedCart;
}

/**
 * Updates the quantity of a specific line item in the cart.
 * @param {string} lineItemId
 * @param {number} quantity
 * @returns {Promise<object>}
 */
export async function updateCartQuantity(lineItemId, quantity) {
  if (!lineItemId) throw new Error('Line item ID is required');

  const client = getWixClient();

  if (quantity <= 0) {
    return removeFromCart(lineItemId);
  }

  const response = await client.currentCart.updateCurrentCartLineItemQuantity([
    {
      id: lineItemId,
      quantity,
    },
  ]);

  return formatCart(response.cart);
}

/**
 * Removes one or more line items from the current cart.
 * @param {string|Array<string>} lineItemIds
 * @returns {Promise<object>}
 */
export async function removeFromCart(lineItemIds) {
  const client = getWixClient();
  const ids = Array.isArray(lineItemIds) ? lineItemIds : [lineItemIds];

  const response = await client.currentCart.removeLineItemsFromCurrentCart(ids);
  return formatCart(response.cart);
}

/**
 * Clears / deletes the active cart for the current visitor.
 * @returns {Promise<object>}
 */
export async function clearCart() {
  const client = getWixClient();

  try {
    await client.currentCart.deleteCurrentCart();
  } catch (err) {
    console.warn('[Wix Cart] deleteCurrentCart note:', err.message);
  }

  return formatCart(null);
}

/**
 * Initiates the official Wix checkout flow.
 * Creates an e-commerce checkout from currentCart and requests a redirect URL.
 * @returns {Promise<{ url?: string, checkoutId: string, fallback?: boolean, message?: string }>}
 */
export async function createCheckoutRedirect() {
  const client = getWixClient();

  console.log('[Wix Checkout] Creating checkout from current cart...');
  const checkout = await client.currentCart.createCheckoutFromCurrentCart({
    channelType: currentCart.ChannelType.WEB,
  });

  const checkoutId = checkout.checkoutId;
  console.log(`[Wix Checkout] Created checkout session ID: ${checkoutId}`);

  // Attempt official Wix redirect session creation
  try {
    const postFlowUrl = window?.location?.href || 'http://localhost:5173/products';
    const thankYouPageUrl = `${window?.location?.origin || 'http://localhost:5173'}/products?status=success`;

    const redirectSession = await client.redirects.createRedirectSession({
      ecomCheckout: { checkoutId },
      callbacks: {
        postFlowUrl,
        thankYouPageUrl,
      },
    });

    const fullUrl = redirectSession?.redirectSession?.fullUrl;
    if (fullUrl) {
      console.log(`[Wix Checkout] Redirect URL generated: ${fullUrl}`);
      return { url: fullUrl, checkoutId, fallback: false };
    }
  } catch (redirectErr) {
    console.warn('[Wix Checkout] createRedirectSession notice:', redirectErr.message);
    return {
      checkoutId,
      fallback: true,
      message:
        'Checkout session initialized successfully in Wix eCommerce. Hosted checkout redirect requires publishing the site in Wix Studio or connecting a public checkout domain.',
    };
  }

  return {
    checkoutId,
    fallback: true,
    message: 'Checkout initialized with ID: ' + checkoutId,
  };
}
