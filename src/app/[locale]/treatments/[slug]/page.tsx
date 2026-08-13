import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import TreatmentList from '@/components/treatments/TreatmentList';
import Header from '@/components/layout/Header';
import SubNav from '@/components/layout/SubNav';
import { MENU_CATEGORIES } from '@/constants/categories';
import type { Locale } from '@/i18n/routing';
import { createPageMetadata } from '@/lib/seo';
import { createTreatmentSchema } from '@/lib/schema';

export function generateStaticParams() {
    return MENU_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
    const { locale, slug } = await params;
    const category = MENU_CATEGORIES.find((c) => c.slug === slug);
    if (!category) return {};

    const [tm, tb] = await Promise.all([
        getTranslations({ locale, namespace: 'meta' }),
        getTranslations({ locale, namespace: 'banner' }),
    ]);
    const name = tb(category.slug);

    return createPageMetadata({
        locale,
        path: `/treatments/${slug}`,
        title: name,
        description: tm('treatmentDesc', { name }),
        clinic: tm('clinic'),
        ogAlt: tm('ogAlt'),
    });
}

export default async function TreatmentPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
    const { locale, slug } = await params;
    const category = MENU_CATEGORIES.find((c) => c.slug === slug);
    if (!category) notFound();

    const [tm, tb] = await Promise.all([
        getTranslations({ locale, namespace: 'meta' }),
        getTranslations({ locale, namespace: 'banner' }),
    ]);
    const name = tb(category.slug);
    const description = tm('treatmentDesc', { name });
    const schema = createTreatmentSchema({
        locale: locale as Locale,
        slug,
        name,
        description,
        clinic: tm('clinic'),
    });

    return (
        <>
            <JsonLd data={schema} />
            <Header dark />
            <SubNav />

            <main className="site-sub min-h-dvh bg-cream">
                <h1 className="sr-only">
                    {tm('clinic')} {name}
                </h1>
                <TreatmentList slug={slug} categoryName={name} />
            </main>
        </>
    );
}
