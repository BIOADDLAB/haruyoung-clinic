import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import PrecautionsView from './PrecautionsView';
import Header from '@/components/layout/Header';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'meta' });

    return {
        title: t('precautions'),
        description: t('precautionsDesc'),
        alternates: { canonical: '/precautions' },
    };
}

export default function PrecautionsPage() {
    return (
        <>
            <Header />

            <main className="site-main relative min-h-dvh bg-sand">
                <Image
                    src="/images/bg-sub-05.jpg"
                    alt=""
                    fill
                    priority
                    quality={95}
                    sizes="100vw"
                    className="object-cover"
                />

                <div className="relative">
                    <PrecautionsView />
                </div>
            </main>
        </>
    );
}
