import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import BeforeAfterGallery from '@/components/before-after/BeforeAfterGallery';
import Header from '@/components/layout/Header';
import SubNav from '@/components/layout/SubNav';
import { createPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'meta' });

    return createPageMetadata({
        locale,
        path: '/before-after',
        title: t('beforeAfter'),
        description: t('beforeAfterDesc'),
        clinic: t('clinic'),
        ogAlt: t('ogAlt'),
    });
}

export default async function BeforeAfterPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'meta' });

    return (
        <>
            <Header dark />
            <SubNav />

            <main className="site-sub min-h-dvh bg-cream">
                <h1 className="sr-only">{t('beforeAfter')}</h1>
                <Suspense fallback={null}>
                    <BeforeAfterGallery />
                </Suspense>
            </main>
        </>
    );
}
