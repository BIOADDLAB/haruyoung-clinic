const TREATMENT_ORDER = ['lifting', 'pigment', 'acne', 'petit', 'care', 'hair', 'body', 'booster'] as const;

/** key 는 messages 의 banner 네임스페이스 키다 */
const treatments = TREATMENT_ORDER.map((slug) => ({ key: slug, href: `/treatments/${slug}` }));

export const MENU_GROUPS = [
    {
        title: 'Haru Young',
        items: [
            { key: 'philosophy', href: '/about#philosophy' },
            { key: 'specialist', href: '/about#specialist' },
            { key: 'space', href: '/about#space' },
        ],
    },
    { title: 'Treatments', items: treatments },
    { title: 'Promotion', items: [{ key: 'promotion', href: '/promotion' }] },
    { title: 'Precautions', items: [{ key: 'precautions', href: '/precautions' }] },
] as const;

export const CLINIC = {
    name: '하루영의원',
    /** #TODO: 개원 전이라 미확정. 확정되면 여기만 고치면 푸터 표기와 지도 쿼리가 함께 바뀐다 */

    /**
     * day 는 화면 표기용이라 글자를 공백으로 띄워 적는다 (43px 폭 안에서 양끝 정렬).
     * 그대로 읽히면 "월 금" 이 되므로 스크린리더·검색엔진용 문장은 aria 에 따로 둔다.
     */
    /** 시간은 언어와 무관하다. 요일 라벨만 messages 의 footer 에서 꺼낸다 */
    hours: [
        { key: 'day1', time: '13:00 - 21:00' },
        { key: 'day2', time: '10:00 - 19:00' },
        { key: 'day3', time: '10:00 - 15:00' },
        { key: 'day4', time: '13:00 - 14:00' },
    ],
    hourNotes: ['note1', 'note2'],

    bizNo: '876-48-01029',
    tel: '00-000-0000',
} as const;

/** TODO: 실제 카카오 채널 주소로 교체 */
export const KAKAO_CHANNEL = 'https://pf.kakao.com/_haruyoung';

/** 헤더 레일 하단 바로가기 — 상담예약은 전화연결, 바로예약은 예약 페이지, 카카오톡은 채널 */
export const QUICK_LINKS = [
    { icon: 'i-h-02', key: 'quickConsult', href: `tel:${CLINIC.tel.replace(/-/g, '')}`, external: true },
    { icon: 'i-h-03', key: 'quickReserve', href: '/reservation', external: false },
    { icon: 'i-h-05', key: 'quickKakao', href: KAKAO_CHANNEL, external: true },
] as const;

export const LANGS = [
    { code: 'ko', label: 'KO', name: '한국어' },
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'zh', label: 'ZH', name: '中文' },
] as const;

export type LangCode = (typeof LANGS)[number]['code'];

export const POLICY_LINKS = [
    { key: 'priceList', href: '/treatments' },
    { key: 'terms', href: '/terms' },
    { key: 'privacy', href: '/privacy' },
] as const;

/** 시술·프로모션 페이지 좌측 서브 내비. 시안 순서 그대로 */
export const SUB_NAV = [
    { key: 'promotion', href: '/promotion' },
    ...TREATMENT_ORDER.map((slug) => ({ key: slug, href: `/treatments/${slug}` })),
] as const;

/** 방문 형태. 값은 키로 저장하고 화면에서만 번역한다 */
export const VISIT_TYPES = ['visitFirst', 'visitAgain'] as const;

/**
 * 요일별 예약 가능 구간. 0=일 … 6=토. 없는 요일은 휴진이다.
 * lunch 가 true 면 13:00~14:00 슬롯을 뺀다 (월·토는 점심시간 없이 진료).
 */
export const RESERVATION_HOURS: Record<number, { start: string; end: string; lunch: boolean }> = {
    1: { start: '13:00', end: '21:00', lunch: false },
    2: { start: '10:00', end: '19:00', lunch: true },
    3: { start: '10:00', end: '19:00', lunch: true },
    4: { start: '10:00', end: '19:00', lunch: true },
    5: { start: '13:00', end: '21:00', lunch: false },
    6: { start: '10:00', end: '15:00', lunch: false },
};

/** 오늘부터 이만큼 뒤까지만 예약을 받는다 */
export const RESERVATION_MAX_DAYS = 60;

/**
 * 시술 페이지 배너. 892×194.
 * 번호는 SUB_NAV 순서를 따른다. 새 카테고리가 생기면 여기에 한 줄 추가한다.
 */
export const TREATMENT_BANNER: Record<string, { file: string; en: string }> = {
    lifting: { file: 'bg-tre-01', en: 'Lifting' },
    pigment: { file: 'bg-tre-02', en: 'Pigment' },
    acne: { file: 'bg-tre-03', en: 'Acne' },
    petit: { file: 'bg-tre-04', en: 'Petit' },
    care: { file: 'bg-tre-05', en: 'Care' },
    hair: { file: 'bg-tre-06', en: 'Smooth' },
    body: { file: 'bg-tre-07', en: 'Body' },
    booster: { file: 'bg-tre-08', en: 'Skin Booster' },
};

// #TODO: 관리자페이지에서 문구 등록 가능해야할듯
export const PROMOTION_BANNER = {
    file: 'bg-pro',
    lead: 'HA : RU : OO',
    title: '2026 Autumn Event',
    subtitle: '2026년 9월 가을맞이 이벤트',
};
