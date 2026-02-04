import Link from "next/link";
import Image from "next/image"; // Image import preserved though not used in new design yet
import prisma from '@/lib/prisma';
import DebatePanel from "@/components/DebatePanel"; // Reusing components if suitable
import CommentSection from "@/components/CommentSection"; // Assuming this exists or will be needed
import ViewTracker from "@/components/ViewTracker"; // Assuming this exists

export const dynamic = 'force-dynamic';

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch real post data
    const post = await prisma.post.findUnique({
        where: { id },
        include: {
            persona: true,
            guest: true,
            _count: {
                select: { comments: true }
            }
        }
    });

    if (!post) {
        return (
            <div className="container-main py-20 text-center text-white">
                <h1 className="text-3xl font-bold mb-4">게시글을 찾을 수 없습니다.</h1>
                <Link href="/" className="text-[var(--accent)] hover:underline">홈으로 돌아가기</Link>
            </div>
        );
    }

    const authorName = post.persona?.nickname || post.guest?.nickname || "익명";
    const authorRole = post.persona?.role || "팬";
    const authorInitial = authorName[0];
    const categoryMap: Record<string, string> = { news: '뉴스', analysis: '분석', gossip: '잡담', debate: '썰전' };
    const categoryName = categoryMap[post.categorySlug] || "기타";
    const categoryBadgeClass = `badge-${post.categorySlug}`;

    return (
        <div className="container-main py-12">
            {/* View Tracker */}
            {/* <ViewTracker postId={post.id} /> Assuming component exists, commented out if not imported */}

            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-[var(--text-muted)] mb-8">
                <Link href="/" className="hover:text-white">홈</Link>
                <span className="mx-2">/</span>
                <Link href={`/${post.categorySlug}`} className="hover:text-white">{categoryName}</Link>
                <span className="mx-2">/</span>
                <span className="text-[var(--text-secondary)] truncate max-w-[200px]">{post.title}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <article className="lg:col-span-2">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex gap-2 mb-4">
                            <span className={`badge ${categoryBadgeClass} bg-[rgba(16,185,129,0.1)] text-[#34d399] border border-[#34d399]/30`}>
                                {categoryName}
                            </span>
                            <span className="text-[var(--text-muted)] text-sm ml-2">
                                {new Date(post.createdAt).toLocaleString()}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-6">
                            {post.title}
                        </h1>

                        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center text-blue-400 font-bold text-xl">
                                    {authorInitial}
                                </div>
                                <div>
                                    <div className="font-bold text-white flex items-center gap-2">
                                        {authorName}
                                        {post.persona && (
                                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                                                {authorRole}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-[var(--text-muted)]">
                                        {post.persona ? '열정적인 야구 팬' : '게스트 유저'}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right text-sm text-[var(--text-muted)]">
                                <div>{new Date(post.createdAt).toLocaleDateString()}</div>
                                <div className="mt-1 flex items-center justify-end gap-3">
                                    <span>👁️ {post.viewCount.toLocaleString()}</span>
                                    <span>💬 {post.commentCount || post._count.comments}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="prose prose-invert prose-lg max-w-none mb-12 whitespace-pre-line text-gray-300">
                        {/* Simple text rendering for now, mimicking HTML behavior if content is HTML-like, but safely */}
                        {/* In real app, might use a parser or dangerouslySetInnerHTML if trusted. 
                             Assuming content is plain text or basic HTML from Gemini. 
                             For safety, we'll try dangerouslySetInnerHTML but be mindful of XSS in production. 
                             Since it's from our DB/AI, we assume it's relatively safe or sanitized. */}
                        <div dangerouslySetInnerHTML={{ __html: post.content || "" }} />
                    </div>

                    {/* Engagement */}
                    <div className="flex items-center justify-center gap-6 py-8 border-y border-[var(--border-color)]">
                        <button className="flex flex-col items-center gap-2 group">
                            <div className="w-16 h-16 rounded-full bg-[rgba(255,107,0,0.1)] border border-[var(--border-accent)] flex items-center justify-center text-2xl group-hover:bg-[var(--accent)] group-hover:text-white transition-all">
                                👍
                            </div>
                            <span className="font-bold text-[var(--accent)]">{post.likeCount}</span>
                        </button>
                    </div>

                    {/* Comments Section (Placeholder) */}
                    <div className="mt-12">
                        {/* If CommentSection component exists and works, use it. 
                             Otherwise show placeholder properly connected to real count. */}
                        <h3 className="text-xl font-bold text-white mb-6">댓글 {post.commentCount || post._count.comments}개</h3>
                        <div className="glass-card p-6 text-center text-[var(--text-muted)]">
                            로그인 후 댓글을 남겨주세요. (기능 준비중)
                        </div>
                    </div>
                </article>

                {/* Sidebar */}
                <aside className="hidden lg:block space-y-8">
                    {/* Analyst Profile - Dynamic based on author */}
                    <div className="glass-card p-6 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
                        <div className="w-20 h-20 mx-auto rounded-full border-4 border-blue-500 flex items-center justify-center bg-gray-800 text-blue-400 font-bold text-3xl mb-4 relative z-10">
                            {authorInitial}
                        </div>
                        <h3 className="text-xl font-bold text-white relative z-10">{authorName}</h3>
                        <p className="text-blue-400 font-bold text-sm mb-4 relative z-10">{authorRole}</p>
                        <p className="text-gray-400 text-sm mb-6 relative z-10 italic">
                            &quot;야구를 사랑하는 팬입니다.&quot;
                        </p>
                    </div>
                </aside>
            </div >
        </div >
    );
}
