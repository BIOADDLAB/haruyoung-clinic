'use client';

import { useEffect, useRef, useState } from 'react';

type NavItem = { id: string; label: string };

export default function EquipmentNav({ items, label }: { items: NavItem[]; label: string }) {
    const [active, setActive] = useState(items[0]?.id ?? '');
    const listRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        const sections = items
            .map(({ id }) => document.getElementById(id))
            .filter((section): section is HTMLElement => section !== null);
        let frame = 0;

        const update = () => {
            frame = 0;
            let current = sections[0]?.id ?? '';
            for (const section of sections) {
                const offset = parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
                if (section.getBoundingClientRect().top <= offset + 8) current = section.id;
            }
            if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
                current = sections.at(-1)?.id ?? current;
            }
            setActive(current);
        };

        const schedule = () => {
            if (!frame) frame = window.requestAnimationFrame(update);
        };

        schedule();
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        window.addEventListener('hashchange', schedule);
        window.addEventListener('pageshow', schedule);
        return () => {
            window.cancelAnimationFrame(frame);
            window.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', schedule);
            window.removeEventListener('hashchange', schedule);
            window.removeEventListener('pageshow', schedule);
        };
    }, [items]);

    useEffect(() => {
        const keepActiveVisible = () => {
            const list = listRef.current;
            if (!list || window.matchMedia('(min-width: 1024px)').matches) return;
            const link = list.querySelector<HTMLAnchorElement>('[aria-current="location"]');
            if (!link) return;
            const listRect = list.getBoundingClientRect();
            const linkRect = link.getBoundingClientRect();
            // 메뉴 안에서만 이동해 본문의 세로 스크롤 위치를 유지합니다.
            list.scrollTo({
                left: list.scrollLeft + linkRect.left - listRect.left - (list.clientWidth - linkRect.width) / 2,
                behavior: 'auto',
            });
        };

        keepActiveVisible();
        window.addEventListener('resize', keepActiveVisible);
        return () => window.removeEventListener('resize', keepActiveVisible);
    }, [active, items]);

    return (
        <nav
            aria-label={label}
            className="fixed inset-x-0 top-16 z-40 h-12 border-b border-dark/15 bg-cream lg:inset-x-auto lg:left-rail lg:top-0 lg:h-dvh lg:w-[277px] lg:overflow-y-auto lg:border-r lg:border-b-0"
        >
            <ul
                ref={listRef}
                className="flex h-full items-center gap-5 overflow-x-auto px-5 lg:h-auto lg:flex-col lg:items-start lg:gap-2 lg:overflow-visible lg:pt-[80px] lg:pr-6 lg:pl-10"
            >
                {items.map((item) => (
                    <li key={item.id} className="shrink-0 lg:w-full">
                        <a
                            href={`#${item.id}`}
                            aria-current={active === item.id ? 'location' : undefined}
                            className={`group inline-flex min-h-11 items-center py-2 text-[16px] transition-colors duration-300 ease-brand hover:text-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brown lg:text-small ${
                                active === item.id ? 'font-semibold text-dark' : 'text-dark/75'
                            }`}
                        >
                            <span
                                className={`border-b pb-1 whitespace-nowrap group-hover:border-dark lg:whitespace-normal lg:break-keep ${
                                    active === item.id ? 'border-dark' : 'border-transparent'
                                }`}
                            >
                                {item.label}
                            </span>
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
