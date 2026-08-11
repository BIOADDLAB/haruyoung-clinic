import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import SearchResult from './SearchResult';
import Header from '@/components/layout/Header';
import SubNav from '@/components/layout/SubNav';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'meta' });

    return {
        title: t('search'),
        description: t('searchDesc'),
        alternates: { canonical: '/treatments' },
    };
}

export default async function TreatmentsPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ q?: string }>;
}) {
    const { locale } = await params;
    const { q } = await searchParams;
    const t = await getTranslations({ locale, namespace: 'meta' });

    return (
        <>
            <Header dark />
            <SubNav />

            <main className="site-sub min-h-dvh bg-cream">
                <h1 className="sr-only">{t('search')}</h1>
                <SearchResult keyword={q ?? ''} />
            </main>
        </>
    );
}
