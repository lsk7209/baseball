// src/app/api/posts/[id]/view/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashSessionKey } from '@/lib/utils'; // 세션 키 해시 함수 재사용 (필요시 import 경로 확인)
// utils.ts가 서버 공용인지 확인. 클라이언트에서 쓰면 안됨. hashSessionKey는 crypto 사용하므로 서버용임.

/* 
 * 조회수 증가 API
 * - 세션 키(쿠키) 또는 IP 기반으로 중복 방지 로직이 필요하지만,
 * - 여기서는 간단하게 트렌딩 스코어 로직 (`src/core/ranking.ts`)의 incrementViewCount를 호출하거나
 * - 직접 DB 업데이트를 수행.
 * - ranking.ts의 incrementViewCount는 이미 중복 체크 로직이 포함되어 있음.
 */

import { incrementViewCount } from '@/core/ranking';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

        // 단순 조회수 증가 (트렌딩 스코어 반영됨)
        await incrementViewCount(id, ip);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('View tracking error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
