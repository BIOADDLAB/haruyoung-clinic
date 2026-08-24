import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PromotionList from '@/components/promotion/PromotionList';
import Header from '@/components/layout/Header';
import SubNav from '@/components/layout/SubNav';
import { createPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'meta' });

    return createPageMetadata({
        locale,
        path: '/promotion',
        title: t('promotion'),
        description: t('promotionDesc'),
        clinic: t('clinic'),
        ogAlt: t('ogAlt'),
    });
}

export default async function PromotionPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ c?: string }>;
}) {
    const { locale } = await params;
    const { c } = await searchParams;
    const t = await getTranslations({ locale, namespace: 'meta' });

    return (
        <>
            <Header dark />
            <SubNav />

            <main className="site-sub min-h-dvh bg-cream">
                <h1 className="sr-only">{t('promotion')}</h1>
                <PromotionList categoryId={typeof c === 'string' ? c : ''} />
            </main>
        </>
    );
}
