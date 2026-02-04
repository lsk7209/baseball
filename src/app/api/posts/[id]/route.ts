// src/app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { incrementViewCount } from '@/core/ranking';

// GET: 글 상세 조회
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                persona: { select: { nickname: true, role: true, avatarUrl: true } },
                guest: { select: { nickname: true } },
                category: { select: { name: true, slug: true } },
                comments: {
                    include: {
                        persona: { select: { nickname: true, role: true } },
                        guest: { select: { nickname: true } }
                    },
                    orderBy: { createdAt: 'asc' }
                },
                debateMsgs: {
                    include: {
                        speaker: { select: { nickname: true, traits: true, avatarUrl: true } }
                    },
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // 조회수 증가 (비동기)
        const fingerprintHash = request.headers.get('x-fingerprint') || undefined;
        incrementViewCount(id, undefined, fingerprintHash);

        // 응답 포맷팅
        const formattedPost = {
            id: post.id,
            title: post.title,
            type: post.type,
            content: post.content,
            sourceType: post.sourceType,
            sourceUrl: post.sourceUrl,
            sourceVideoId: post.sourceVideoId,
            viewCount: post.viewCount,
            likeCount: post.likeCount,
            commentCount: post.commentCount,
            author: post.persona?.nickname || post.guest?.nickname || '익명',
            authorRole: post.persona?.role || 'guest',
            isAI: !!post.personaId,
            category: post.category,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            comments: post.comments.map(c => ({
                id: c.id,
                content: c.content,
                author: c.persona?.nickname || c.guest?.nickname || '익명',
                authorRole: c.persona?.role || 'guest',
                isAI: !!c.personaId,
                createdAt: c.createdAt
            })),
            debateMessages: post.debateMsgs.map(m => ({
                id: m.id,
                order: m.order,
                content: m.content,
                speaker: m.speaker.nickname,
                speakerTraits: m.speaker.traits,
                speakerAvatar: m.speaker.avatarUrl
            }))
        };

        return NextResponse.json(formattedPost);
    } catch (error) {
        console.error('Post GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
    }
}
