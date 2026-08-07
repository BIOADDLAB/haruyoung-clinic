'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SUB_NAV } from '@/data/site';

export default function SubNav() {
    const pathname = usePathname();

    return (
        <>
            <nav
                aria-label="시술 메뉴"
                className="fixed left-rail top-0 z-40 hidden h-dvh w-[277px] border-r border-dark/15 bg-cream lg:block"
            >
                <ul className="flex flex-col gap-[13px] pl-14 pt-[91px]">
                    {SUB_NAV.map((item) => {
                        const current = pathname === item.href;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    aria-current={current ? 'page' : undefined}
                                    className={`group relative inline-block pb-1.5 text-small transition-colors duration-500 ease-brand hover:text-dark ${
                                        current ? 'font-semibold text-dark' : 'text-dark/70'
                                    }`}
                                >
                                    {item.label}
                                    <span
                                        className={`absolute inset-x-0 bottom-0 h-px origin-left bg-dark transition-transform duration-500 ease-brand group-hover:scale-x-100 ${
                                            current ? 'scale-x-100' : 'scale-x-0'
                                        }`}
                                    />
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <nav
                aria-label="시술 메뉴"
                className="fixed inset-x-0 top-16 z-40 h-12 border-b border-dark/10 bg-cream lg:hidden"
            >
                <ul className="flex h-full items-center gap-5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {SUB_NAV.map((item) => {
                        const current = pathname === item.href;
                        return (
                            <li key={item.href} className="shrink-0">
                                <Link
                                    href={item.href}
                                    aria-current={current ? 'page' : undefined}
                                    className={`whitespace-nowrap text-caption ${
                                        current ? 'border-b border-dark pb-1 font-semibold text-dark' : 'text-dark/60'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </>
    );
}
