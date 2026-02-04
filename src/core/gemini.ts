// src/core/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// 콘텐츠 생성용 모델
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
 */
export async function generateBaseballPost(
    persona: { nickname: string; traits: string; role?: string },
    topic: string,
    sourceInfo?: { title?: string; url?: string; summary?: string }
): Promise<{ title: string; content: string }> {

    // 역할별 스타일 가이드
    let styleGuide = "";
    if (persona.role === 'expert') {
        styleGuide = `
        - 전문가답게 분석적이고 논리적인 말투 사용 (~합니다, ~것으로 보임)
        - 이모지 사용 절제 (거의 쓰지 말 것, 1개 이하)
        - 데이터나 근거를 들어 설명
        - 점잖은 문체 유지`;
    } else if (persona.role === 'troll') {
        styleGuide = `
        - 아주 냉소적(비꼬기)이거나 과도하게 낙관적인(행복회로) 태도 유지
        - 반말 필수, 약간 공격적이거나 우기는 말투
        - 이모지는 😑, 🤷‍♂️, 👎, 🤮 같은 부정적인 것 위주로 사용하거나 아예 안 쓰기
        - "ㅉㅉ", "답도 없다" 같은 표현 사용`;
    } else { // fan
        styleGuide = `
        - 야구 커뮤니티 찐팬 말투 (반말 기본)
        - 감정 표현 확실하게 (기쁨, 분노, 슬픔)
        - 적절한 이모지 사용 (🔥, ⚾, ㅠㅠ, ㅋㅋ) 허용하되 문장마다 도배 금지
        - 초성체(ㅋㅋㅋ, ㄹㅇ) 자연스럽게 섞기`;
    }

    const prompt = `당신은 "${persona.nickname}"이라는 KBO 야구 커뮤니티 유저입니다.
성격: ${persona.traits}
역할: ${persona.role || 'fan'}

다음 주제로 글을 작성하세요:
주제: ${topic}
${sourceInfo ? `
참고 정보:
- 제목: ${sourceInfo.title || '없음'}
- 요약: ${sourceInfo.summary || '없음'}
` : ''}

[작성 스타일 가이드 - 반드시 준수!]
${styleGuide}

[공통 규칙]
1. 제목은 클릭 유발하도록 작성 (궁금증 유발)
2. 내용은 100~300자 정도
3. 사람처럼 보이게 작성 (AI 티 내지 말 것)

JSON 형식으로만 응답:
{"title": "제목", "content": "내용"}`;

    const response = await generateContent(prompt);

    try {
        const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(cleanJson);
    } catch {
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
 * 일상 글 주제 생성
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
        '응원가 연습 중입니다'
    ];
    return topics[Math.floor(Math.random() * topics.length)];
}
