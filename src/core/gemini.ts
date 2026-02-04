// src/core/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// 콘텐츠 생성용 모델 (gemini-2.5-flash-lite Verified)
const contentModel = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite'
});

/**
 * AI 콘텐츠 생성 (글, 댓글)
 */
export async function generateContent(prompt: string): Promise<string> {
    try {
        const result = await contentModel.generateContent(prompt);
        const response = result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
}

/**
 * 야구 커뮤니티 글 생성
 * - 감정(Emotion): 화내거나, 기뻐하거나, 비꼬기
 * - 경험(Experience): 1인칭 가짜 경험 주입
 * - 스타일: 초성체, 제목 낚시, 비속어(필터링 범위 내)
 */
export async function generateBaseballPost(
    persona: { nickname: string; traits: string },
    topic: string,
    sourceInfo?: { title?: string; url?: string; summary?: string }
): Promise<{ title: string; content: string }> {
    const prompt = `당신은 "${persona.nickname}"이라는 야구 커뮤니티 유저입니다.
성격 특성: ${persona.traits}

다음 주제로 야구 커뮤니티에 올릴 글을 작성하세요:
주제: ${topic}
${sourceInfo ? `
참고 정보:
- 제목: ${sourceInfo.title || '없음'}
- 출처: ${sourceInfo.url || '없음'}
- 요약: ${sourceInfo.summary || '없음'}
` : ''}

작성 규칙:
1. 기계적인 요약 금지! 감정을 넣어라 (화나거나, 기쁘거나, 비꼬거나)
2. 1인칭 경험을 넣어라 (예: "직관 갔다 왔는데", "방금 치킨 시키고 봤는데")
3. 한국 야구 커뮤니티 스타일로 (초성체 ㅋㅋㅋ, ㄹㅇ, ㅇㅈ 등 자연스럽게 사용)
4. 제목은 클릭하고 싶게 낚시성으로 작성
5. 내용은 100~300자 정도로 짧고 임팩트 있게

JSON 형식으로만 응답하세요:
{"title": "제목", "content": "본문내용"}`;

    const response = await generateContent(prompt);

    try {
        // JSON 파싱 (코드블록 제거)
        const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(cleanJson);
    } catch {
        // 파싱 실패시 기본값
        return {
            title: topic.slice(0, 50),
            content: response
        };
    }
}

/**
 * AI 댓글 생성
 */
export async function generateComment(
    persona: { nickname: string; traits: string },
    postTitle: string,
    postContent: string,
    existingComments?: string[]
): Promise<string> {
    const prompt = `당신은 "${persona.nickname}"이라는 야구 커뮤니티 유저입니다.
성격 특성: ${persona.traits}

다음 글에 댓글을 달아주세요:
제목: ${postTitle}
내용: ${postContent}
${existingComments?.length ? `
기존 댓글들:
${existingComments.map((c, i) => `${i + 1}. ${c}`).join('\n')}
` : ''}

작성 규칙:
1. 성격에 맞게 반응 (동의/반박/조롱/응원 등)
2. 한국 야구 커뮤니티 스타일 (초성체, 이모티콘 등 자연스럽게)
3. 기존 댓글이 있다면 대화 흐름에 맞게 반응
4. 20~80자 정도로 짧게

댓글 내용만 작성하세요 (다른 설명 없이):`;

    return await generateContent(prompt);
}

/**
 * 전문가 토론 대본 생성
 */
export async function generateDebate(
    topic: string,
    experts: Array<{ nickname: string; traits: string }>
): Promise<Array<{ speaker: string; speakerId: string; text: string }>> {
    const prompt = `야구 주제로 전문가 3인 토론 대본을 작성하세요.

주제: ${topic}

패널:
${experts.map((e, i) => `${i + 1}. ${e.nickname} - ${e.traits}`).join('\n')}

규칙:
1. 각 전문가가 2~3번씩 발언 (총 6~9개 발언)
2. 서로 다른 관점에서 의견 제시
3. 자연스러운 대화 흐름 (동의, 반박, 보충 등)
4. 한국어로 자연스럽게

JSON 배열로만 응답:
[{"speaker": "닉네임", "text": "발언내용"}, ...]`;

    const response = await generateContent(prompt);

    try {
        const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        // speakerId 매핑
        return parsed.map((item: { speaker: string; text: string }) => {
            const expert = experts.find(e => e.nickname === item.speaker);
            return {
                speaker: item.speaker,
                speakerId: expert?.nickname || experts[0].nickname,
                text: item.text
            };
        });
    } catch {
        return [];
    }
}

/**
 * 일상 글 주제 생성 (뉴스 없을 때)
 */
export async function generateDailyTopic(): Promise<string> {
    const topics = [
        '오늘 직관 가는데 꿀팁 있나요?',
        '유니폼 인증합니다',
        '치킨 시키고 야구 보는 중',
        '오늘 경기 예상 라인업',
        '최근에 산 야구 굿즈 자랑',
        '직관 가는 길에 찍은 사진',
        '오늘 선발 어떻게 생각함?',
        '응원가 연습 중입니다',
        '야구장 맛집 추천해주세요',
        '내일 티켓팅 성공할 수 있을까요'
    ];

    return topics[Math.floor(Math.random() * topics.length)];
}
