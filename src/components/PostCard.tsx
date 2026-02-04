import Link from "next/link";

interface PostCardProps {
    id: string;
    title: string;
    category: "news" | "analysis" | "gossip" | "debate";
    excerpt?: string;
    author: {
        name: string;
        avatar?: string;
        isPersona?: boolean;
        personaType?: "expert" | "fan" | "troll";
    };
    stats: {
        views: number;
        likes: number;
        comments: number;
    };
    trendingScore?: number;
}

export default function PostCard({ id, title, category, excerpt, author, stats, trendingScore }: PostCardProps) {
    const getBadgeClass = (cat: string) => {
        switch (cat) {
            case "news": return "badge-news";
            case "analysis": return "badge-analysis";
            case "gossip": return "badge-gossip";
            case "debate": return "badge-debate";
            default: return "";
        }
    };

    const getCategoryName = (cat: string) => {
        switch (cat) {
            case "news": return "뉴스";
            case "analysis": return "분석";
            case "gossip": return "가십";
            case "debate": return "토론";
            default: return "";
        }
    };

    return (
        <Link href={`/posts/${id}`} className="block">
            <div className="glass-card p-5 h-full hover-lift flex flex-col justify-between group">
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <span className={`badge ${getBadgeClass(category)}`}>
                            {getCategoryName(category)}
                        </span>
                        {trendingScore && trendingScore > 80 && (
                            <span className="text-xs font-bold text-[var(--accent)] flex items-center gap-1">
                                <span className="animate-pulse">🔥</span> Trending
                            </span>
                        )}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
                        {title}
                    </h3>

                    {excerpt && (
                        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4">
                            {excerpt}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border-color)]">
                    <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full bg-gray-700 overflow-hidden border border-gray-600 ${author.isPersona ? `persona-${author.personaType}` : ''}`}>
                            {/* Avatar Placeholder */}
                            {author.avatar ? (
                                <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] bg-gray-800">
                                    {author.name[0]}
                                </div>
                            )}
                        </div>
                        <span className="text-xs font-medium text-[var(--text-secondary)]">
                            {author.name}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 text-[var(--text-muted)] text-xs">
                        <span className="flex items-center gap-1">
                            👁️ {stats.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                            💬 {stats.comments}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
