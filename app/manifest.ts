import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MockOffer — AI coding interview practice',
    short_name: 'MockOffer',
    description:
      'AI-powered mock coding interviews that challenge your problem solving, analyze your code, and show you exactly how to improve.',
    start_url: '/',
    display: 'standalone',
    background_color: '#08090a',
    theme_color: '#08090a',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
