const TREATMENT_ORDER = [
    'zeroaging',
    'lifting',
    'pigment',
    'acne',
    'body',
    'petit',
    'booster',
    'care',
    'iv',
    'hair',
] as const;

export const SITE_CONFIG = {
    url: 'https://haruyoung-clinic.vercel.app',
    googleSiteVerification: '',
};

/** key 는 messages 의 banner 네임스페이스 키다 */
const treatments = TREATMENT_ORDER.map((slug) => ({ key: slug, href: `/treatments/${slug}` }));

export const MENU_GROUPS = [
    {
        title: 'HARUYOUNG',
        items: [
            { key: 'philosophy', href: '/about#philosophy' },
            { key: 'specialist', href: '/about#specialist' },
            { key: 'space', href: '/about#space' },
            { key: 'beforeAfter', href: '/before-after' },
        ],
    },
    { title: 'TREATMENTS', items: treatments },
    { title: 'PROMOTION', items: [{ key: 'promotion', href: '/promotion' }] },
    { title: 'PRECAUTIONS', items: [{ key: 'precautions', href: '/precautions' }] },
] as const;

export const CLINIC = {
    name: '하루영의원',

    /**
     * day 는 화면 표기용이라 글자를 공백으로 띄워 적는다 (43px 폭 안에서 양끝 정렬).
     * 그대로 읽히면 "월 금" 이 되므로 스크린리더·검색엔진용 문장은 aria 에 따로 둔다.
     */
    /** 시간은 언어와 무관하다. 요일 라벨만 messages 의 footer 에서 꺼낸다 */
    hours: [
        { key: 'day1', time: '11:00 - 20:00', schemaDays: ['Monday', 'Friday'] },
        { key: 'day2', time: '10:00 - 19:00', schemaDays: ['Tuesday', 'Thursday'] },
        { key: 'day3', time: '10:00 - 16:30', schemaDays: ['Saturday'] },
        { key: 'day4', time: '14:00 - 15:00', schemaDays: [] },
    ],
    hourNotes: ['note1', 'note2'],

    bizNo: '203-49-64257',
    tel: '031-215-0424',

    /** 푸터 구글 지도. 주소로 검색해야 광교스타천(광교중앙로 319)에 핀이 맞는다 */
    mapQuery: '경기도 용인시 수지구 광교중앙로 319',
    lat: 37.29853,
    lng: 127.06913,
} as const;

/** TODO: 실제 카카오 채널 주소로 교체 */
export const KAKAO_CHANNEL = 'http://pf.kakao.com/_kbhSX';

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

export const NOTICE_LINKS = [
    { key: 'cert', src: '/images/cert.jpeg' },
    { key: 'rights', src: '/images/rights.jpeg' },
] as const;

export const POLICY_LINKS = [
    { key: 'priceList', href: '/treatments' },
    { key: 'terms', href: '/terms' },
    { key: 'privacy', href: '/privacy' },
] as const;

/**
 * 좌측 서브 내비. 헤더와 같은 영문 대문자 표기를 쓴다 (messages 의 nav).
 * 헤더 Promotion 그룹 항목은 언어별 표기를 유지해야 해서 키를 subPromotion 으로 따로 뒀다.
 *
 * 프로모션과 시술은 서로 섞지 않는다.
 * 프로모션 페이지에서는 프로모션만, 시술 페이지에서는 시술만 보인다.
 */
export const PROMOTION_SUB_NAV = [{ key: 'subPromotion', href: '/promotion' }] as const;

export const TREATMENT_SUB_NAV = TREATMENT_ORDER.map((slug) => ({
    key: slug,
    href: `/treatments/${slug}`,
})) as readonly { key: string; href: string }[];

/** 방문 형태. 값은 키로 저장하고 화면에서만 번역한다 */
export const VISIT_TYPES = ['visitFirst', 'visitAgain'] as const;

/**
 * 요일별 예약 가능 구간. 0=일 … 6=토. 없는 요일은 휴진이다.
 * 수(3)·일(0)은 휴진이라 아예 없다.
 * lunch 가 false 면 점심시간에도 예약을 받는다 (토는 점심시간 없이 진료).
 */
export const RESERVATION_HOURS: Record<number, { start: string; end: string; lunch: boolean }> = {
    1: { start: '11:00', end: '20:00', lunch: true },
    2: { start: '10:00', end: '19:00', lunch: true },
    4: { start: '10:00', end: '19:00', lunch: true },
    5: { start: '11:00', end: '20:00', lunch: true },
    6: { start: '10:00', end: '16:30', lunch: false },
};

/** 점심시간. 이 구간의 슬롯은 예약에서 뺀다 */
export const RESERVATION_LUNCH = { start: '14:00', end: '15:00' } as const;

/** 오늘부터 이만큼 뒤까지만 예약을 받는다 */
export const RESERVATION_MAX_DAYS = 60;

export const TREATMENT_BANNER: Record<string, { file: string; en: string }> = {
    zeroaging: { file: 'bg-tre-08', en: 'Zero Aging Project' },
    lifting: { file: 'bg-tre-01', en: 'Zero Lifting' },
    pigment: { file: 'bg-tre-02', en: 'Zero Pigments' },
    acne: { file: 'bg-tre-03', en: 'Zero Acne' },
    body: { file: 'bg-tre-07', en: 'Zero Fat' },
    petit: { file: 'bg-tre-04', en: 'Petite' },
    care: { file: 'bg-tre-05', en: 'Skin Care' },
    iv: { file: 'bg-tre-05', en: 'IV Therapy' },
    hair: { file: 'bg-tre-06', en: 'Hair Removal' },
    booster: { file: 'bg-tre-08', en: 'Skin Boosters' },
};

/**
 * 프로모션 배너 기본값.
 * 문구는 관리자 > 사이트 설정에서 덮어쓴다. Firestore 에 값이 없을 때만 이 값이 보인다.
 */
export const PROMOTION_BANNER = {
    file: 'bg-pro',
    /** 배너 맨 위 로고 타이포 이미지 */
    logo: '/images/l-haru-w.png',
    title: '2026 Autumn Event',
    subtitle: '2026년 9월 가을맞이 이벤트',
};

/**
 * 홈 히어로 배너 기본값.
 * 문구는 관리자 > 메인 배너 설정에서 덮어쓴다. Firestore 에 값이 없을 때만 이 값이 보인다.
 */
export const HERO_BANNER = {
    slogan: 'A LITTLE YOUNGER, EVERY DAY.',
    sloganEn: 'A LITTLE YOUNGER, EVERY DAY.',
    sloganZh: 'A LITTLE YOUNGER, EVERY DAY.',
    sub: '오늘보다, 하루 더 젊게.',
    subEn: 'One day younger than today.',
    subZh: '比今天，更年轻一天。',
    cta: 'VISIT HARUYOUNG',
    ctaEn: 'VISIT HARUYOUNG',
    ctaZh: 'VISIT HARUYOUNG',
};
