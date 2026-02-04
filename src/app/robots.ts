import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://kbo-hub.vercel.app'; // 실제 도메인으로 교체 필요

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/admin/', '/write/success'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
