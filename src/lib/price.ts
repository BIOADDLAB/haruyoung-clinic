/** 관리자 가격 입력값에는 숫자만 남기고 천 단위 쉼표를 붙인다. */
export function formatPriceInput(value: string | number | null | undefined) {
    const digits = String(value ?? '').replace(/\D/g, '');
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** 화면용 쉼표를 제거해 Firestore에 저장할 숫자로 바꾼다. */
export function parsePriceInput(value: string) {
    const digits = value.replace(/\D/g, '');
    return digits === '' ? null : Number(digits);
}
