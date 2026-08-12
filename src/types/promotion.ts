export type Promotion = {
    id: string;
    name: string;
    /** 영문·중문. 비어 있으면 화면에서 한국어로 떨어진다 */
    nameEn?: string;
    nameZh?: string;
    /** 카드 부제. 예: '선 - 페이스라인 탄력케어' */
    highlight: string;
    highlightEn?: string;
    highlightZh?: string;
    description: string;
    descriptionEn?: string;
    descriptionZh?: string;
    /** 할인 전 가격. 할인이 없으면 price 와 같게 넣는다 */
    originPrice: number;
    originPriceEn?: number | null;
    originPriceZh?: number | null;
    price: number;
    /**
     * 언어별 가격. 비어 있으면 기본 가격(원화)을 쓴다.
     * 통화 표기는 messages 의 cart.won 에서 언어별로 붙는다.
     */
    priceEn?: number | null;
    priceZh?: number | null;
    /** 'YYYY-MM-DD'. 이 날짜까지 노출된다 */
    until: string;
    /**
     * 노출할 언어. 비어 있거나 없으면 모두 노출한다.
     * 기존 데이터에 이 필드가 없어도 그대로 보이므로 재입력이 필요 없다.
     */
    locales?: ('ko' | 'en' | 'zh')[];
    order: number;
};

export type PromotionSeed = Omit<Promotion, 'id'>;

/** 할인율은 저장하지 않고 매번 계산한다. 두 곳에 두면 어긋난다 */
export function discountRate(p: Pick<Promotion, 'originPrice' | 'price'>) {
    if (!p.originPrice || p.originPrice <= p.price) return 0;
    return Math.round((1 - p.price / p.originPrice) * 100);
}

/** 마감일까지 남은 일수. 지났으면 음수 */
export function daysLeft(until: string) {
    const end = new Date(`${until}T23:59:59`);
    return Math.ceil((end.getTime() - Date.now()) / 86400000);
}

/** 화면에 쓸 언어 */
export type PromoLocale = 'ko' | 'en' | 'zh';

/** 해당 언어가 비어 있으면 한국어로 떨어진다 */
export function localizedPromo(p: Promotion, field: 'name' | 'highlight' | 'description', locale: string) {
    if (locale === 'en') return p[`${field}En`] || p[field];
    if (locale === 'zh') return p[`${field}Zh`] || p[field];
    return p[field];
}

/**
 * 언어별 가격. 값이 없으면 기본 가격을 쓴다.
 * 나라마다 다르게 책정할 수 있고, 안 채우면 원화 하나로 동작한다.
 */
export function localizedPromoPrice(p: Promotion, locale: string) {
    if (locale === 'en' && p.priceEn != null) return p.priceEn;
    if (locale === 'zh' && p.priceZh != null) return p.priceZh;
    return p.price;
}

/** 할인 전 가격도 같은 방식이다 */
export function localizedOriginPrice(p: Promotion, locale: string) {
    if (locale === 'en' && p.originPriceEn != null) return p.originPriceEn;
    if (locale === 'zh' && p.originPriceZh != null) return p.originPriceZh;
    return p.originPrice;
}
