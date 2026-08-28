import { defaultReservationHours, isReservationClosed, type ReservationHoursSetting } from '@/types/settings';

export const toMin = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
};

export const toLabel = (min: number) =>
    `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

/** 로컬 기준 'YYYY-MM-DD'. toISOString 은 UTC 라 하루 밀린다 */
export function toKey(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * 'YYYY-MM-DD' 의 예약 가능 시간을 30분 단위로 만든다.
 * 마지막 슬롯은 마감 30분 전. 점심시간이 있는 요일은 lunch 구간을 뺀다.
 * 오늘이면 이미 지난 시간과 1시간 안쪽은 제외한다.
 */
export function slotsOf(
    dateKey: string,
    hours?: ReservationHoursSetting | null,
    opts?: { includePast?: boolean },
): string[] {
    if (!dateKey) return [];
    const cfg = hours ?? defaultReservationHours();
    if (isReservationClosed(dateKey, cfg)) return [];
    const date = new Date(`${dateKey}T00:00:00`);
    const rule = cfg.days[String(date.getDay())];
    if (!rule?.open) return [];

    const now = new Date();
    const isToday = dateKey === toKey(now);
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const cutoff = !opts?.includePast && isToday ? Math.ceil(nowMin / 30) * 30 : -1;

    const out: string[] = [];
    for (let m = toMin(rule.start); m <= toMin(rule.end) - 30; m += 30) {
        if (rule.lunch && m >= toMin(cfg.lunchStart) && m < toMin(cfg.lunchEnd)) continue;
        if (m < cutoff) continue;
        out.push(toLabel(m));
    }
    return out;
}

/** 주간 달력 세로축. 열린 요일 중 가장 이른 시작 ~ 가장 늦은 종료를 30분 칸으로 펼친다 */
export function weekAxisTimes(hours?: ReservationHoursSetting | null): string[] {
    const cfg = hours ?? defaultReservationHours();
    let min = Infinity;
    let max = 0;
    for (const rule of Object.values(cfg.days)) {
        if (!rule.open) continue;
        min = Math.min(min, toMin(rule.start));
        max = Math.max(max, toMin(rule.end));
    }
    if (!Number.isFinite(min) || max <= min) return [];
    const out: string[] = [];
    for (let m = min; m < max; m += 30) out.push(toLabel(m));
    return out;
}
