import Link from 'next/link';
import AdminAuth from './AdminAuth';
import AdminNav from './AdminNav';
import { logoutAdmin } from '../actions';

/**
 * 관리자 레이아웃.
 * PC 는 좌측 고정 사이드바, 모바일·태블릿은 상단 바 + 가로 스크롤 탭이다.
 * 원장·데스크에서 폰으로 예약을 확인하는 경우가 많아 모바일이 필수다.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#f3efe9] lg:flex">
            {/* 모바일·태블릿 상단 */}
            <header className="sticky top-0 z-40 bg-[#3a322c] text-white lg:hidden">
                <div className="flex items-center justify-between px-5 py-4">
                    <Link href="/admin/products">
                        <span className="text-xs tracking-[0.2em] text-white/60">HARUYOUNG</span>
                        <span className="ml-2 text-base font-semibold">관리자</span>
                    </Link>
                    <form action={logoutAdmin}>
                        <button className="text-xs text-white/60">로그아웃</button>
                    </form>
                </div>
                <AdminNav variant="mobile" />
            </header>

            {/* PC 사이드바 */}
            <aside className="hidden w-[240px] shrink-0 flex-col justify-between bg-[#3a322c] px-7 py-8 text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:self-start">
                <div>
                    <div className="text-sm tracking-[0.2em] text-white/60">HARUYOUNG</div>
                    <div className="mt-1 text-xl font-semibold">관리자</div>
                    <AdminNav variant="desktop" />
                </div>

                <form action={logoutAdmin}>
                    <button className="text-sm text-white/60 hover:text-white">로그아웃</button>
                </form>
            </aside>

            {/* Firestore 규칙이 request.auth 를 보므로 Firebase 로그인 후에 내용을 그린다 */}
            <main className="flex-1 px-5 py-8 lg:px-12 lg:py-10">
                <AdminAuth>{children}</AdminAuth>
            </main>
        </div>
    );
}
