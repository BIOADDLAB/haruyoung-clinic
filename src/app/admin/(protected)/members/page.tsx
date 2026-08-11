'use client';

import { useEffect, useState } from 'react';
import { deleteMember, getMembers } from '@/lib/members';
import type { Member } from '@/types/member';

const FILTERS = [
    { key: 'active', label: '이용 중' },
    { key: 'deleted', label: '삭제됨' },
    { key: 'all', label: '전체' },
];

export default function MembersPage() {
    const [all, setAll] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');
    const [filter, setFilter] = useState('active');

    useEffect(() => {
        let alive = true;
        getMembers().then((data) => {
            if (!alive) return;
            setAll(data);
            setLoading(false);
        });
        return () => {
            alive = false;
        };
    }, []);

    /**
     * 삭제. Firestore 문서에 삭제 시각만 남긴다.
     * 되돌리지 않으므로 확인을 받는다.
     */
    const remove = async (m: Member) => {
        const ok = window.confirm(`${m.name}(${m.loginId}) 회원을 삭제할까요?\n삭제 기록은 남지만 되돌릴 수 없습니다.`);
        if (!ok) return;

        await deleteMember(m.id);
        // 서버가 찍은 시각을 그대로 받아 화면에 반영한다
        setAll(await getMembers());
    };

    const byFilter = all.filter((m) => (filter === 'all' ? true : filter === 'deleted' ? !!m.deletedAt : !m.deletedAt));

    const list = q.trim()
        ? byFilter.filter((m) => [m.name, m.loginId, m.phone].join(' ').toLowerCase().includes(q.trim().toLowerCase()))
        : byFilter;

    const countOf = (key: string) =>
        key === 'all'
            ? all.length
            : key === 'deleted'
              ? all.filter((m) => m.deletedAt).length
              : all.filter((m) => !m.deletedAt).length;

    if (loading) return <div>불러오는 중...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-[#3a322c] lg:text-3xl">회원 관리</h1>
            <p className="mt-1 text-sm text-neutral-500">가입 최신순</p>

            <div className="-mx-5 mt-6 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:px-0">
                {FILTERS.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm ${
                            filter === f.key ? 'bg-[#3a322c] text-white' : 'border border-black/10 bg-white'
                        }`}
                    >
                        {f.label}
                        <span className="ml-1.5 text-xs opacity-60">{countOf(f.key)}</span>
                    </button>
                ))}
            </div>

            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="이름, 아이디, 연락처로 검색"
                className="mt-4 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-[#3a322c]/30 lg:max-w-sm"
            />

            {/* 모바일 — 카드. 테이블은 가로가 잘린다 */}
            <ul className="mt-6 flex flex-col gap-2 lg:hidden">
                {list.map((m) => (
                    <li
                        key={m.id}
                        className={`rounded-xl border border-black/5 bg-white p-4 ${m.deletedAt ? 'opacity-60' : ''}`}
                    >
                        <div className="flex items-center justify-between gap-3">
                            <span className="font-medium">
                                {m.name}
                                {m.deletedAt && (
                                    <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-600">
                                        삭제됨
                                    </span>
                                )}
                            </span>
                            <span className="text-xs text-neutral-400">
                                {new Date(m.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                        </div>

                        <p className="mt-1 text-sm text-neutral-600">{m.loginId}</p>

                        <div className="mt-2 flex items-center justify-between gap-3">
                            <a href={`tel:${m.phone.replace(/-/g, '')}`} className="text-sm text-neutral-600 underline">
                                {m.phone}
                            </a>
                            {!m.deletedAt && (
                                <button onClick={() => remove(m)} className="text-sm text-red-500">
                                    회원 삭제
                                </button>
                            )}
                        </div>

                        {m.deletedAt && (
                            <p className="mt-2 text-xs text-neutral-400">
                                삭제 {new Date(m.deletedAt).toLocaleString('ko-KR')}
                            </p>
                        )}
                    </li>
                ))}
                {list.length === 0 && (
                    <li className="rounded-xl border border-black/5 bg-white px-4 py-10 text-center text-neutral-400">
                        해당하는 회원이 없습니다.
                    </li>
                )}
            </ul>

            {/* PC — 테이블 */}
            <div className="mt-6 hidden overflow-hidden rounded-2xl border border-black/[0.04] bg-white shadow-sm lg:block">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-black/5 bg-neutral-50/60 text-neutral-500">
                        <tr>
                            <th className="px-5 py-3 font-medium">이름</th>
                            <th className="px-5 py-3 font-medium">아이디</th>
                            <th className="px-5 py-3 font-medium">연락처</th>
                            <th className="px-5 py-3 font-medium">가입일</th>
                            <th className="px-5 py-3 font-medium">상태</th>
                            <th className="px-5 py-3 font-medium" />
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((m) => (
                            <tr
                                key={m.id}
                                className={`border-b border-black/[0.04] last:border-0 ${
                                    m.deletedAt ? 'opacity-55' : ''
                                }`}
                            >
                                <td className="px-5 py-3.5 font-medium">{m.name}</td>
                                <td className="px-5 py-3.5 text-neutral-600">{m.loginId}</td>
                                <td className="px-5 py-3.5 text-neutral-600">
                                    <a href={`tel:${m.phone.replace(/-/g, '')}`} className="hover:underline">
                                        {m.phone}
                                    </a>
                                </td>
                                <td className="px-5 py-3.5 text-neutral-500">
                                    {new Date(m.createdAt).toLocaleDateString('ko-KR')}
                                </td>
                                <td className="px-5 py-3.5">
                                    {m.deletedAt ? (
                                        <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs text-rose-600">
                                            삭제 {new Date(m.deletedAt).toLocaleDateString('ko-KR')}
                                        </span>
                                    ) : (
                                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs text-emerald-700">
                                            이용 중
                                        </span>
                                    )}
                                </td>
                                <td className="px-5 py-3.5 text-right">
                                    {!m.deletedAt && (
                                        <button onClick={() => remove(m)} className="text-sm text-red-500">
                                            회원 삭제
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {list.length === 0 && (
                    <p className="px-5 py-10 text-center text-neutral-400">해당하는 회원이 없습니다.</p>
                )}
            </div>
        </div>
    );
}
