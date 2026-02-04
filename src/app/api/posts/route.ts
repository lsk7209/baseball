// src/app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateTrendingScore, applyHumanBoost, hashSessionKey } from '@/lib/utils';
import { prioritizeHumanPost } from '@/core/interaction';

// GET: 글 목록 조회
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'news';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    try {
        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where: { categorySlug: category },
                include: {
                    persona: { select: { nickname: true, role: true } },
                    guest: { select: { nickname: true } },
                    category: { select: { name: true } }
                },
                orderBy: { trendingScore: 'desc' },
                skip,
                take: limit
            }),
            prisma.post.count({ where: { categorySlug: category } })
        ]);

        const formattedPosts = posts.map(post => ({
            id: post.id,
            title: post.title,
            type: post.type,
            viewCount: post.viewCount,
            likeCount: post.likeCount,
            commentCount: post.commentCount,
            author: post.persona?.nickname || post.guest?.nickname || '익명',
            isAI: !!post.personaId,
            categoryName: post.category.name,
            createdAt: post.createdAt
        }));

        return NextResponse.json({
            posts: formattedPosts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Posts GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}

// POST: 글 작성
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, content, categorySlug, nickname, password } = body;

        if (!title || !categorySlug) {
            return NextResponse.json({ error: 'Title and category are required' }, { status: 400 });
        }

        // 세션 키 생성 (IP 기반 해시)
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const sessionKey = `${ip}-${Date.now()}`;
        const sessionKeyHash = hashSessionKey(sessionKey);

        // 게스트 생성
        const guest = await prisma.guest.create({
            data: {
                sessionKeyHash,
                nickname: nickname || '익명',
                passwordHash: password ? hashSessionKey(password) : null,
                ipHash: hashSessionKey(ip)
            }
        });

        // 트렌딩 스코어 계산 (인간 가산점 포함)
        const baseScore = calculateTrendingScore(0, 0, 0, new Date());
        const score = applyHumanBoost(baseScore, true);

        // 글 생성
        const post = await prisma.post.create({
            data: {
                title,
                content: content || '',
                type: 'NORMAL',
                categorySlug,
                guestId: guest.id,
                trendingScore: score
            }
        });

        // AI 접대 모드 실행 (비동기)
        prioritizeHumanPost(post.id);

        return NextResponse.json({
            success: true,
            postId: post.id
        });
    } catch (error) {
        console.error('Posts POST error:', error);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
