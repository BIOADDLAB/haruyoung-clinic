import Header from '@/components/layout/Header';
import SubNav from '@/components/layout/SubNav';

export default function Page() {
    return (
        <>
            <Header dark />
            <SubNav />
            <main className="site-sub min-h-dvh bg-cream" />
        </>
    );
}
