'use client';

import { useMemo, useState } from 'react';
import { RESERVATION_TONE, WEEKDAYS } from '@/components/admin/reservationUi';
import { toKey, toMin, weekAxisTimes } from '@/components/reservation/slots';
import { defaultReservationHours, isReservationClosed, isReservationForcedOpen, reservationHoursForDate, type ReservationHoursSetting } from '@/types/settings';
import { RESERVATION_STATUS, type Reservation } from '@/types/reservation';

function startOfWeek(d: Date) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    x.setDate(x.getDate() - x.getDay());
    return x;
}

function addDays(d: Date, n: number) {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
}

export default function ReservationWeekView({
    list,
    hours,
    selectedId,
    onSelect,
}: {
    list: Reservation[];
    hours: ReservationHoursSetting | null;
    selectedId: string | null;
    onSelect: (r: Reservation) => void;
}) {
    const cfg = hours ?? defaultReservationHours();
    const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
    const todayKey = toKey(new Date());
    const times = weekAxisTimes(cfg);

    const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

    const byKey = useMemo(() => {
        const map = new Map<string, Reservation[]>();
        for (const r of list) {
            const k = `${r.date}_${r.time}`;
            const row = map.get(k) ?? [];
            row.push(r);
            map.set(k, row);
        }
        return map;
    }, [list]);

    const weekLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()} – ${addDays(weekStart, 6).getMonth() + 1}/${addDays(weekStart, 6).getDate()}`;

    return (
        <div className="mt-6 rounded-xl border border-black/5 bg-white p-3 shadow-sm sm:p-4">
            <div className="mb-4 flex items-center justify-between px-1">
                <button
                    type="button"
                    onClick={() => setWeekStart(addDays(weekStart, -7))}
                    className="rounded-full px-3 py-1 text-sm text-neutral-500 hover:bg-neutral-100"
                >
                    이전
                </button>
                <p className="text-base font-semibold text-[#3a322c]">{weekLabel}</p>
                <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={() => setWeekStart(startOfWeek(new Date()))}
                        className="rounded-full px-3 py-1 text-sm text-neutral-500 hover:bg-neutral-100"
                    >
                        오늘
                    </button>
                    <button
                        type="button"
                        onClick={() => setWeekStart(addDays(weekStart, 7))}
                        className="rounded-full px-3 py-1 text-sm text-neutral-500 hover:bg-neutral-100"
                    >
                        다음
                    </button>
                </div>
            </div>

            <div className="-mx-3 overflow-x-auto px-3 [scrollbar-width:thin]">
                <div className="min-w-[720px]">
                    <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] text-center text-xs text-neutral-500">
                        <div />
                        {days.map((d) => {
                            const key = toKey(d);
                            const today = key === todayKey;
                            return (
                                <div key={key} className={`py-2 ${today ? 'font-semibold text-[#3a322c]' : ''}`}>
                                    <span className="block text-[11px] text-neutral-400">{WEEKDAYS[d.getDay()]}</span>
                                    {d.getMonth() + 1}/{d.getDate()}
                                </div>
                            );
                        })}
                    </div>

                    {times.map((time) => (
                        <div key={time} className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] border-t border-black/5">
                            <div className="flex items-start justify-end pr-2 pt-1 text-[11px] text-neutral-400">
                                {time}
                            </div>
                            {days.map((d) => {
                                const dateKey = toKey(d);
                                const rule = reservationHoursForDate(dateKey, cfg);
                                const weekday = cfg.days[String(d.getDay())];
                                const t = toMin(time);
                                const forced = isReservationForcedOpen(dateKey, cfg);
                                const closed = !weekday?.open && !forced;
                                const holiday = isReservationClosed(dateKey, cfg);
                                const bookable = !!rule;
                                const outside = bookable && (t < toMin(rule.start) || t >= toMin(rule.end));
                                const lunch =
                                    bookable &&
                                    rule.lunch &&
                                    t >= toMin(cfg.lunchStart) &&
                                    t < toMin(cfg.lunchEnd);
                                const items = byKey.get(`${dateKey}_${time}`) ?? [];
                                const muted = closed || holiday || outside || lunch;

                                return (
                                    <div
                                        key={dateKey}
                                        className={`min-h-[44px] border-l border-black/5 p-0.5 ${muted ? 'bg-[#f7f4f0]' : 'bg-white'}`}
                                    >
                                        {items.map((r) => (
                                            <button
                                                key={r.id}
                                                type="button"
                                                onClick={() => onSelect(r)}
                                                className={`mb-0.5 block w-full truncate rounded px-1 py-1 text-left text-[11px] ${RESERVATION_TONE[r.status]} ${
                                                    selectedId === r.id ? 'ring-1 ring-[#3a322c]/40' : ''
                                                }`}
                                                title={`${r.name} · ${RESERVATION_STATUS[r.status]}`}
                                            >
                                                {r.name}
                                            </button>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
