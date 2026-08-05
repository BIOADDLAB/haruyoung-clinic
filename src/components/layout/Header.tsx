'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { MENU_GROUPS, QUICK_LINKS } from '@/data/site';
import { DUR, EASE, fadeUp, stagger } from '@/lib/motion';

const PANEL_W = 247;

type PanelKind = 'menu' | 'search' | null;

export default function Header() {
    const [panel, setPanel] = useState<PanelKind>(null);
    const [keyword, setKeyword] = useState('');
    const pathname = usePathname();
    const router = useRouter();
    const reduced = useReducedMotion();

    // 라우트가 바뀌면 패널을 닫는다 (effect 대신 렌더 중 상태 조정)
    const [lastPath, setLastPath] = useState(pathname);
    if (lastPath !== pathname) {
        setLastPath(pathname);
        setPanel(null);
    }

    // 모바일 전체 오버레이일 때만 배경 스크롤 잠금 (PC 가로 스크롤은 유지)
    useEffect(() => {
        document.body.classList.toggle('max-lg:overflow-hidden', panel !== null);
        return () => document.body.classList.remove('max-lg:overflow-hidden');
    }, [panel]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPanel(null);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const toggle = (kind: Exclude<PanelKind, null>) => setPanel((p) => (p === kind ? null : kind));

    const submitSearch = (e: FormEvent) => {
        e.preventDefault();
        const q = keyword.trim();
        if (!q) return;
        // TODO: 시술목록 페이지 구현 후 검색 결과 연결
        router.push(`/treatments?q=${encodeURIComponent(q)}`);
    };

    const close = () => setPanel(null);

    // 패널은 폭이 열리고 닫힌다. 안쪽은 고정 폭이라 내용이 밀리지 않는다.
    const expand = reduced
        ? { initial: false as const }
        : {
              initial: { width: 0, opacity: 0 },
              animate: { width: PANEL_W, opacity: 1 },
              exit: { width: 0, opacity: 0 },
              transition: { duration: DUR.base, ease: EASE },
          };

    return (
        <>
            {/* ── 모바일 · 태블릿 상단 바 ─────────────────────── */}
            <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-dark/10 bg-cream px-5 lg:hidden">
                <Link href="/" aria-label="하루영의원 홈으로">
                    <Image src="/images/logo-sub.svg" alt="하루영의원" width={110} height={24} />
                </Link>
                <div className="flex items-center gap-5">
                    <button
                        type="button"
                        onClick={() => toggle('search')}
                        aria-label="시술 바로 검색 열기"
                        aria-expanded={panel === 'search'}
                    >
                        <Image src="/images/i-search.svg" alt="" width={22} height={22} />
                    </button>
                    <button
                        type="button"
                        onClick={() => toggle('menu')}
                        aria-label={panel === 'menu' ? '메뉴 닫기' : '메뉴 열기'}
                        aria-expanded={panel === 'menu'}
                    >
                        <Image
                            src={panel === 'menu' ? '/images/i-close.svg' : '/images/i-ham.svg'}
                            alt=""
                            width={22}
                            height={22}
                        />
                    </button>
                </div>
            </header>

            {panel !== null && (
                <div className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-cream px-6 py-8 lg:hidden">
                    {panel === 'menu' ? (
                        <MenuNav onNavigate={close} />
                    ) : (
                        <SearchForm keyword={keyword} onChange={setKeyword} onSubmit={submitSearch} onClose={close} />
                    )}
                </div>
            )}

            {/* ── PC 좌측 레일 ───────────────────────────────── */}
            <header className="fixed left-0 top-0 z-50 hidden h-dvh bg-cream lg:flex">
                <div className="flex h-full w-rail flex-col justify-between px-4 py-11.5">
                    <div className="flex flex-col items-center justify-center">
                        {/* {panel !== 'menu' && (
                            <Link href="/" className="mb-10" aria-label="하루영의원 홈으로">
                                <Image src="/images/logo.svg" alt="하루영의원" width={74} height={44} />
                            </Link>
                        )} */}

                        <Link href="/" className="mb-10" aria-label="하루영의원 홈으로">
                            <Image src="/images/logo.svg" alt="하루영의원" width={74} height={44} />
                        </Link>

                        <button
                            type="button"
                            onClick={() => toggle('menu')}
                            aria-expanded={panel === 'menu'}
                            className="mb-5.5 flex flex-col items-center"
                        >
                            <Image
                                src={panel === 'menu' ? '/images/i-close.svg' : '/images/i-ham.svg'}
                                alt=""
                                width={22}
                                height={22}
                            />
                            <span className="mt-3 font-display text-caption">MENU</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => toggle('search')}
                            aria-expanded={panel === 'search'}
                            className="flex flex-col items-center"
                        >
                            <Image src="/images/i-search.svg" alt="" width={22} height={22} />
                            <span className="mt-1.25 text-caption-sm font-semibold">바로검색</span>
                        </button>
                    </div>

                    <nav aria-label="빠른 메뉴" className="flex flex-col gap-6.5">
                        {/* TODO: 다국어 라우팅 준비되면 언어 선택으로 교체 */}
                        <button
                            type="button"
                            aria-label="언어 선택"
                            className="flex flex-col items-center transition-opacity hover:opacity-70"
                        >
                            <Image src="/images/i-h-01.svg" alt="" width={34} height={34} />
                        </button>

                        {QUICK_LINKS.map((l) =>
                            l.external ? (
                                <a
                                    key={l.label}
                                    href={l.href}
                                    target={l.href.startsWith('http') ? '_blank' : undefined}
                                    rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                    className="flex flex-col items-center transition-opacity hover:opacity-70"
                                >
                                    <Image src={`/images/${l.icon}.svg`} alt="" width={34} height={34} />
                                    <span className="text-caption-sm font-semibold">{l.label}</span>
                                </a>
                            ) : (
                                <Link
                                    key={l.label}
                                    href={l.href}
                                    className="flex flex-col items-center transition-opacity hover:opacity-70"
                                >
                                    <Image src={`/images/${l.icon}.svg`} alt="" width={34} height={34} />
                                    <span className="text-caption-sm font-semibold">{l.label}</span>
                                </Link>
                            ),
                        )}

                        <Link href="/login" className="text-center text-caption-sm font-semibold">
                            <span className="border-b border-dark pb-1">로그인</span>
                        </Link>
                    </nav>
                </div>

                <AnimatePresence initial={false} mode="wait">
                    {panel !== null && (
                        <motion.div key={panel} {...expand} className="overflow-hidden">
                            <div style={{ width: PANEL_W }} className="h-full">
                                {panel === 'menu' ? (
                                    <MenuNav onNavigate={close} />
                                ) : (
                                    <SearchForm
                                        keyword={keyword}
                                        onChange={setKeyword}
                                        onSubmit={submitSearch}
                                        onClose={close}
                                    />
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>
        </>
    );
}

/**
 * 전체 메뉴.
 * 그룹에 마우스를 올리면 제목·선 투명도가 80% → 100% 로 올라가고
 * 제목 끝의 갈색 원이 서서히 나타난다. 항목은 개별 hover 로 진해진다.
 */
function MenuNav({ onNavigate }: { onNavigate: () => void }) {
    const reduced = useReducedMotion();

    return (
        <nav aria-label="전체 메뉴" className="flex h-full flex-col justify-between lg:py-10 lg:pl-10 lg:pr-7.5">
            <motion.div
                variants={stagger}
                initial={reduced ? false : 'hidden'}
                animate="show"
                className="flex flex-col gap-8"
            >
                {MENU_GROUPS.map((group) => {
                    const id = `menu-${group.title.replace(/\s+/g, '-').toLowerCase()}`;
                    return (
                        <motion.div key={group.title} variants={reduced ? undefined : fadeUp} className="group">
                            <p
                                id={id}
                                className="relative w-full border-b border-dark/50 pb-1 font-display text-small opacity-80 transition-opacity duration-500 ease-brand group-hover:opacity-100"
                            >
                                {/* 호버시 갈색원 생김 */}
                                <span className="relative inline-block">
                                    <span className="absolute right-0 top-3 h-3 w-3 -translate-y-1/2 translate-x-1/4 scale-0 rounded-full bg-tan opacity-0 transition duration-700 ease-brand group-hover:scale-100 group-hover:opacity-100" />
                                    <span className="relative text-lead">{group.title}</span>
                                </span>
                            </p>

                            <ul aria-labelledby={id} className="ml-[2px] mt-3 flex flex-col gap-2.5">
                                {group.items.map((item) => (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            onClick={onNavigate}
                                            className="group/item relative inline-block pb-1 text-small text-dark/80 transition-colors duration-500 ease-brand hover:font-semibold hover:text-dark"
                                        >
                                            {item.label}
                                            {/* 밑줄 — 왼쪽에서 오른쪽으로 그어진다 */}
                                            <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-dark transition-transform duration-500 ease-brand group-hover/item:scale-x-100" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    );
                })}
            </motion.div>

            <div className="mt-12 flex justify-center lg:mt-0">
                <Image src="/images/logo-sub.svg" alt="하루영의원" width={120} height={34} />
            </div>
        </nav>
    );
}

function SearchForm({
    keyword,
    onChange,
    onSubmit,
    onClose,
}: {
    keyword: string;
    onChange: (v: string) => void;
    onSubmit: (e: FormEvent) => void;
    onClose: () => void;
}) {
    return (
        <section aria-label="시술 바로 검색" className="lg:px-9 lg:py-11.25">
            <div className="mb-7.5 flex items-center justify-between">
                <h2 className="text-small font-semibold">시술 바로 검색</h2>
                <button type="button" onClick={onClose} aria-label="검색 닫기">
                    <Image src="/images/i-close.svg" alt="" width={20} height={20} />
                </button>
            </div>

            <form onSubmit={onSubmit}>
                <div className="flex items-center justify-between border-b border-dark/50 pb-1.75">
                    <label htmlFor="quick-search" className="sr-only">
                        시술명 검색
                    </label>
                    <input
                        id="quick-search"
                        type="search"
                        value={keyword}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Search"
                        autoComplete="off"
                        className="w-[90%] bg-transparent outline-none placeholder:text-dark/40"
                    />
                    <button type="submit" aria-label="검색">
                        <Image src="/images/i-search.svg" alt="" width={20} height={20} />
                    </button>
                </div>
                <p className="mt-2 text-caption-sm text-dark/60">원하는 시술명을 입력해주세요.</p>
            </form>
        </section>
    );
}
