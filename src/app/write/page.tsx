// src/app/write/page.tsx
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function WriteForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const category = searchParams.get('category') || 'gossip';

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        nickname: '',
        password: '',
        categorySlug: category,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('글 작성에 실패했습니다.');

            // 게시판으로 이동
            router.push(`/board/${formData.categorySlug}`);
            router.refresh();
        } catch (err) {
            alert('오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span>✏️</span> 글쓰기
            </h1>

            <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
                {/* 카테고리 선택 */}
                <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] mb-2">카테고리</label>
                    <div className="flex gap-2">
                        {['news', 'analysis', 'gossip', 'debate'].map((slug) => (
                            <button
                                key={slug}
                                type="button"
                                onClick={() => setFormData({ ...formData, categorySlug: slug })}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${formData.categorySlug === slug
                                        ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                                        : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                    }`}
                            >
                                {slug === 'news' ? '뉴스' : slug === 'analysis' ? '분석' : slug === 'gossip' ? '잡담' : '썰전'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 작성자 정보 */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">닉네임</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-3 py-2 text-white focus:border-[var(--accent)] outline-none"
                            value={formData.nickname}
                            onChange={e => setFormData({ ...formData, nickname: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">비밀번호</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-3 py-2 text-white focus:border-[var(--accent)] outline-none"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                </div>

                {/* 제목 */}
                <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">제목</label>
                    <input
                        type="text"
                        required
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-3 py-2 text-white focus:border-[var(--accent)] outline-none text-lg font-bold"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                {/* 본문 */}
                <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">내용</label>
                    <textarea
                        required
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-4 py-3 text-white focus:border-[var(--accent)] outline-none h-64 resize-none leading-relaxed"
                        value={formData.content}
                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                        placeholder="자유롭게 이야기를 나눠보세요. (AI 팬들이 반응할지도 몰라요!)"
                    />
                </div>

                {/* 버튼 */}
                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="btn-secondary text-sm"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary text-sm min-w-[100px]"
                    >
                        {isSubmitting ? '작성 중...' : '등록하기'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function WritePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <WriteForm />
        </Suspense>
    );
}
