import { RESERVATION_HOURS } from '@/data/site';

const toMin = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
};

const toLabel = (min: number) =>
    `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

/**
 * 'YYYY-MM-DD' 의 예약 가능 시간을 30분 단위로 만든다.
 * 마지막 슬롯은 마감 30분 전. 점심시간(13:00~14:00)이 있는 요일은 그 구간을 뺀다.
 */
export function slotsOf(dateKey: string): string[] {
    if (!dateKey) return [];
    const day = new Date(`${dateKey}T00:00:00`).getDay();
    const rule = RESERVATION_HOURS[day];
    if (!rule) return [];

    const out: string[] = [];
    for (let m = toMin(rule.start); m <= toMin(rule.end) - 30; m += 30) {
        if (rule.lunch && m >= toMin('13:00') && m < toMin('14:00')) continue;
        out.push(toLabel(m));
    }
    return out;
}
