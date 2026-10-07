import { media } from '@wix/sdk';
import { getWixClient } from './wixClient.js';

/**
 * Resolves Wix media URIs (e.g. "wix:image://v1/...") to fully qualified public CDN URLs.
 * @param {string|object} rawImage
 * @returns {string|null}
 */
export function resolveWixImageUrl(rawImage) {
  if (!rawImage) return null;

  // If already a standard HTTP/HTTPS URL
  if (typeof rawImage === 'string' && (rawImage.startsWith('http://') || rawImage.startsWith('https://'))) {
    return rawImage;
  }

  // If string Wix media URI
  if (typeof rawImage === 'string') {
    try {
      // Use official Wix SDK media helper
      const resolved = media.getImageUrl(rawImage);
      if (resolved && resolved.url) {
        return resolved.url;
      }
    } catch {
      // Fallback manual parser for wix:image://v1/{uri}/{filename}
      if (rawImage.startsWith('wix:image://v1/')) {
        const withoutPrefix = rawImage.replace('wix:image://v1/', '');
        const uri = withoutPrefix.split('/')[0].split('#')[0];
        return `https://static.wixstatic.com/media/${uri}`;
      }
    }
  }

  // If object with url or src
  if (typeof rawImage === 'object') {
    if (rawImage.url) return rawImage.url;
    if (rawImage.src) return resolveWixImageUrl(rawImage.src);
    if (rawImage.id) return `https://static.wixstatic.com/media/${rawImage.id}`;
  }

  return null;
}

/**
 * Extracts the featured or cover image from a Wix Post object.
 * Checks multiple Wix post fields where images can be stored.
 * @param {object} post 
 * @returns {string|null}
 */
export function extractPostImageUrl(post) {
  if (!post) return null;

  // 1. Post media -> wixMedia -> image
  const wixMediaImage = post.media?.wixMedia?.image;
  if (wixMediaImage) {
    const resolved = resolveWixImageUrl(wixMediaImage);
    if (resolved) return resolved;
  }

  // 2. Post heroImage
  if (post.heroImage) {
    const resolved = resolveWixImageUrl(post.heroImage);
    if (resolved) return resolved;
  }

  // 3. Post media -> embedMedia -> thumbnail -> url
  const embedThumbnail = post.media?.embedMedia?.thumbnail?.url;
  if (embedThumbnail) {
    return embedThumbnail;
  }

  // 4. Cover image fallback if provided
  if (post.coverImage) {
    const resolved = resolveWixImageUrl(post.coverImage);
    if (resolved) return resolved;
  }

  return null;
}

/**
 * Standardizes a Wix post object for the React frontend.
 * @param {object} rawPost 
 * @returns {object}
 */
export function formatPost(rawPost) {
  if (!rawPost) return null;

  const rawDate = rawPost.firstPublishedDate || rawPost.lastPublishedDate;
  let formattedDate = 'Recently published';
  let isoDate = null;

  if (rawDate) {
    try {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        isoDate = d.toISOString();
      }
    } catch {
      // ignore date parse fallback
    }
  }

  // Clean excerpt or fallback to first characters of contentText
  let excerpt = rawPost.excerpt?.trim();
  if (!excerpt && rawPost.contentText) {
    const plain = rawPost.contentText.replace(/\s+/g, ' ').trim();
    excerpt = plain.length > 160 ? `${plain.slice(0, 157)}...` : plain;
  }

  return {
    id: rawPost._id || rawPost.id || String(Math.random()),
    title: rawPost.title || 'Untitled Post',
    excerpt: excerpt || 'No excerpt provided for this post.',
    contentText: rawPost.contentText || '',
    publishedDate: formattedDate,
    isoDate,
    featuredImage: extractPostImageUrl(rawPost),
    slug: rawPost.slug || '',
    minutesToRead: rawPost.minutesToRead || 1,
    url: rawPost.url || '',
    categoryIds: rawPost.categoryIds || [],
    tagIds: rawPost.tagIds || [],
    hasUnpublishedChanges: Boolean(rawPost.hasUnpublishedChanges),
    raw: rawPost,
  };
}

/**
 * Fetches published blog posts dynamically from Wix using the official SDK.
 * @param {object} [options]
 * @returns {Promise<{ posts: Array<object>, total: number, rawResponse: any }>}
 */
export async function fetchPublishedPosts(options = {}) {
  const client = getWixClient();

  // Try listPosts first with fieldsets for URL and content
  try {
    const listResult = await client.posts.listPosts({
      fieldsets: ['URL', 'CONTENT_TEXT', 'RICH_CONTENT'],
      sort: 'FEED',
      paging: {
        limit: options.limit || 50,
        offset: options.offset || 0,
      },
    });

    const rawList = listResult?.posts || listResult?.items || [];
    const formatted = rawList.map(formatPost);

    // Requirement 8: Log the number and titles of posts returned from Wix
    console.log(`[Wix Headless] Retrieved ${formatted.length} published post(s) via listPosts:`);
    formatted.forEach((p, idx) => {
      console.log(`  ${idx + 1}. "${p.title}" (Published: ${p.publishedDate})`);
    });

    return {
      posts: formatted,
      total: listResult?.metaData?.total ?? formatted.length,
      rawResponse: listResult,
    };
  } catch (listError) {
    // If listPosts encounters an issue, fallback to queryPosts().find()
    try {
      const queryBuilder = client.posts.queryPosts({
        fieldsets: ['URL', 'CONTENT_TEXT', 'RICH_CONTENT'],
      });
      const queryResult = await queryBuilder.find();
      const rawItems = queryResult?.items || [];
      const formatted = rawItems.map(formatPost);

      console.log(`[Wix Headless] Fallback queryPosts retrieved ${formatted.length} post(s):`);
      formatted.forEach((p, idx) => {
        console.log(`  ${idx + 1}. "${p.title}" (Published: ${p.publishedDate})`);
      });

      return {
        posts: formatted,
        total: queryResult?.length ?? formatted.length,
        rawResponse: queryResult,
      };
    } catch {
      // Re-throw the original error to display in the UI error state
      throw listError;
    }
  }
}

/**
 * Fetches a single blog post by its Wix post ID.
 * @param {string} postId 
 */
export async function fetchPostById(postId) {
  if (!postId) throw new Error('Post ID is required');

  const client = getWixClient();
  const rawPost = await client.posts.getPost(postId, {
    fieldsets: ['URL', 'CONTENT_TEXT', 'RICH_CONTENT'],
  });

  return formatPost(rawPost);
}

/**
 * Fetches a single blog post by its slug.
 * @param {string} slug 
 */
export async function fetchPostBySlug(slug) {
  if (!slug) throw new Error('Post slug is required');

  const client = getWixClient();
  const response = await client.posts.getPostBySlug(slug);
  const rawPost = response?.post || response;

  return formatPost(rawPost);
}
