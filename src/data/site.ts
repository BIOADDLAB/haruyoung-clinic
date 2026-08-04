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
    address: '서울 강남구 언주로 538 대웅빌딩 1층',
    subway: '9호선 선정릉역 4번 출구 도보 11분',
    parking: '무료주차 / 발렛 이용 시 3,000원',
    hours: [
        { day: '월 금', time: '13:00 - 21:00' },
        { day: '화 수 목', time: '10:00 - 19:00' },
        { day: '토요일', time: '10:00 - 15:00' },
        { day: '점심', time: '13:00 - 14:00' },
    ],
    hourNotes: ['월/토: 점심시간 없이 진료', '일요일: 휴진'],
    ceo: '유선민',
    bizNo: '876-48-01029',
    tel: '00-000-0000',
} as const;

export const POLICY_LINKS = [
    { label: '비급여수가표', href: '/treatments' },
    { label: '이용약관', href: '/terms' },
    { label: '개인정보처리방침', href: '/privacy' },
] as const;
