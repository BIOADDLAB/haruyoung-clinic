/** 한 시술을 1회 / 5회 / 10회처럼 나눠 팔 때 쓰는 가격 */
export type PriceTier = {
    sessions: number;
    price: number | null;
    priceEn?: number | null;
    priceZh?: number | null;
};

export type Product = {
    id: string;
    menuCategory: string;
    menuSlug: string;
    /** 페이지 안 섹션 제목. 예: 주름 보톡스 / 여성 제모 - 얼굴 */
    subCategory: string;
    name: string;
    /** 영문·중문 시술명. 비어 있으면 화면에서 한국어로 떨어진다 */
    nameEn?: string;
    nameZh?: string;
    highlight: string;
    highlightEn?: string;
    highlightZh?: string;
    description: string;
    descriptionEn?: string;
    descriptionZh?: string;
    price: number | null;
    /**
     * 언어별 가격. 비어 있으면 기본 가격(원화)을 쓴다.
     * 통화 표기는 messages 의 cart.won 에서 언어별로 붙는다.
     */
    priceEn?: number | null;
    priceZh?: number | null;
    /** 있으면 단일 가격 대신 회차별 가격을 보여준다. 없으면 예전처럼 price 하나만 쓴다 */
    priceTiers?: PriceTier[];
    /**
     * 노출할 언어. 비어 있거나 없으면 모두 노출한다.
     * 기존 데이터에 이 필드가 없어도 그대로 보이므로 재입력이 필요 없다.
     */
    locales?: ('ko' | 'en' | 'zh')[];
    order: number;
};

export type ProductSeed = Omit<Product, 'id'>;

/** 화면에 쓸 언어. 다국어 라우팅이 붙기 전까지는 'ko' 고정이다 */
export type Locale = 'ko' | 'en' | 'zh';

/**
 * 해당 언어가 비어 있으면 한국어로 떨어진다.
 * 269건을 다 번역하기 전에도 화면이 안 깨진다.
 */
export function localized(p: Product, field: 'name' | 'highlight' | 'description', locale: Locale) {
    if (locale === 'en') return p[`${field}En`] || p[field];
    if (locale === 'zh') return p[`${field}Zh`] || p[field];
    return p[field];
}

/** 회차가 있는 시술인지. 공개 카드 레이아웃을 나눌 때 쓴다 */
export function hasPriceTiers(p: Product) {
    return usableTiers(p).length > 0;
}

/** 횟수가 있는 회차만 오름차순으로 돌려준다 */
export function usableTiers(p: Product): PriceTier[] {
    return [...(p.priceTiers ?? [])]
        .filter((tier) => Number.isFinite(tier.sessions) && tier.sessions > 0)
        .sort((a, b) => a.sessions - b.sessions);
}

export function localizedTierPrice(tier: PriceTier, locale: Locale) {
    if (locale === 'en' && tier.priceEn != null) return tier.priceEn;
    if (locale === 'zh' && tier.priceZh != null) return tier.priceZh;
    return tier.price;
}

/**
 * 언어별 가격. 값이 없으면 기본 가격을 쓴다.
 * 나라마다 다르게 책정할 수 있고, 안 채우면 원화 하나로 동작한다.
 * 회차가 있으면 그중 가장 낮은 가격을 돌려준다.
 */
export function localizedPrice(p: Product, locale: Locale) {
    const tiers = usableTiers(p);
    if (tiers.length > 0) {
        const prices = tiers
            .map((tier) => localizedTierPrice(tier, locale))
            .filter((n): n is number => n != null);
        return prices.length ? Math.min(...prices) : null;
    }
    if (locale === 'en' && p.priceEn != null) return p.priceEn;
    if (locale === 'zh' && p.priceZh != null) return p.priceZh;
    return p.price;
}
