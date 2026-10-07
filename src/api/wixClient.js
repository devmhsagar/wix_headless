import { createClient, OAuthStrategy } from '@wix/sdk';
import { posts } from '@wix/blog';
import { items } from '@wix/data';
import { products } from '@wix/stores';
import { currentCart } from '@wix/ecom';
import { redirects } from '@wix/redirects';
import { services, availabilityTimeSlots, bookings } from '@wix/bookings';
import { forms, submissions } from '@wix/forms';

/**
 * Storage key for optional browser-based client ID override during testing.
 */
const STORAGE_OVERRIDE_KEY = 'wix_headless_client_id_override';

// Stale cache & old project purge
if (typeof window !== 'undefined') {
  try {
    const override = localStorage.getItem(STORAGE_OVERRIDE_KEY);
    if (override && (override.includes('94f8c76c') || override !== (import.meta.env?.VITE_WIX_CLIENT_ID || ''))) {
      localStorage.removeItem(STORAGE_OVERRIDE_KEY);
    }
    // Remove any cached OAuth tokens or stale session artifacts from old project
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.includes('94f8c76c') || k.includes('wix_client_auth') || k.includes('wix_oauth'))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    sessionStorage.clear();
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

/**
 * Retrieve the current active Wix Client ID.
 * Priority:
 * 1. Runtime override from UI/localStorage (for instant testing without rebuild)
 * 2. Environment variable VITE_WIX_CLIENT_ID
 */
export function getWixClientId() {
  const envId =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_WIX_CLIENT_ID) ||
    (typeof process !== 'undefined' && process.env && process.env.VITE_WIX_CLIENT_ID) ||
    '';

  if (typeof window !== 'undefined') {
    const localOverride = localStorage.getItem(STORAGE_OVERRIDE_KEY);
    if (localOverride && localOverride.trim() && !localOverride.includes('94f8c76c')) {
      return localOverride.trim();
    }
  }

  if (envId && envId.trim()) {
    return envId.trim();
  }

  return '';
}

/**
 * Save or clear a client ID override from the browser.
 * @param {string|null} clientId 
 */
export function setWixClientIdOverride(clientId) {
  if (typeof window === 'undefined') return;

  if (clientId && clientId.trim()) {
    localStorage.setItem(STORAGE_OVERRIDE_KEY, clientId.trim());
  } else {
    localStorage.removeItem(STORAGE_OVERRIDE_KEY);
  }
}

/**
 * Check whether a Wix Client ID is currently configured.
 */
export function isWixConfigured() {
  const id = getWixClientId();
  return Boolean(id && id.length > 5);
}

/**
 * Cached client instance to avoid recreating unless ID changes.
 */
let cachedClient = null;
let cachedClientId = null;

/**
 * Create or return the configured Wix Client instance.
 * @param {string} [explicitClientId]
 */
export function getWixClient(explicitClientId = null) {
  const clientId = explicitClientId || getWixClientId();

  if (!clientId) {
    throw new Error(
      'Wix Client ID is not configured. Please define VITE_WIX_CLIENT_ID in your .env file or enter your Client ID in the configuration banner.'
    );
  }

  if (cachedClient && cachedClientId === clientId) {
    return cachedClient;
  }

  const client = createClient({
    modules: { posts, items, products, currentCart, redirects, services, availabilityTimeSlots, bookings, forms, submissions },
    auth: OAuthStrategy({
      clientId,
    }),
  });

  cachedClient = client;
  cachedClientId = clientId;

  return client;
}
