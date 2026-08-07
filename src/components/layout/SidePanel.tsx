import type { ReactNode } from 'react';

export default function SidePanel({ title, children }: { title: string; children?: ReactNode }) {
    return (
        <>
            <aside className="fixed left-rail top-0 z-40 hidden h-dvh w-[277px] border-r border-dark/15 bg-cream p-12 lg:block">
                <h1 className="text-24 font-bold">{title}</h1>
                {children}
            </aside>

            <div className="fixed inset-x-0 top-16 z-40 flex h-12 items-center border-b border-dark/10 bg-cream px-5 lg:hidden">
                <h1 className="text-small font-bold">{title}</h1>
            </div>
        </>
    );
}
