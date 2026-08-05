import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HorizontalScroll, { Panel } from '@/components/ui/HorizontalScroll';

export default function Home() {
    return (
        <>
            <Header />
            <main className="site-main bg-cream">
                <HorizontalScroll footer={<Footer />}>
                    <Panel className="bg-sand" />
                    <Panel width={1184} className="bg-paper" />
                </HorizontalScroll>
            </main>
        </>
    );
}
