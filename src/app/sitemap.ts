import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://kbo-hub.vercel.app'; // 실제 도메인으로 교체 필요

    // 정적 페이지
    const routes = [
        '',
        '/news',
        '/analysis',
        '/gossip',
        '/debate',
        '/about',
        '/privacy',
        '/terms',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // 동적 포스트 (최근 100개)
    let posts: MetadataRoute.Sitemap = [];
    try {
        const recentPosts = await prisma.post.findMany({
            take: 100,
            orderBy: { createdAt: 'desc' },
            select: { id: true, updatedAt: true },
        });

        posts = recentPosts.map((post) => ({
            url: `${baseUrl}/posts/${post.id}`,
            lastModified: post.updatedAt || new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }));
    } catch (error) {
        console.error('Sitemap generation error:', error);
    }

    return [...routes, ...posts];
}
