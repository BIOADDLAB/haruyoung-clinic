'use client';

import { useEffect, useState } from 'react';
import { getMembers } from '@/lib/members';
import type { Member } from '@/types/member';

export default function MembersPage() {
    const [all, setAll] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');

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

    const list = q.trim()
        ? all.filter((m) => [m.name, m.loginId, m.phone].join(' ').toLowerCase().includes(q.trim().toLowerCase()))
        : all;

    if (loading) return <div>불러오는 중...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-[#3a322c] lg:text-3xl">회원 관리</h1>
            <p className="mt-1 text-sm text-neutral-500">가입 최신순 {all.length}명</p>

            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="이름, 아이디, 연락처로 검색"
                className="mt-6 w-full rounded-xl lg:max-w-sm border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-[#3a322c]/30"
            />

            {/* 모바일 — 카드. 테이블은 가로가 잘린다 */}
            <ul className="mt-6 flex flex-col gap-2 lg:hidden">
                {list.map((m) => (
                    <li key={m.id} className="rounded-xl border border-black/5 bg-white p-4">
                        <div className="flex items-center justify-between gap-3">
                            <span className="font-medium">{m.name}</span>
                            <span className="text-xs text-neutral-400">
                                {new Date(m.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-neutral-600">{m.loginId}</p>
                        <a
                            href={`tel:${m.phone.replace(/-/g, '')}`}
                            className="mt-2 inline-block text-sm text-neutral-600 underline"
                        >
                            {m.phone}
                        </a>
                    </li>
                ))}
                {list.length === 0 && (
                    <li className="rounded-xl border border-black/5 bg-white px-4 py-10 text-center text-neutral-400">
                        회원이 없습니다.
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
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((m) => (
                            <tr key={m.id} className="border-b border-black/[0.04] last:border-0">
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
                            </tr>
                        ))}
                    </tbody>
                </table>

                {list.length === 0 && <p className="px-5 py-10 text-center text-neutral-400">회원이 없습니다.</p>}
            </div>

            {/* TODO: 탈퇴 처리는 Firebase Auth 계정도 함께 지워야 해서 Admin SDK 가 필요하다.
                     서버 라우트를 붙인 뒤 열어준다 */}
        </div>
    );
}
