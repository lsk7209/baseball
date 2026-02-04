// src/core/ingestor.ts
import prisma from '@/lib/prisma';

interface NewsItem {
    title: string;
    url: string;
    summary: string;
    source: string;
}

interface HistoryEvent {
    date: string;
    title: string;
    description: string;
}

/**
 * 구글 뉴스 RSS에서 KBO 뉴스 수집
 * (RSS 파싱을 위한 간단한 구현)
 */
export async function collectNews(): Promise<NewsItem[]> {
    const RSS_URL = 'https://news.google.com/rss/search?q=KBO+야구&hl=ko&gl=KR&ceid=KR:ko';

    try {
        const response = await fetch(RSS_URL);
        const text = await response.text();

        // 간단한 RSS 파싱 (XML 파서 없이)
        const items: NewsItem[] = [];
        const itemMatches = text.match(/<item>([\s\S]*?)<\/item>/g) || [];

        for (const item of itemMatches.slice(0, 10)) { // 최대 10개
            const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
                item.match(/<title>(.*?)<\/title>/);
            const linkMatch = item.match(/<link>(.*?)<\/link>/);
            const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) ||
                item.match(/<description>(.*?)<\/description>/);
            const sourceMatch = item.match(/<source.*?>(.*?)<\/source>/);

            if (titleMatch && linkMatch) {
                items.push({
                    title: titleMatch[1].replace(/<[^>]*>/g, '').trim(),
                    url: linkMatch[1].trim(),
                    summary: descMatch ? descMatch[1].replace(/<[^>]*>/g, '').slice(0, 200) : '',
                    source: sourceMatch ? sourceMatch[1] : '구글뉴스'
                });
            }
        }

        return items;
    } catch (error) {
        console.error('뉴스 수집 실패:', error);
        return [];
    }
}

/**
 * 수집된 뉴스를 DB에 저장 (중복 체크)
 */
export async function saveNewsToDb(news: NewsItem): Promise<string | null> {
    // 중복 체크
    const existing = await prisma.post.findFirst({
        where: { sourceUrl: news.url }
    });

    if (existing) {
        return null; // 이미 존재
    }

    // 시스템 봇 페르소나 찾기
    const newsBot = await prisma.persona.findFirst({
        where: { nickname: 'KBO뉴스봇' }
    });

    if (!newsBot) return null;

    // 글 저장
    const post = await prisma.post.create({
        data: {
            title: news.title,
            content: news.summary,
            type: 'NORMAL',
            sourceType: 'KBO_NEWS',
            sourceUrl: news.url,
            sourceProvider: news.source,
            sourceTitle: news.title,
            categorySlug: 'news',
            personaId: newsBot.id,
            trendingScore: 100 // 초기 스코어
        }
    });

    return post.id;
}

/**
 * 오늘의 야구 역사 이벤트 조회
 * (샘플 데이터)
 */
export function getTodayHistoryEvents(): HistoryEvent[] {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const dateKey = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    // 샘플 역사 데이터 (실제로는 JSON 파일이나 DB에서 로드)
    const historyData: Record<string, HistoryEvent[]> = {
        '02-03': [
            {
                date: '2020-02-03',
                title: '2020 KBO 스프링캠프 시작',
                description: '각 구단이 일본 오키나와 등지에서 스프링캠프를 시작했다.'
            }
        ],
        '03-28': [
            {
                date: '2024-03-28',
                title: '2024 KBO 정규시즌 개막',
                description: '역대 최대 관중을 동원하며 시즌이 시작되었다.'
            }
        ],
        '10-26': [
            {
                date: '2023-10-26',
                title: 'LG 트윈스 29년 만의 우승',
                description: 'LG 트윈스가 한국시리즈에서 우승하며 29년 만에 정상에 올랐다.'
            }
        ]
    };

    return historyData[dateKey] || [];
}

/**
 * 역사 이벤트를 DB에 저장
 */
export async function saveHistoryEventToDb(event: HistoryEvent): Promise<string | null> {
    // 시스템 봇 페르소나 찾기
    const historyBot = await prisma.persona.findFirst({
        where: { nickname: '야구역사봇' }
    });

    if (!historyBot) return null;

    // 오늘 이미 생성했는지 체크
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.post.findFirst({
        where: {
            personaId: historyBot.id,
            sourceType: 'HISTORY_EVENT',
            createdAt: { gte: today }
        }
    });

    if (existing) return null;

    const post = await prisma.post.create({
        data: {
            title: `📅 오늘의 야구 역사: ${event.title}`,
            content: event.description,
            type: 'NORMAL',
            sourceType: 'HISTORY_EVENT',
            categorySlug: 'news',
            personaId: historyBot.id,
            trendingScore: 80
        }
    });

    return post.id;
}

/**
 * 전체 수집 실행
 */
export async function runIngestor(): Promise<{
    newsCreated: number;
    historyCreated: number;
}> {
    let newsCreated = 0;
    let historyCreated = 0;

    // 1. 뉴스 수집
    const news = await collectNews();
    for (const item of news) {
        const id = await saveNewsToDb(item);
        if (id) newsCreated++;
    }

    // 2. 역사 이벤트
    const historyEvents = getTodayHistoryEvents();
    for (const event of historyEvents) {
        const id = await saveHistoryEventToDb(event);
        if (id) historyCreated++;
    }

    console.log(`수집 완료: 뉴스 ${newsCreated}개, 역사 ${historyCreated}개`);

    return { newsCreated, historyCreated };
}
