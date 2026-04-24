import type { APIRoute } from 'astro';
import { services } from '../data/services';
import { siteConfig } from '../data/site';

const staticPages = ['/', '/uslugi', '/kejsy', '/ceny', '/o-studii', '/faq', '/kontakty', '/politika-konfidencialnosti'];
const urls = [...staticPages, ...services.map((service) => `/uslugi/${service.slug}`)];

const normalizeSitePath = (path: string) => {
  if (path === '/') {
    return '/';
  }

  return path.endsWith('/') ? path : `${path}/`;
};

export const GET: APIRoute = () => {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (path) => `  <url>
    <loc>${new URL(normalizeSitePath(path), siteConfig.siteUrl).toString()}</loc>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
