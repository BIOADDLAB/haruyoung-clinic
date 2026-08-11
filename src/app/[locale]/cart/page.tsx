import type { Metadata } from 'next';
import CartView from './CartView';
import Header from '@/components/layout/Header';
import SidePanel from '@/components/layout/SidePanel';

export const metadata: Metadata = {
    title: '장바구니',
    description: '담아둔 시술을 확인하고 바로 예약하세요.',
    alternates: { canonical: '/cart' },
};

export default function CartPage() {
    return (
        <>
            <Header dark />
            <SidePanel title="장바구니" />

            <main className="site-sub min-h-dvh bg-cream">
                <div className="px-6 pb-28 pt-8 lg:pb-24 lg:pl-12 lg:pr-0 lg:pt-16">
                    <CartView />
                </div>
            </main>
        </>
    );
}
