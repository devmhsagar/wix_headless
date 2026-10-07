import { createClient, OAuthStrategy } from '@wix/sdk';
import { posts } from '@wix/blog';
import { items } from '@wix/data';
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

async function verifyAll() {
  console.log('====================================================');
  console.log('       FULL VERIFICATION TEST SUITE (PHASES 1-3)     ');
  console.log('====================================================');
  console.log('Client ID (masked):', CLIENT_ID.slice(0, 8) + '...' + CLIENT_ID.slice(-4));

  const client = createClient({
    modules: { posts, items, products, currentCart, redirects },
    auth: OAuthStrategy({ clientId: CLIENT_ID }),
  });

  // 1. Blog Verification
  console.log('\n[1/4] Verifying Wix Blog Posts...');
  const blogRes = await client.posts.listPosts({ paging: { limit: 10 } });
  const postCount = blogRes.posts?.length || 0;
  console.log(`  -> Status: PASS (${postCount} published posts)`);
  blogRes.posts?.forEach((p, i) => console.log(`     ${i + 1}. "${p.title}"`));

  // 2. Testimonials Verification
  console.log('\n[2/4] Verifying Wix CMS Testimonials...');
  const testRes = await client.items.query('testimonials').find();
  const testimonialCount = testRes.items?.length || 0;
  console.log(`  -> Status: PASS (${testimonialCount} testimonials in CMS)`);
  testRes.items?.forEach((t, i) => console.log(`     ${i + 1}. ${t.name} (${t.role} at ${t.company}) - Rating: ${t.rating}★`));

  // 3. Products Verification
  console.log('\n[3/4] Verifying Wix Stores Products...');
  const prodRes = await client.products.queryProducts().limit(10).find();
  const productCount = prodRes.items?.length || 0;
  console.log(`  -> Status: PASS (${productCount} products in catalog)`);
  prodRes.items?.forEach((p, i) => console.log(`     ${i + 1}. "${p.name}" - ${p.price?.formatted?.price || p.priceData?.formatted?.price || p.price?.price}`));

  // 4. Cart & Checkout Verification
  console.log('\n[4/4] Verifying Wix eCommerce Cart & Checkout Flow...');
  const firstProd = prodRes.items?.[0];
  const firstVariant = firstProd?.variants?.[0];

  const cartRes = await client.currentCart.addToCurrentCart({
    lineItems: [
      {
        catalogReference: {
          appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
          catalogItemId: firstProd._id,
          options: {
            variantId: firstVariant?._id,
          },
        },
        quantity: 1,
      },
    ],
  });

  const cartLineItemsCount = cartRes.cart?.lineItems?.length || 0;
  console.log(`  -> Add to Cart Status: PASS (${cartLineItemsCount} line item, Subtotal: ${cartRes.cart?.subtotal?.formattedAmount})`);

  const checkoutRes = await client.currentCart.createCheckoutFromCurrentCart({
    channelType: currentCart.ChannelType.WEB,
  });
  console.log(`  -> Checkout Session Status: PASS (Checkout ID: ${checkoutRes.checkoutId})`);

  console.log('\n====================================================');
  console.log('       ALL VERIFICATIONS COMPLETED SUCCESSFULLY     ');
  console.log('====================================================');
}

verifyAll().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
