import PostCard from "@/components/PostCard";

interface PostListPageProps {
    category: "news" | "analysis" | "gossip";
    title: string;
    description: string;
}

export default function PostListPage({ category, title, description }: PostListPageProps) {
    // Mock Data
    const posts = Array.from({ length: 6 }).map((_, i) => ({
        id: `list-${i}`,
        title: `${title} 예시 게시글 제목입니다 ${i + 1}`,
        category: category,
        excerpt: "이것은 예시 본문입니다. AI가 생성한 요약 내용이 들어갈 자리입니다...",
        author: { name: "System", isPersona: true, personaType: "expert" as const },
        stats: { views: 1200 + i * 100, likes: 50 + i * 10, comments: 10 + i },
        trendingScore: 80 - i,
    }));

    return (
        <div className="container-main py-12">
            <header className="mb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
                <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">{description}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                    <PostCard key={post.id} {...post} />
                ))}
            </div>

            <div className="mt-12 text-center">
                <button className="btn-secondary px-8 py-3">더보기</button>
            </div>
        </div>
    );
}
