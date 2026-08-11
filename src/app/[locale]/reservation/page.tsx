import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/Header';
import SidePanel from '@/components/layout/SidePanel';
import ReservationForm from '@/components/reservation/ReservationForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'meta' });

    return {
        title: t('reservation'),
        description: t('reservationDesc'),
        alternates: { canonical: '/reservation' },
    };
}

export default async function ReservationPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'meta' });

    return (
        <>
            <Header dark />
            <SidePanel title={t('reservation')} />

            <main className="site-sub min-h-dvh bg-cream">
                <div className="px-6 pb-28 pt-8 lg:pb-24 lg:pl-12 lg:pr-0 lg:pt-16">
                    <ReservationForm withCategory />
                </div>
            </main>
        </>
    );
}
