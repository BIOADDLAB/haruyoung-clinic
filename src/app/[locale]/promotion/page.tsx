import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PromotionList from './PromotionList';
import Header from '@/components/layout/Header';
import SubNav from '@/components/layout/SubNav';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'meta' });

    return {
        title: t('promotion'),
        description: t('promotionDesc'),
        alternates: { canonical: '/promotion' },
    };
}

export default async function PromotionPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'meta' });

    return (
        <>
            <Header dark />
            <SubNav />

            <main className="site-sub min-h-dvh bg-cream">
                <h1 className="sr-only">{t('promotion')}</h1>
                <PromotionList />
            </main>
        </>
    );
}
