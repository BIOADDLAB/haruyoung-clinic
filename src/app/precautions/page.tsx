import type { Metadata } from 'next';
import Image from 'next/image';
import PrecautionsView from './PrecautionsView';
import Header from '@/components/layout/Header';

export const metadata: Metadata = {
    title: '시술 후 주의사항',
    description: '하루영의원 시술 후 관리 방법과 주의사항을 안내합니다.',
    alternates: { canonical: '/precautions' },
};

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
