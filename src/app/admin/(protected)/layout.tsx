import Link from 'next/link';
import { logoutAdmin } from '../actions';

const NAV = [{ href: '/admin/products', label: '수가표 관리' }];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-[#f3efe9]">
            {/* 왼쪽 사이드바 */}
            <aside className="flex w-[240px] shrink-0 flex-col justify-between bg-[#3a322c] px-7 py-8 text-white">
                <div>
                    <div className="text-sm tracking-[0.2em] text-white/60">HARUYOUNG</div>
                    <div className="mt-1 text-xl font-semibold">관리자</div>

                    <nav className="mt-10 flex flex-col gap-4">
                        {NAV.map((n) => (
                            <Link key={n.href} href={n.href} className="text-sm text-white/85 hover:text-white">
                                {n.label}
                            </Link>
                        ))}
                        <Link href="/admin/promotions">프로모션 관리</Link>
                    </nav>
                </div>

                <form action={logoutAdmin}>
                    <button className="text-sm text-white/60 hover:text-white">로그아웃</button>
                </form>
            </aside>

            {/* 본문 */}
            <main className="flex-1 px-12 py-10">{children}</main>
        </div>
    );
}
