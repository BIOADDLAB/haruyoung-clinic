import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/Header';
import SidePanel from '@/components/layout/SidePanel';
import { TERMS_EFFECTIVE, TERMS_SECTIONS } from '@/data/terms';
import { createPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'meta' });

    return createPageMetadata({
        locale,
        path: '/terms',
        title: t('terms'),
        description: t('termsDesc'),
        clinic: t('clinic'),
        ogAlt: t('ogAlt'),
    });
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'meta' });

    return (
        <>
            <Header dark />
            <SidePanel title={t('terms')} />

            <main className="site-sub min-h-dvh bg-cream">
                <div className="w-full max-w-[800px] px-6 pb-28 pt-8 lg:pb-24 lg:pl-12 lg:pr-0 lg:pt-16">
                    {TERMS_SECTIONS.map((s) => (
                        <section key={s.title} className="border-b border-dark/12 py-8 first:pt-0">
                            <h2 className="text-small font-bold">{s.title}</h2>
                            <p className="mt-3 text-caption leading-[1.9] text-dark/75">{s.body}</p>
                        </section>
                    ))}
                    <p className="pt-8 text-caption-sm text-dark/50">시행일 {TERMS_EFFECTIVE}</p>
                </div>
            </main>
        </>
    );
}
