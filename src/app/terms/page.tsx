import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import SidePanel from '@/components/layout/SidePanel';
import { TERMS_EFFECTIVE, TERMS_SECTIONS } from '@/data/terms';

export const metadata: Metadata = {
    title: '이용약관',
    description: '하루영의원 온라인 예약 및 회원 서비스 이용약관입니다.',
    alternates: { canonical: '/terms' },
};

export default function TermsPage() {
    return (
        <>
            <Header dark />
            <SidePanel title="이용약관" />

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
