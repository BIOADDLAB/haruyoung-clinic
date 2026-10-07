import { getAI, getGenerativeModel, GoogleAIBackend, Schema } from 'firebase/ai';
import { app } from './firebase';
import type { ColumnLang } from '@/types/column';

/**
 * 칼럼 AI 보조 — Firebase AI Logic(Gemini) 사용.
 * 관리자 화면(클라이언트)에서만 호출한다. 기계번역(구글 번역 등) 대신 LLM 으로 번역한다.
 * Firebase 콘솔에서 AI Logic 이 활성화되어 있어야 한다.
 */
const MODEL = 'gemini-3.8-flash';

function getModel(jsonSchema?: Schema) {
    // App Check 의 "재생 보호"가 적용된 상태라 1회용 토큰을 써야 한다.
    // 재사용 가능한 일반 토큰을 보내면 두 번째 요청부터 "App Check token is invalid" 로 거부된다.
    const ai = getAI(app, { backend: new GoogleAIBackend(), useLimitedUseAppCheckTokens: true });
    return getGenerativeModel(ai, {
        model: MODEL,
        generationConfig: jsonSchema
            ? { responseMimeType: 'application/json', responseSchema: jsonSchema }
            : undefined,
    });
}

const LANG_NAME: Record<ColumnLang, string> = {
    en: '영어(English)',
    zh: '중국어 간체(简体中文)',
};

export type TranslationSource = {
    title: string;
    summary: string;
    /** Tiptap HTML */
    content: string;
};

export type TranslationResult = {
    title: string;
    summary: string;
    content: string;
};

const translationSchema = Schema.object({
    properties: {
        title: Schema.string(),
        summary: Schema.string(),
        content: Schema.string(),
    },
});

/**
 * 한국어 원문을 영어/중국어로 번역한다. 결과는 AI 초안이며 반드시 사람 검수 후 발행한다.
 * 응답이 출력 한도에서 잘리면 저장 사고를 막기 위해 에러를 던진다.
 */
export async function translateColumn(source: TranslationSource, target: ColumnLang): Promise<TranslationResult> {
    const model = getModel(translationSchema);

    const prompt = [
        `너는 피부과 의원 홈페이지 칼럼의 의료 전문 번역가다. 아래 한국어 칼럼을 ${LANG_NAME[target]}로 번역하라.`,
        '',
        '규칙:',
        '- content 는 HTML 이다. 태그 구조·속성은 그대로 두고 텍스트만 번역한다.',
        '- 시술명·의학 용어는 해당 언어권에서 통용되는 정확한 표현을 쓴다.',
        '- 과장·효과 보장 표현을 새로 만들지 않는다 (의료광고 규정).',
        '',
        `title: ${source.title}`,
        `summary: ${source.summary}`,
        'content:',
        source.content,
    ].join('\n');

    const result = await model.generateContent(prompt);
    const finishReason = result.response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
        throw new Error(`번역이 완료되지 못했습니다 (${finishReason}). 글이 너무 길면 나눠서 시도해 주세요.`);
    }
    return JSON.parse(result.response.text()) as TranslationResult;
}

/** 한글 제목으로 영문/숫자 slug 를 제안한다. 실패하면 빈 문자열 */
export async function suggestSlug(koreanTitle: string): Promise<string> {
    const model = getModel();
    const result = await model.generateContent(
        [
            '다음 한국어 글 제목을 뜻이 통하는 영어 URL slug 로 바꿔라.',
            '규칙: 소문자 영문·숫자·하이픈만, 3~6개 단어, 다른 설명 없이 slug 만 출력.',
            `제목: ${koreanTitle}`,
        ].join('\n'),
    );
    const slug = result.response
        .text()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return slug;
}

/** 제목·본문(HTML)을 바탕으로 한국어 요약문을 만든다. 목록·검색 미리보기용 */
export async function suggestSummary(title: string, contentHtml: string): Promise<string> {
    const model = getModel();
    const result = await model.generateContent(
        [
            '너는 피부과 의원 홈페이지 칼럼 편집자다. 아래 글의 요약문을 한국어로 작성하라.',
            '규칙:',
            '- 1~2문장, 120자 이내. 목록과 검색 결과 미리보기에 쓰인다.',
            '- 과장·치료 효과 보장 표현 금지 (의료광고 규정).',
            '- HTML 태그 없이 순수 문장만, 다른 설명 없이 요약문만 출력.',
            '',
            `제목: ${title}`,
            '본문:',
            contentHtml,
        ].join('\n'),
    );
    const finishReason = result.response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
        throw new Error(`요약 생성이 완료되지 못했습니다 (${finishReason}).`);
    }
    return result.response.text().trim().replace(/^["']|["']$/g, '');
}
