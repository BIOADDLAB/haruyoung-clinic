import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Header from '@/components/layout/Header';

export default function NotFound() {
    const t = useTranslations('notFound');
    return (
        <>
            <Header />

            <main className="site-main flex min-h-dvh items-center justify-center bg-cream px-6">
                <div className="pb-24 text-center">
                    <p className="font-gara text-48 italic text-brown">404</p>
                    <h1 className="mt-6 text-22 font-bold">{t('title')}</h1>
                    <p className="mt-4 whitespace-pre-line text-caption leading-[1.9] text-dark/65">{t('body')}</p>

                    <div className="mt-10 flex flex-wrap justify-center gap-3">
                        <Link
                            href="/"
                            className="bg-dark px-7 py-3.5 text-caption font-semibold text-cream transition-colors duration-500 ease-brand hover:bg-brown"
                        >
                            {t('home')}
                        </Link>
                        <Link
                            href="/promotion"
                            className="border border-dark/25 px-7 py-3.5 text-caption font-semibold transition-colors duration-500 ease-brand hover:border-dark"
                        >
                            {t('browse')}
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}
