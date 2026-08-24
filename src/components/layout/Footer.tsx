'use client';

import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { CLINIC, MAP_LINKS, NOTICE_LINKS, POLICY_LINKS } from '@/data/site';
import NoticeImageModal from '@/components/ui/NoticeImageModal';

export default function Footer() {
    const t = useTranslations('policy');
    const tf = useTranslations('footer');
    const ta = useTranslations('a11y');
    const locale = useLocale();
    const [notice, setNotice] = useState<(typeof NOTICE_LINKS)[number] | null>(null);
    return (
        <footer className="flex flex-col bg-dark text-cream lg:h-dvh">
            <div className="relative h-[32vh] w-full shrink-0 sm:h-[40vh] lg:h-auto lg:min-h-0 lg:flex-1">
                <Image
                    src="/images/bg-main.jpg"
                    alt={ta('lounge')}
                    fill
                    quality={95}
                    sizes="100vw"
                    className="object-cover"
                />
            </div>

            <div className="footer-info px-6 pb-24 pt-14 lg:px-14 lg:py-10">
                <div className="footer-row mx-auto flex w-full max-w-[1440px] flex-col gap-12 lg:gap-10">
                    <div className="footer-left flex flex-col gap-8 lg:flex-row lg:gap-5">
                        <FooterMap />

                        <ul className="footer-list flex w-full flex-col gap-2.5 lg:min-w-0 lg:flex-1">
                            <li className="flex items-center gap-7 border-b border-cream/40 pb-3.5 pl-3">
                                <h4 className="shrink-0 text-caption w-[55px]  tracking-wide">{tf('labelLocation')}</h4>
                                <p className="text-caption tracking-wide">{tf('address')}</p>
                            </li>
                            <li className="flex items-center gap-7 border-b border-cream/40 pb-3.5 pl-3">
                                <h4 className="shrink-0 text-caption w-[55px]  tracking-wide">{tf('labelHours')}</h4>
                                <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:gap-7">
                                    <div className="flex flex-col">
                                        {CLINIC.hours.map((h) => (
                                            <p key={h.key} className="flex gap-2.5">
                                                {/* 화면에는 글자를 벌려 보여주고, 읽히는 문장은 sr-only 로 따로 준다 */}
                                                <span className="sr-only">
                                                    {tf(`${h.key}Aria`)} {h.time}
                                                </span>
                                                <span
                                                    aria-hidden="true"
                                                    className={`shrink-0 whitespace-nowrap text-caption tracking-wide ${
                                                        locale === 'ko'
                                                            ? 'flex w-[43px] justify-between'
                                                            : 'min-w-[88px]'
                                                    }`}
                                                >
                                                    {locale === 'ko'
                                                        ? [...tf(h.key).replace(/\s/g, '')].map((c, ci) => (
                                                              <span key={`${h.key}-${ci}`}>{c}</span>
                                                          ))
                                                        : tf(h.key)}
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
                                                {tf(n)}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </li>

                            <li className="flex items-center gap-7 border-b border-cream/40 pb-3.5 pl-3">
                                <h4 className="shrink-0 text-caption w-[55px]  tracking-wide">{tf('labelSubway')}</h4>
                                <p className="text-caption tracking-wide">{tf('subway')}</p>
                            </li>

                            <li className="flex items-center gap-7 border-b border-cream/40 pb-3.5 pl-3">
                                <h4 className="shrink-0 text-caption w-[55px]  tracking-wide">{tf('labelParking')}</h4>
                                <div className="min-w-0">
                                    <p className="text-caption tracking-wide">{tf('parking')}</p>
                                    <p className="text-caption-sm tracking-wide text-cream/80">{tf('parkingNote')}</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="footer-right flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                        <Link href="/" aria-label={ta('logo')}>
                            <Image src="/images/logo-suv-w.svg" alt={ta('logo')} width={170} height={37} />
                        </Link>

                        <div className="lg:text-right">
                            <ul className="flex flex-wrap items-center text-caption font-bold lg:justify-end">
                                {NOTICE_LINKS.map((l) => (
                                    <li
                                        key={l.key}
                                        className="before:mx-3 before:text-cream/50 before:content-['|'] first:before:hidden"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setNotice(l)}
                                            className="transition-colors duration-500 ease-brand hover:text-beige"
                                        >
                                            {t(l.key)}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <ul className="mt-2.5 flex flex-wrap items-center text-caption font-bold lg:justify-end">
                                {POLICY_LINKS.map((l) => (
                                    <li
                                        key={l.href}
                                        className="before:mx-3 before:text-cream/50 before:content-['|'] first:before:hidden"
                                    >
                                        <Link
                                            href={l.href}
                                            className="transition-colors duration-500 ease-brand hover:text-beige"
                                        >
                                            {t(l.key)}
                                        </Link>
                                    </li>
                                ))}
                            </ul>

                            <address className="mt-6 flex flex-wrap text-caption-sm font-medium not-italic lg:justify-end">
                                <span>
                                    {tf('ceo')} : {tf('ceoName')}
                                </span>
                                <span aria-hidden="true" className="mx-3 text-cream/50">
                                    |
                                </span>
                                <span>{tf('address')}</span>
                                <span aria-hidden="true" className="mx-3 text-cream/50">
                                    |
                                </span>
                                <span>
                                    {tf('bizNo')} : {CLINIC.bizNo}
                                </span>
                                <span aria-hidden="true" className="mx-3 text-cream/50">
                                    |
                                </span>
                                <span>
                                    {tf('tel')} : {CLINIC.tel}
                                </span>
                            </address>

                            <p className="mt-3.75 text-[10px]">
                                COPYRIGHT © {new Date().getFullYear()} HARUYOUNG CLINIC ALL RIGHT RESERVED. Made By
                                BIOADDLAB
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <NoticeImageModal
                open={notice !== null}
                src={notice?.src ?? ''}
                alt={notice ? t(notice.key) : ''}
                onClose={() => setNotice(null)}
            />
        </footer>
    );
}

const MAP_LINK_CLASS =
    'inline-flex flex-1 items-center justify-center rounded-full px-3 py-2 text-center text-caption-sm font-semibold tracking-wide transition-opacity duration-500 ease-brand hover:opacity-80';

/**
 * Google Maps iframe 은 카카오톡 안드로이드 웹뷰에서 BLOCKED 된다.
 * 같은 사이트 iframe 대신 카카오·네이버를 바깥으로 연다. 아이폰은 구글 iframe 이 되는 경우가 많다.
 */
function FooterMap() {
    const t = useTranslations('footer');
    const ta = useTranslations('a11y');

    return (
        <div
            role="group"
            aria-label={ta('mapAlt')}
            className="footer-map flex aspect-[5/3] w-full max-w-[520px] flex-col justify-between self-start bg-[#ddd4c8] p-4 text-dark lg:w-[320px] lg:max-w-none lg:shrink-0"
        >
            <div>
                <p className="flex items-center gap-2 text-small font-semibold">
                    <MapPin />
                    {CLINIC.name}
                </p>
                <p className="mt-2 pl-7 text-caption leading-snug text-dark/70">{t('address')}</p>
            </div>

            <div className="flex gap-2">
                <a
                    href={MAP_LINKS.kakao}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${MAP_LINK_CLASS} bg-dark text-cream`}
                >
                    {t('mapKakao')}
                </a>
                <a
                    href={MAP_LINKS.naver}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${MAP_LINK_CLASS} border border-dark/20 bg-cream/70 text-dark`}
                >
                    {t('mapNaver')}
                </a>
            </div>
        </div>
    );
}

function MapPin() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0 text-dark">
            <path
                fill="currentColor"
                d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"
            />
        </svg>
    );
}
