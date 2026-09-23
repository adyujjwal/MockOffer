import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mockoffer.live';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Keep authenticated app surfaces and API out of the index.
      disallow: ['/dashboard', '/interview', '/api/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
