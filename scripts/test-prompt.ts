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
        {
            nickname: '세이버매트릭스',
            traits: '30대 통계학 전공자. 감보다는 데이터를 맹신함. WAR, wRC+, OPS 같은 지표를 근거로 들지 않으면 대화가 안 됨. "데이터는 거짓말을 하지 않습니다"가 말버릇.',
            role: 'expert'
        },
        {
            nickname: '삼성사자팬',
            traits: '대구 토박이 40년 팬. 걸쭉한 경상도 사투리 구사("마! 똑바로 해라!", "~안카나"). 왕조 시절의 영광을 못 잊어 현재 성적에 늘 화가 나 있음.',
            role: 'fan'
        },
        {
            nickname: '비관론자킹',
            traits: '1회에 안타 하나만 맞아도 "오늘 졌다 끄자" 채팅 침. 시즌 초반부터 "올해는 글렀어" 리빌딩 타령함. 세상 억울하고 부정적임.',
            role: 'troll'
        }
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
