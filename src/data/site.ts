import { MENU_CATEGORIES } from '@/constants/categories';

/** 시안 메뉴 노출 순서 (constants/categories.ts 의 등록 순서와 다름) */
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
    /** TODO: 개원 전이라 미확정. 확정되면 여기만 고치면 푸터 표기와 지도 쿼리가 함께 바뀐다 */
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
