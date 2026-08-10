import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import SidePanel from '@/components/layout/SidePanel';
import { PRIVACY_EFFECTIVE, PRIVACY_SECTIONS } from '@/data/privacy';

export const metadata: Metadata = {
    title: '개인정보처리방침',
    description: '하루영의원 개인정보 수집 및 이용에 대한 안내입니다.',
    alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
    return (
        <>
            <Header dark />
            <SidePanel title="개인정보처리방침" />

            <main className="site-sub min-h-dvh bg-cream">
                <div className="w-full max-w-[800px] px-6 pb-28 pt-8 lg:pb-24 lg:pl-12 lg:pr-0 lg:pt-16">
                    {PRIVACY_SECTIONS.map((s) => (
                        <section key={s.title} className="border-b border-dark/12 py-8 first:pt-0">
                            <h2 className="text-small font-bold">{s.title}</h2>
                            <p className="mt-3 text-caption leading-[1.9] text-dark/75">{s.body}</p>
                        </section>
                    ))}
                    <p className="pt-8 text-caption-sm text-dark/50">시행일 {PRIVACY_EFFECTIVE}</p>
                </div>
            </main>
        </>
    );
}
