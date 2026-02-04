// src/app/api/cron/collect/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { runIngestor } from '@/core/ingestor';

export async function POST(request: NextRequest) {
    // Cron 보안 키 확인
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await runIngestor();
        return NextResponse.json({
            success: true,
            message: '수집 완료',
            ...result
        });
    } catch (error) {
        console.error('Cron collect error:', error);
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    }
}

// Vercel Cron 설정
export const dynamic = 'force-dynamic';
