import { MENU_CATEGORIES } from '@/constants/categories';

const TREATMENT_ORDER = ['lifting', 'pigment', 'acne', 'petit', 'care', 'hair', 'body', 'booster'] as const;

const treatments = TREATMENT_ORDER.map((slug) => {
    const c = MENU_CATEGORIES.find((m) => m.slug === slug)!;
    return { label: c.name, href: `/treatments/${c.slug}` };
});

export const MENU_GROUPS = [
    {
        title: 'Haru Young',
        items: [
            { label: '하루영 철학', href: '/about#philosophy' },
            { label: '원장 소개', href: '/about#specialist' },
            { label: '공간 소개', href: '/about#space' },
        ],
    },
    { title: 'Treatments', items: treatments },
    { title: 'Promotion', items: [{ label: '프로모션', href: '/promotion' }] },
    { title: 'Precautions', items: [{ label: '시술 후 주의사항', href: '/precautions' }] },
] as const;

export const CLINIC = {
    name: '하루영의원',
    /** #TODO: 개원 전이라 미확정. 확정되면 여기만 고치면 푸터 표기와 지도 쿼리가 함께 바뀐다 */
    address: '서울 강남구 언주로 538 대웅빌딩 1층',
    subway: '9호선 선정릉역 4번 출구 도보 11분',
    parking: '무료주차 / 발렛 이용 시 3,000원',
    /**
     * day 는 화면 표기용이라 글자를 공백으로 띄워 적는다 (43px 폭 안에서 양끝 정렬).
     * 그대로 읽히면 "월 금" 이 되므로 스크린리더·검색엔진용 문장은 aria 에 따로 둔다.
     */
    hours: [
        { day: '월 금', aria: '월요일과 금요일', time: '13:00 - 21:00' },
        { day: '화 수 목', aria: '화요일, 수요일, 목요일', time: '10:00 - 19:00' },
        { day: '토요일', aria: '토요일', time: '10:00 - 15:00' },
        { day: '점심', aria: '점심시간', time: '13:00 - 14:00' },
    ],
    hourNotes: ['월 / 토: 점심시간 없이 진료', '일요일: 휴진'],
    ceo: '유선민',
    bizNo: '876-48-01029',
    tel: '00-000-0000',
} as const;

/** TODO: 실제 카카오 채널 주소로 교체 */
export const KAKAO_CHANNEL = 'https://pf.kakao.com/_haruyoung';

/** 헤더 레일 하단 바로가기 — 상담예약은 전화연결, 바로예약은 예약 페이지, 카카오톡은 채널 */
export const QUICK_LINKS = [
    { icon: 'i-h-02', label: '상담예약', href: `tel:${CLINIC.tel.replace(/-/g, '')}`, external: true },
    { icon: 'i-h-03', label: '바로예약', href: '/reservation', external: false },
    { icon: 'i-h-05', label: '카카오톡', href: KAKAO_CHANNEL, external: true },
] as const;

/** 언어 전환. TODO: next-intl 등 라우팅 붙으면 code 를 locale 로 사용 */
export const LANGS = [
    { code: 'ko', label: 'KO', name: '한국어' },
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'cn', label: 'CN', name: '中文' },
] as const;

export type LangCode = (typeof LANGS)[number]['code'];

export const POLICY_LINKS = [
    { label: '비급여수가표', href: '/treatments' },
    { label: '이용약관', href: '/terms' },
    { label: '개인정보처리방침', href: '/privacy' },
] as const;

/** 시술·프로모션 페이지 좌측 서브 내비. 시안 순서 그대로 */
export const SUB_NAV = [
    { label: '프로모션', href: '/promotion' },
    ...['lifting', 'pigment', 'acne', 'petit', 'care', 'hair', 'body', 'booster'].map((slug) => {
        const c = MENU_CATEGORIES.find((m) => m.slug === slug)!;
        return { label: c.name, href: `/treatments/${c.slug}` };
    }),
] as const;

/** 방문 형태 */
export const VISIT_TYPES = ['초진', '재진'] as const;

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
