import Image from 'next/image';
import Link from 'next/link';
import { CLINIC, POLICY_LINKS } from '@/data/site';

/**
 * 가로 트랙 뒤에 미리 깔려 있다가, 트랙이 왼쪽으로 빠지면서 드러나는 푸터.
 *
 * 폭 구간이 3개다. 1455 이상 고정값은 globals.css 의 .footer-* 규칙이 담당한다.
 *  - wide(≥1455) : 시안 기준. 맵 412 / 정보 435 / 로고 순으로 한 줄, 정보부 330px 고정
 *  - lg(1024~1454) : 맵+정보 한 줄, 로고 줄은 아래로. 높이는 내용에 맡긴다
 *  - ~1023 : 전부 세로 스택
 *
 * 모바일에는 우하단 플로팅 버튼이 떠 있으므로 pb-24 로 그만큼 자리를 비워둔다.
 */
export default function Footer() {
    return (
        <footer className="flex flex-col bg-dark text-cream lg:h-dvh">
            <div className="relative h-[50vh] w-full shrink-0 lg:h-auto lg:min-h-0 lg:flex-1">
                <Image
                    src="/images/bg-main.jpg"
                    alt="하루영의원 1층 리셉션 라운지 전경"
                    fill
                    quality={95}
                    sizes="100vw"
                    className="object-cover"
                />
            </div>

            <div className="footer-info px-6 pb-24 pt-14 lg:px-14 lg:py-10">
                <div className="footer-row ml-auto flex w-full max-w-[1440px] flex-col gap-12 lg:gap-10">
                    <div className="footer-left flex flex-col gap-8 lg:flex-row lg:gap-5">
                        {/* #TODO: 개원 후 주소 확정되면 아래 iframe 으로 교체
                        <iframe
                            src={`https://www.google.com/maps?q=${encodeURIComponent(CLINIC.address)}&hl=ko&z=17&output=embed`}
                            title={`하루영의원 위치 지도 - ${CLINIC.address}`}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="footer-map h-[220px] w-full border-0 bg-[#d9d9d9] lg:h-[250px] lg:w-[320px] lg:shrink-0"
                        /> */}
                        <div
                            role="img"
                            aria-label="하루영의원 위치 지도 (개원 후 공개 예정)"
                            className="footer-map flex h-[220px] w-full items-center justify-center bg-[#d9d9d9] text-caption text-dark/50 lg:h-[250px] lg:w-[320px] lg:shrink-0"
                        >
                            오픈 준비 중
                        </div>

                        <ul className="footer-list flex w-full flex-col gap-2.5 lg:min-w-0 lg:flex-1">
                            <li className="flex items-center gap-7 border-b border-cream/90 pb-3.5 pl-3">
                                <h4 className="font-display text-caption">Location</h4>
                                <p className="text-caption font-semibold">{CLINIC.address}</p>
                            </li>

                            <li className="flex items-center gap-7 border-b border-cream/90 pb-3.5 pl-3">
                                <h4 className="shrink-0 text-caption font-bold">진료시간</h4>
                                <div className="flex flex-col">
                                    {CLINIC.hours.map((h) => (
                                        <p key={h.day} className="flex gap-2.5">
                                            {/* 화면에는 글자를 벌려 보여주고, 읽히는 문장은 sr-only 로 따로 준다 */}
                                            <span className="sr-only">
                                                {h.aria} {h.time}
                                            </span>
                                            <span
                                                aria-hidden="true"
                                                className="flex w-[43px] shrink-0 justify-between text-caption font-semibold"
                                            >
                                                {[...h.day.replace(/\s/g, '')].map((c) => (
                                                    <span key={c}>{c}</span>
                                                ))}
                                            </span>
                                            <span aria-hidden="true" className="text-caption font-medium">
                                                {h.time}
                                            </span>
                                        </p>
                                    ))}
                                </div>
                                <div>
                                    {CLINIC.hourNotes.map((n) => (
                                        <p key={n} className="flex items-center gap-1.5 text-caption font-semibold">
                                            <span
                                                aria-hidden="true"
                                                className="h-1 w-1 shrink-0 rounded-full bg-cream"
                                            />
                                            {n}
                                        </p>
                                    ))}
                                </div>
                            </li>

                            <li className="flex items-center gap-7 border-b border-cream/90 pb-3.5 pl-3">
                                <h4 className="shrink-0 text-caption font-bold">지하철</h4>
                                <p className="text-caption font-semibold">{CLINIC.subway}</p>
                            </li>

                            <li className="flex items-center gap-7 border-b border-cream/90 pb-3.5 pl-3">
                                <h4 className="shrink-0 text-caption font-bold">주차</h4>
                                <p className="text-caption font-semibold">{CLINIC.parking}</p>
                            </li>
                        </ul>
                    </div>

                    <div className="footer-right flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                        <Link href="/" aria-label="하루영의원 홈으로">
                            <Image src="/images/logo-suv-w.svg" alt="하루영의원" width={170} height={37} />
                        </Link>

                        <div className="lg:text-right">
                            <ul className="flex flex-wrap items-center text-caption font-bold lg:justify-end">
                                {POLICY_LINKS.map((l) => (
                                    <li
                                        key={l.href}
                                        className="before:mx-3 before:text-cream/50 before:content-['|'] first:before:hidden"
                                    >
                                        <Link
                                            href={l.href}
                                            className="transition-colors duration-500 ease-brand hover:text-beige"
                                        >
                                            {l.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>

                            <address className="mt-6 flex flex-wrap text-caption-sm font-medium not-italic lg:justify-end">
                                <span>대표자 : {CLINIC.ceo}</span>
                                <span aria-hidden="true" className="mx-3 text-cream/50">
                                    |
                                </span>
                                <span>{CLINIC.address}</span>
                                <span>사업자등록번호 : {CLINIC.bizNo}</span>
                                <span aria-hidden="true" className="mx-3 text-cream/50">
                                    |
                                </span>
                                <span>대표전화 : {CLINIC.tel}</span>
                            </address>

                            <p className="mt-3.75 text-[10px]">
                                COPYRIGHT © {new Date().getFullYear()} HARU YOUNG CLINIC ALL RIGHT RESERVED. Made By
                                BIOADDLAB
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
