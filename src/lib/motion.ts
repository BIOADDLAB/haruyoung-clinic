import type { Variants } from 'framer-motion';

/**
 * 애니메이션 컨셉 — "머무는 한 순간(A Moment of Pause)"
 * 요소는 튀어나오지 않고, 정지해 있던 것이 천천히 초점이 맞듯 떠오른다.
 * 전 구간 동일 이징 / 0.4~0.8s / framer-motion 단일 사용.
 */
export const EASE = [0.22, 1, 0.36, 1] as const;

export const DUR = {
    fast: 0.4,
    base: 0.6,
    slow: 0.8,
} as const;

/** 화면에 80px 들어온 뒤 발동 — 가장자리에서 어색하게 터지는 것 방지 */
export const VIEWPORT = { once: true, margin: '-80px' } as const;

const t = (duration: number, delay = 0) => ({ duration, delay, ease: EASE });

/** 기본 진입 — 본문 블록 */
export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: t(DUR.base) },
};

/** 헤드라인·타이틀 — 더 느리게 */
export const fadeUpSlow: Variants = {
    hidden: { opacity: 0, y: 36 },
    show: { opacity: 1, y: 0, transition: t(DUR.slow) },
};

/** 배경·이미지 — 위치 이동 없이 밝기만 */
export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: t(DUR.slow) },
};

/** 좌우 교차 레이아웃 */
export const slideLeft: Variants = {
    hidden: { opacity: 0, x: 40 },
    show: { opacity: 1, x: 0, transition: t(DUR.base) },
};
export const slideRight: Variants = {
    hidden: { opacity: 0, x: -40 },
    show: { opacity: 1, x: 0, transition: t(DUR.base) },
};

/** 강조 카드 — 아주 약한 스케일 */
export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.96 },
    show: { opacity: 1, scale: 1, transition: t(DUR.base) },
};

/** 헤어라인 — 좌에서 우로 그어짐 */
export const drawLine: Variants = {
    hidden: { scaleX: 0 },
    show: { scaleX: 1, transition: t(DUR.slow) },
};

/** 리스트 부모 — 자식을 0.12s 간격으로 순차 등장 */
export const stagger: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } },
};
