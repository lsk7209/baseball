// src/app/api/posts/[id]/vote/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashSessionKey } from '@/lib/utils';
import { toggleVote } from '@/core/ranking';

// POST: 좋아요 토글
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: postId } = await params;

    try {
        // 글 존재 확인
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // 세션 기반 게스트 ID 찾기 또는 생성
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const sessionKeyHash = hashSessionKey(`vote-${ip}`);

        let guest = await prisma.guest.findUnique({
            where: { sessionKeyHash }
        });

        if (!guest) {
            guest = await prisma.guest.create({
                data: {
                    sessionKeyHash,
                    nickname: '익명',
                    ipHash: hashSessionKey(ip)
                }
            });
        }

        // 좋아요 토글
        const result = await toggleVote(postId, guest.id);

        // 현재 좋아요 수 조회
        const updatedPost = await prisma.post.findUnique({
            where: { id: postId },
            select: { likeCount: true }
        });

        return NextResponse.json({
            success: true,
            liked: result.liked,
            likeCount: updatedPost?.likeCount || 0
        });
    } catch (error) {
        console.error('Vote POST error:', error);
        return NextResponse.json({ error: 'Failed to toggle vote' }, { status: 500 });
    }
}
