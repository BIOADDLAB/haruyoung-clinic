import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import HorizontalScroll, { Panel } from '@/components/ui/HorizontalScroll';
import PhotoGallery, { type GalleryPhoto } from '@/components/ui/PhotoGallery';
import Reveal from '@/components/ui/Reveal';
import { RevealGroup, RevealItem } from '@/components/ui/RevealGroup';
import { drawLine, fadeUpSlow, slideLeft } from '@/lib/motion';
import { createPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'meta' });

    return createPageMetadata({
        locale,
        path: '/about',
        title: t('about'),
        description: t('aboutDesc'),
        clinic: t('clinic'),
        ogAlt: t('ogAlt'),
    });
}

/** #issue 원장 약력. 병원에서 영문·중문 표기를 받으면 messages 값만 고치면 된다 */
const CAREER_KEYS = ['career1', 'career2', 'society1', 'society2', 'society3'] as const;

const SPACE_PHOTOS: GalleryPhoto[] = [
    {
        src: '/images/img-tour-01.jpg',
        alt: 'room01',
        className: 'col-span-4 row-span-2 sm:col-span-3 sm:row-span-3 lg:col-span-20 lg:row-span-1',
    },
    {
        src: '/images/img-tour-02.jpg',
        alt: 'room02',
        className: 'col-span-2 row-span-2 sm:col-span-3 sm:row-span-3 lg:col-span-18 lg:row-span-1',
    },
    {
        src: '/images/img-tour-03.jpg',
        alt: 'room03',
        className: 'col-span-2 row-span-2 sm:col-span-2 sm:row-span-2 lg:col-span-10 lg:row-span-1',
    },
    {
        src: '/images/img-tour-04.jpg',
        alt: 'room04',
        className: 'col-span-2 row-span-3 sm:col-span-2 sm:row-span-2 lg:col-span-14 lg:row-span-2',
    },
    {
        src: '/images/img-tour-05.jpg',
        alt: 'room05',
        className: 'col-span-2 row-span-3 sm:col-span-2 sm:row-span-2 lg:col-span-13 lg:row-span-2',
    },
    {
        src: '/images/img-tour-06.jpg',
        alt: 'room06',
        className: 'col-span-4 row-span-2 sm:col-span-3 sm:row-span-2 lg:col-span-21 lg:row-span-1',
    },
    {
        src: '/images/img-tour-07.jpg',
        alt: 'room07',
        className: 'col-span-4 row-span-2 sm:col-span-3 sm:row-span-2 lg:col-span-21 lg:row-span-1',
    },
];

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'about' });
    const ta = await getTranslations({ locale, namespace: 'a11y' });

    return (
        <>
            <Header />

            {/* 철학 */}
            <main className="site-main bg-cream">
                <HorizontalScroll footer={<Footer />}>
                    <Panel id="philosophy" className="min-h-[calc(100dvh-64px)] overflow-hidden bg-sand">
                        <Image
                            src="/images/bg-sub-05.jpg"
                            alt=""
                            fill
                            priority
                            quality={95}
                            sizes="125vw"
                            className="object-cover"
                        />

                        <div className="relative mx-auto flex h-full w-full max-w-[738px] items-center px-6 pb-36 pt-20 lg:px-0 lg:py-0">
                            <div className="flex w-full flex-col items-center gap-10 lg:flex-row lg:items-start lg:gap-[33px]">
                                <div className="flex w-full flex-col items-center lg:h-[529px] lg:w-[360px] lg:shrink-0 lg:items-start lg:justify-between">
                                    <Reveal
                                        as="p"
                                        variants={fadeUpSlow}
                                        className="whitespace-pre-line text-center font-gara text-[34px] font-bold italic leading-[30px] text-dark lg:text-left lg:text-34 lg:leading-[38px]"
                                    >
                                        {t('heroEn')}
                                    </Reveal>

                                    {/* 모바일 전용 이미지 (겹침 유지) */}
                                    <Reveal
                                        variants={slideLeft}
                                        delay={0.1}
                                        className="relative mt-9 h-[280px] w-[230px] lg:hidden"
                                    >
                                        {/* 아래쪽 큰 이미지 */}
                                        <div className="absolute bottom-0 left-0 h-[190px] w-[155px] overflow-hidden rounded-bl-[50px]">
                                            <Image
                                                src="/images/img-sub-01.jpg"
                                                alt={ta('flower')}
                                                fill
                                                quality={90}
                                                sizes="155px"
                                                className="object-cover"
                                            />
                                        </div>

                                        {/* 위쪽 작은 이미지 */}
                                        <div className="absolute right-0 top-0 z-10 h-[140px] w-[115px] overflow-hidden rounded-t-full">
                                            <Image
                                                src="/images/img-sub-02.jpg"
                                                alt={ta('linen')}
                                                fill
                                                quality={90}
                                                sizes="115px"
                                                className="object-cover"
                                            />
                                        </div>
                                    </Reveal>

                                    {/* 한국어 제목 + 본문 */}
                                    <div className="mt-9 w-full max-w-[320px] text-center lg:mt-0 lg:max-w-none lg:text-left">
                                        <Reveal
                                            as="h1"
                                            variants={fadeUpSlow}
                                            className="text-[21px] font-bold leading-[29px] lg:text-24 lg:leading-[34px] whitespace-pre-line"
                                        >
                                            {t('heroTitle')}
                                        </Reveal>

                                        <Reveal
                                            as="p"
                                            delay={0.15}
                                            className="mt-5 text-[14px] whitespace-pre-line font-medium leading-[22px] text-dark lg:mt-[30px] lg:text-samll lg:leading-[24px]"
                                        >
                                            {t('heroBody')}
                                        </Reveal>
                                    </div>
                                </div>

                                {/*  웹 전용 이미지 (lg 이상)  */}
                                <Reveal
                                    variants={slideLeft}
                                    delay={0.1}
                                    className="relative hidden h-[398px] w-[315px] shrink-0 self-start lg:block"
                                >
                                    <div className="absolute bottom-0 left-0 h-[267px] w-[216px] overflow-hidden rounded-bl-[70px]">
                                        <Image
                                            src="/images/img-sub-01.jpg"
                                            alt={ta('flower')}
                                            fill
                                            quality={90}
                                            sizes="216px"
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="absolute right-0 top-0 z-10 h-[192px] w-[155px] overflow-hidden rounded-t-full">
                                        <Image
                                            src="/images/img-sub-02.jpg"
                                            alt={ta('linen')}
                                            fill
                                            quality={90}
                                            sizes="155px"
                                            className="object-cover"
                                        />
                                    </div>
                                </Reveal>
                            </div>
                        </div>
                    </Panel>

                    {/* 의료진 소개 */}
                    <Panel id="specialist" width={816} className="bg-paper">
                        <Image
                            src="/images/bg-sub-01.jpg"
                            alt=""
                            fill
                            quality={95}
                            sizes="(min-width:1024px) 816px, 1184px"
                            className="object-cover"
                        />

                        <div className="relative mx-auto flex h-full w-full max-w-[550px] items-center px-6 py-16 lg:px-0 lg:py-0">
                            <div className="flex w-full flex-col items-center gap-10 lg:flex-row lg:items-end lg:gap-12">
                                {/*  왼쪽 텍스트 영역  */}
                                <div className="flex w-full flex-col items-center lg:w-[263px] lg:shrink-0 lg:items-start">
                                    {/* 타이틀 */}
                                    <Reveal
                                        as="h1"
                                        variants={fadeUpSlow}
                                        className="text-center font-display text-[22px] leading-[30px] lg:text-left lg:text-24 lg:leading-[34px]"
                                    >
                                        HARU YOUNG
                                        <br />
                                        Specialist
                                    </Reveal>

                                    {/* 모바일 전용 프로필 이미지 (제목 바로 아래) */}
                                    <Reveal variants={slideLeft} delay={0.1} className="mt-9 lg:hidden">
                                        <div
                                            role="img"
                                            aria-label={ta('doctor')}
                                            className="h-[260px] w-[175px] rounded-full bg-[#d9d9d9]"
                                        />
                                    </Reveal>

                                    {/* 이름 + 서명 */}
                                    <Reveal
                                        delay={0.1}
                                        className="mt-9 flex items-end justify-center gap-2 lg:mt-[109px] lg:justify-start"
                                    >
                                        <p className="text-center lg:text-left">
                                            <span className="block font-display text-caption-sm tracking-[0.18em] text-dark/70">
                                                HARUYOUNG
                                            </span>
                                            <span className="mt-2.5 block text-[22px] font-bold lg:text-24">
                                                {t('ceoName')}{' '}
                                                <span className="text-16 font-normal">{t('ceoTitle')}</span>
                                            </span>
                                        </p>
                                        <span className="pb-1">
                                            <Image src="/images/i-sig.png" alt="" width={126} height={35} unoptimized />
                                        </span>
                                    </Reveal>

                                    {/* 구분선 */}
                                    <Reveal
                                        variants={drawLine}
                                        delay={0.2}
                                        className="mt-6 h-px w-[46px] origin-left bg-dark/40 lg:mt-[26px]"
                                    />

                                    {/* 경력 리스트 */}
                                    <RevealGroup as="ul" className="mt-7 text-center lg:mt-[33px] lg:text-left">
                                        {CAREER_KEYS.map((c) => {
                                            const lines = t(c).split('\n');

                                            return (
                                                <RevealItem
                                                    as="li"
                                                    key={c}
                                                    className="text-small leading-[32px] text-dark lg:leading-[35px]"
                                                >
                                                    {lines.length === 1 ? (
                                                        lines[0]
                                                    ) : (
                                                        <span className="inline-block text-left leading-[22px] lg:leading-[24px]">
                                                            {lines.map((line, index) => (
                                                                <span
                                                                    key={`${c}-${index}`}
                                                                    className={
                                                                        index === 0 ? 'block' : 'block pl-[1.15em]'
                                                                    }
                                                                >
                                                                    {line}
                                                                </span>
                                                            ))}
                                                        </span>
                                                    )}
                                                </RevealItem>
                                            );
                                        })}
                                    </RevealGroup>
                                </div>

                                {/*  웹 전용 프로필 이미지  */}
                                <Reveal
                                    variants={slideLeft}
                                    delay={0.15}
                                    className="hidden self-end lg:mb-[13px] lg:block"
                                >
                                    <div
                                        role="img"
                                        aria-label={ta('doctor')}
                                        className="h-[357px] w-[239px] rounded-full bg-[#d9d9d9]"
                                    />
                                </Reveal>
                            </div>
                        </div>
                    </Panel>

                    {/* 공간 소개 */}
                    <Panel id="space" width={1745} className="bg-taupe text-dark">
                        <Image
                            src="/images/bg-sub-06.jpg"
                            alt=""
                            fill
                            quality={95}
                            sizes="(min-width:1024px) 1745px, 1745px"
                            className="object-cover"
                        />

                        <div className="relative mx-auto flex h-full w-full max-w-[1479px] items-center px-6 py-20 lg:px-0 lg:py-0">
                            <div className="flex w-full flex-col gap-12 lg:flex-row lg:items-start lg:gap-26">
                                <div className="lg:w-[420px] lg:shrink-0">
                                    <Reveal as="h2" className="font-display text-22">
                                        Space
                                    </Reveal>
                                    <Reveal
                                        as="p"
                                        variants={fadeUpSlow}
                                        delay={0.1}
                                        className="mt-[66px] text-24 font-bold leading-[36px] whitespace-pre-line"
                                    >
                                        {t('spaceTitle')}
                                    </Reveal>
                                    <Reveal
                                        as="p"
                                        delay={0.2}
                                        className="mt-[46px] whitespace-normal text-small font-medium leading-[24px] text-dark lg:whitespace-pre-line"
                                    >
                                        {t('spaceBody')}
                                    </Reveal>
                                    <Reveal
                                        as="p"
                                        delay={0.3}
                                        className="mt-[30px] whitespace-normal text-small font-medium leading-[24px] text-dark lg:whitespace-pre-line"
                                    >
                                        {t('spaceBody2')}
                                    </Reveal>
                                </div>

                                <PhotoGallery
                                    photos={SPACE_PHOTOS.map((ph) => ({ ...ph, alt: ta(ph.alt) }))}
                                    className="grid auto-rows-[84px] grid-cols-4 gap-2 sm:auto-rows-[92px] sm:grid-cols-6 lg:w-[1004px] lg:shrink-0 lg:auto-rows-auto lg:grid-cols-[repeat(48,minmax(0,1fr))] lg:grid-rows-[208px_160px_124px] lg:gap-3"
                                />
                            </div>
                        </div>
                    </Panel>
                </HorizontalScroll>
            </main>
        </>
    );
}
