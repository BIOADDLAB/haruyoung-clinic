'use client';

import { useEffect, useState } from 'react';
import { deleteReservation, getReservations, updateReservation } from '@/lib/reservations';
import { RESERVATION_STATUS, type Reservation, type ReservationStatus } from '@/types/reservation';

const TONE: Record<ReservationStatus, string> = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    done: 'bg-neutral-200 text-neutral-600',
    canceled: 'bg-rose-100 text-rose-700',
};

const FILTERS = [
    { key: 'all', label: '전체' },
    ...Object.entries(RESERVATION_STATUS).map(([k, v]) => ({ key: k, label: v })),
];

export default function ReservationsPage() {
    const [all, setAll] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [openId, setOpenId] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;
        getReservations().then((data) => {
            if (!alive) return;
            setAll(data);
            setLoading(false);
        });
        return () => {
            alive = false;
        };
    }, []);

    const list = filter === 'all' ? all : all.filter((r) => r.status === filter);

    /** 낙관적 갱신. 화면을 먼저 바꾸고 서버에 쓴다 */
    const patch = async (id: string, data: Partial<Reservation>) => {
        setAll((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
        await updateReservation(id, data);
    };

    /**
     * 삭제. 보통 병원에서는 기록 보존 때문에 '취소' 상태로만 남기고 지우지 않는다.
     * 테스트 데이터나 중복 접수를 정리할 때만 쓰도록 확인을 두 번 받는다.
     */
    const remove = async (r: Reservation) => {
        if (!confirm(`${r.name} (${r.date} ${r.time}) 예약을 완전히 삭제할까요?\n기록이 남지 않습니다.`)) return;
        setAll((prev) => prev.filter((x) => x.id !== r.id));
        await deleteReservation(r.id);
    };

    if (loading) return <div>불러오는 중...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-[#3a322c] lg:text-3xl">예약 관리</h1>

            <div className="-mx-5 mt-6 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0 [&::-webkit-scrollbar]:hidden">
                {FILTERS.map((f) => (
                    <button
                        key={f.key}
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

            <div className="mt-6 flex flex-col gap-2">
                {list.map((r) => {
                    const open = openId === r.id;
                    return (
                        <div key={r.id} className="rounded-lg border border-black/5 bg-white shadow-sm">
                            <button onClick={() => setOpenId(open ? null : r.id)} className="w-full p-4 text-left">
                                {/* 모바일은 2줄로 접고, PC 는 한 줄로 편다 */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                    <span
                                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${TONE[r.status]}`}
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
                                    <span className="shrink-0 text-neutral-400">{open ? '▲' : '▼'}</span>
                                </div>

                                <p className="mt-2 truncate text-sm text-neutral-500">
                                    {r.visitType}
                                    {r.category && ` · ${r.category}`}
                                    {r.items.length > 0 && ` · ${r.items[0].name}`}
                                    {r.items.length > 1 && ` 외 ${r.items.length - 1}건`}
                                </p>
                            </button>

                            {open && (
                                <div className="border-t border-black/5 p-4">
                                    {r.items.length > 0 && (
                                        <ul className="mb-4 flex flex-col gap-1">
                                            {r.items.map((i) => (
                                                <li key={i.key} className="flex justify-between text-sm">
                                                    <span>
                                                        <span className="text-neutral-400">{i.category}</span> {i.name}
                                                    </span>
                                                    <span>{i.price.toLocaleString()}원</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    <div className="flex flex-wrap items-center gap-2">
                                        {(Object.keys(RESERVATION_STATUS) as ReservationStatus[]).map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => patch(r.id, { status: s })}
                                                className={`rounded-full px-3 py-1 text-xs ${
                                                    r.status === s
                                                        ? 'bg-[#3a322c] text-white'
                                                        : 'border border-black/10 bg-white'
                                                }`}
                                            >
                                                {RESERVATION_STATUS[s]}
                                            </button>
                                        ))}
                                        <a
                                            href={`tel:${r.phone.replace(/-/g, '')}`}
                                            className="ml-auto rounded-full border border-black/10 px-3 py-1 text-xs"
                                        >
                                            전화 걸기
                                        </a>
                                        <button
                                            onClick={() => remove(r)}
                                            className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-500"
                                        >
                                            삭제
                                        </button>
                                    </div>

                                    {/* 통화 내용 메모. blur 될 때만 저장해 입력 중 쓰기를 줄인다 */}
                                    <textarea
                                        defaultValue={r.memo}
                                        onBlur={(e) => {
                                            if (e.target.value !== r.memo) patch(r.id, { memo: e.target.value });
                                        }}
                                        rows={3}
                                        placeholder="통화 내용, 변경 요청 등을 기록하세요."
                                        className="mt-3 w-full resize-none rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#3a322c]/30"
                                    />

                                    <p className="mt-2 text-xs text-neutral-400">
                                        접수 {new Date(r.createdAt).toLocaleString('ko-KR')}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {list.length === 0 && <p className="mt-6 text-neutral-400">해당하는 예약이 없습니다.</p>}
        </div>
    );
}
