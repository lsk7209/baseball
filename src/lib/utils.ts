// src/lib/utils.ts

/**
 * 상대 시간 포맷 (방금 전, 3분 전, 2시간 전 등)
 */
export function formatRelativeTime(date: Date | string): string {
    const now = new Date();
    const target = new Date(date);
    const diffMs = now.getTime() - target.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;

    // 7일 이상이면 날짜 표시
    return target.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric'
    });
}

/**
 * 트렌딩 스코어 계산
 * 공식: (조회수 + 좋아요*3 + 댓글*5) / (경과시간 + 2)^1.8
 */
export function calculateTrendingScore(
    viewCount: number,
    likeCount: number,
    commentCount: number,
    createdAt: Date | string
): number {
    const now = new Date();
    const created = new Date(createdAt);
    const hoursElapsed = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

    const engagementScore = viewCount + likeCount * 3 + commentCount * 5;
    const decayFactor = Math.pow(hoursElapsed + 2, 1.8);

    return engagementScore / decayFactor;
}

/**
 * 인간 글 가산점 적용
 */
export function applyHumanBoost(score: number, isHuman: boolean): number {
    return isHuman ? score + 500 : score;
}

/**
 * 랜덤 딜레이 시간 생성 (AI 댓글용)
 * 1분, 3분, 10분 중 랜덤
 */
export function getRandomCommentDelay(): number {
    const delays = [60, 180, 600]; // 초 단위
    return delays[Math.floor(Math.random() * delays.length)] * 1000;
}

/**
 * 세션 키 해시 생성
 */
export function hashSessionKey(key: string): string {
    // 간단한 해시 (실제로는 crypto 사용 권장)
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        const char = key.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}

/**
 * 페르소나 역할에 맞는 랜덤 선택
 */
export function getRandomPersonaByRole(
    personas: Array<{ id: string; role: string }>,
    role?: string
): { id: string; role: string } | undefined {
    const filtered = role
        ? personas.filter(p => p.role === role)
        : personas;

    if (filtered.length === 0) return undefined;
    return filtered[Math.floor(Math.random() * filtered.length)];
}
