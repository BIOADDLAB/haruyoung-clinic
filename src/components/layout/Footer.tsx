import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { CLINIC, POLICY_LINKS } from '@/data/site';

export default function Footer() {
    return (
        <footer className="flex flex-col bg-dark text-cream lg:h-dvh">
            <div className="relative h-[32vh] w-full shrink-0 sm:h-[40vh] lg:h-auto lg:min-h-0 lg:flex-1">
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
                <div className="footer-row mx-auto flex w-full max-w-[1440px] flex-col gap-12 lg:gap-10">
                    <div className="footer-left flex flex-col gap-8 lg:flex-row lg:gap-5">
                        {/* #TODO: 개원 후 주소 확정되면 아래 iframe 으로 교체
                        <iframe
                            src={`https://www.google.com/maps?q=${encodeURIComponent(CLINIC.address)}&hl=ko&z=17&output=embed`}
                            title={`하루영의원 위치 지도 - ${CLINIC.address}`}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="footer-map aspect-[5/3] w-full max-w-[520px] self-start border-0 bg-[#d9d9d9] lg:w-[320px] lg:max-w-none lg:shrink-0"
                        /> */}
                        <div
                            role="img"
                            aria-label="하루영의원 위치 지도 (개원 후 공개 예정)"
                            className="footer-map flex aspect-[5/3] w-full max-w-[520px] shrink-0 items-center justify-center self-start bg-[#d9d9d9] text-caption text-dark/50 lg:w-[320px] lg:max-w-none"
                        >
                            오픈 준비 중
                        </div>

                        <ul className="footer-list flex w-full flex-col gap-2.5 lg:min-w-0 lg:flex-1">
                            <li className="flex items-center gap-7 border-b border-cream/40 pb-3.5 pl-3">
                                <h4 className="font-display text-caption w-[55px] tracking-wide">Location</h4>
                                <p className="text-caption tracking-wide">{CLINIC.address}</p>
                            </li>
                            <li className="flex items-center gap-5 border-b border-cream/40 pb-3.5 pl-3">
                                <h4 className="shrink-0 text-caption w-[55px]  tracking-wide">진료시간</h4>
                                <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:gap-7">
                                    <div className="flex flex-col">
                                        {CLINIC.hours.map((h) => (
                                            <p key={h.day} className="flex gap-2.5">
                                                {/* 화면에는 글자를 벌려 보여주고, 읽히는 문장은 sr-only 로 따로 준다 */}
                                                <span className="sr-only">
                                                    {h.aria} {h.time}
                                                </span>
                                                <span
                                                    aria-hidden="true"
                                                    className="flex w-[43px] shrink-0 justify-between text-caption  tracking-wide"
                                                >
                                                    {[...h.day.replace(/\s/g, '')].map((c) => (
                                                        <span key={c}>{c}</span>
                                                    ))}
                                                </span>
                                                <span
                                                    aria-hidden="true"
                                                    className="whitespace-nowrap text-caption  tracking-wide"
                                                >
                                                    {h.time}
                                                </span>
                                            </p>
                                        ))}
                                    </div>
                                    <div className="shrink-0">
                                        {CLINIC.hourNotes.map((n) => (
                                            <p
                                                key={n}
                                                className="flex items-center gap-1.5 whitespace-nowrap text-caption  tracking-wide"
                                            >
                                                <span
                                                    aria-hidden="true"
                                                    className="h-1 w-1 shrink-0 rounded-full bg-cream"
                                                />
                                                {n}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </li>

                            <li className="flex items-center gap-7 border-b border-cream/40 pb-3.5 pl-3">
                                <h4 className="shrink-0 text-caption   w-[55px]">지하철</h4>
                                <p className="text-caption tracking-wide">{CLINIC.subway}</p>
                            </li>

                            <li className="flex items-center gap-7 border-b border-cream/40 pb-3.5 pl-3">
                                <h4 className="shrink-0 text-caption  w-[55px]">주차</h4>
                                <p className="text-caption tracking-wide">{CLINIC.parking}</p>
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
