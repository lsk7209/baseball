// src/core/generator.ts
import prisma from '@/lib/prisma';
import { generateBaseballPost, generateDailyTopic } from './gemini';
import { calculateTrendingScore } from '@/lib/utils';

/**
 * 수집된 뉴스에 대한 AI 반응글 생성
 */
export async function generateNewsReaction(newsPostId: string): Promise<string | null> {
    // 원본 뉴스 글 조회
    const newsPost = await prisma.post.findUnique({
        where: { id: newsPostId }
    });

    if (!newsPost || newsPost.sourceType !== 'KBO_NEWS') {
        return null;
    }

    // 랜덤 페르소나 선택 (fan 또는 troll)
    const personas = await prisma.persona.findMany({
        where: { role: { in: ['fan', 'troll'] } }
    });

    if (personas.length === 0) return null;

    const persona = personas[Math.floor(Math.random() * personas.length)];

    // AI로 글 생성
    const generated = await generateBaseballPost(
        { nickname: persona.nickname, traits: persona.traits },
        newsPost.title,
        {
            title: newsPost.sourceTitle || newsPost.title,
            url: newsPost.sourceUrl || undefined,
            summary: newsPost.content || undefined
        }
    );

    // DB에 저장
    const post = await prisma.post.create({
        data: {
            title: generated.title,
            content: generated.content,
            type: 'NORMAL',
            sourceType: 'NONE',
            categorySlug: 'gossip', // 잡담 카테고리
            personaId: persona.id,
            trendingScore: calculateTrendingScore(0, 0, 0, new Date())
        }
    });

    return post.id;
}

/**
 * 일상 글 자동 생성 (뉴스가 없을 때)
 */
export async function generateDailyPost(): Promise<string | null> {
    // 랜덤 페르소나 선택
    const personas = await prisma.persona.findMany({
        where: { role: 'fan' }
    });

    if (personas.length === 0) return null;

    const persona = personas[Math.floor(Math.random() * personas.length)];
    const topic = await generateDailyTopic();

    // AI로 글 생성
    const generated = await generateBaseballPost(
        { nickname: persona.nickname, traits: persona.traits },
        topic
    );

    // DB에 저장
    const post = await prisma.post.create({
        data: {
            title: generated.title,
            content: generated.content,
            type: 'NORMAL',
            sourceType: 'NONE',
            categorySlug: 'gossip',
            personaId: persona.id,
            trendingScore: calculateTrendingScore(0, 0, 0, new Date())
        }
    });

    return post.id;
}

/**
 * 전체 생성 실행 (Cron에서 호출)
 */
export async function runGenerator(): Promise<{
    reactionsCreated: number;
    dailyCreated: number;
}> {
    let reactionsCreated = 0;
    let dailyCreated = 0;

    // 1. 최근 뉴스에 대한 반응글 생성 (아직 반응글이 없는 것만)
    const recentNews = await prisma.post.findMany({
        where: {
            sourceType: 'KBO_NEWS',
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24시간 이내
        },
        take: 5,
        orderBy: { createdAt: 'desc' }
    });

    for (const news of recentNews) {
        // 30% 확률로 반응글 생성
        if (Math.random() < 0.3) {
            const id = await generateNewsReaction(news.id);
            if (id) reactionsCreated++;
        }
    }

    // 2. 오늘 글이 5개 미만이면 일상 글 생성
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayPostCount = await prisma.post.count({
        where: { createdAt: { gte: today } }
    });

    if (todayPostCount < 5) {
        const id = await generateDailyPost();
        if (id) dailyCreated++;
    }

    console.log(`생성 완료: 반응글 ${reactionsCreated}개, 일상글 ${dailyCreated}개`);

    return { reactionsCreated, dailyCreated };
}
