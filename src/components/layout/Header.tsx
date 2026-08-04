'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icons';
import { MENU_GROUPS } from '@/data/site';
import { DUR, EASE } from '@/lib/motion';

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

    const slide = reduced
        ? {}
        : {
              initial: { opacity: 0, x: -24 },
              animate: { opacity: 1, x: 0 },
              exit: { opacity: 0, x: -24 },
              transition: { duration: DUR.fast, ease: EASE },
          };

    return (
        <>
            {/* ── 모바일 · 태블릿 상단 바 ─────────────────────── */}
            <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-line bg-cream px-5 lg:hidden">
                <Link href="/" aria-label="하루영의원 홈으로">
                    <Icon name="logo-sub" width={110} height={24} alt="하루영의원 로고" />
                </Link>
                <div className="flex items-center gap-5">
                    <button type="button" onClick={() => toggle('search')} aria-label="시술 바로 검색 열기">
                        <Icon name="i-seach" size={22} />
                    </button>
                    <button
                        type="button"
                        onClick={() => toggle('menu')}
                        aria-label={panel === 'menu' ? '메뉴 닫기' : '메뉴 열기'}
                        aria-expanded={panel === 'menu'}
                    >
                        <Icon name={panel === 'menu' ? 'i-close' : 'i-ham'} size={22} />
                    </button>
                </div>
            </header>

            {/* ── PC 좌측 레일 ───────────────────────────────── */}
            <header className="fixed left-0 top-0 z-50 hidden h-dvh w-rail flex-col items-center justify-between border-r border-line bg-cream py-8 lg:flex">
                <div className="flex flex-col items-center gap-8">
                    {panel !== 'menu' && (
                        <Link href="/" aria-label="하루영의원 홈으로">
                            <Icon name="logo" width={62} height={37} alt="하루영의원 로고" />
                        </Link>
                    )}
                    <RailButton
                        label="MENU"
                        display
                        onClick={() => toggle('menu')}
                        expanded={panel === 'menu'}
                        icon={<Icon name={panel === 'menu' ? 'i-close' : 'i-ham'} size={22} />}
                    />
                    <RailButton
                        label="바로검색"
                        onClick={() => toggle('search')}
                        expanded={panel === 'search'}
                        icon={<Icon name="i-seach" size={22} />}
                    />
                </div>

                <nav aria-label="빠른 메뉴" className="flex flex-col items-center gap-7">
                    {/* TODO: 다국어 라우팅 준비되면 언어 선택으로 교체 */}
                    <button type="button" aria-label="언어 선택">
                        <Icon name="i-h-01" size={26} />
                    </button>
                    <RailLink
                        href="/reservation?type=counsel"
                        label="상담예약"
                        icon={<Icon name="i-h-02" size={26} />}
                    />
                    <RailLink href="/reservation" label="바로예약" icon={<Icon name="i-h-03" size={26} />} />
                    {/* TODO: 카카오 채널 주소 확정 시 교체 */}
                    <RailLink
                        href="https://pf.kakao.com"
                        external
                        label="카카오톡"
                        icon={<Icon name="i-h-05" size={30} />}
                    />
                    <Link href="/login" className="text-caption-sm underline underline-offset-4">
                        로그인
                    </Link>
                </nav>
            </header>

            {/* ── 패널 ───────────────────────────────────────── */}
            <AnimatePresence mode="wait">
                {panel === 'menu' && (
                    <motion.nav
                        key="menu"
                        aria-label="전체 메뉴"
                        {...slide}
                        className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-cream px-6 pb-16 pt-8 lg:inset-y-0 lg:left-rail lg:right-auto lg:top-0 lg:w-menu lg:border-r lg:border-line lg:px-0 lg:pl-10 lg:pr-8 lg:pt-10"
                    >
                        <div className="flex min-h-full flex-col">
                            {MENU_GROUPS.map((group) => (
                                <div key={group.title} className="mb-10 lg:mb-9">
                                    <h2 className="font-display text-18">{group.title}</h2>
                                    <span className="mt-2 block h-px w-full bg-dark/25" />
                                    <ul className="mt-4 space-y-2.5">
                                        {group.items.map((item) => (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    className="text-caption text-dark/60 transition-colors hover:font-semibold hover:text-dark"
                                                >
                                                    {item.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}

                            <div className="mt-auto flex justify-center pt-6">
                                <Icon name="logo-sub" width={110} height={24} />
                            </div>
                        </div>
                    </motion.nav>
                )}

                {panel === 'search' && (
                    <motion.div
                        key="search"
                        {...slide}
                        role="dialog"
                        aria-label="시술 바로 검색"
                        className="fixed inset-x-0 bottom-0 top-16 z-40 bg-cream px-6 pt-8 lg:inset-y-0 lg:left-rail lg:right-auto lg:top-0 lg:w-search lg:border-r lg:border-line lg:px-0 lg:pl-10 lg:pr-8 lg:pt-10"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-16 font-semibold">시술 바로 검색</h2>
                            <button type="button" onClick={() => setPanel(null)} aria-label="검색 닫기">
                                <Icon name="i-close" size={20} />
                            </button>
                        </div>

                        <form
                            onSubmit={submitSearch}
                            className="mt-8 flex items-center gap-2 border-b border-dark/30 pb-2"
                        >
                            <label htmlFor="quick-search" className="sr-only">
                                시술명 검색
                            </label>
                            <input
                                id="quick-search"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="Search"
                                autoComplete="off"
                                className="w-full bg-transparent font-display text-20 text-dark outline-none placeholder:text-taupe"
                            />
                            <button type="submit" aria-label="검색">
                                <Icon name="i-seach" size={20} />
                            </button>
                        </form>
                        <p className="mt-3 text-caption-sm text-dark/50">원하는 시술명을 입력해주세요</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function RailButton({
    icon,
    label,
    onClick,
    expanded,
    display,
}: {
    icon: ReactNode;
    label: string;
    onClick: () => void;
    expanded: boolean;
    display?: boolean;
}) {
    return (
        <button type="button" onClick={onClick} aria-expanded={expanded} className="flex flex-col items-center gap-1.5">
            {icon}
            <span className={`text-caption-sm ${display ? 'font-display tracking-[0.14em]' : ''}`}>{label}</span>
        </button>
    );
}

function RailLink({
    href,
    label,
    icon,
    external,
}: {
    href: string;
    label: string;
    icon: ReactNode;
    external?: boolean;
}) {
    const cls = 'flex flex-col items-center gap-1.5 text-caption-sm';
    if (external) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
                {icon}
                <span>{label}</span>
            </a>
        );
    }
    return (
        <Link href={href} className={cls}>
            {icon}
            <span>{label}</span>
        </Link>
    );
}
