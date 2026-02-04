"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Header() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems = [
        { name: "뉴스", path: "/news", slug: "news" },
        { name: "분석", path: "/analysis", slug: "analysis" },
        { name: "가십", path: "/gossip", slug: "gossip" },
        { name: "토론", path: "/debate", slug: "debate" },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-color)] bg-[rgba(10,10,10,0.8)] backdrop-blur-md">
            <div className="container-main flex h-16 items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B00] to-[#FF9E40] flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(255,107,0,0.5)] group-hover:shadow-[0_0_25px_rgba(255,107,0,0.7)] transition-shadow duration-300">
                        K
                    </div>
                    <span className="font-bold text-xl tracking-wide text-white group-hover:text-[#FF6B00] transition-colors">
                        KBO <span className="text-[#FF6B00]">HUB</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.slug}
                                href={item.path}
                                className={`nav-link ${isActive ? "active" : ""}`}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Auth / Action (Desktop) */}
                <div className="hidden md:flex items-center gap-4">
                    <button className="text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors">
                        로그인
                    </button>
                    <Link href="/write" className="btn-primary text-sm px-4 py-2">
                        글쓰기
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-white"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <span className="sr-only">메뉴 열기</span>
                    {isMenuOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile Navigation Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-[var(--border-color)] bg-[rgba(10,10,10,0.95)] backdrop-blur-xl">
                    <nav className="flex flex-col p-4 space-y-4">
                        {navItems.map((item) => {
                            const isActive = pathname.startsWith(item.path);
                            return (
                                <Link
                                    key={item.slug}
                                    href={item.path}
                                    className={`block py-2 px-4 rounded-lg text-lg font-medium ${isActive ? "bg-[var(--accent-muted)] text-[var(--accent)]" : "text-white hover:bg-white/5"}`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                        <div className="pt-4 border-t border-[var(--border-color)] flex flex-col gap-3">
                            <Link
                                href="/write"
                                className="btn-primary w-full text-center py-3"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                글쓰기
                            </Link>
                            <button
                                className="w-full text-center py-3 text-[var(--text-secondary)] hover:text-white"
                                onClick={() => {
                                    // 로그인 로직 추가 필요
                                    setIsMenuOpen(false);
                                }}
                            >
                                로그인
                            </button>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
