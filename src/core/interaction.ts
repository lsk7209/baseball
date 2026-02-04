// src/core/interaction.ts
import prisma from '@/lib/prisma';
import { generateComment } from './gemini';
import { updatePostTrendingScore } from './ranking';
import { getRandomCommentDelay } from '@/lib/utils';

/**
 * AI 댓글 스케줄링 (글 작성 후 호출)
 * - 1분, 3분, 10분 후에 AI 댓글 생성
 */
export async function scheduleAIComments(postId: string): Promise<void> {
    // 즉시 1개 댓글
    setTimeout(() => addAIComment(postId), 1000);

    // 1~3분 후 1개
    setTimeout(() => addAIComment(postId), getRandomCommentDelay());

    // 5~10분 후 1개
    setTimeout(() => addAIComment(postId), getRandomCommentDelay() + 300000);
}

/**
 * AI 댓글 추가
 */
export async function addAIComment(postId: string): Promise<string | null> {
    try {
        // 글 조회
        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                comments: {
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!post) return null;

        // 랜덤 페르소나 선택
        const personas = await prisma.persona.findMany({
            where: { role: { in: ['fan', 'troll', 'expert'] } }
        });

        if (personas.length === 0) return null;

        const persona = personas[Math.floor(Math.random() * personas.length)];

        // 기존 댓글 목록
        const existingComments = post.comments.map(c => c.content);

        // AI 댓글 생성
        const content = await generateComment(
            { nickname: persona.nickname, traits: persona.traits },
            post.title,
            post.content || '',
            existingComments
        );

        // DB 저장
        const comment = await prisma.comment.create({
            data: {
                content: content.trim(),
                postId,
                personaId: persona.id
            }
        });

        // 댓글 수 증가 + 트렌딩 갱신
        await prisma.post.update({
            where: { id: postId },
            data: { commentCount: { increment: 1 } }
        });
        await updatePostTrendingScore(postId);

        console.log(`AI 댓글 생성: ${persona.nickname} -> "${content.slice(0, 30)}..."`);

        return comment.id;
    } catch (error) {
        console.error('AI 댓글 생성 실패:', error);
        return null;
    }
}

/**
 * 인간 글에 우선 댓글 (접대 모드)
 */
export async function prioritizeHumanPost(postId: string): Promise<void> {
    const post = await prisma.post.findUnique({
        where: { id: postId }
    });

    // 인간 글인 경우에만
    if (post?.guestId) {
        // 즉시 환영 댓글
        setTimeout(() => addWelcomeComment(postId), 500);

        // 추가 AI 댓글 스케줄링
        scheduleAIComments(postId);
    }
}

/**
 * 환영 댓글 생성 (인간 글 전용)
 */
async function addWelcomeComment(postId: string): Promise<void> {
    try {
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) return;

        // fan 역할 페르소나 선택
        const fanPersonas = await prisma.persona.findMany({
            where: { role: 'fan' }
        });

        if (fanPersonas.length === 0) return;

        const persona = fanPersonas[Math.floor(Math.random() * fanPersonas.length)];

        // 환영 메시지 생성
        const welcomeMessages = [
            'ㅇㅎ 반갑습니다!',
            'ㅋㅋㅋ 좋은 글이네요',
            '오 이거 공감됨',
            'ㄹㅇ ㅇㅈ합니다',
            '글 잘 봤습니다!',
            'ㅎㅎ 동의',
            '음 일리가 있네요'
        ];

        const content = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

        await prisma.comment.create({
            data: {
                content,
                postId,
                personaId: persona.id
            }
        });

        await prisma.post.update({
            where: { id: postId },
            data: { commentCount: { increment: 1 } }
        });
    } catch (error) {
        console.error('환영 댓글 생성 실패:', error);
    }
}

/**
 * 티키타카 (댓글 논쟁) 생성
 */
export async function generateDebateThread(postId: string): Promise<void> {
    const post = await prisma.post.findUnique({
        where: { id: postId },
        include: { comments: { orderBy: { createdAt: 'desc' }, take: 3 } }
    });

    if (!post || post.comments.length < 2) return;

    // 50% 확률로 논쟁 댓글 추가
    if (Math.random() > 0.5) return;

    // troll 페르소나로 반박
    const trolls = await prisma.persona.findMany({
        where: { role: 'troll' }
    });

    if (trolls.length === 0) return;

    const troll = trolls[Math.floor(Math.random() * trolls.length)];
    const lastComment = post.comments[0];

    const rebuttals = [
        `ㅋㅋ ${lastComment.content.slice(0, 10)}... 이게 말이 됨?`,
        '아니 ㄹㅇ 이해가 안가는데',
        '헐 완전 다른 생각인데요',
        '저는 반대로 생각하는데...',
        'ㄴㄴ 그건 아닌듯'
    ];

    const content = rebuttals[Math.floor(Math.random() * rebuttals.length)];

    await prisma.comment.create({
        data: {
            content,
            postId,
            personaId: troll.id
        }
    });

    await prisma.post.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } }
    });
}
