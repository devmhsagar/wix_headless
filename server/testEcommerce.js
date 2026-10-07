import { createClient, OAuthStrategy, ApiKeyStrategy } from '@wix/sdk';
import { products } from '@wix/stores';
import { currentCart } from '@wix/ecom';
import { redirects } from '@wix/redirects';
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

async function run() {
  console.log('[Test] Testing Wix Stores with OAuthStrategy (Client ID: ' + CLIENT_ID.slice(0, 8) + '...)...');
  const client = createClient({
    modules: { products, currentCart, redirects },
    auth: OAuthStrategy({ clientId: CLIENT_ID }),
  });

  // 1. Query products
  const productRes = await client.products.queryProducts().limit(10).find();
  console.log('[Test] Products found:', productRes.items?.length);
  for (const [i, p] of (productRes.items || []).entries()) {
    console.log(`  ${i + 1}. "${p.name}" - ${p.price?.formatted?.price || p.priceData?.price || p.price?.price} (ID: ${p._id})`);
  }

  // 2. Test Cart functionality
  console.log('\n[Test] Testing currentCart API with OAuthStrategy...');
  try {
    const cart = await client.currentCart.getCurrentCart();
    console.log('[Test] Current cart retrieved. Line items:', cart.lineItems?.length || 0);
  } catch (err) {
    console.log('[Test] Current cart check (normal if no active cart session):', err.message);
  }

  // Test adding an item to currentCart
  if (productRes.items && productRes.items.length > 0) {
    const firstProduct = productRes.items[0];
    try {
      console.log(`[Test] Attempting addToCurrentCart with product "${firstProduct.name}"...`);
      const updatedCart = await client.currentCart.addToCurrentCart({
        lineItems: [
          {
            catalogReference: {
              appId: '1380b703-e342-4b58-80e4-5944cc4f4d9e', // Stores catalog appId
              catalogItemId: firstProduct._id,
            },
            quantity: 1,
          },
        ],
      });
      console.log('[Test] Item successfully added to cart! Cart ID:', updatedCart.cart?._id, 'Items count:', updatedCart.cart?.lineItems?.length);

      // Test createCheckoutFromCurrentCart
      console.log('\n[Test] Testing checkout redirect creation...');
      const checkout = await client.currentCart.createCheckoutFromCurrentCart({
        channelType: currentCart.ChannelType.WEB,
      });
      console.log('[Test] Checkout created! Checkout ID:', checkout.checkoutId);

      // Test redirects.createRedirectSession
      if (checkout.checkoutId) {
        const redirectSession = await client.redirects.createRedirectSession({
          ecomCheckout: { checkoutId: checkout.checkoutId },
          callbacks: {
            postFlowUrl: 'http://localhost:5173/products',
            thankYouPageUrl: 'http://localhost:5173/products?status=success',
          },
        });
        console.log('[Test] Redirect session URL successfully generated:', redirectSession.redirectSession?.fullUrl);
      }
    } catch (cartErr) {
      console.log('[Test] Cart/Checkout test note:', cartErr.message, cartErr.details || '');
    }
  }
}

run().catch(console.error);
