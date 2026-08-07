'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Calendar from './Calendar';
import DoneModal from './DoneModal';
import { slotsOf } from './slots';
import { useCart } from '@/components/cart/CartProvider';
import { MENU_CATEGORIES } from '@/constants/categories';
import { VISIT_TYPES } from '@/data/site';
import { addReservation } from '@/lib/reservations';

// const field =
//     'w-full border border-dark/20 bg-transparent px-4 py-3 text-caption text-dark outline-none transition-colors duration-500 ease-brand placeholder:text-dark/35 focus:border-dark/50';

const field =
    'w-full border-b border-dark/25 bg-transparent px-1 py-3 text-caption text-dark outline-none transition-colors duration-500 ease-brand placeholder:text-dark/35 focus:border-dark';

/** 010-1234-5678 형태로 자동 정리 */
function formatPhone(v: string) {
    const n = v.replace(/\D/g, '').slice(0, 11);
    if (n.length < 4) return n;
    if (n.length < 8) return `${n.slice(0, 3)}-${n.slice(3)}`;
    return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7)}`;
}

/** @param withCategory 장바구니 없이 바로예약할 때만 카테고리를 고른다 */
export default function ReservationForm({ withCategory }: { withCategory?: boolean }) {
    const { items, total, clear } = useCart();
    const router = useRouter();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [visitType, setVisitType] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [agreePrivacy, setAgreePrivacy] = useState(false);
    const [agreeAge, setAgreeAge] = useState(false);
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);

    const slots = slotsOf(date);

    const submit = async () => {
        if (!name.trim()) return alert('이름을 입력해주세요.');
        if (phone.replace(/\D/g, '').length < 10) return alert('연락처를 정확히 입력해주세요.');
        if (!visitType) return alert('방문 형태를 선택해주세요.');
        if (withCategory && !category) return alert('카테고리를 선택해주세요.');
        if (!date) return alert('예약 일자를 선택해주세요.');
        if (!time) return alert('예약 시간을 선택해주세요.');
        if (!agreePrivacy || !agreeAge) return alert('필수 항목에 동의해주세요.');

        setBusy(true);
        try {
            await addReservation({
                name: name.trim(),
                phone,
                visitType,
                category: withCategory ? category : '',
                items: withCategory ? [] : items,
                date,
                time,
                total: withCategory ? 0 : total,
                status: 'pending',
                memo: '',
                createdAt: Date.now(),
            });
            if (!withCategory) clear();
            setDone(true);
        } catch {
            alert('예약 접수에 실패했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="w-full max-w-[800px]">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                    <span className="text-caption font-semibold">
                        이름 <span className="text-red-500">*</span>
                    </span>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="이름을 입력해주세요."
                        className={field}
                    />
                </label>

                <label className="flex flex-col gap-2">
                    <span className="text-caption font-semibold">
                        연락처 <span className="text-red-500">*</span>
                    </span>
                    <input
                        type="tel"
                        inputMode="numeric"
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        placeholder="연락처를 입력해주세요."
                        className={field}
                    />
                </label>
            </div>

            <label className="mt-6 flex flex-col gap-2">
                <span className="text-caption font-semibold">
                    방문 형태 <span className="text-red-500">*</span>
                </span>
                <select value={visitType} onChange={(e) => setVisitType(e.target.value)} className={field}>
                    <option value="">방문 형태를 선택해주세요.</option>
                    {VISIT_TYPES.map((v) => (
                        <option key={v} value={v}>
                            {v}
                        </option>
                    ))}
                </select>
            </label>

            {withCategory && (
                <label className="mt-6 flex flex-col gap-2">
                    <span className="text-caption font-semibold">
                        카테고리 <span className="text-red-500">*</span>
                    </span>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className={field}>
                        <option value="">카테고리를 선택해주세요.</option>
                        {MENU_CATEGORIES.map((c) => (
                            <option key={c.slug} value={c.name}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </label>
            )}

            <h2 className="mt-12 text-small font-semibold">예약 일자를 선택해주세요.</h2>
            <div className="mt-6">
                <Calendar
                    value={date}
                    onChange={(v) => {
                        setDate(v);
                        setTime('');
                    }}
                />
            </div>

            <h2 className="mt-12 text-small font-semibold">예약 시간을 선택해주세요.</h2>
            {date === '' ? (
                <p className="mt-5 text-caption text-dark/50">먼저 예약 일자를 선택해주세요.</p>
            ) : slots.length === 0 ? (
                <p className="mt-5 text-caption text-dark/50">선택한 날짜는 휴진입니다.</p>
            ) : (
                <ul className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-6">
                    {slots.map((s) => (
                        <li key={s}>
                            <button
                                type="button"
                                onClick={() => setTime(s)}
                                aria-pressed={time === s}
                                className={`w-full rounded-full py-2.5 text-caption transition-colors duration-500 ease-brand ${
                                    time === s
                                        ? 'bg-dark font-semibold text-cream'
                                        : 'bg-dark/8 text-dark hover:bg-dark/15'
                                }`}
                            >
                                {s}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <h2 className="mt-12 text-small font-semibold">아래 내용에 동의해주세요.</h2>
            <div className="mt-5 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                    <Check checked={agreePrivacy} onChange={setAgreePrivacy} label="(필수) 개인정보 수집 이용 동의" />
                    <Link href="/privacy" className="shrink-0 text-caption-sm text-dark/60 underline">
                        상세보기
                    </Link>
                </div>
                <div>
                    <Check checked={agreeAge} onChange={setAgreeAge} label="(필수) 예약자가 만 14세 이상입니다." />
                    <p className="mt-2 pl-8 text-caption-sm text-dark/55">
                        만 14세 미만 고객은 카톡플친이나 전화로 문의해주세요.
                    </p>
                </div>
            </div>

            <button
                type="button"
                onClick={submit}
                disabled={busy}
                className="mt-10 w-full bg-dark py-4 text-caption font-semibold text-cream transition-colors duration-500 ease-brand hover:bg-brown disabled:opacity-50"
            >
                {busy ? '접수 중…' : '시술 예약하기'}
            </button>

            <DoneModal
                open={done}
                name={name}
                date={date}
                time={time}
                onClose={() => {
                    setDone(false);
                    router.push('/');
                }}
            />
        </div>
    );
}

function Check({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            aria-pressed={checked}
            className="flex items-center gap-3"
        >
            <span
                aria-hidden="true"
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-500 ease-brand ${
                    checked ? 'border-dark bg-dark' : 'border-dark/30'
                }`}
            >
                {checked && (
                    <svg
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-2.5 w-2.5 text-cream"
                    >
                        <path d="M1 6l3.5 3.5L11 2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </span>
            <span className="text-left text-caption">{label}</span>
        </button>
    );
}
