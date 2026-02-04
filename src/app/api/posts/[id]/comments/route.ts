// src/app/api/posts/[id]/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashSessionKey } from '@/lib/utils';
import { updatePostTrendingScore } from '@/core/ranking';
import { generateDebateThread } from '@/core/interaction';

// POST: 댓글 작성
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: postId } = await params;

    try {
        const body = await request.json();
        const { content, nickname } = body;

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        // 글 존재 확인
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // 세션 키 생성
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const sessionKey = `${ip}-${Date.now()}`;
        const sessionKeyHash = hashSessionKey(sessionKey);

        // 게스트 생성
        const guest = await prisma.guest.create({
            data: {
                sessionKeyHash,
                nickname: nickname || '익명',
                ipHash: hashSessionKey(ip)
            }
        });

        // 댓글 생성
        const comment = await prisma.comment.create({
            data: {
                content,
                postId,
                guestId: guest.id
            }
        });

        // 댓글 수 증가
        await prisma.post.update({
            where: { id: postId },
            data: { commentCount: { increment: 1 } }
        });

        // 트렌딩 스코어 갱신
        await updatePostTrendingScore(postId);

        // AI 티키타카 생성 (비동기)
        generateDebateThread(postId);

        return NextResponse.json({
            success: true,
            comment: {
                id: comment.id,
                content: comment.content,
                author: guest.nickname,
                createdAt: comment.createdAt
            }
        });
    } catch (error) {
        console.error('Comment POST error:', error);
        return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }
}
