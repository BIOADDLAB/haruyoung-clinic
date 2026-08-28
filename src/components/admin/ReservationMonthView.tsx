'use client';

import { useState } from 'react';
import { RESERVATION_TONE, WEEKDAYS } from '@/components/admin/reservationUi';
import { toKey } from '@/components/reservation/slots';
import { RESERVATION_STATUS, type Reservation } from '@/types/reservation';

export default function ReservationMonthView({
    list,
    selectedId,
    onSelect,
}: {
    list: Reservation[];
    selectedId: string | null;
    onSelect: (r: Reservation) => void;
}) {
    const [cursor, setCursor] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));

    const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const blanks = Array.from({ length: new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay() });
    const todayKey = toKey(new Date());
    const prefix = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;

    const byDay = new Map<string, Reservation[]>();
    for (const r of list) {
        if (!r.date.startsWith(prefix)) continue;
        const row = byDay.get(r.date) ?? [];
        row.push(r);
        byDay.set(r.date, row);
    }
    for (const row of byDay.values()) {
        row.sort((a, b) => a.time.localeCompare(b.time));
    }

    return (
        <div className="mt-6 rounded-xl border border-black/5 bg-white p-3 shadow-sm sm:p-4">
            <div className="mb-4 flex items-center justify-between px-1">
                <button
                    type="button"
                    onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                    className="rounded-full px-3 py-1 text-sm text-neutral-500 hover:bg-neutral-100"
                >
                    이전
                </button>
                <p className="text-base font-semibold text-[#3a322c]">
                    {cursor.getFullYear()}년 {cursor.getMonth() + 1}월
                </p>
                <button
                    type="button"
                    onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                    className="rounded-full px-3 py-1 text-sm text-neutral-500 hover:bg-neutral-100"
                >
                    다음
                </button>
            </div>

            <div className="grid grid-cols-7 text-center text-[11px] font-medium text-neutral-400 sm:text-xs">
                {WEEKDAYS.map((w) => (
                    <div key={w} className="py-2">
                        {w}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-black/5">
                {blanks.map((_, i) => (
                    <div key={`b-${i}`} className="min-h-[92px] bg-[#f7f4f0] sm:min-h-[120px]" />
                ))}
                {Array.from({ length: days }, (_, i) => i + 1).map((day) => {
                    const key = `${prefix}-${String(day).padStart(2, '0')}`;
                    const items = byDay.get(key) ?? [];
                    const today = key === todayKey;
                    return (
                        <div
                            key={key}
                            className={`min-h-[92px] bg-white p-1 sm:min-h-[120px] sm:p-1.5 ${today ? 'ring-1 ring-inset ring-[#3a322c]/30' : ''}`}
                        >
                            <p
                                className={`mb-1 text-right text-xs ${today ? 'font-semibold text-[#3a322c]' : 'text-neutral-500'}`}
                            >
                                {day}
                            </p>
                            <div className="flex flex-col gap-0.5">
                                {items.slice(0, 3).map((r) => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => onSelect(r)}
                                        className={`truncate rounded px-1 py-0.5 text-left text-[10px] leading-tight sm:text-[11px] ${RESERVATION_TONE[r.status]} ${
                                            selectedId === r.id ? 'ring-1 ring-[#3a322c]/40' : ''
                                        }`}
                                        title={`${r.time} ${r.name} · ${RESERVATION_STATUS[r.status]}`}
                                    >
                                        <span className="font-medium">{r.time}</span> {r.name}
                                    </button>
                                ))}
                                {items.length > 3 && (
                                    <p className="px-1 text-[10px] text-neutral-400">+{items.length - 3}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
