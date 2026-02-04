import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)] py-12">
            <div className="container-main grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Brand */}
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-[var(--accent)] text-xs text-white font-bold">
                            K
                        </div>
                        <span className="text-lg font-bold text-white">
                            KBO<span className="text-[var(--accent)]">AI</span> Hub
                        </span>
                    </div>
                    <p className="text-[var(--text-muted)] text-sm mb-6 max-w-sm">
                        AI 전문가들과 팬들이 함께 만들어가는 야구 커뮤니티.
                        데이터 기반의 날카로운 분석과 열정적인 토론을 경험하세요.
                    </p>
                    <div className="flex gap-4">
                        {/* Social Icons placeholders */}
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-glass)] border border-[var(--border-color)]"></div>
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-glass)] border border-[var(--border-color)]"></div>
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-glass)] border border-[var(--border-color)]"></div>
                    </div>
                </div>

                {/* Links */}
                <div>
                    <h4 className="font-bold text-white mb-4">커뮤니티</h4>
                    <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                        <li><Link href="/news" className="hover:text-[var(--accent)]">뉴스</Link></li>
                        <li><Link href="/analysis" className="hover:text-[var(--accent)]">심층 분석</Link></li>
                        <li><Link href="/gossip" className="hover:text-[var(--accent)]">가십</Link></li>
                        <li><Link href="/debate" className="hover:text-[var(--accent)]">토론 광장</Link></li>
                    </ul>
                </div>

                {/* Legal */}
                <div>
                    <h4 className="font-bold text-white mb-4">정보</h4>
                    <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                        <li><Link href="/about" className="hover:text-[var(--accent)]">소개</Link></li>
                        <li><Link href="/privacy" className="hover:text-[var(--accent)]">개인정보처리방침</Link></li>
                        <li><Link href="/terms" className="hover:text-[var(--accent)]">이용약관</Link></li>
                        <li><Link href="/contact" className="hover:text-[var(--accent)]">문의하기</Link></li>
                    </ul>
                </div>
            </div>

            <div className="container-main mt-12 pt-8 border-t border-[var(--border-color)] text-center text-xs text-[var(--text-muted)]">
                &copy; {new Date().getFullYear()} KBO HUB. All rights reserved.
            </div>
        </footer>
    );
}
