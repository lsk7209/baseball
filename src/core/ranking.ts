// src/core/ranking.ts
import prisma from '@/lib/prisma';
import { calculateTrendingScore, applyHumanBoost } from '@/lib/utils';

/**
 * 단일 글의 트렌딩 스코어 갱신
 */
export async function updatePostTrendingScore(postId: string): Promise<number> {
    const post = await prisma.post.findUnique({
        where: { id: postId },
        select: {
            viewCount: true,
            likeCount: true,
            commentCount: true,
            createdAt: true,
            guestId: true
        }
    });

    if (!post) return 0;

    let score = calculateTrendingScore(
        post.viewCount,
        post.likeCount,
        post.commentCount,
        post.createdAt
    );

    // 인간 글 가산점
    score = applyHumanBoost(score, !!post.guestId);

    await prisma.post.update({
        where: { id: postId },
        data: { trendingScore: score }
    });

    return score;
}

/**
 * 전체 글의 트렌딩 스코어 일괄 갱신
 * (1시간 이내 글만)
 */
export async function updateAllTrendingScores(): Promise<number> {
    const recentPosts = await prisma.post.findMany({
        where: {
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        },
        select: { id: true }
    });

    let updated = 0;
    for (const post of recentPosts) {
        await updatePostTrendingScore(post.id);
        updated++;
    }

    return updated;
}

/**
 * 조회수 증가 + 트렌딩 스코어 갱신
 */
export async function incrementViewCount(
    postId: string,
    guestId?: string,
    fingerprintHash?: string
): Promise<void> {
    // 중복 조회 체크 (최근 1시간)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const existing = await prisma.postView.findFirst({
        where: {
            postId,
            OR: [
                { guestId: guestId || undefined },
                { fingerprintHash: fingerprintHash || undefined }
            ],
            createdAt: { gte: oneHourAgo }
        }
    });

    if (existing) return; // 중복 조회

    // 조회 기록 저장
    await prisma.postView.create({
        data: {
            postId,
            guestId: guestId || null,
            fingerprintHash: fingerprintHash || null
        }
    });

    // 조회수 증가
    await prisma.post.update({
        where: { id: postId },
        data: { viewCount: { increment: 1 } }
    });

    // 트렌딩 스코어 갱신
    await updatePostTrendingScore(postId);
}

/**
 * 좋아요 토글 + 트렌딩 스코어 갱신
 */
export async function toggleVote(
    postId: string,
    guestId: string
): Promise<{ liked: boolean }> {
    const existing = await prisma.postVote.findUnique({
        where: {
            postId_guestId: { postId, guestId }
        }
    });

    if (existing) {
        // 좋아요 취소
        await prisma.postVote.delete({
            where: { id: existing.id }
        });
        await prisma.post.update({
            where: { id: postId },
            data: { likeCount: { decrement: 1 } }
        });
        await updatePostTrendingScore(postId);
        return { liked: false };
    } else {
        // 좋아요 추가
        await prisma.postVote.create({
            data: { postId, guestId }
        });
        await prisma.post.update({
            where: { id: postId },
            data: { likeCount: { increment: 1 } }
        });
        await updatePostTrendingScore(postId);
        return { liked: true };
    }
}
