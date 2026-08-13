import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import CartView from '@/components/cart/CartView';
import Header from '@/components/layout/Header';
import SidePanel from '@/components/layout/SidePanel';
import { createPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'meta' });

    return createPageMetadata({
        locale,
        path: '/cart',
        title: t('cart'),
        description: t('cartDesc'),
        clinic: t('clinic'),
        ogAlt: t('ogAlt'),
        index: false,
    });
}

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'meta' });

    return (
        <>
            <Header dark />
            <SidePanel title={t('cart')} />

            <main className="site-sub min-h-dvh bg-cream">
                <div className="px-6 pb-28 pt-8 lg:pb-24 lg:pl-12 lg:pr-0 lg:pt-16">
                    <CartView />
                </div>
            </main>
        </>
    );
}
