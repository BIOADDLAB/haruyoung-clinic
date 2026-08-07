import type { Metadata } from 'next';
import CartView from './CartView';
import Header from '@/components/layout/Header';

export const metadata: Metadata = {
    title: '장바구니',
    description: '담아둔 시술을 확인하고 바로 예약하세요.',
    alternates: { canonical: '/cart' },
};

export default function CartPage() {
    return (
        <>
            <Header dark />

            <main className="site-main min-h-dvh bg-cream">
                <div className="mx-auto flex max-w-[1200px] flex-col gap-12 px-6 pb-28 pt-10 lg:flex-row lg:gap-24 lg:px-12 lg:pb-24 lg:pt-16">
                    <h1 className="shrink-0 text-24 font-bold lg:w-[240px]">장바구니</h1>
                    <CartView />
                </div>
            </main>
        </>
    );
}
