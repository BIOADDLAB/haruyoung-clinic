import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import SidePanel from '@/components/layout/SidePanel';
import ReservationForm from '@/components/reservation/ReservationForm';

export const metadata: Metadata = {
    title: '바로예약',
    description: '하루영의원 시술 예약을 접수합니다. 원하는 날짜와 시간을 선택해주세요.',
    alternates: { canonical: '/reservation' },
};

export default function ReservationPage() {
    return (
        <>
            <Header dark />
            <SidePanel title="바로예약" />

            <main className="site-sub min-h-dvh bg-cream">
                <div className="px-6 pb-28 pt-8 lg:pb-24 lg:pl-12 lg:pr-0 lg:pt-16">
                    <ReservationForm withCategory />
                </div>
            </main>
        </>
    );
}
