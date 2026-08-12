import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TreatmentList from '@/components/treatments/TreatmentList';
import Header from '@/components/layout/Header';
import SubNav from '@/components/layout/SubNav';
import { MENU_CATEGORIES } from '@/constants/categories';

export function generateStaticParams() {
    return MENU_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const category = MENU_CATEGORIES.find((c) => c.slug === slug);
    if (!category) return {};

    return {
        title: category.name,
        description: `하루영의원 ${category.name} 시술 안내와 가격입니다. 피부를 위한 가장 깊은 쉼을 설계합니다.`,
        alternates: { canonical: `/treatments/${slug}` },
    };
}

export default async function TreatmentPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const category = MENU_CATEGORIES.find((c) => c.slug === slug);
    if (!category) notFound();

    return (
        <>
            <Header dark />
            <SubNav />

            <main className="site-sub min-h-dvh bg-cream">
                <h1 className="sr-only">하루영의원 {category.name}</h1>
                <TreatmentList slug={slug} categoryName={category.name} />
            </main>
        </>
    );
}
