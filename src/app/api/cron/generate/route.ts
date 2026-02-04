// src/app/api/cron/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { runGenerator } from '@/core/generator';
import { runDailyDebate } from '@/core/debate';
import { updateAllTrendingScores } from '@/core/ranking';

export async function POST(request: NextRequest) {
    // Cron 보안 키 확인
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. AI 글 생성
        const generatorResult = await runGenerator();

        // 2. 일일 토론 글 (하루에 1번)
        const debateId = await runDailyDebate();

        // 3. 트렌딩 스코어 갱신
        const updatedCount = await updateAllTrendingScores();

        return NextResponse.json({
            success: true,
            message: 'AI 생성 완료',
            generator: generatorResult,
            debateCreated: !!debateId,
            trendingUpdated: updatedCount
        });
    } catch (error) {
        console.error('Cron generate error:', error);
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
