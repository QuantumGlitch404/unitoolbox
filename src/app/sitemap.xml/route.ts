// src/app/sitemap.xml/route.ts
import { tools } from '@/lib/tools';

const URL = 'https://unitoolbox.vercel.app';

function generateSiteMap() {
  const staticPages = [
    '', // Homepage
    '/tools',
    '/support',
    '/support/faq',
    '/support/contact',
  ];

  const toolPages = tools.map(tool => tool.href);

  const allPages = [...staticPages, ...toolPages];

  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${allPages
       .map(path => {
         return `
       <url>
           <loc>${`${URL}${path}`}</loc>
           <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
           <changefreq>weekly</changefreq>
           <priority>${path === '' ? '1.0' : path.startsWith('/tools/') ? '0.8' : '0.7'}</priority>
       </url>
     `;
       })
       .join('')}
   </urlset>
 `;
}

export async function GET() {
  const body = generateSiteMap();
  return new Response(body, {
    status: 200,
    headers: {
      'Cache-control': 'public, s-maxage=86400, stale-while-revalidate',
      'content-type': 'application/xml',
    },
  });
}
