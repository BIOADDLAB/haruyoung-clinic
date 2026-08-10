'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV } from './nav';

/** 현재 메뉴를 표시한다. 모바일은 가로 스크롤 탭, PC 는 세로 목록 */
export default function AdminNav({ variant }: { variant: 'mobile' | 'desktop' }) {
    const pathname = usePathname();

    if (variant === 'mobile') {
        return (
            <nav className="border-t border-white/10">
                <ul className="flex gap-1 overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {NAV.map((n) => {
                        const on = pathname.startsWith(n.href);
                        return (
                            <li key={n.href} className="shrink-0">
                                <Link
                                    href={n.href}
                                    aria-current={on ? 'page' : undefined}
                                    className={`block whitespace-nowrap px-3 py-3 text-sm ${
                                        on ? 'border-b-2 border-white font-semibold text-white' : 'text-white/60'
                                    }`}
                                >
                                    {n.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        );
    }

    return (
        <nav className="mt-10 flex flex-col gap-4">
            {NAV.map((n) => {
                const on = pathname.startsWith(n.href);
                return (
                    <Link
                        key={n.href}
                        href={n.href}
                        aria-current={on ? 'page' : undefined}
                        className={`text-sm transition-colors ${on ? 'font-semibold text-white' : 'text-white/60 hover:text-white'}`}
                    >
                        {n.label}
                    </Link>
                );
            })}
        </nav>
    );
}
