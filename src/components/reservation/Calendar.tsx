'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toKey } from './slots';
import { defaultReservationHours, isReservationDayClosed, type ReservationHoursSetting } from '@/types/settings';

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

export default function Calendar({
    value,
    onChange,
    hours,
}: {
    value: string;
    onChange: (v: string) => void;
    hours?: ReservationHoursSetting | null;
}) {
    const t = useTranslations('reservation');
    const cfg = hours ?? defaultReservationHours();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const last = new Date(today);
    last.setDate(last.getDate() + cfg.maxDays);

    const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    // 1일 앞의 빈 칸
    const blanks = Array.from({ length: first.getDay() });

    const move = (step: number) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + step, 1));

    const prevDisabled = cursor.getFullYear() === today.getFullYear() && cursor.getMonth() === today.getMonth();
    const nextDisabled = cursor.getFullYear() === last.getFullYear() && cursor.getMonth() === last.getMonth();

    return (
        <div className="w-full max-w-[520px] mx-auto">
            <div className="flex items-center justify-between px-2">
                <button
                    type="button"
                    onClick={() => move(-1)}
                    disabled={prevDisabled}
                    aria-label={t('prevMonth')}
                    className="p-2 text-dark/60 transition-colors duration-500 ease-brand hover:text-dark disabled:opacity-25"
                >
                    <Chevron dir={-1} />
                </button>
                <p className="text-small font-semibold">
                    {cursor.getMonth() + 1}월 {cursor.getFullYear()}
                </p>
                <button
                    type="button"
                    onClick={() => move(1)}
                    disabled={nextDisabled}
                    aria-label={t('nextMonth')}
                    className="p-2 text-dark/60 transition-colors duration-500 ease-brand hover:text-dark disabled:opacity-25"
                >
                    <Chevron dir={1} />
                </button>
            </div>

            <div className="mt-6 grid grid-cols-7 gap-y-1 text-center">
                {WEEK.map((w) => (
                    <div key={w} className="pb-3 text-caption-sm font-semibold text-dark/60">
                        {w}
                    </div>
                ))}

                {blanks.map((_, i) => (
                    <div key={`blank-${cursor.getMonth()}-${i}`} />
                ))}

                {Array.from({ length: days }, (_, i) => i + 1).map((day) => {
                    const date = new Date(cursor.getFullYear(), cursor.getMonth(), day);
                    const key = toKey(date);
                    // 휴진 요일·지정 휴진일·지난 날짜·예약 한계 밖은 못 고른다
                    const closed = isReservationDayClosed(key, cfg);
                    const disabled = closed || date < today || date > last;
                    const on = value === key;

                    return (
                        <div key={key} className="flex justify-center py-1">
                            <button
                                type="button"
                                onClick={() => onChange(key)}
                                disabled={disabled}
                                aria-pressed={on}
                                className={`flex h-9 w-9 items-center justify-center rounded-full text-caption transition-colors duration-500 ease-brand ${
                                    on
                                        ? 'bg-dark font-semibold text-cream'
                                        : disabled
                                          ? 'cursor-not-allowed text-dark/25'
                                          : 'text-dark hover:bg-dark/8'
                                }`}
                            >
                                {day}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function Chevron({ dir }: { dir: -1 | 1 }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-5 w-5 ${dir === -1 ? 'rotate-180' : ''}`}
        >
            <path d="M9 5l7 7-7 7" />
        </svg>
    );
}
