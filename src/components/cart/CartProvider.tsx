'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DUR, EASE } from '@/lib/motion';
import type { CartItem } from '@/types/reservation';

const STORAGE_KEY = 'haruyoung.cart';

/** 토스트가 떠 있는 시간. 진행바 길이와 같은 값을 쓴다 */
const TOAST_MS = 3000;

type Toast = { id: number; name: string };

type CartValue = {
    items: CartItem[];
    count: number;
    total: number;
    has: (key: string) => boolean;
    toggle: (item: CartItem) => void;
    remove: (keys: string[]) => void;
    clear: () => void;
};

const Ctx = createContext<CartValue | null>(null);

export function useCart() {
    const v = useContext(Ctx);
    if (!v) throw new Error('CartProvider 안에서만 쓸 수 있습니다.');
    return v;
}

/** 서버에서는 항상 빈 배열. 클라이언트에서만 저장분을 읽는다 */
function readStored(): CartItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
        // 파싱 실패는 빈 장바구니로 취급한다
        return [];
    }
}

export default function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(readStored);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const reduced = useReducedMotion();

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch {
            // 용량 초과·프라이빗 모드 등. 저장 못 해도 담기는 되어야 한다
        }
    }, [items]);

    // 토스트는 3초 뒤 오래된 것부터 사라진다
    useEffect(() => {
        if (toasts.length === 0) return;
        const t = setTimeout(() => setToasts((list) => list.slice(1)), TOAST_MS);
        return () => clearTimeout(t);
    }, [toasts]);

    const has = useCallback((key: string) => items.some((i) => i.key === key), [items]);

    const toggle = useCallback(
        (item: CartItem) => {
            // 담김 여부를 렌더된 목록으로 판단한다.
            // 업데이터 콜백 안에서 다른 setState 를 부르면 lint 가 잡는다
            if (items.some((i) => i.key === item.key)) {
                setItems((list) => list.filter((i) => i.key !== item.key));
                return;
            }
            setItems((list) => [...list, item]);
            setToasts((t) => [...t, { id: Date.now() + Math.random(), name: item.name }]);
        },
        [items],
    );

    const remove = useCallback((keys: string[]) => {
        setItems((list) => list.filter((i) => !keys.includes(i.key)));
    }, []);

    const clear = useCallback(() => setItems([]), []);

    const value = useMemo<CartValue>(
        () => ({
            items,
            count: items.length,
            total: items.reduce((sum, i) => sum + i.price, 0),
            has,
            toggle,
            remove,
            clear,
        }),
        [items, has, toggle, remove, clear],
    );

    return (
        <Ctx.Provider value={value}>
            {children}

            <div className="pointer-events-none fixed bottom-24 right-5 z-70 flex flex-col-reverse gap-2 lg:bottom-8">
                <AnimatePresence initial={false}>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            initial={reduced ? false : { opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: DUR.fast, ease: EASE }}
                            className="pointer-events-auto relative w-[320px] max-w-[calc(100vw-40px)] overflow-hidden border border-dark/10 bg-cream shadow-[0_10px_28px_rgba(59,43,30,0.16)]"
                        >
                            <div className="flex items-center gap-4 px-5 py-4">
                                <span
                                    aria-hidden="true"
                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-dark"
                                >
                                    <svg
                                        viewBox="0 0 12 12"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="h-3 w-3 text-cream"
                                    >
                                        <path d="M1 6l3.5 3.5L11 2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>

                                <div className="min-w-0 flex-1">
                                    <p className="text-caption font-semibold">시술이 추가됐어요!</p>
                                    <p className="mt-0.5 truncate text-caption-sm text-dark/55">{t.name}</p>
                                </div>

                                <Link href="/cart" className="shrink-0 text-caption font-semibold">
                                    <span className="border-b border-dark pb-0.5">보기</span>
                                </Link>
                            </div>

                            {/* 남은 시간. TOAST_MS 와 같은 값이어야 어긋나지 않는다 */}
                            <motion.span
                                aria-hidden="true"
                                initial={{ scaleX: 1 }}
                                animate={{ scaleX: 0 }}
                                transition={{ duration: TOAST_MS / 1000, ease: 'linear' }}
                                className="absolute inset-x-0 bottom-0 block h-0.5 origin-left bg-dark/35"
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </Ctx.Provider>
    );
}
