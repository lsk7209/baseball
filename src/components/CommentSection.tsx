// src/components/CommentSection.tsx
'use client';

import { useState } from 'react';
import { formatRelativeTime } from '@/lib/utils'; // 클라이언트 사이드에서 사용할 수 있도록 유틸 확인 필요. utils.ts는 node 의존성 없어야 함.

// types 
interface Comment {
    id: string;
    content: string;
    createdAt: string | Date; // 직렬화되면 string
    guest?: { nickname: string } | null;
    persona?: { nickname: string; role: string } | null;
}

interface CommentSectionProps {
    postId: string;
    initialComments: Comment[];
}

export default function CommentSection({ postId, initialComments }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [content, setContent] = useState('');
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !nickname.trim() || !password.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, nickname, password }),
            });

            if (!res.ok) throw new Error('댓글 작성 실패');

            const newComment = await res.json();
            setComments((prev) => [...prev, newComment]); // 낙관적 업데이트 대신 실제 응답 사용
            setContent('');
            // 닉네임, 비밀번호는 유지 (연속 댓글 편의성)
        } catch (err) {
            alert('댓글 작성 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
                <span>💬</span> 댓글 <span className="text-[var(--accent)]">{comments.length}</span>
            </h3>

            {/* 리스트 */}
            <div className="space-y-4 mb-8">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                        {/* 아바타 */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ring-1 ring-[var(--border-color)] ${comment.persona?.role === 'expert' ? 'bg-blue-900/50 text-blue-200' :
                                comment.persona?.role === 'troll' ? 'bg-purple-900/50 text-purple-200' :
                                    comment.persona ? 'bg-pink-900/50 text-pink-200' : 'bg-gray-800 text-gray-400'
                            }`}>
                            {(comment.persona?.nickname || comment.guest?.nickname || '?')[0]}
                        </div>

                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                                <span className={`font-bold ${comment.persona ? 'text-[var(--text-primary)]' : 'text-gray-400'
                                    }`}>
                                    {comment.persona?.nickname || comment.guest?.nickname || '익명'}
                                </span>
                                {comment.persona && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-glass)] text-[var(--accent)] border border-[var(--border-color)]">
                                        AI
                                    </span>
                                )}
                                <span className="text-[var(--text-muted)]">
                                    {typeof comment.createdAt === 'string'
                                        ? new Date(comment.createdAt).toLocaleTimeString()
                                        : comment.createdAt.toLocaleTimeString()}
                                </span>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] bg-[var(--bg-glass)] p-3 rounded-lg rounded-tl-none border border-[var(--border-color)]">
                                {comment.content}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* 작성 폼 */}
            <form onSubmit={handleSubmit} className="glass-card p-4 space-y-3">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="닉네임"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="w-1/3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-3 py-2 text-sm text-white focus:border-[var(--accent)] outline-none"
                        required
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-1/3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-3 py-2 text-sm text-white focus:border-[var(--accent)] outline-none"
                        required
                    />
                </div>
                <textarea
                    placeholder="댓글 내용을 입력하세요 (AI가 반응할 수도?)"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-3 py-2 text-sm text-white focus:border-[var(--accent)] outline-none h-20 resize-none"
                    required
                />
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
                    >
                        {isSubmitting ? '작성 중...' : '등록'}
                    </button>
                </div>
            </form>
        </div>
    );
}
