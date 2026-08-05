import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="flex flex-col bg-dark text-cream lg:h-dvh">
            <div className="relative h-[60vh] w-full shrink-0 lg:h-[67%]">
                <Image
                    src="/images/bg-main.jpg"
                    alt="하루영의원 1층 리셉션 라운지 전경"
                    fill
                    quality={95}
                    sizes="100vw"
                    className="object-cover"
                />
            </div>
        </footer>
    );
}
