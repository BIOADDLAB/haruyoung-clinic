'use client';

import { useEffect, useState } from 'react';
import ReservationDetail from '@/components/admin/ReservationDetail';
import ReservationMonthView from '@/components/admin/ReservationMonthView';
import ReservationWeekView from '@/components/admin/ReservationWeekView';
import { RESERVATION_TONE, VISIT_LABEL } from '@/components/admin/reservationUi';
import {
    deleteReservation,
    getReservations,
    reconcileReservationSlot,
    syncReservationSlots,
    updateReservation,
} from '@/lib/reservations';
import { getReservationHoursSetting } from '@/lib/settings';
import { RESERVATION_STATUS, type Reservation } from '@/types/reservation';
import type { ReservationHoursSetting } from '@/types/settings';

const FILTERS = [
    { key: 'all', label: '전체' },
    ...Object.entries(RESERVATION_STATUS).map(([k, v]) => ({ key: k, label: v })),
];

const VIEWS = [
    { key: 'list', label: '목록' },
    { key: 'week', label: '주' },
    { key: 'month', label: '월' },
] as const;

type ViewKey = (typeof VIEWS)[number]['key'];

export default function ReservationsPage() {
    const [all, setAll] = useState<Reservation[]>([]);
    const [hours, setHours] = useState<ReservationHoursSetting | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [view, setView] = useState<ViewKey>('list');
    const [openId, setOpenId] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;
        Promise.all([getReservations(), getReservationHoursSetting()]).then(async ([data, h]) => {
            if (!alive) return;
            await syncReservationSlots(data).catch((e) => console.warn('[reservations] 슬롯 동기화 실패', e));
            if (!alive) return;
            setAll(data);
            setHours(h);
            setLoading(false);
        });
        return () => {
            alive = false;
        };
    }, []);

    const list = filter === 'all' ? all : all.filter((r) => r.status === filter);
    const open = all.find((r) => r.id === openId) ?? null;

    const patch = async (id: string, data: Partial<Reservation>) => {
        const prev = all.find((r) => r.id === id);
        const next = all.map((r) => (r.id === id ? { ...r, ...data } : r));
        setAll(next);
        await updateReservation(id, data);
        const date = data.date ?? prev?.date;
        const time = data.time ?? prev?.time;
        if (date && time) await reconcileReservationSlot(date, time, next);
    };

    const remove = async (r: Reservation) => {
        if (!confirm(`${r.name} (${r.date} ${r.time}) 예약을 완전히 삭제할까요?\n기록이 남지 않습니다.`)) return;
        const next = all.filter((x) => x.id !== r.id);
        setAll(next);
        if (openId === r.id) setOpenId(null);
        await deleteReservation(r.id);
        await reconcileReservationSlot(r.date, r.time, next);
    };

    if (loading) return <div>불러오는 중...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-[#3a322c] lg:text-3xl">예약 관리</h1>
            <p className="mt-2 text-sm text-neutral-500">같은 30분 칸에는 예약이 한 건만 들어갑니다.</p>

            <div className="mt-6 flex gap-1 rounded-full bg-white p-1 shadow-sm ring-1 ring-black/5">
                {VIEWS.map((v) => (
                    <button
                        key={v.key}
                        type="button"
                        onClick={() => setView(v.key)}
                        className={`flex-1 rounded-full px-3 py-1.5 text-sm ${
                            view === v.key ? 'bg-[#3a322c] text-white' : 'text-neutral-600'
                        }`}
                    >
                        {v.label}
                    </button>
                ))}
            </div>

            <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0 [&::-webkit-scrollbar]:hidden">
                {FILTERS.map((f) => (
                    <button
                        key={f.key}
                        type="button"
                        onClick={() => setFilter(f.key)}
                        className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm ${
                            filter === f.key ? 'bg-[#3a322c] text-white' : 'border border-black/10 bg-white'
                        }`}
                    >
                        {f.label}
                        <span className="ml-1.5 text-xs opacity-60">
                            {f.key === 'all' ? all.length : all.filter((r) => r.status === f.key).length}
                        </span>
                    </button>
                ))}
            </div>

            {view === 'list' && (
                <div className="mt-6 flex flex-col gap-2">
                    {list.map((r) => {
                        const isOpen = openId === r.id;
                        return (
                            <div key={r.id} className="rounded-lg border border-black/5 bg-white shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => setOpenId(isOpen ? null : r.id)}
                                    className="w-full p-4 text-left"
                                >
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                        <span
                                            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${RESERVATION_TONE[r.status]}`}
                                        >
                                            {RESERVATION_STATUS[r.status]}
                                        </span>
                                        <span className="shrink-0 text-sm">
                                            {r.date} {r.time}
                                        </span>
                                        <span className="shrink-0 font-medium">{r.name}</span>
                                        <span className="shrink-0 text-sm text-neutral-500">{r.phone}</span>
                                        <span className="ml-auto shrink-0 text-sm">
                                            {r.total > 0 ? `${r.total.toLocaleString()}원` : '-'}
                                        </span>
                                        <span className="shrink-0 text-neutral-400">{isOpen ? '▲' : '▼'}</span>
                                    </div>

                                    <p className="mt-2 truncate text-sm text-neutral-500">
                                        {VISIT_LABEL[r.visitType] ?? r.visitType}
                                        {r.category && ` · ${r.category}`}
                                        {r.items.length > 0 && ` · ${r.items[0].name}`}
                                        {r.items.length > 1 && ` 외 ${r.items.length - 1}건`}
                                    </p>
                                </button>

                                {isOpen && <ReservationDetail r={r} onPatch={patch} onRemove={remove} />}
                            </div>
                        );
                    })}
                    {list.length === 0 && <p className="mt-2 text-neutral-400">해당하는 예약이 없습니다.</p>}
                </div>
            )}

            {view === 'week' && (
                <ReservationWeekView list={list} hours={hours} selectedId={openId} onSelect={(r) => setOpenId(r.id)} />
            )}

            {view === 'month' && (
                <ReservationMonthView list={list} selectedId={openId} onSelect={(r) => setOpenId(r.id)} />
            )}

            {view !== 'list' && open && (
                <div className="mt-4 rounded-lg border border-black/5 bg-white shadow-sm">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${RESERVATION_TONE[open.status]}`}>
                            {RESERVATION_STATUS[open.status]}
                        </span>
                        <span className="text-sm">
                            {open.date} {open.time}
                        </span>
                        <span className="font-medium">{open.name}</span>
                        <span className="text-sm text-neutral-500">{open.phone}</span>
                        <button type="button" onClick={() => setOpenId(null)} className="ml-auto text-sm text-neutral-400">
                            닫기
                        </button>
                    </div>
                    <ReservationDetail r={open} onPatch={patch} onRemove={remove} />
                </div>
            )}
        </div>
    );
}
