'use client';

import { useState } from 'react';
import { loginAdmin } from '../actions';

export default function AdminLoginPage() {
    const [show, setShow] = useState(false);
    const [error, setError] = useState(false);

    if (typeof window !== 'undefined' && !error) {
        const params = new URLSearchParams(window.location.search);
        if (params.get('error') === '1') setError(true);
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f3efe9]">
            <form action={loginAdmin} className="w-[360px] rounded-xl border border-black/5 bg-white p-10 shadow-sm">
                <h1 className="text-center text-lg font-semibold tracking-wide text-[#3a322c]">관리자 로그인</h1>

                <input
                    type="text"
                    name="id"
                    placeholder="아이디"
                    autoFocus
                    className="mt-8 w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-[#3a322c]"
                />

                <div className="relative mt-3">
                    <input
                        type={show ? 'text' : 'password'}
                        name="password"
                        placeholder="비밀번호"
                        className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 pr-11 text-sm outline-none focus:border-[#3a322c]"
                    />
                    <button
                        type="button"
                        onClick={() => setShow((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                        aria-label={show ? '비밀번호 숨기기' : '비밀번호 보기'}
                    >
                        {show ? (
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.6"
                            >
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                        ) : (
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.6"
                            >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        )}
                    </button>
                </div>

                {error && <p className="mt-3 text-sm text-red-600">아이디 또는 비밀번호가 틀렸습니다.</p>}

                <button className="mt-6 w-full rounded-lg bg-[#3a322c] py-2.5 text-sm text-white hover:bg-[#4a4038]">
                    로그인
                </button>
            </form>
        </div>
    );
}
