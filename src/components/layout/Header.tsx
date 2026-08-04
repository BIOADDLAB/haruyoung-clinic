'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MENU_GROUPS } from '@/data/site';

type MenuState = 'collapsed' | 'expanded' | 'search';

export default function Header() {
    const [menuState, setMenuState] = useState<MenuState>('collapsed');

    const isExpanded = menuState === 'expanded';
    const isSearch = menuState === 'search';

    return (
        <header className="fixed inset-y-0 left-0 z-50">
            <div className="h-dvh bg-cream flex">
                {/* 접었을때 - 기본 */}
                <nav
                    aria-label="메인 네비게이션"
                    className="px-4 py-11.5 flex flex-col justify-between max-w-[106px] h-full shrink-0"
                >
                    <div className="flex flex-col justify-center items-center">
                        <Link href="/" className="mb-10" aria-label="홈으로 이동">
                            <Image src="/images/logo.svg" alt="하루영의원 로고" width={74} height={44} priority />
                        </Link>

                        <button
                            type="button"
                            onClick={() => setMenuState((prev) => (prev === 'expanded' ? 'collapsed' : 'expanded'))}
                            className="flex flex-col items-center mb-5.5"
                            aria-expanded={isExpanded}
                            aria-controls="main-menu"
                        >
                            <Image
                                src={isExpanded ? '/images/i-close.svg' : '/images/i-ham.svg'}
                                alt=""
                                width={22}
                                height={22}
                                aria-hidden
                            />
                            <span className="mt-3 font-display text-caption">MENU</span>
                        </button>

                        {/* 바로검색 */}
                        <button
                            type="button"
                            onClick={() => setMenuState('search')}
                            className="flex flex-col items-center"
                            aria-expanded={isSearch}
                            aria-controls="search-panel"
                        >
                            <Image src="/images/i-search.svg" alt="" width={22} height={22} aria-hidden />
                            <span className="mt-1.25 text-caption-sm font-semibold">바로검색</span>
                        </button>
                    </div>

                    {/* 하단 아이콘 메뉴 */}
                    <div className="flex flex-col gap-6.5">
                        <Link href="/" className="flex flex-col items-center" aria-label="홈">
                            <Image src="/images/i-h-01.svg" alt="" width={34} height={34} aria-hidden />
                        </Link>

                        <Link href="/consult" className="flex flex-col items-center" aria-label="상담예약">
                            <Image src="/images/i-h-02.svg" alt="" width={34} height={34} aria-hidden />
                            <span className="text-caption-sm font-semibold">상담예약</span>
                        </Link>

                        <Link href="/reservation" className="flex flex-col items-center" aria-label="바로예약">
                            <Image src="/images/i-h-03.svg" alt="" width={34} height={34} aria-hidden />
                            <span className="text-caption-sm font-semibold">바로예약</span>
                        </Link>

                        <a
                            href="http://pf.kakao.com/your-id"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center"
                            aria-label="카카오톡 상담"
                        >
                            <Image src="/images/i-h-05.svg" alt="" width={34} height={34} aria-hidden />
                            <span className="text-caption-sm font-semibold">카카오톡</span>
                        </a>

                        <Link href="/login" className="text-caption-sm font-semibold text-center">
                            <span className="pb-1 border-b border-dark">로그인</span>
                        </Link>
                    </div>
                </nav>

                {/* 펼쳤을 때 */}
                {isExpanded && (
                    <div id="main-menu" className="py-10 pl-10 pr-7.5 w-[247px] flex flex-col justify-between">
                        <nav aria-label="전체 메뉴" className="flex flex-col gap-11.5">
                            {MENU_GROUPS.map((group) => (
                                <div key={group.title} className="group">
                                    <h3 className="font-display text-small w-fit pb-4 border-b border-[#3B2B1E]/50] relative after:content-[''] after:absolute after:w-2.5 after:h-2.5 after:rounded-full after:bg-beige after:opacity-0 after:transition-opacity after:duration-300 after:top-1 after:-right-1 group-hover:after:opacity-100 after:-z-1">
                                        {group.title}
                                    </h3>

                                    <ul className="mt-3 flex flex-col gap-2.5 text-dark/80 ml-[2px]">
                                        {group.items.map((item) => (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    className="text-caption-sm hover:text-dark hover:underline underline-offset-4 transition-all"
                                                >
                                                    {item.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </nav>

                        <div className="flex justify-center">
                            <Image src="/images/logo-sub.svg" alt="하루영의원" width={110} height={24} />
                        </div>
                    </div>
                )}

                {/* 검색 패널 */}
                {isSearch && (
                    <div id="search-panel" className="w-[247px] py-11.25 px-9 relative">
                        <div className="mb-7.5 relative">
                            <h3 className="font-display text-small">시술 바로 검색</h3>
                            <button
                                type="button"
                                onClick={() => setMenuState('collapsed')}
                                className="absolute top-0 right-0"
                                aria-label="검색 닫기"
                            >
                                <Image src="/images/i-close.svg" alt="" width={20} height={20} aria-hidden />
                            </button>
                        </div>

                        <div>
                            <div className="flex justify-between items-center border-b border-[#3B2B1E]/50] pb-1.75">
                                <input
                                    type="search"
                                    name="q"
                                    placeholder="Search"
                                    className="w-[90%] bg-transparent outline-none text-body"
                                    aria-label="시술 검색"
                                />
                                <Image src="/images/i-search.svg" alt="" width={20} height={20} aria-hidden />
                            </div>
                            <p className="mt-2 text-caption-sm text-dark/70">원하는 시술명을 입력해주세요.</p>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
