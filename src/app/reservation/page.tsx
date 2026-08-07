import type { Metadata } from 'next';
import ReservationForm from '@/components/reservation/ReservationForm';
import Header from '@/components/layout/Header';

export const metadata: Metadata = {
    title: '바로예약',
    description: '하루영의원 시술 예약을 접수합니다. 원하는 날짜와 시간을 선택해주세요.',
    alternates: { canonical: '/reservation' },
};

export default function ReservationPage() {
    return (
        <>
            <Header dark />

            <main className="site-main min-h-dvh bg-cream">
                <div className="mx-auto flex max-w-[1200px] flex-col gap-12 px-6 pb-28 pt-10 lg:flex-row lg:gap-24 lg:px-12 lg:pb-24 lg:pt-16">
                    <h1 className="shrink-0 text-24 font-bold lg:w-[240px]">바로예약</h1>
                    <ReservationForm withCategory />
                </div>
            </main>
        </>
    );
}
