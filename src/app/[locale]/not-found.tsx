import { Link } from '@/i18n/navigation';
import Header from '@/components/layout/Header';

export default function NotFound() {
    return (
        <>
            <Header />

            <main className="site-main flex min-h-dvh items-center justify-center bg-cream px-6">
                <div className="pb-24 text-center">
                    <p className="font-gara text-48 italic text-brown">404</p>
                    <h1 className="mt-6 text-22 font-bold">페이지를 찾을 수 없습니다.</h1>
                    <p className="mt-4 text-caption leading-[1.9] text-dark/65">
                        주소가 바뀌었거나 삭제된 페이지입니다.
                        <br />
                        아래 버튼으로 이동해 주세요.
                    </p>

                    <div className="mt-10 flex flex-wrap justify-center gap-3">
                        <Link
                            href="/"
                            className="bg-dark px-7 py-3.5 text-caption font-semibold text-cream transition-colors duration-500 ease-brand hover:bg-brown"
                        >
                            홈으로
                        </Link>
                        <Link
                            href="/promotion"
                            className="border border-dark/25 px-7 py-3.5 text-caption font-semibold transition-colors duration-500 ease-brand hover:border-dark"
                        >
                            시술 둘러보기
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}
