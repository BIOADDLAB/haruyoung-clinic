/** 번역 언어. 한국어 원문은 Column 본체 필드다 */
export type ColumnLang = 'en' | 'zh';

/**
 * 언어별 번역본. AI 초안 생성 후 사람이 검수한다.
 * approved 가 true 인 번역만 공개 페이지·사이트맵에 노출된다.
 */
export type ColumnTranslation = {
    title: string;
    summary: string;
    /** Tiptap 이 만든 HTML */
    content: string;
    /** 검수 완료 여부. false 면 AI 초안 상태라 절대 공개하지 않는다 */
    approved: boolean;
};

export type Column = {
    id: string;
    /** 영문/숫자 URL. 세 언어가 같은 slug 를 쓴다 */
    slug: string;
    /** MENU_CATEGORIES 의 slug. 전후사진과 같은 진료 카테고리를 쓴다 */
    category: string;
    /** 대표 이미지. 상세 상단·공유(OG)·목록 썸네일에 모두 쓴다. 권장 1200×630px */
    coverImage: string;
    /** 한국어 원문 발행 여부. false 면 임시저장(비공개) */
    published: boolean;
    /** 'YYYY-MM-DD'. 목록 정렬·화면 표기용 */
    publishedAt: string;
    createdAt: string;
    updatedAt: string;

    /** 한국어 원문 */
    title: string;
    summary: string;
    /** Tiptap 이 만든 HTML */
    content: string;

    en?: ColumnTranslation | null;
    zh?: ColumnTranslation | null;
};

export type ColumnSeed = Omit<Column, 'id'>;

/**
 * 해당 언어로 공개 가능한 본문 묶음.
 * 한국어는 발행 여부만 보고, 영어·중국어는 검수 완료된 번역이 있어야 한다.
 * 공개 불가면 null — 상세 페이지는 404, 목록·사이트맵에서는 제외한다.
 * 검색 메타태그는 제목·요약문을 그대로 쓴다.
 */
export function localizedColumn(c: Column, locale: string) {
    if (locale === 'ko') {
        if (!c.published) return null;
        const { title, summary, content } = c;
        return { title, summary, content };
    }
    const tr = locale === 'en' ? c.en : locale === 'zh' ? c.zh : null;
    if (!c.published || !tr?.approved) return null;
    const { title, summary, content } = tr;
    return { title, summary, content };
}

/** 글이 공개된 언어 목록. hreflang·사이트맵에 이 언어만 넣는다 */
export function columnLocales(c: Column): ('ko' | 'en' | 'zh')[] {
    if (!c.published) return [];
    const locales: ('ko' | 'en' | 'zh')[] = ['ko'];
    if (c.en?.approved) locales.push('en');
    if (c.zh?.approved) locales.push('zh');
    return locales;
}
