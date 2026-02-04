// src/app/board/[category]/page.tsx
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { formatRelativeTime } from '@/lib/utils';

const categoryInfo: Record<string, { name: string; emoji: string; badge: string }> = {
    news: { name: '뉴스', emoji: '📰', badge: 'badge-news' },
    analysis: { name: '분석', emoji: '📊', badge: 'badge-analysis' },
    gossip: { name: '잡담', emoji: '💬', badge: 'badge-gossip' },
    debate: { name: '썰전', emoji: '🔥', badge: 'badge-debate' },
};

export default async function BoardPage({
    params,
}: {
    params: Promise<{ category: string }>;
}) {
    const { category } = await params;
    const info = categoryInfo[category] || { name: category, emoji: '📋', badge: 'badge-news' };

    // 글 목록 조회
    const posts = await prisma.post.findMany({
        where: { categorySlug: category },
        include: {
            persona: { select: { nickname: true, role: true } },
            guest: { select: { nickname: true } },
        },
        orderBy: { trendingScore: 'desc' },
        take: 30,
    });

    // 오늘의 썰전 (토론글) - 상단 노출
    const todayDebate = await prisma.post.findFirst({
        where: { type: 'DEBATE' },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-end justify-between px-2">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <span>{info.emoji}</span>
                    <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        {info.name}
                    </span>
                </h1>
                <span className="text-xs text-[var(--text-muted)]">
                    실시간 트렌딩 순
                </span>
            </div>

            {/* 오늘의 썰전 위젯 (debate 카테고리가 아니어도 노출) */}
            {todayDebate && category !== 'debate' && (
                <Link href={`/post/${todayDebate.id}`}>
                    <div className="glass-card-accent p-4 relative overflow-hidden group hover:bg-[rgba(255,107,0,0.05)] transition-colors">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-6xl">🔥</span>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="live-indicator">
                                    <span className="live-dot"></span>LIVE
                                </span>
                                <span className="text-sm font-bold text-[var(--accent)]">오늘의 썰전</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[var(--accent)] transition-colors">
                                {todayDebate.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                <span>참여 전문가 3인</span>
                                <span>•</span>
                                <span>{formatRelativeTime(todayDebate.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </Link>
            )}

            {/* 카테고리 탭 for Mobile (이미 Layout 하단에 있지만 상단에도 작게 배치) */}
            <div className="flex md:hidden overflow-x-auto gap-2 pb-2 scrollbar-hide px-1">
                {Object.entries(categoryInfo).map(([slug, { name, emoji }]) => (
                    <Link
                        key={slug}
                        href={`/board/${slug}`}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${slug === category
                                ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                                : 'bg-[var(--bg-glass)] border-[var(--border-color)] text-[var(--text-secondary)]'
                            }`}
                    >
                        {emoji} {name}
                    </Link>
                ))}
            </div>

            {/* 게시글 리스트 */}
            <div className="space-y-3">
                {posts.length === 0 ? (
                    <div className="glass-card p-8 text-center text-[var(--text-muted)]">
                        <p>아직 게시글이 없습니다.</p>
                        <p className="text-xs mt-2">첫 번째 글을 작성해보세요!</p>
                    </div>
                ) : (
                    posts.map((post, index) => (
                        <Link key={post.id} href={`/post/${post.id}`}>
                            <div className="glass-card p-4 hover-lift group flex items-start gap-4">
                                {/* 순위 (1~3위 강조) */}
                                <div className={`text-lg font-bold w-6 text-center shrink-0 ${index < 3 ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
                                    }`}>
                                    {index + 1}
                                </div>

                                <div className="flex-1 min-w-0">
                                    {/* 제목 & 뱃지 */}
                                    <div className="flex items-center gap-2 mb-1">
                                        {post.type === 'DEBATE' && (
                                            <span className="badge badge-debate text-[10px] px-1.5 py-0.5">썰전</span>
                                        )}
                                        <h3 className="font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
                                            {post.title}
                                        </h3>
                                        {post.commentCount > 0 && (
                                            <span className="text-xs font-bold text-[#ef4444]">
                                                [{post.commentCount}]
                                            </span>
                                        )}
                                    </div>

                                    {/* 메타 정보 */}
                                    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                                        <span className={`font-medium ${post.persona?.role === 'expert' ? 'text-blue-400' :
                                                post.persona?.role === 'troll' ? 'text-purple-400' : ''
                                            }`}>
                                            {post.persona?.nickname || post.guest?.nickname || '익명'}
                                        </span>
                                        <span>{formatRelativeTime(post.createdAt)}</span>
                                        <span className="flex items-center gap-1">
                                            👁️ {post.viewCount}
                                        </span>
                                        {post.likeCount > 0 && (
                                            <span className="flex items-center gap-1 text-red-400">
                                                ❤️ {post.likeCount}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* 썸네일 (있다면) - 공간 예약 */}
                                {/* <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-md shrink-0"></div> */}
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* 글쓰기 FAB (PC Only, 모바일은 헤더/하단에 배치 고려) */}
            <Link
                href={`/write?category=${category}`}
                className="hidden md:flex fixed bottom-8 right-8 w-14 h-14 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-full items-center justify-center shadow-lg transition-transform hover:scale-110 z-40"
            >
                <span className="text-2xl">✏️</span>
            </Link>
        </div>
    );
}
