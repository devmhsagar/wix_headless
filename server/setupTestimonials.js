/**
 * Server-Side Wix CMS Testimonials Provisioning Script
 * 
 * SECURITY RULE:
 * This script runs exclusively in a trusted server/Node environment.
 * The Admin API Key is loaded from process.env.WIX_API_KEY and is NEVER sent to the client.
 */

import { createClient, ApiKeyStrategy, OAuthStrategy } from '@wix/sdk';
import { collections, items } from '@wix/data';
import fs from 'fs';
import path from 'path';

// Load .env manually if not already populated
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const WIX_API_KEY = process.env.WIX_API_KEY;
const WIX_CLIENT_ID = process.env.WIX_CLIENT_ID || process.env.VITE_WIX_CLIENT_ID;

if (!WIX_API_KEY) {
  console.error('[Error] WIX_API_KEY is not defined in .env.');
  process.exit(1);
}

// Extract siteId and accountId from credentials
async function resolveSiteAndAccount() {
  let siteId = process.env.WIX_SITE_ID;
  let accountId = process.env.WIX_ACCOUNT_ID;

  // Try decoding from API key JWT payload
  if (!accountId && WIX_API_KEY) {
    try {
      const parts = WIX_API_KEY.split('.');
      const payloadIndex = parts.length === 5 ? 2 : 1;
      const payload = JSON.parse(Buffer.from(parts[payloadIndex], 'base64').toString('utf8'));
      const data = typeof payload.data === 'string' ? JSON.parse(payload.data) : payload.data;
      if (data?.tenant?.id) {
        accountId = data.tenant.id;
      }
    } catch {
      // ignore
    }
  }

  // Resolve siteId from OAuthStrategy instance if available
  if (!siteId && WIX_CLIENT_ID) {
    try {
      const oauth = OAuthStrategy({ clientId: WIX_CLIENT_ID });
      const authHeader = await oauth.getAuthHeaders();
      const token = authHeader.headers?.Authorization || '';
      const parts = token.split('.');
      if (parts.length >= 4) {
        const payload = JSON.parse(Buffer.from(parts[3], 'base64').toString('utf8'));
        const data = typeof payload.data === 'string' ? JSON.parse(payload.data) : payload.data;
        if (data?.instance?.metaSiteId) {
          siteId = data.instance.metaSiteId;
        }
        if (!accountId && data?.instance?.siteOwnerId) {
          accountId = data.instance.siteOwnerId;
        }
      }
    } catch {
      // ignore
    }
  }

  // Fallbacks if known from site
  siteId = siteId || '1c6ae045-e46e-43d4-adfb-3beb1beaac3e';
  accountId = accountId || '456351de-45e0-479b-829a-e50e747b2bec';

  return { siteId, accountId };
}

export async function getAdminClient() {
  const { siteId, accountId } = await resolveSiteAndAccount();

  return createClient({
    modules: { collections, items },
    auth: ApiKeyStrategy({
      apiKey: WIX_API_KEY,
      siteId,
      accountId,
    }),
  });
}

const TEST_TESTIMONIALS = [
  {
    name: 'John Smith',
    role: 'CEO',
    company: 'ABC Technologies',
    message: 'Excellent service and great communication.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Sarah Johnson',
    role: 'Founder',
    company: 'Creative Labs',
    message: 'The entire development process was smooth and professional.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Michael Brown',
    role: 'Product Manager',
    company: 'Startup Labs',
    message: 'Great attention to detail and very reliable development support.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
];

async function ensureCmsAppInstalled(siteId, accountId) {
  try {
    const res = await fetch('https://www.wixapis.com/apps-installer-service/v1/app-instance/install', {
      method: 'POST',
      headers: {
        'Authorization': WIX_API_KEY,
        'wix-site-id': siteId,
        'wix-account-id': accountId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appDefId: 'e593b0bd-b783-45b8-97c2-873d42aacaf4',
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      console.log('[Wix Admin] Wix CMS app installed/verified programmatically.');
    } else if (data?.message?.toLowerCase().includes('already') || res.status === 409) {
      console.log('[Wix Admin] Wix CMS app is already installed.');
    }
  } catch (err) {
    console.warn('[Wix Admin] CMS install check warning:', err.message);
  }
}

export async function setupTestimonials() {
  console.log('[Wix Admin] Initializing server-side CMS setup...');
  const { siteId, accountId } = await resolveSiteAndAccount();
  console.log(`[Wix Admin] Target site: ${siteId} | Account: ${accountId}`);

  // Ensure CMS app is provisioned
  await ensureCmsAppInstalled(siteId, accountId);

  const adminClient = await getAdminClient();

  // 1. Verify or create Testimonials collection
  let collectionExists = false;
  try {
    const existing = await adminClient.collections.getDataCollection('testimonials');
    if (existing && (existing._id || existing.id)) {
      collectionExists = true;
      console.log(`[Wix Admin] Collection 'testimonials' already exists. Reusing it.`);
    }
  } catch (err) {
    console.log(`[Wix Admin] getDataCollection check note: ${err?.message || err}`);
    if (err?.message?.includes('WDE0110')) {
      console.log('[Wix Admin] Provisioning CMS app via API...');
      await ensureCmsAppInstalled(siteId, accountId);
    }
  }

  if (!collectionExists) {
    console.log('[Wix Admin] Creating collection "testimonials"...');
    try {
      const created = await adminClient.collections.createDataCollection({
        _id: 'testimonials',
        displayName: 'Testimonials',
        fields: [
          { key: 'name', type: 'TEXT' },
          { key: 'role', type: 'TEXT' },
          { key: 'company', type: 'TEXT' },
          { key: 'message', type: 'TEXT' },
          { key: 'rating', type: 'NUMBER' },
          { key: 'image', type: 'IMAGE' },
        ],
        permissions: {
          read: 'ANYONE',
          insert: 'ADMIN',
          update: 'ADMIN',
          remove: 'ADMIN',
        },
      });
      console.log(`[Wix Admin] Successfully created collection: ${created._id || created.id}`);
    } catch (createErr) {
      console.log(`[Wix Admin] createDataCollection response: ${createErr?.message}`);
      if (createErr?.message?.toLowerCase().includes('already') || createErr?.details?.applicationError?.code === 'ALREADY_EXISTS') {
        console.log('[Wix Admin] Collection already exists. Continuing...');
      } else {
        throw createErr;
      }
    }
  }

  // 2. Check and seed test records
  console.log('[Wix Admin] Checking existing records in "testimonials"...');
  try {
    const queryResult = await adminClient.items.query('testimonials').find();
    const currentCount = queryResult?.items?.length || 0;
    console.log(`[Wix Admin] Found ${currentCount} existing testimonial record(s).`);

    if (currentCount === 0) {
      console.log('[Wix Admin] Seeding 3 initial test testimonials into Wix CMS...');
      for (const itemData of TEST_TESTIMONIALS) {
        const inserted = await adminClient.items.insert('testimonials', itemData);
        console.log(`  + Inserted: ${itemData.name} (${itemData.role} at ${itemData.company}) [ID: ${inserted._id}]`);
      }
      console.log('[Wix Admin] Successfully created 3 test testimonials in Wix CMS.');
    } else {
      console.log('[Wix Admin] Testimonials already present. Skipping duplicate creation.');
    }
  } catch (itemErr) {
    console.error('[Wix Admin] Error querying/inserting items:', itemErr.message);
    throw itemErr;
  }

  console.log('[Wix Admin] Setup completed successfully.');
}

// Execute directly if run as CLI script
if (process.argv[1]?.endsWith('setupTestimonials.js')) {
  setupTestimonials().catch(() => process.exit(1));
}
