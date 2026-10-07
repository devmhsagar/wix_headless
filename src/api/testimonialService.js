import { media } from '@wix/sdk';
import { getWixClient } from './wixClient.js';

/**
 * Resolves Wix or web media URLs for testimonial avatars.
 * @param {string|object} rawImage
 * @returns {string|null}
 */
export function resolveTestimonialImage(rawImage) {
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
    if (rawImage.src) return resolveTestimonialImage(rawImage.src);
    if (rawImage.id) return `https://static.wixstatic.com/media/${rawImage.id}`;
  }

  return null;
}

/**
 * Normalizes a raw Wix CMS testimonial data item.
 * @param {object} raw
 * @returns {object}
 */
export function formatTestimonial(raw) {
  if (!raw) return null;

  return {
    id: raw._id || raw.id || String(Math.random()),
    name: raw.name || 'Anonymous Client',
    role: raw.role || '',
    company: raw.company || '',
    message: raw.message || '',
    rating: typeof raw.rating === 'number' ? raw.rating : 5,
    image: resolveTestimonialImage(raw.image),
    createdAt: raw._createdDate || null,
    raw,
  };
}

/**
 * Dynamically retrieves published testimonials from Wix CMS via Wix Headless Data API.
 * Uses OAuthStrategy from the client side without Admin secrets.
 * @returns {Promise<{ testimonials: Array<object>, total: number, rawResponse: any }>}
 */
export async function fetchPublishedTestimonials() {
  const client = getWixClient();

  const queryResult = await client.items.query('testimonials').find();
  const rawList = queryResult?.items || [];
  const formatted = rawList.map(formatTestimonial);

  console.log(`[Wix CMS] Retrieved ${formatted.length} published testimonial(s):`);
  formatted.forEach((t, idx) => {
    console.log(`  ${idx + 1}. ${t.name} (${t.role} at ${t.company}) - Rating: ${t.rating}★`);
  });

  return {
    testimonials: formatted,
    total: queryResult?.totalCount ?? formatted.length,
    rawResponse: queryResult,
  };
}

/**
 * Submits a new client review to Wix CMS via secure server-side API.
 * The Admin API key is stored and executed exclusively on the server.
 * @param {{ name: string, role?: string, company?: string, rating: number, message: string, image?: string }} reviewData
 * @returns {Promise<{ success: boolean, item?: any, message?: string }>}
 */
export async function submitTestimonialReview(reviewData) {
  const response = await fetch('/api/submit-review', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reviewData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    throw new Error(data.error || data.message || 'Failed to submit review to Wix CMS.');
  }

  return data;
}
