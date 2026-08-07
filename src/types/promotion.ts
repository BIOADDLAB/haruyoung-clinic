export type Promotion = {
    id: string;
    name: string;
    /** 카드 부제. 예: '선 - 페이스라인 탄력케어' */
    highlight: string;
    description: string;
    /** 할인 전 가격. 할인이 없으면 price 와 같게 넣는다 */
    originPrice: number;
    price: number;
    /** 'YYYY-MM-DD'. 이 날짜까지 노출된다 */
    until: string;
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
