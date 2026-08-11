'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { SUB_NAV } from '@/data/site';

export default function SubNav() {
    const pathname = usePathname();
    const t = useTranslations('banner');
    const tn = useTranslations('nav');

    return (
        <>
            <nav
                aria-label={tn('treatmentMenu')}
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
                                    {t(item.key)}
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
                aria-label={tn('treatmentMenu')}
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
                                    {t(item.key)}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </>
    );
}
