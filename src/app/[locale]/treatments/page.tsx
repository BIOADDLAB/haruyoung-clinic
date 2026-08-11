import type { Metadata } from 'next';
import SearchResult from './SearchResult';
import Header from '@/components/layout/Header';
import SubNav from '@/components/layout/SubNav';

export const metadata: Metadata = {
    title: '시술 검색',
    description: '하루영의원 시술을 검색해 보세요.',
    alternates: { canonical: '/treatments' },
};

export default async function TreatmentsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const { q } = await searchParams;

    return (
        <>
            <Header dark />
            <SubNav />

            <main className="site-sub min-h-dvh bg-cream">
                <h1 className="sr-only">하루영의원 시술 검색</h1>
                <SearchResult keyword={q ?? ''} />
            </main>
        </>
    );
}
