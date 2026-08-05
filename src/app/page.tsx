import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';

export default function Home() {
    return (
        <>
            <Header />
            <div className="site-main">
                <main className="relative bg-sand">
                    <Image src="/images/bg-sub-05.jpg" alt="" fill sizes="100vw" className="object-cover" />
                    <div className="relative"></div>
                </main>
                <Footer />
            </div>
        </>
    );
}
