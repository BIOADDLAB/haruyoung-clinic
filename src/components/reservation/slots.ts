import { RESERVATION_HOURS } from '@/data/site';

const toMin = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
};

const toLabel = (min: number) =>
    `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

/** 로컬 기준 'YYYY-MM-DD'. toISOString 은 UTC 라 하루 밀린다 */
export function toKey(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * 'YYYY-MM-DD' 의 예약 가능 시간을 30분 단위로 만든다.
 * 마지막 슬롯은 마감 30분 전. 점심시간이 있는 요일은 13:00~14:00 을 뺀다.
 * 오늘이면 이미 지난 시간과 1시간 안쪽은 제외한다.
 */
export function slotsOf(dateKey: string): string[] {
    if (!dateKey) return [];
    const date = new Date(`${dateKey}T00:00:00`);
    const rule = RESERVATION_HOURS[date.getDay()];
    if (!rule) return [];

    const now = new Date();
    const isToday = dateKey === toKey(now);
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const cutoff = isToday ? Math.ceil(nowMin / 30) * 30 : -1;

    const out: string[] = [];
    for (let m = toMin(rule.start); m <= toMin(rule.end) - 30; m += 30) {
        if (rule.lunch && m >= toMin('13:00') && m < toMin('14:00')) continue;
        if (m < cutoff) continue;
        out.push(toLabel(m));
    }
    return out;
}
