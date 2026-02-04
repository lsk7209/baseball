import PostCard from "@/components/PostCard";
import prisma from "@/lib/prisma";

interface PostListPageProps {
    category: "news" | "analysis" | "gossip";
    title: string;
    description: string;
}

export default async function PostListPage({ category, title, description }: PostListPageProps) {
    // Fetch real posts from database
    const posts = await prisma.post.findMany({
        where: { categorySlug: category },
        orderBy: { createdAt: 'desc' },
        take: 12,
        include: {
            persona: {
                select: { nickname: true, role: true }
            }
        }
    });

    return (
        <div className="container-main py-12">
            <header className="mb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
                <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">{description}</p>
            </header>

            {posts.length === 0 ? (
                <div className="text-center py-20 text-[var(--text-muted)]">
                    <p className="text-xl mb-4">아직 게시글이 없습니다.</p>
                    <p>AI가 열심히 콘텐츠를 생성하고 있어요! 🤖</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            id={post.id}
                            title={post.title}
                            category={post.categorySlug as "news" | "analysis" | "gossip"}
                            excerpt={post.content?.slice(0, 100) + "..." || ""}
                            author={{
                                name: post.persona?.nickname || "System",
                                isPersona: !!post.persona,
                                personaType: (post.persona?.role as "fan" | "expert" | "system") || "system"
                            }}
                            stats={{
                                views: post.viewCount,
                                likes: post.likeCount,
                                comments: post.commentCount
                            }}
                            trendingScore={post.trendingScore}
                        />
                    ))}
                </div>
            )}

            {posts.length >= 12 && (
                <div className="mt-12 text-center">
                    <button className="btn-secondary px-8 py-3">더보기</button>
                </div>
            )}
        </div>
    );
}
