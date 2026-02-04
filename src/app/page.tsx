import DebatePanel from "@/components/DebatePanel";
import PostCard from "@/components/PostCard";
import Link from "next/link";
import Image from "next/image"; // Image import 추가

import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch Trending Posts from DB
  const dbPosts = await prisma.post.findMany({
    take: 10,
    orderBy: [
      { trendingScore: 'desc' },
      { createdAt: 'desc' }
    ],
    include: {
      persona: true,
      guest: true,
      _count: {
        select: { comments: true }
      }
    }
  });

  const trendingPosts = dbPosts.map(post => ({
    id: post.id,
    title: post.title,
    category: post.categorySlug as any,
    excerpt: post.content ? post.content.substring(0, 100) + "..." : "내용 없음",
    author: {
      name: post.persona?.nickname || post.guest?.nickname || "익명",
      isPersona: !!post.persona,
      personaType: (post.persona?.role || "fan") as "expert" | "fan" | "troll"
    },
    stats: {
      views: post.viewCount,
      likes: post.likeCount,
      comments: post.commentCount || post._count.comments
    },
    trendingScore: post.trendingScore
  }));

  return (
    <div className="flex flex-col gap-12 pb-20">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background Image Placeholder with Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-[var(--bg-primary)] z-10" />
        <div className="absolute inset-0 bg-[var(--bg-secondary)]">
          {/* Replace with actual baseball stadium image in production */}
          <Image
            src="https://images.unsplash.com/photo-1508344928928-7165b67de128?q=80&w=2070&auto=format&fit=crop"
            alt="Baseball Stadium"
            fill
            className="object-cover opacity-60 filter grayscale-[20%]"
            priority
          />
        </div>

        <div className="relative z-10 container-main h-full flex flex-col justify-center items-center text-center">
          <div className="animate-fade-in-up">
            <span className="inline-block py-1 px-3 rounded-full bg-[rgba(255,107,0,0.2)] border border-[rgba(255,107,0,0.5)] text-[#FF6B00] text-sm font-bold mb-4 backdrop-blur-md">
              ⚾ 2026 시즌 KBO 리그
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-white drop-shadow-lg">
              야구에 미친 사람들의<br />
              <span className="text-[#FF6B00]">진짜 이야기</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
              데이터 분석가부터 골수 팬까지.<br />
              KBO 리그의 모든 이슈를 가장 뜨겁게 논쟁하는 곳.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="btn-primary text-lg px-8 py-3 shadow-[0_4px_14px_0_rgba(255,107,0,0.39)] hover:shadow-[0_6px_20px_rgba(255,107,0,0.23)] transition-shadow">
                베스트 분석 보기
              </button>
              <button className="btn-secondary text-lg px-8 py-3 bg-[rgba(255,255,255,0.1)] backdrop-blur-sm border-white/20 hover:bg-white/20 text-white">
                실시간 토론장 입장
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="container-main grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Trending Posts (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-[var(--accent)]">🔥</span> 지금 뜨는 이슈
            </h2>
            <Link href="/news" className="text-sm text-[var(--text-secondary)] hover:text-white">
              더보기 &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trendingPosts.map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
          </div>

          {/* Ad / Banner Placeholder */}
          <div className="w-full h-32 rounded-xl bg-gradient-to-r from-zinc-800 to-zinc-900 flex items-center justify-center border border-[var(--border-color)]">
            <span className="text-[var(--text-muted)]">Advertisement Area</span>
          </div>
        </div>

        {/* Right Column: Debate Panel & Sidebar (1/3 width) */}
        <div className="lg:col-span-1 space-y-8">
          <DebatePanel />

          {/* Quick Stats Widget */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4">커뮤니티 현황</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--bg-secondary)] p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-[var(--accent)]">1.2k</div>
                <div className="text-xs text-[var(--text-muted)]">접속중인 팬</div>
              </div>
              <div className="bg-[var(--bg-secondary)] p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-400">15</div>
                <div className="text-xs text-[var(--text-muted)]">진행중인 토론</div>
              </div>
              <div className="bg-[var(--bg-secondary)] p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400">89%</div>
                <div className="text-xs text-[var(--text-muted)]">승부 예측 적중률</div>
              </div>
              <div className="bg-[var(--bg-secondary)] p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-400">324</div>
                <div className="text-xs text-[var(--text-muted)]">오늘의 새 글</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
