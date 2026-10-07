import { createClient, OAuthStrategy, ApiKeyStrategy } from '@wix/sdk';
import { services, availabilityTimeSlots, bookings } from '@wix/bookings';
import fs from 'fs';

function loadEnv() {
  const env = {};
  if (fs.existsSync('.env')) {
    const lines = fs.readFileSync('.env', 'utf8').split('\n');
    for (const l of lines) {
      const idx = l.indexOf('=');
      if (idx > 0) {
        const k = l.slice(0, idx).trim();
        const v = l.slice(idx + 1).trim();
        env[k] = v;
      }
    }
  }
  return env;
}

const env = loadEnv();
const CLIENT_ID = env.VITE_WIX_CLIENT_ID || '1fe2dd83-1c28-450a-8f3a-9ee727449674';
const API_KEY = env.WIX_API_KEY;
const SITE_ID = env.WIX_SITE_ID || '1c6ae045-e46e-43d4-adfb-3beb1beaac3e';
const ACCOUNT_ID = env.WIX_ACCOUNT_ID || '456351de-45e0-479b-829a-e50e747b2bec';

async function installBookingsApp() {
  console.log('[Wix Bookings] Checking / Provisioning Wix Bookings app via installer API...');
  try {
    const res = await fetch('https://www.wixapis.com/apps-installer-service/v1/app-instance/install', {
      method: 'POST',
      headers: {
        'Authorization': API_KEY,
        'wix-site-id': SITE_ID,
        'wix-account-id': ACCOUNT_ID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appDefId: '13d21c63-b5ec-5912-8397-c3a5ddb27a97', // Wix Bookings App ID
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      console.log('[Wix Bookings] Wix Bookings app successfully installed/verified!');
    } else {
      console.log('[Wix Bookings] Installer response:', data?.message || res.status);
    }
  } catch (err) {
    console.warn('[Wix Bookings] Installer warning:', err.message);
  }
}

async function run() {
  console.log('--- Inspecting Wix Bookings Services ---');
  await installBookingsApp();

  const oauthClient = createClient({
    modules: { services, availabilityTimeSlots, bookings },
    auth: OAuthStrategy({ clientId: CLIENT_ID }),
  });

  const adminClient = createClient({
    modules: { services, availabilityTimeSlots, bookings },
    auth: ApiKeyStrategy({
      apiKey: API_KEY,
      siteId: SITE_ID,
      accountId: ACCOUNT_ID,
    }),
  });

  // 1. Query existing services
  console.log('\n[1] Querying existing booking services via OAuth...');
  let existingServices = [];
  try {
    const res = await oauthClient.services.queryServices().find();
    existingServices = res.items || [];
    console.log(`[OAuth] Found ${existingServices.length} booking service(s):`);
    existingServices.forEach((s, idx) => {
      console.log(`  ${idx + 1}. "${s.name}" | Duration: ${s.schedule?.duration?.minutes || s.schedule?.duration}m | Type: ${s.type} | ID: ${s._id}`);
    });
  } catch (oauthErr) {
    console.error('[OAuth Query Error]:', oauthErr.message);
  }

  // 2. If no services exist, provision realistic services using Admin API
  if (existingServices.length === 0 && API_KEY) {
    console.log('\n[2] No services found. Provisioning 3 realistic test booking services via Admin API...');
    const TEST_SERVICES = [
      {
        name: 'Technical Architecture Consultation',
        tagLine: '1-on-1 expert deep dive into Headless web development',
        description: 'Comprehensive review of your system architecture, API design, scalability bottlenecks, and Wix Headless integrations.',
        type: 'INDIVIDUAL',
        schedule: {
          duration: { minutes: 45 },
          availabilityConstraints: {
            durations: [{ minutes: 45 }],
          },
        },
        payment: {
          rateType: 'FIXED',
          fixed: {
            price: {
              value: '120.00',
              currency: 'USD',
            },
          },
        },
      },
      {
        name: 'Full Stack Code Review',
        tagLine: 'Thorough review of code quality, security, and performance',
        description: 'Detailed analysis of your React components, API services, security configurations, and performance optimization.',
        type: 'INDIVIDUAL',
        schedule: {
          duration: { minutes: 60 },
          availabilityConstraints: {
            durations: [{ minutes: 60 }],
          },
        },
        payment: {
          rateType: 'FIXED',
          fixed: {
            price: {
              value: '180.00',
              currency: 'USD',
            },
          },
        },
      },
      {
        name: 'Wix Headless Strategy Workshop',
        tagLine: 'Strategy session for product managers & engineering leads',
        description: 'Strategic planning session covering headless CMS, eCommerce integration, multi-channel deployment, and best practices.',
        type: 'INDIVIDUAL',
        schedule: {
          duration: { minutes: 90 },
          availabilityConstraints: {
            durations: [{ minutes: 90 }],
          },
        },
        payment: {
          rateType: 'FIXED',
          fixed: {
            price: {
              value: '250.00',
              currency: 'USD',
            },
          },
        },
      },
    ];

    for (const serviceData of TEST_SERVICES) {
      try {
        console.log(`Creating service: "${serviceData.name}"...`);
        const created = await adminClient.services.createService({
          service: serviceData,
        });
        console.log(`  + Created service: ${created.service?._id || created._id}`);
      } catch (createErr) {
        console.error(`  - Failed to create "${serviceData.name}":`, createErr.message, createErr?.details || '');
      }
    }

    // Re-query
    const refetched = await oauthClient.services.queryServices().find();
    console.log(`[After Creation] Now found ${refetched.items?.length || 0} booking service(s).`);
  }

  // 3. Test Availability / Slots
  console.log('\n[3] Testing Availability Time Slots query...');
  const activeServices = (await oauthClient.services.queryServices().find()).items || [];
  if (activeServices.length > 0) {
    const firstService = activeServices[0];
    const now = new Date();
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    try {
      const slotsRes = await oauthClient.availabilityTimeSlots.getServiceAvailability(
        firstService._id,
        {
          from: now.toISOString(),
          to: nextWeek.toISOString(),
        }
      );
      console.log(`Found ${slotsRes.slots?.length || 0} time slot(s) for "${firstService.name}"`);
    } catch (slotErr) {
      console.log('Slot check note (normal if calendar schedules need business hours configured):', slotErr.message);
    }
  }
}

run().catch(console.error);
