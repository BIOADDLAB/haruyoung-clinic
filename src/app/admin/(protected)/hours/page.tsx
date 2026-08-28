'use client';

import { useEffect, useState } from 'react';
import { getReservationHoursSetting, saveReservationHoursSetting } from '@/lib/settings';
import {
    defaultReservationHours,
    normalizeClosedDates,
    type ReservationDayHours,
    type ReservationHoursSetting,
} from '@/types/settings';
import { toKey } from '@/components/reservation/slots';

const inputBase =
    'w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] text-[#3a322c] outline-none transition focus:border-[#3a322c]/30 focus:ring-2 focus:ring-[#3a322c]/10 disabled:bg-neutral-50 disabled:text-neutral-400';

const DAYS = [
    { key: '0', label: '일요일' },
    { key: '1', label: '월요일' },
    { key: '2', label: '화요일' },
    { key: '3', label: '수요일' },
    { key: '4', label: '목요일' },
    { key: '5', label: '금요일' },
    { key: '6', label: '토요일' },
] as const;

const TIME_OK = /^\d{2}:\d{2}$/;
const DATE_OK = /^\d{4}-\d{2}-\d{2}$/;

const toMin = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
};

export default function HoursPage() {
    const [hours, setHours] = useState<ReservationHoursSetting>(defaultReservationHours);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [closedFrom, setClosedFrom] = useState('');
    const [closedTo, setClosedTo] = useState('');
    const [closedNote, setClosedNote] = useState('');

    useEffect(() => {
        let alive = true;
        getReservationHoursSetting().then((s) => {
            if (!alive) return;
            setHours({
                ...defaultReservationHours(),
                ...s,
                days: { ...defaultReservationHours().days, ...s.days },
                closedDates: normalizeClosedDates(s.closedDates),
            });
            setLoading(false);
        });
        return () => {
            alive = false;
        };
    }, []);

    const setDay = (key: string, patch: Partial<ReservationDayHours>) =>
        setHours((prev) => ({ ...prev, days: { ...prev.days, [key]: { ...prev.days[key], ...patch } } }));

    const addClosedRange = () => {
        if (!DATE_OK.test(closedFrom)) return alert('시작 날짜를 선택하세요.');
        const end = closedTo || closedFrom;
        if (!DATE_OK.test(end)) return alert('종료 날짜를 선택하세요.');
        if (end < closedFrom) return alert('종료일이 시작일보다 빠를 수 없습니다.');

        const note = closedNote.trim();
        setHours((prev) => {
            const next = [...prev.closedDates];
            const have = new Set(next.map((d) => d.date));
            const cursor = new Date(`${closedFrom}T00:00:00`);
            const last = new Date(`${end}T00:00:00`);
            while (cursor <= last) {
                const key = toKey(cursor);
                if (!have.has(key)) {
                    have.add(key);
                    next.push({ date: key, note });
                }
                cursor.setDate(cursor.getDate() + 1);
            }
            next.sort((a, b) => a.date.localeCompare(b.date));
            return { ...prev, closedDates: next };
        });
        setClosedFrom('');
        setClosedTo('');
        setClosedNote('');
    };

    const removeClosed = (date: string) =>
        setHours((prev) => ({ ...prev, closedDates: prev.closedDates.filter((d) => d.date !== date) }));

    const submit = async () => {
        if (!TIME_OK.test(hours.lunchStart) || !TIME_OK.test(hours.lunchEnd)) {
            return alert('점심시간을 HH:MM 형식으로 입력하세요.');
        }
        if (toMin(hours.lunchStart) >= toMin(hours.lunchEnd)) {
            return alert('점심 시작이 점심 종료보다 빨라야 합니다.');
        }
        if (!Number.isFinite(hours.maxDays) || hours.maxDays < 1 || hours.maxDays > 365) {
            return alert('예약 가능 기간은 1~365일 사이여야 합니다.');
        }

        const openDays = DAYS.filter((d) => hours.days[d.key]?.open);
        if (openDays.length === 0) return alert('진료일을 하루 이상 선택하세요.');

        for (const d of openDays) {
            const rule = hours.days[d.key];
            if (!TIME_OK.test(rule.start) || !TIME_OK.test(rule.end)) {
                return alert(`${d.label} 진료시간을 HH:MM 형식으로 입력하세요.`);
            }
            if (toMin(rule.start) >= toMin(rule.end)) {
                return alert(`${d.label} 시작이 종료보다 빨라야 합니다.`);
            }
        }

        setBusy(true);
        try {
            await saveReservationHoursSetting({
                ...hours,
                closedDates: normalizeClosedDates(hours.closedDates),
            });
            alert('저장했습니다.');
        } catch {
            alert('저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setBusy(false);
        }
    };

    if (loading) return <div>불러오는 중...</div>;

    return (
        <div className="w-full max-w-4xl">
            <h1 className="text-2xl font-bold text-[#3a322c] lg:text-3xl">예약 시간 설정</h1>
            <p className="mt-1 text-sm text-neutral-500">
                요일별 진료시간, 점심시간, 추석처럼 예약이 안 되는 날짜를 바꿉니다. 바로예약 달력에 바로 반영됩니다.
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-black/[0.04] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="space-y-5 p-6 sm:p-8">
                    {DAYS.map((d) => {
                        const rule = hours.days[d.key];
                        return (
                            <div
                                key={d.key}
                                className="grid grid-cols-1 items-end gap-3 border-b border-black/[0.06] pb-5 last:border-b-0 last:pb-0 sm:grid-cols-[88px_1fr_1fr_auto]"
                            >
                                <label className="flex items-center gap-2 pb-2 text-sm font-medium text-[#3a322c] sm:pb-2.5">
                                    <input
                                        type="checkbox"
                                        checked={rule.open}
                                        onChange={(e) => setDay(d.key, { open: e.target.checked })}
                                    />
                                    {d.label}
                                </label>
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-[13px] font-medium text-neutral-600">시작</span>
                                    <input
                                        type="time"
                                        value={rule.start}
                                        disabled={!rule.open}
                                        onChange={(e) => setDay(d.key, { start: e.target.value })}
                                        className={inputBase}
                                    />
                                </label>
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-[13px] font-medium text-neutral-600">종료</span>
                                    <input
                                        type="time"
                                        value={rule.end}
                                        disabled={!rule.open}
                                        onChange={(e) => setDay(d.key, { end: e.target.value })}
                                        className={inputBase}
                                    />
                                </label>
                                <label className="flex items-center gap-2 pb-2 text-sm text-neutral-600 sm:pb-2.5">
                                    <input
                                        type="checkbox"
                                        checked={rule.lunch}
                                        disabled={!rule.open}
                                        onChange={(e) => setDay(d.key, { lunch: e.target.checked })}
                                    />
                                    점심 휴진
                                </label>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-black/[0.04] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-3 sm:p-8">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-neutral-600">점심 시작</span>
                        <input
                            type="time"
                            value={hours.lunchStart}
                            onChange={(e) => setHours((prev) => ({ ...prev, lunchStart: e.target.value }))}
                            className={inputBase}
                        />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-neutral-600">점심 종료</span>
                        <input
                            type="time"
                            value={hours.lunchEnd}
                            onChange={(e) => setHours((prev) => ({ ...prev, lunchEnd: e.target.value }))}
                            className={inputBase}
                        />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-neutral-600">예약 가능 기간 (일)</span>
                        <input
                            type="number"
                            min={1}
                            max={365}
                            value={hours.maxDays}
                            onChange={(e) =>
                                setHours((prev) => ({ ...prev, maxDays: Number(e.target.value) || 0 }))
                            }
                            className={inputBase}
                        />
                    </label>
                </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-black/[0.04] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="space-y-5 p-6 sm:p-8">
                    <div>
                        <h2 className="text-base font-semibold text-[#3a322c]">예약 불가 날짜</h2>
                        <p className="mt-1 text-sm text-neutral-500">
                            추석·임시휴진처럼 요일과 관계없이 막을 날짜입니다. 기간을 넣으면 그 사이 날짜가 모두
                            추가됩니다.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-[13px] font-medium text-neutral-600">시작</span>
                            <input
                                type="date"
                                value={closedFrom}
                                onChange={(e) => {
                                    setClosedFrom(e.target.value);
                                    if (!closedTo) setClosedTo(e.target.value);
                                }}
                                className={inputBase}
                            />
                        </label>
                        <label className="flex flex-col gap-1.5">
                            <span className="text-[13px] font-medium text-neutral-600">종료</span>
                            <input
                                type="date"
                                value={closedTo}
                                onChange={(e) => setClosedTo(e.target.value)}
                                className={inputBase}
                            />
                        </label>
                        <label className="flex flex-col gap-1.5">
                            <span className="text-[13px] font-medium text-neutral-600">메모</span>
                            <input
                                type="text"
                                value={closedNote}
                                onChange={(e) => setClosedNote(e.target.value)}
                                placeholder="추석"
                                className={inputBase}
                            />
                        </label>
                        <button
                            type="button"
                            onClick={addClosedRange}
                            className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-[#3a322c]"
                        >
                            추가
                        </button>
                    </div>

                    {hours.closedDates.length === 0 ? (
                        <p className="text-sm text-neutral-400">등록된 날짜가 없습니다.</p>
                    ) : (
                        <ul className="flex flex-col gap-2">
                            {hours.closedDates.map((d) => (
                                <li
                                    key={d.date}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.06] bg-neutral-50 px-3.5 py-2.5"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-[#3a322c]">{d.date}</p>
                                        {d.note && <p className="text-xs text-neutral-500">{d.note}</p>}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeClosed(d.date)}
                                        className="shrink-0 text-xs text-red-500"
                                    >
                                        삭제
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="flex justify-end border-t border-black/[0.06] bg-neutral-50 px-6 py-4 sm:px-8">
                    <button
                        type="button"
                        onClick={submit}
                        disabled={busy}
                        className="rounded-xl bg-[#3a322c] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                    >
                        {busy ? '저장 중…' : '저장'}
                    </button>
                </div>
            </div>
        </div>
    );
}
