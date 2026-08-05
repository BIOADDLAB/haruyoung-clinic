import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HorizontalScroll, { Panel } from '@/components/ui/HorizontalScroll';
import HeroVisual, { HERO_HOLD } from './HeroVisual';

export default function Home() {
    return (
        <>
            <Header />
            <main className="site-main bg-cream">
                <HorizontalScroll footer={<Footer />} holdStart={HERO_HOLD}>
                    <Panel className="min-h-[calc(100dvh-64px)] overflow-hidden bg-dark">
                        <HeroVisual />
                    </Panel>
                </HorizontalScroll>
            </main>
        </>
    );
}
