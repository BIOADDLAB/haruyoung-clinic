/** 장바구니에 담기는 최소 정보. 시술과 프로모션 모두 이 모양으로 눕힌다 */
export type CartItem = {
    /** 'product:{id}' 또는 'promotion:{id}'. 두 컬렉션의 id 가 겹칠 수 있어 접두어를 붙인다 */
    key: string;
    name: string;
    price: number;
    /** 시술이 속한 대메뉴 또는 '프로모션' */
    category: string;
};

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
    /** 합계. 담긴 게 없으면 0 */
    total: number;
    createdAt: number;
};

export type ReservationSeed = Omit<Reservation, 'id'>;
