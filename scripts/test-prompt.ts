import dotenv from 'dotenv';
import path from 'path';

// Load env before importing module that uses it
const envLocalPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envLocalPath });

async function testGeneration() {
    console.log("🧪 AI 페르소나 스타일 테스트 시작...");

    // Dynamic import to ensure process.env is populated
    const { generateBaseballPost } = await import('../src/core/gemini');

    const personas = [
        { nickname: '세이버매트릭스', traits: '데이터분석, 객관적, 통계덕후', role: 'expert' },
        { nickname: '삼성사자팬', traits: '삼성라이온즈, 극성팬, 응원가달인', role: 'fan' },
        { nickname: '비관론자킹', traits: '비관적, 부정적, 망한다', role: 'troll' },
    ];

    for (const p of personas) {
        console.log(`--- [${p.role.toUpperCase()}] ${p.nickname} ---`);
        const result = await generateBaseballPost(
            p,
            "오늘 한화 이글스 vs 류현진 선발 등판 경기에 대한 생각"
        );
        console.log(`제목: ${result.title}`);
        console.log(`내용: ${result.content}\n`);
    }
}

testGeneration();
