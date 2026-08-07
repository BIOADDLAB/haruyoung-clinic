'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DUR, EASE } from '@/lib/motion';
import type { CartItem } from '@/types/reservation';

const STORAGE_KEY = 'haruyoung.cart';

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
    // useState 초기화 함수는 첫 렌더에 한 번만 돈다. effect 에서 setState 할 필요가 없다
    const [items, setItems] = useState<CartItem[]>(readStored);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const reduced = useReducedMotion();

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch {
            // 용량 초과 등은 무시. 담기 자체를 막을 이유는 없다
        }
    }, [items]);

    // 토스트는 3초 뒤 오래된 것부터 사라진다
    useEffect(() => {
        if (toasts.length === 0) return;
        const t = setTimeout(() => setToasts((list) => list.slice(1)), 3000);
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

            {/* 담기 피드백 — 우하단에서 위로 쌓인다. 모바일 퀵바(64) 위에 얹는다 */}
            <div className="pointer-events-none fixed bottom-24 right-5 z-70 flex flex-col-reverse gap-2 lg:bottom-8">
                <AnimatePresence initial={false}>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            initial={reduced ? false : { opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: DUR.fast, ease: EASE }}
                            className="pointer-events-auto flex items-center gap-4 border border-dark/10 bg-cream px-5 py-3.5 shadow-[0_10px_28px_rgba(59,43,30,0.16)]"
                        >
                            <p className="text-caption">
                                <span className="font-semibold">시술이 추가됐어요!</span>
                                <span className="ml-2 text-dark/60">장바구니를 확인해 보세요.</span>
                            </p>
                            <Link href="/cart" className="shrink-0 text-caption font-semibold">
                                <span className="border-b border-dark pb-0.5">장바구니</span>
                            </Link>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </Ctx.Provider>
    );
}
