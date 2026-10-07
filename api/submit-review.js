import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { items } from '@wix/data';

/**
 * Vercel Serverless Function: Secure Review Submission to Wix CMS
 * 
 * SECURITY:
 * Runs strictly server-side. WIX_API_KEY is never exposed to the client.
 */
export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Parse body if string
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // fallback
      }
    }
    body = body || {};

    const { name, role, company, rating, message, review, image } = body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const reviewText = (review || message || '').trim();
    if (!reviewText) {
      return res.status(400).json({ error: 'Review text is required' });
    }

    const apiKey = process.env.WIX_API_KEY;
    const siteId = process.env.WIX_SITE_ID || '1c6ae045-e46e-43d4-adfb-3beb1beaac3e';
    const accountId = process.env.WIX_ACCOUNT_ID || '456351de-45e0-479b-829a-e50e747b2bec';

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Server configuration error: WIX_API_KEY is not configured on server environment' 
      });
    }

    const adminClient = createClient({
      modules: { items },
      auth: ApiKeyStrategy({
        apiKey,
        siteId,
        accountId
      })
    });

    const itemData = {
      name: name.trim(),
      role: (role || 'Client').trim(),
      company: (company || '').trim(),
      message: reviewText,
      rating: Number(rating) || 5,
      image: image && image.trim() ? image.trim() : undefined
    };

    const inserted = await adminClient.items.insert('testimonials', itemData);

    return res.status(200).json({
      success: true,
      message: 'Review successfully submitted to Wix CMS',
      item: inserted
    });
  } catch (err) {
    console.error('[API submit-review error]:', err);
    return res.status(500).json({
      error: err.message || 'Failed to submit review to Wix CMS'
    });
  }
}
