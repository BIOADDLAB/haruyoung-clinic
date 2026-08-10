import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import SidePanel from '@/components/layout/SidePanel';

export const metadata: Metadata = {
    title: '개인정보처리방침',
    description: '하루영의원 개인정보 수집 및 이용에 대한 안내입니다.',
    alternates: { canonical: '/privacy' },
};

/** TODO: 원장 확인 후 실제 방침으로 교체 */
const SECTIONS = [
    {
        title: '1. 수집하는 개인정보 항목',
        body: '내용입니다.',
    },
    {
        title: '2. 개인정보의 수집 및 이용 목적',
        body: '내용입니다.',
    },
    {
        title: '3. 개인정보의 보유 및 이용 기간',
        body: '내용입니다.',
    },
    {
        title: '4. 동의를 거부할 권리',
        body: '내용입니다.',
    },
];

export default function PrivacyPage() {
    return (
        <>
            <Header dark />
            <SidePanel title="개인정보처리방침" />

            <main className="site-sub min-h-dvh bg-cream">
                <div className="w-full max-w-[800px] px-6 pb-28 pt-8 lg:pb-24 lg:pl-12 lg:pr-0 lg:pt-16">
                    {SECTIONS.map((s) => (
                        <section key={s.title} className="border-b border-dark/12 py-8 first:pt-0">
                            <h2 className="text-small font-bold">{s.title}</h2>
                            <p className="mt-3 text-caption leading-[1.9] text-dark/75">{s.body}</p>
                        </section>
                    ))}
                    <p className="pt-8 text-caption-sm text-dark/50">시행일 2026년 8월 10일</p>
                </div>
            </main>
        </>
    );
}
