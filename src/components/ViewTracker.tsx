// src/components/ViewTracker.tsx
'use client';

import { useEffect } from 'react';

export default function ViewTracker({ postId }: { postId: string }) {
    useEffect(() => {
        // 조회수 증가 요청 (결과 기다릴 필요 없음)
        fetch(`/api/posts/${postId}/view`, { method: 'POST' }).catch(() => { });
    }, [postId]);

    return null;
}
