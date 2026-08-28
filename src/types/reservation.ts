export type CartItem = {
    /** 'product:{id}' 또는 'promotion:{id}'. 두 컬렉션의 id 가 겹칠 수 있어 접두어를 붙인다 */
    key: string;
    name: string;
    price: number;
    category: string;
    /** 프로모션만 채운다. 할인 전 가격. 없거나 price 와 같으면 할인이 없는 것 */
    originPrice?: number;
    /** 카드에서 보던 설명. 장바구니에서도 무엇을 담았는지 알 수 있어야 한다 */
    description?: string;
    /** 회차별 가격을 고른 시술만 채운다. 예: 5 */
    sessions?: number;
};

/** 대기 → 확정 → 완료. 취소는 어느 단계에서든 가능 */
export const RESERVATION_STATUS = {
    pending: '대기',
    confirmed: '확정',
    done: '완료',
    canceled: '취소',
} as const;

export type ReservationStatus = keyof typeof RESERVATION_STATUS;

/** 이 상태면 해당 30분 칸을 차지한다. 취소만 자리를 비운다 */
export function holdsReservationSlot(status: ReservationStatus) {
    return status === 'pending' || status === 'confirmed' || status === 'done';
}

export type Reservation = {
    id: string;
    name: string;
    phone: string;
    /** 초진 / 재진 */
    visitType: string;
    /** 장바구니 없이 바로예약할 때 고르는 대메뉴. 장바구니 경로면 빈 문자열 */
    category: string;
    items: CartItem[];
    /** 'YYYY-MM-DD' */
    date: string;
    /** 'HH:mm' */
    time: string;
    total: number;
    status: ReservationStatus;
    /** 통화 내용 등 원내 메모. 고객에게 보이지 않는다 */
    memo: string;
    createdAt: number;
};

export type ReservationSeed = Omit<Reservation, 'id'>;
