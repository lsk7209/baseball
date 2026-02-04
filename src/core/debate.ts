// src/core/debate.ts
import prisma from '@/lib/prisma';
import { generateDebate } from './gemini';
import { calculateTrendingScore } from '@/lib/utils';

/**
 * 전문가 토론 글 생성
 */
export async function createDebatePost(topic: string): Promise<string | null> {
    try {
        // 전문가 페르소나 3명 선택
        const experts = await prisma.persona.findMany({
            where: { role: 'expert' },
            take: 3
        });

        if (experts.length < 3) {
            console.error('전문가 페르소나가 3명 미만입니다');
            return null;
        }

        // AI로 토론 대본 생성
        const debateScript = await generateDebate(
            topic,
            experts.map(e => ({ nickname: e.nickname, traits: e.traits }))
        );

        if (debateScript.length === 0) {
            console.error('토론 대본 생성 실패');
            return null;
        }

        // 토론 글 생성
        const post = await prisma.post.create({
            data: {
                title: `🔥 [썰전] ${topic}`,
                type: 'DEBATE',
                content: `전문가 ${experts.length}인이 "${topic}"에 대해 토론합니다.`,
                summaryJson: JSON.stringify({
                    topic,
                    panelists: experts.map(e => e.nickname),
                    messageCount: debateScript.length
                }),
                categorySlug: 'debate',
                personaId: experts[0].id, // 첫 번째 전문가가 대표 작성자
                trendingScore: calculateTrendingScore(0, 0, 0, new Date()) + 200 // 토론글 가산점
            }
        });

        // 토론 메시지 저장
        for (let i = 0; i < debateScript.length; i++) {
            const msg = debateScript[i];
            const speaker = experts.find(e => e.nickname === msg.speaker) || experts[0];

            await prisma.debateMessage.create({
                data: {
                    postId: post.id,
                    order: i + 1,
                    content: msg.text,
                    speakerId: speaker.id
                }
            });
        }

        console.log(`토론 글 생성 완료: ${post.id} - ${topic}`);
        return post.id;

    } catch (error) {
        console.error('토론 글 생성 실패:', error);
        return null;
    }
}

/**
 * 토론 주제 자동 생성 (트렌딩 뉴스 기반)
 */
export async function generateDebateTopic(): Promise<string> {
    // 최근 핫한 뉴스 조회
    const hotNews = await prisma.post.findFirst({
        where: {
            sourceType: 'KBO_NEWS',
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        },
        orderBy: { trendingScore: 'desc' }
    });

    if (hotNews) {
        return hotNews.title.replace(/[\[\]「」『』]/g, '').slice(0, 50);
    }

    // 기본 토론 주제
    const defaultTopics = [
        '올해 MVP 후보는 누구인가?',
        '외국인 선수 쿼터제 변경, 어떻게 생각하시나요?',
        '포스트시즌 진출 가능성 높은 팀은?',
        '역대급 신인왕 후보, 누가 가장 유력한가?',
        'KBO 경기 시간 단축, 필요한가?',
        '지명타자 제도, 야구의 묘미를 해치는가?',
        '팀 성적과 감독 책임론',
        '용병 영입 전략, 성공과 실패'
    ];

    return defaultTopics[Math.floor(Math.random() * defaultTopics.length)];
}

/**
 * 일일 토론 글 생성 (Cron에서 호출)
 */
export async function runDailyDebate(): Promise<string | null> {
    // 오늘 이미 토론 글이 있는지 확인
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingDebate = await prisma.post.findFirst({
        where: {
            type: 'DEBATE',
            createdAt: { gte: today }
        }
    });

    if (existingDebate) {
        console.log('오늘 이미 토론 글이 있습니다');
        return null;
    }

    const topic = await generateDebateTopic();
    return await createDebatePost(topic);
}
