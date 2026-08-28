'use client';

import { useEffect, useState } from 'react';
import { STATUS_PICK, VISIT_LABEL } from '@/components/admin/reservationUi';
import { RESERVATION_STATUS, type Reservation, type ReservationStatus } from '@/types/reservation';

export default function ReservationDetail({
    r,
    onPatch,
    onRemove,
}: {
    r: Reservation;
    onPatch: (id: string, data: Partial<Reservation>) => Promise<void> | void;
    onRemove: (r: Reservation) => Promise<void> | void;
}) {
    return (
        <div className="border-t border-black/5 p-4">
            <p className="mb-3 text-sm text-neutral-500">
                {VISIT_LABEL[r.visitType] ?? r.visitType}
                {r.category && ` · ${r.category}`}
                {r.items.length > 0 && ` · ${r.items[0].name}`}
                {r.items.length > 1 && ` 외 ${r.items.length - 1}건`}
            </p>

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
                        type="button"
                        onClick={() => onPatch(r.id, { status: s })}
                        className={`rounded-full px-3 py-1 text-xs transition ${
                            r.status === s ? STATUS_PICK[s].on : STATUS_PICK[s].off
                        }`}
                    >
                        {RESERVATION_STATUS[s]}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={() => onRemove(r)}
                    className="ml-auto rounded-full border border-red-200 px-3 py-1 text-xs text-red-500"
                >
                    삭제
                </button>
            </div>

            <MemoBox value={r.memo} onSave={(memo) => onPatch(r.id, { memo })} />

            <p className="mt-2 text-xs text-neutral-400">접수 {new Date(r.createdAt).toLocaleString('ko-KR')}</p>
        </div>
    );
}

function MemoBox({ value, onSave }: { value: string; onSave: (v: string) => Promise<void> | void }) {
    const [text, setText] = useState(value);
    const [busy, setBusy] = useState(false);
    const [saved, setSaved] = useState(false);

    const dirty = text !== value;

    useEffect(() => {
        setText(value);
    }, [value]);

    useEffect(() => {
        if (!saved) return;
        const t = setTimeout(() => setSaved(false), 2000);
        return () => clearTimeout(t);
    }, [saved]);

    const save = async () => {
        setBusy(true);
        try {
            await onSave(text);
            setSaved(true);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="mt-3">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="통화 내용, 변경 요청 등을 기록하세요."
                className="w-full resize-none rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#3a322c]/30"
            />

            <div className="mt-2 flex items-center justify-end gap-3">
                {saved && <span className="text-xs text-emerald-600">저장됨</span>}
                {dirty && !saved && <span className="text-xs text-neutral-400">저장되지 않음</span>}

                <button
                    type="button"
                    onClick={save}
                    disabled={!dirty || busy}
                    className="rounded-full bg-[#3a322c] px-4 py-1.5 text-xs text-white transition disabled:opacity-30"
                >
                    {busy ? '저장 중…' : '메모 저장'}
                </button>
            </div>
        </div>
    );
}
