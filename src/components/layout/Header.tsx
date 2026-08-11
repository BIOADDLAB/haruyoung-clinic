'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import MobileQuickBar from './MobileQuickBar';
import AuthModal from '@/components/auth/AuthModal';
import { useAuthMember } from '@/components/auth/useAuthMember';
import { signOutMember } from '@/lib/members';
import { useCart } from '@/components/cart/CartProvider';
import { LANGS, MENU_GROUPS, QUICK_LINKS, type LangCode } from '@/data/site';
import { DUR, EASE, fadeUp, stagger } from '@/lib/motion';
import { useMounted } from '@/lib/useMounted';

const PANEL_W = 247;

/** 검색창이 비어 있을 때 바로 누를 수 있는 추천어 관리자에서 직접 입력 불가 */
const SEARCH_SUGGESTIONS = ['리프팅', '스킨부스터', '여드름치료', '제모'] as const;

type PanelKind = 'menu' | 'search' | null;

/**
 * @param dark 시술·프로모션·예약 페이지용. PC 레일 배경이 dark 로 뒤집힌다.
 *             모바일 상단 바와 열린 패널은 두 경우 모두 cream 이다.
 */
export default function Header({ dark }: { dark?: boolean }) {
    const [panel, setPanel] = useState<PanelKind>(null);
    const [keyword, setKeyword] = useState('');
    const [lang, setLang] = useState<LangCode>('ko');
    const [auth, setAuth] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const reduced = useReducedMotion();

    const iconTone = dark ? 'brightness-0 invert' : undefined;

    const [lastPath, setLastPath] = useState(pathname);
    if (lastPath !== pathname) {
        setLastPath(pathname);
        setPanel(null);
    }

    useEffect(() => {
        document.body.classList.toggle('max-lg:overflow-hidden', panel !== null);
        return () => document.body.classList.remove('max-lg:overflow-hidden');
    }, [panel]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPanel(null);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const close = useCallback(() => setPanel(null), []);
    const toggle = (kind: Exclude<PanelKind, null>) => setPanel((p) => (p === kind ? null : kind));

    const search = useCallback(
        (q: string) => {
            const term = q.trim();
            if (!term) return;
            setPanel(null);
            // #TODO: 검색 결과 페이지 구현 후 연결
            router.push(`/treatments?q=${encodeURIComponent(term)}`);
        },
        [router],
    );

    const submitSearch = (e: FormEvent) => {
        e.preventDefault();
        search(keyword);
    };

    // 패널은 폭이 열리고 닫힌다. 안쪽은 고정 폭이라 애니메이션 중에 내용이 밀리지 않는다.
    const expand = reduced
        ? { initial: false as const }
        : {
              initial: { width: 0, opacity: 0 },
              animate: { width: PANEL_W, opacity: 1 },
              exit: { width: 0, opacity: 0 },
              transition: { duration: DUR.base, ease: EASE },
          };

    const fade = reduced
        ? { initial: false as const }
        : {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
              transition: { duration: DUR.base, ease: EASE },
          };

    const slideDown = reduced
        ? { initial: false as const }
        : {
              initial: { opacity: 0, y: -12 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -12 },
              transition: { duration: DUR.fast, ease: EASE },
          };

    return (
        <>
            <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-dark/10 bg-cream px-5 lg:hidden">
                <Link href="/" aria-label="하루영의원 홈으로">
                    <Image src="/images/logo-sub.svg" alt="하루영의원" width={110} height={24} priority />
                </Link>
                <div className="flex items-center gap-4">
                    <MobileLangTop value={lang} onChange={setLang} />

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

            <AnimatePresence initial={false} mode="wait">
                {panel !== null && (
                    <motion.div
                        key={panel}
                        {...slideDown}
                        className="fixed inset-x-0 bottom-0 top-16 z-45 overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-cream px-6 py-8 lg:hidden"
                    >
                        {panel === 'menu' ? (
                            <MenuNav onNavigate={close} onLogin={() => setAuth(true)} />
                        ) : (
                            <SearchForm
                                keyword={keyword}
                                onChange={setKeyword}
                                onSubmit={submitSearch}
                                onPick={search}
                                onClose={close}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {panel !== null && (
                    <motion.button
                        type="button"
                        tabIndex={-1}
                        aria-hidden
                        onClick={close}
                        {...fade}
                        className="fixed inset-0 z-40 hidden cursor-default bg-dark/45 lg:block"
                    />
                )}
            </AnimatePresence>

            <header
                className={`fixed left-0 top-0 z-50 hidden h-dvh lg:flex ${dark ? 'bg-dark text-cream' : 'bg-cream'}`}
            >
                <div className="flex h-full w-rail shrink-0 flex-col justify-between gap-10 overflow-y-auto overscroll-contain px-4 py-11.5">
                    <div className="flex flex-col items-center justify-center">
                        <Link href="/" className="mb-10" aria-label="하루영의원 홈으로">
                            <Image
                                src="/images/logo.svg"
                                alt="하루영의원"
                                width={74}
                                height={44}
                                className={iconTone}
                            />
                        </Link>

                        <button
                            type="button"
                            onClick={() => toggle('menu')}
                            aria-expanded={panel === 'menu'}
                            aria-label={panel === 'menu' ? '전체 메뉴 닫기' : '전체 메뉴 열기'}
                            className="mb-5.5 flex flex-col items-center"
                        >
                            <Image
                                src={panel === 'menu' ? '/images/i-close.svg' : '/images/i-ham.svg'}
                                alt=""
                                width={22}
                                height={22}
                                className={iconTone}
                            />
                            <span className="mt-3 font-display text-caption">MENU</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => toggle('search')}
                            aria-expanded={panel === 'search'}
                            aria-label={panel === 'search' ? '바로검색 닫기' : '바로검색 열기'}
                            className="flex flex-col items-center"
                        >
                            <Image src="/images/i-search.svg" alt="" width={22} height={22} className={iconTone} />
                            <span className="mt-1.25 text-caption-sm font-semibold">바로검색</span>
                        </button>
                    </div>

                    <nav aria-label="빠른 메뉴" className="flex flex-col gap-6.5">
                        <RailLang value={lang} onChange={setLang} dark={dark} />

                        {QUICK_LINKS.map((l) =>
                            l.external ? (
                                <a
                                    key={l.label}
                                    href={l.href}
                                    target={l.href.startsWith('http') ? '_blank' : undefined}
                                    rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                    className="flex flex-col items-center transition-opacity duration-500 ease-brand hover:opacity-70"
                                >
                                    <Image
                                        src={`/images/${l.icon}.svg`}
                                        alt=""
                                        width={34}
                                        height={34}
                                        className={iconTone}
                                    />
                                    <span className="text-caption-sm font-semibold">{l.label}</span>
                                </a>
                            ) : (
                                <Link
                                    key={l.label}
                                    href={l.href}
                                    className="flex flex-col items-center transition-opacity duration-500 ease-brand hover:opacity-70"
                                >
                                    <Image
                                        src={`/images/${l.icon}.svg`}
                                        alt=""
                                        width={34}
                                        height={34}
                                        className={iconTone}
                                    />
                                    <span className="text-caption-sm font-semibold">{l.label}</span>
                                </Link>
                            ),
                        )}

                        <CartRailLink dark={dark} />

                        <RailAuth dark={dark} onLogin={() => setAuth(true)} />
                    </nav>
                </div>

                <AnimatePresence initial={false} mode="wait">
                    {panel !== null && (
                        <motion.div key={panel} {...expand} className="overflow-hidden bg-cream text-dark">
                            {/* 세로가 짧은 노트북에서 메뉴가 잘린다. 패널 안에서만 스크롤한다 */}
                            <div style={{ width: PANEL_W }} className="h-full overflow-y-auto overscroll-contain">
                                {panel === 'menu' ? (
                                    <MenuNav onNavigate={close} onLogin={() => setAuth(true)} />
                                ) : (
                                    <SearchForm
                                        keyword={keyword}
                                        onChange={setKeyword}
                                        onSubmit={submitSearch}
                                        onPick={search}
                                        onClose={close}
                                    />
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <MobileQuickBar />

            <AuthModal open={auth} onClose={() => setAuth(false)} />
        </>
    );
}

/**
 * 레일 로그인 영역.
 * 로그인 전에는 '로그인', 후에는 이름과 로그아웃을 보여준다.
 * 판정이 끝나기 전(ready=false)에는 아무것도 그리지 않아 깜빡임을 막는다.
 */
/**
 * 레일 로그인 영역.
 * 로그인 전에는 '로그인', 후에는 '로그아웃'.
 * 판정이 끝나기 전(ready=false)에는 아무것도 그리지 않아 깜빡임을 막는다.
 */
function RailAuth({ dark, onLogin }: { dark?: boolean; onLogin: () => void }) {
    const { member, ready } = useAuthMember();
    const line = dark ? 'border-cream' : 'border-dark';

    if (!ready) return <span className="h-5" />;

    return (
        <button
            type="button"
            onClick={() => (member ? signOutMember() : onLogin())}
            className="text-center text-caption-sm font-semibold"
        >
            <span className={`border-b pb-1 ${line}`}>{member ? '로그아웃' : '로그인'}</span>
        </button>
    );
}

/** 모바일 메뉴 로그인 영역. 로그인 전에는 '로그인', 후에는 '로그아웃' */
function MobileAuth({ onNavigate, onLogin }: { onNavigate: () => void; onLogin: () => void }) {
    const { member, ready } = useAuthMember();

    if (!ready) return <span />;

    return (
        <button
            type="button"
            onClick={() => {
                if (member) {
                    signOutMember();
                    return;
                }
                onNavigate();
                onLogin();
            }}
            className="text-caption font-semibold"
        >
            <span className="border-b border-dark pb-1">{member ? '로그아웃' : '로그인'}</span>
        </button>
    );
}
/** 레일 장바구니. 개수는 localStorage 기반이라 마운트 전에는 숨긴다 */
function CartRailLink({ dark }: { dark?: boolean }) {
    const { count } = useCart();
    const mounted = useMounted();

    return (
        <Link href="/cart" className="text-center text-caption-sm font-semibold">
            <span className={`border-b pb-1 ${dark ? 'border-cream' : 'border-dark'}`}>
                장바구니
                {mounted && count > 0 && ` (${count})`}
            </span>
        </Link>
    );
}

function MobileLangTop({ value, onChange }: { value: LangCode; onChange: (v: LangCode) => void }) {
    const [open, setOpen] = useState(false);
    const reduced = useReducedMotion();
    const current = LANGS.find((l) => l.code === value)!;

    return (
        <>
            {open && (
                <button
                    type="button"
                    tabIndex={-1}
                    aria-hidden
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 z-0 cursor-default"
                />
            )}

            <div className="relative z-10 flex h-16 items-center">
                <button
                    type="button"
                    onClick={() => setOpen((o) => !o)}
                    aria-expanded={open}
                    aria-label={`언어 선택, 현재 ${current.name}`}
                    className={`px-1 font-display text-caption tracking-[0.12em] transition-colors duration-500 ease-brand ${
                        open ? 'text-dark' : 'text-dark/70'
                    }`}
                >
                    <span aria-hidden="true">{current.label}</span>
                </button>

                <AnimatePresence>
                    {open && (
                        <motion.ul
                            initial={reduced ? false : { opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: DUR.fast, ease: EASE }}
                            className="absolute left-1/2 top-full flex w-16 -translate-x-1/2 flex-col items-center divide-y divide-dark/10 border border-dark/10 bg-cream shadow-[0_8px_20px_rgba(59,43,30,0.1)]"
                        >
                            {LANGS.map((l) => (
                                <li key={l.code} className="w-full">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onChange(l.code);
                                            setOpen(false);
                                        }}
                                        aria-pressed={value === l.code}
                                        className={`w-full py-2.5 font-display text-caption-sm tracking-[0.12em] transition-colors duration-500 ease-brand ${
                                            value === l.code ? 'bg-dark/5 text-dark' : 'text-dark/45'
                                        }`}
                                    >
                                        <span className="sr-only">{l.name}</span>
                                        <span aria-hidden="true">{l.label}</span>
                                    </button>
                                </li>
                            ))}
                        </motion.ul>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}

/**
 * 레일 언어 전환.
 * 레일 오른쪽으로 캡슐 팝오버가 미끄러져 나온다.
 * 세로로 펼치면 레일 높이가 늘어나 아래 항목들이 밀리므로 옆으로 편다.
 *
 * 레일에 overflow-y-auto 가 걸려 있어 absolute 로 두면 잘린다.
 * 버튼 위치를 재서 fixed 로 띄운다.
 *
 * TODO: 다국어 라우팅 붙으면 setState 대신 locale 전환으로 교체
 */
function RailLang({ value, onChange, dark }: { value: LangCode; onChange: (v: LangCode) => void; dark?: boolean }) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const btnRef = useRef<HTMLButtonElement>(null);
    const reduced = useReducedMotion();
    const current = LANGS.find((l) => l.code === value)!;

    const openAt = () => {
        const r = btnRef.current?.getBoundingClientRect();
        if (r) setPos({ top: r.top + r.height / 2, left: r.right + 8 });
        setOpen((o) => !o);
    };

    return (
        <>
            {open && (
                <button
                    type="button"
                    tabIndex={-1}
                    aria-hidden
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 z-55 cursor-default"
                />
            )}

            <div className="flex flex-col items-center">
                <button
                    ref={btnRef}
                    type="button"
                    onClick={openAt}
                    aria-expanded={open}
                    aria-label={`언어 선택, 현재 ${current.name}`}
                    className="flex flex-col items-center transition-opacity duration-500 ease-brand hover:opacity-70"
                >
                    <Image
                        src="/images/i-h-01.svg"
                        alt=""
                        width={34}
                        height={34}
                        className={dark ? 'brightness-0 invert' : undefined}
                    />
                    <span aria-hidden="true" className="font-display text-caption-sm tracking-[0.1em]">
                        {current.label}
                    </span>
                </button>
            </div>

            <AnimatePresence>
                {open && (
                    <motion.ul
                        initial={reduced ? false : { opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: DUR.fast, ease: EASE }}
                        style={{ top: pos.top, left: pos.left }}
                        className="fixed z-56 flex -translate-y-1/2 items-center gap-1 rounded-full border border-dark/10 bg-cream px-2.5 py-2 shadow-[0_10px_30px_rgba(59,43,30,0.14)]"
                    >
                        {LANGS.map((l) => (
                            <li key={l.code}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onChange(l.code);
                                        setOpen(false);
                                    }}
                                    aria-pressed={value === l.code}
                                    className={`rounded-full px-2.5 py-1 font-display text-caption-sm tracking-[0.1em] transition-colors duration-500 ease-brand ${
                                        value === l.code
                                            ? 'bg-dark text-cream'
                                            : 'text-dark/50 hover:bg-dark/8 hover:text-dark'
                                    }`}
                                >
                                    <span className="sr-only">{l.name}</span>
                                    <span aria-hidden="true">{l.label}</span>
                                </button>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </>
    );
}

function MenuNav({ onNavigate, onLogin }: { onNavigate: () => void; onLogin: () => void }) {
    const reduced = useReducedMotion();
    const pathname = usePathname();

    return (
        <nav aria-label="전체 메뉴" className="flex h-full flex-col justify-between lg:py-10 lg:pl-10 lg:pr-7.5 ">
            <div className="mb-2 flex items-center justify-end gap-5 lg:hidden">
                <MobileCartLink onNavigate={onNavigate} />
                <MobileAuth onNavigate={onNavigate} onLogin={onLogin} />
            </div>

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
                                <span className="relative inline-block">
                                    <span className="absolute right-0 top-3 h-3 w-3 -translate-y-1/2 translate-x-1/4 scale-0 rounded-full bg-tan opacity-0 transition duration-700 ease-brand group-hover:scale-100 group-hover:opacity-100" />
                                    <span className="relative text-lead">{group.title}</span>
                                </span>
                            </p>

                            <ul aria-labelledby={id} className="ml-[2px] mt-3 flex flex-col gap-2.5">
                                {group.items.map((item) => {
                                    const current = item.href === pathname;
                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                onClick={onNavigate}
                                                aria-current={current ? 'page' : undefined}
                                                className={`group/item relative inline-block pb-1 text-small transition-colors duration-500 ease-brand hover:font-semibold hover:text-dark ${
                                                    current ? 'font-semibold text-dark' : 'text-dark/80'
                                                }`}
                                            >
                                                {item.label}
                                                <span
                                                    className={`absolute inset-x-0 bottom-0 h-px origin-left bg-dark transition-transform duration-500 ease-brand group-hover/item:scale-x-100 ${
                                                        current ? 'scale-x-100' : 'scale-x-0'
                                                    }`}
                                                />
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </motion.div>
                    );
                })}
            </motion.div>

            <div className="!mt-12 flex justify-center !pb-10 lg:mt-0 lg:pb-0">
                <Image src="/images/logo-sub.svg" alt="하루영의원" width={120} height={34} />
            </div>
        </nav>
    );
}

function SearchForm({
    keyword,
    onChange,
    onSubmit,
    onPick,
    onClose,
}: {
    keyword: string;
    onChange: (v: string) => void;
    onSubmit: (e: FormEvent) => void;
    onPick: (v: string) => void;
    onClose: () => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    // 패널이 열리면 바로 타이핑할 수 있게 한다. 레이아웃 점프 방지로 preventScroll
    useEffect(() => {
        inputRef.current?.focus({ preventScroll: true });
    }, []);

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
                        ref={inputRef}
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

            <p className="mt-7.5 text-caption-sm font-semibold text-dark/60">추천 검색어</p>
            <ul className="mt-3 flex flex-wrap gap-2">
                {SEARCH_SUGGESTIONS.map((s) => (
                    <li key={s}>
                        <button
                            type="button"
                            onClick={() => onPick(s)}
                            className="rounded-full border border-dark/20 px-3 py-1 text-caption-sm transition-colors duration-500 ease-brand hover:border-dark/40 hover:bg-tan/40"
                        >
                            {s}
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    );
}

/** 모바일 메뉴 장바구니. 개수는 localStorage 기반이라 마운트 전에는 숨긴다 */
function MobileCartLink({ onNavigate }: { onNavigate: () => void }) {
    const { count } = useCart();
    const mounted = useMounted();

    return (
        <Link href="/cart" onClick={onNavigate} className="text-caption font-semibold">
            <span className="border-b border-dark pb-1">
                장바구니
                {mounted && count > 0 && ` (${count})`}
            </span>
        </Link>
    );
}
