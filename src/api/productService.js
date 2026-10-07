import { media } from '@wix/sdk';
import { getWixClient } from './wixClient.js';

/**
 * Resolves Wix media URI to full CDN URL.
 * @param {string|object} rawImage
 * @returns {string|null}
 */
export function resolveProductImageUrl(rawImage) {
  if (!rawImage) return null;

  if (typeof rawImage === 'string') {
    if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
      return rawImage;
    }
    if (rawImage.startsWith('wix:image://')) {
      try {
        const resolved = media.getImageUrl(rawImage);
        if (resolved && resolved.url) return resolved.url;
      } catch {
        const uri = rawImage.replace('wix:image://v1/', '').split('/')[0].split('#')[0];
        return `https://static.wixstatic.com/media/${uri}`;
      }
    }
  }

  if (typeof rawImage === 'object') {
    if (rawImage.url) return rawImage.url;
    if (rawImage.src) return resolveProductImageUrl(rawImage.src);
    if (rawImage.image?.url) return rawImage.image.url;
    if (rawImage.id) return `https://static.wixstatic.com/media/${rawImage.id}`;
  }

  return null;
}

/**
 * Extracts all gallery media images from a Wix product.
 * @param {object} rawProduct
 * @returns {Array<string>}
 */
export function extractProductGallery(rawProduct) {
  if (!rawProduct?.media?.items) {
    const main = resolveProductImageUrl(rawProduct?.media?.mainMedia?.image);
    return main ? [main] : [];
  }

  const images = [];
  for (const item of rawProduct.media.items) {
    const url = resolveProductImageUrl(item.image?.url || item.image || item.src);
    if (url && !images.includes(url)) {
      images.push(url);
    }
  }

  if (images.length === 0) {
    const fallback = resolveProductImageUrl(rawProduct.media?.mainMedia?.image);
    if (fallback) images.push(fallback);
  }

  return images;
}

/**
 * Standardizes a Wix Stores product object for the React frontend.
 * @param {object} raw
 * @returns {object}
 */
export function formatProduct(raw) {
  if (!raw) return null;

  const gallery = extractProductGallery(raw);
  const mainImage = gallery[0] || resolveProductImageUrl(raw.media?.mainMedia?.image) || null;

  const formattedPrice =
    raw.price?.formatted?.price ||
    raw.priceData?.formatted?.price ||
    (raw.price?.price ? `${raw.price.currency || ''} ${raw.price.price}` : 'Price on request');

  const formattedDiscountedPrice =
    raw.price?.formatted?.discountedPrice ||
    raw.priceData?.formatted?.discountedPrice ||
    null;

  const hasDiscount = Boolean(
    raw.discount?.value ||
    (raw.price?.price && raw.price?.discountedPrice && raw.price.discountedPrice < raw.price.price)
  );

  const cleanDescription = (raw.description || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const inStock = raw.stock?.inventoryStatus !== 'OUT_OF_STOCK' && raw.stock?.inStock !== false;

  return {
    id: raw._id || raw.id,
    name: raw.name || 'Untitled Product',
    slug: raw.slug || '',
    description: cleanDescription || 'Premium product designed with high quality materials.',
    rawDescription: raw.description || '',
    formattedPrice,
    formattedDiscountedPrice,
    hasDiscount,
    numericPrice: raw.price?.price ?? raw.priceData?.price ?? 0,
    currency: raw.price?.currency || raw.priceData?.currency || 'BDT',
    mainImage,
    gallery,
    ribbon: raw.ribbon || '',
    brand: raw.brand || '',
    sku: raw.sku || '',
    productType: raw.productType || 'physical',
    inStock,
    inventoryStatus: raw.stock?.inventoryStatus || (inStock ? 'IN_STOCK' : 'OUT_OF_STOCK'),
    options: raw.productOptions || [],
    variants: raw.variants || [],
    defaultVariantId: raw.variants?.[0]?._id || null,
    raw,
  };
}

/**
 * Dynamically queries products from Wix Stores using official OAuth client.
 * @param {object} [options]
 * @returns {Promise<{ products: Array<object>, total: number, rawResponse: any }>}
 */
export async function fetchProducts(options = {}) {
  const client = getWixClient();

  let query = client.products.queryProducts();

  if (options.limit) {
    query = query.limit(options.limit);
  } else {
    query = query.limit(50);
  }

  if (options.sort) {
    if (options.sort === 'price_asc') {
      query = query.ascending('price');
    } else if (options.sort === 'price_desc') {
      query = query.descending('price');
    } else if (options.sort === 'name_asc') {
      query = query.ascending('name');
    }
  }

  const result = await query.find();
  const rawList = result.items || [];
  const formatted = rawList.map(formatProduct);

  console.log(`[Wix Stores] Retrieved ${formatted.length} product(s) from catalog:`);
  formatted.forEach((p, idx) => {
    console.log(`  ${idx + 1}. "${p.name}" - ${p.formattedPrice} (Stock: ${p.inventoryStatus})`);
  });

  return {
    products: formatted,
    total: result.totalCount ?? formatted.length,
    rawResponse: result,
  };
}

/**
 * Fetches a single product by its ID.
 * @param {string} productId
 * @returns {Promise<object>}
 */
export async function fetchProductById(productId) {
  if (!productId) throw new Error('Product ID is required');

  const client = getWixClient();
  const res = await client.products.getProduct(productId);
  const raw = res.product || res;

  return formatProduct(raw);
}

/**
 * Fetches a single product by its slug.
 * @param {string} slug
 * @returns {Promise<object|null>}
 */
export async function fetchProductBySlug(slug) {
  if (!slug) throw new Error('Product slug is required');

  const client = getWixClient();
  const result = await client.products.queryProducts().eq('slug', slug).limit(1).find();

  if (result.items?.length > 0) {
    return formatProduct(result.items[0]);
  }

  return null;
}
