import Image from 'next/image';
import Link from 'next/link';
import { CLINIC, POLICY_LINKS } from '@/data/site';

/**
 * 가로 트랙 뒤에 미리 깔려 있다가, 트랙이 왼쪽으로 빠지면서 드러나는 푸터.
 * 배치는 HorizontalScroll 의 footer prop 이 담당한다.
 * 가로 모드에서 뷰포트를 꽉 채우므로 상단 비주얼 52% / 정보 flex-1 로 나눈다.
 */
export default function Footer() {
    return (
        <footer className="flex flex-col bg-dark text-cream lg:h-dvh">
            <div className="relative h-[40vh] w-full shrink-0 lg:h-[52%]">
                <Image
                    src="/images/bg-main.jpg"
                    alt="하루영의원 1층 리셉션 라운지 전경"
                    fill
                    quality={95}
                    sizes="100vw"
                    className="object-cover"
                />
            </div>

            <div className="px-6 py-14 lg:flex-1 lg:overflow-hidden lg:px-14 lg:py-10">
                <div className="grid gap-12 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)_minmax(0,300px)] lg:gap-14">
                    {/* TODO: 구글맵 embed 로 교체 */}
                    <div
                        role="img"
                        aria-label={`하루영의원 위치 지도 (${CLINIC.address})`}
                        className="flex aspect-[41/23] w-full items-center justify-center bg-[#d9d9d9] text-caption text-dark/50"
                    >
                        구글맵
                    </div>

                    <dl className="text-caption">
                        <Row label="Location" display>
                            {CLINIC.address}
                        </Row>
                        <Row label="진료시간">
                            <div className="flex flex-col gap-6 sm:flex-row sm:gap-10">
                                <ul className="space-y-1.5">
                                    {CLINIC.hours.map((h) => (
                                        <li key={h.day} className="flex gap-4">
                                            <span className="w-24 shrink-0 text-cream/70">{h.day}</span>
                                            <span>{h.time}</span>
                                        </li>
                                    ))}
                                </ul>
                                <ul className="space-y-1.5 text-cream/70">
                                    {CLINIC.hourNotes.map((n) => (
                                        <li key={n} className="before:mr-2 before:content-['•']">
                                            {n}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Row>
                        <Row label="지하철">{CLINIC.subway}</Row>
                        <Row label="주차" last>
                            {CLINIC.parking}
                        </Row>
                    </dl>

                    <div className="lg:text-right">
                        <div className="flex lg:justify-end">
                            <Image
                                src="/images/logo-sub.svg"
                                alt="하루영의원"
                                width={150}
                                height={33}
                                className="brightness-0 invert"
                            />
                        </div>

                        <ul className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-caption lg:justify-end">
                            {POLICY_LINKS.map((l) => (
                                <li key={l.href}>
                                    <Link href={l.href} className="transition-colors hover:text-beige">
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <address className="mt-8 space-y-1.5 text-caption-sm not-italic text-cream/70">
                            <p>
                                대표자 : {CLINIC.ceo} <span className="mx-2 text-cream/30">|</span> {CLINIC.address}
                            </p>
                            <p>
                                사업자등록번호 : {CLINIC.bizNo} <span className="mx-2 text-cream/30">|</span> 대표전화 :{' '}
                                {CLINIC.tel}
                            </p>
                        </address>

                        <p className="mt-6 text-caption-sm text-cream/50">
                            COPYRIGHT © {new Date().getFullYear()} HARU YOUNG CLINIC ALL RIGHT RESERVED. Made By
                            BIOADDLAB
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function Row({
    label,
    children,
    display,
    last,
}: {
    label: string;
    children: React.ReactNode;
    display?: boolean;
    last?: boolean;
}) {
    return (
        <div
            className={`flex flex-col gap-2 border-t border-cream/15 py-5 sm:flex-row sm:gap-8 ${last ? 'border-b' : ''}`}
        >
            <dt className={`w-24 shrink-0 text-cream/70 ${display ? 'font-display tracking-[0.06em]' : ''}`}>
                {label}
            </dt>
            <dd>{children}</dd>
        </div>
    );
}
