'use client';

import { Link } from '@/i18n/navigation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Calendar from './Calendar';
import DoneModal from './DoneModal';
import { slotsOf } from './slots';
import { useCart } from '@/components/cart/CartProvider';
import { MENU_CATEGORIES } from '@/constants/categories';
import { VISIT_TYPES } from '@/data/site';
import { addReservation } from '@/lib/reservations';
import PrivacyModal from '@/components/ui/PrivacyModal';

const field =
    'w-full border-b border-dark/20 bg-transparent px-1 py-3.5 text-caption text-dark outline-none transition-colors duration-500 ease-brand placeholder:text-dark/35 focus:border-dark';

const cleanPhone = (v: string) => v.replace(/[^\d+-]/g, '').slice(0, 20);

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

    const [privacy, setPrivacy] = useState(false);

    const submit = async () => {
        if (!name.trim()) return alert('이름을 입력해주세요.');
        if (phone.replace(/\D/g, '').length < 8) return alert('연락처를 정확히 입력해주세요.');
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
            {/* 기본 정보 카드 */}
            <section className="rounded-xl border border-beige bg-dark/[0.015] px-6 py-8 sm:px-8">
                <h2 className="text-small font-semibold tracking-wide">예약자 정보</h2>

                <div className="mt-7 grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2">
                    <label className="flex flex-col gap-2.5">
                        <span className="text-caption font-medium tracking-wide text-dark/70">
                            이름 <span className="text-red-500">*</span>
                        </span>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="이름을 입력해주세요."
                            className={field}
                        />
                    </label>

                    <label className="flex flex-col gap-2.5">
                        <span className="text-caption font-medium tracking-wide text-dark/70">
                            연락처 <span className="text-red-500">*</span>
                        </span>
                        <input
                            type="tel"
                            inputMode="tel"
                            value={phone}
                            onChange={(e) => setPhone(cleanPhone(e.target.value))}
                            placeholder="숫자만 입력해주세요."
                            className={field}
                        />
                    </label>
                </div>

                <label className="mt-7 flex flex-col gap-2.5">
                    <span className="text-caption font-medium tracking-wide text-dark/70">
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
                    <label className="mt-7 flex flex-col gap-2.5">
                        <span className="text-caption font-medium tracking-wide text-dark/70">
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
            </section>

            {/* 날짜 */}
            <section className="mt-10">
                <h2 className="text-small font-semibold tracking-wide">예약 일자</h2>
                <div className="mt-5 rounded-xl border border-beige bg-dark/[0.015] p-5 sm:p-6">
                    <Calendar
                        value={date}
                        onChange={(v) => {
                            setDate(v);
                            setTime('');
                        }}
                    />
                </div>
            </section>

            {/* 시간 */}
            <section className="mt-10">
                <h2 className="text-small font-semibold tracking-wide">예약 시간</h2>

                <div className="mt-5 rounded-xl border border-beige bg-dark/[0.015] px-5 py-6 sm:px-6">
                    {date === '' ? (
                        <p className="text-caption text-dark/50">먼저 예약 일자를 선택해주세요.</p>
                    ) : slots.length === 0 ? (
                        <p className="text-caption text-dark/50">선택한 날짜는 휴진입니다.</p>
                    ) : (
                        <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
                            {slots.map((s) => {
                                const active = time === s;
                                return (
                                    <li key={s}>
                                        <button
                                            type="button"
                                            onClick={() => setTime(s)}
                                            aria-pressed={active}
                                            className={`w-full rounded-full py-2.5 text-caption transition-all duration-500 ease-brand ${
                                                active
                                                    ? 'bg-dark font-semibold text-cream shadow-sm'
                                                    : 'bg-dark/[0.05] text-dark hover:bg-dark/[0.1]'
                                            }`}
                                        >
                                            {s}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </section>

            {/* 동의 */}
            <section className="mt-10">
                <h2 className="text-small font-semibold tracking-wide">이용 동의</h2>

                <div className="mt-5 rounded-xl border border-beige bg-dark/[0.015] px-6 py-6">
                    <div className="flex flex-col gap-5">
                        <div className="flex items-center justify-between gap-4">
                            <Check
                                checked={agreePrivacy}
                                onChange={setAgreePrivacy}
                                label="(필수) 개인정보 수집 이용 동의"
                            />
                            <button
                                type="button"
                                onClick={() => setPrivacy(true)}
                                className="shrink-0 text-caption-sm text-dark/50 underline underline-offset-2 transition-colors duration-500 ease-brand hover:text-dark"
                            >
                                상세보기
                            </button>
                        </div>

                        <div>
                            <Check
                                checked={agreeAge}
                                onChange={setAgreeAge}
                                label="(필수) 예약자가 만 14세 이상입니다."
                            />
                            <p className="mt-2.5 pl-9 text-caption-sm leading-relaxed text-dark/50">
                                만 14세 미만 고객은 카톡플친이나 전화로 문의해주세요.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 제출 */}
            <button
                type="button"
                onClick={submit}
                disabled={busy}
                className="mt-12 w-full rounded-xl bg-dark py-4.5 text-caption font-semibold tracking-wide text-cream transition-colors duration-500 ease-brand hover:bg-brown disabled:opacity-50"
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
            <PrivacyModal open={privacy} onClose={() => setPrivacy(false)} />
        </div>
    );
}

function Check({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            aria-pressed={checked}
            className="group flex items-center gap-3.5"
        >
            <span
                aria-hidden="true"
                className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-all duration-500 ease-brand ${
                    checked ? 'border-dark bg-dark' : 'border-dark/30 group-hover:border-dark/55'
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
                        <path d="M1.5 6l3.2 3.2L10.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </span>
            <span className="text-left text-caption leading-snug">{label}</span>
        </button>
    );
}
