import type { Metadata } from 'next';
import PromotionList from './PromotionList';
import Header from '@/components/layout/Header';
import SubNav from '@/components/layout/SubNav';

export const metadata: Metadata = {
    title: '프로모션',
    description: '하루영의원에서 진행 중인 프로모션과 이벤트 가격을 확인하세요.',
    alternates: { canonical: '/promotion' },
};

export default function PromotionPage() {
    return (
        <>
            <Header dark />
            <SubNav />

            <main className="site-sub min-h-dvh bg-cream">
                <h1 className="sr-only">하루영의원 프로모션</h1>
                <PromotionList />
            </main>
        </>
    );
}
