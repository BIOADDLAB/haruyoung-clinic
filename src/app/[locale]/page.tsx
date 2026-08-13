import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { cookies } from 'next/headers';
import MoreView from '@/components/ui/MoreView';
import CategoryGrid from '@/components/home/CategoryGrid';
import HeroVisual, { HERO_HOLD } from '@/components/home/HeroVisual';
import PromotionBoard from '@/components/home/PromotionBoard';
import TreatmentCard from '@/components/home/TreatmentCard';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import HorizontalScroll, { Panel } from '@/components/ui/HorizontalScroll';
import { Icon } from '@/components/ui/Icons';
import PhotoGallery, { type GalleryPhoto } from '@/components/ui/PhotoGallery';
import Reveal from '@/components/ui/Reveal';
import { RevealGroup } from '@/components/ui/RevealGroup';
import { fadeUpSlow, slideLeft, slideRight } from '@/lib/motion';
import { INTRO_COOKIE_NAME } from '@/lib/intro';
import IntroLoader from '@/components/home/IntroLoader';

const TREATMENTS = [
    {
        en: 'Zero Lifting',
        slug: 'lifting',
        n: '01',
    },
    {
        en: 'Zero Pigment',
        slug: 'pigment',
        n: '02',
    },
    {
        en: 'Zero Acne',
        slug: 'acne',
        n: '03',
    },
    {
        en: 'Zero Petit',
        slug: 'petit',
        n: '04',
    },
    {
        en: 'Zero Care',
        slug: 'care',
        n: '05',
    },
    {
        en: 'Zero Smooth',
        slug: 'hair',
        n: '06',
    },
    {
        en: 'Zero Body',
        slug: 'body',
        n: '07',
    },
    {
        en: 'Zero Skinbooster',
        slug: 'booster',
        n: '08',
    },
];

const SPACE_PHOTOS: GalleryPhoto[] = [
    {
        src: '/images/img-tour-01.jpg',
        alt: 'tour01',
        className: 'col-span-4 row-span-2 sm:col-span-3 sm:row-span-3 lg:col-span-20 lg:row-span-1',
    },
    {
        src: '/images/img-tour-02.jpg',
        alt: 'tour02',
        className: 'col-span-2 row-span-2 sm:col-span-3 sm:row-span-3 lg:col-span-18 lg:row-span-1',
    },
    {
        src: '/images/img-tour-03.jpg',
        alt: 'tour03',
        className: 'col-span-2 row-span-2 sm:col-span-2 sm:row-span-2 lg:col-span-10 lg:row-span-1',
    },
    {
        src: '/images/img-tour-04.jpg',
        alt: 'tour04',
        className: 'col-span-2 row-span-3 sm:col-span-2 sm:row-span-2 lg:col-span-14 lg:row-span-2',
    },
    {
        src: '/images/img-tour-05.jpg',
        alt: 'tour05',
        className: 'col-span-2 row-span-3 sm:col-span-2 sm:row-span-2 lg:col-span-13 lg:row-span-2',
    },
    {
        src: '/images/img-tour-06.jpg',
        alt: 'tour06',
        className: 'col-span-4 row-span-2 sm:col-span-3 sm:row-span-2 lg:col-span-21 lg:row-span-1',
    },
    {
        src: '/images/img-tour-07.jpg',
        alt: 'tour07',
        className: 'col-span-4 row-span-2 sm:col-span-3 sm:row-span-2 lg:col-span-21 lg:row-span-1',
    },
];

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const [t, ta, tc, cookieStore] = await Promise.all([
        getTranslations({ locale, namespace: 'home' }),
        getTranslations({ locale, namespace: 'a11y' }),
        getTranslations({ locale, namespace: 'treatCard' }),
        cookies(),
    ]);
    const showIntro = cookieStore.get(INTRO_COOKIE_NAME)?.value !== '1';

    return (
        <>
            <IntroLoader initialOpen={showIntro} />

            <Header />

            <main className="site-main bg-cream">
                {/* 히어로부터 마지막 섹션까지 한 줄로 이어진 가로 스크롤 */}
                <HorizontalScroll footer={<Footer />} holdStart={HERO_HOLD}>
                    {/* 히어로 */}
                    <Panel className="min-h-[calc(100dvh-64px)] overflow-hidden bg-dark">
                        <HeroVisual />
                    </Panel>

                    {/* 인트로 */}
                    <Panel width={1184} className="bg-paper">
                        <Image
                            src="/images/bg-sub-01.jpg"
                            alt=""
                            fill
                            quality={95}
                            sizes="(min-width:1024px) 1184px, 1184px"
                            className="object-cover"
                        />

                        <div className="relative mx-auto flex h-full w-full max-w-[610px] flex-col items-center justify-center gap-12 px-6 py-20 lg:flex-row lg:items-center lg:justify-between lg:gap-20 lg:px-0 lg:py-0">
                            <div className="w-full lg:max-w-[420px]">
                                <Reveal as="p" className="font-display text-32 tracking-[0.12em]">
                                    <Image src={'/images/logo-sub-02.svg'} alt="" width={200} height={25} />
                                </Reveal>
                                <Reveal
                                    as="h2"
                                    variants={fadeUpSlow}
                                    delay={0.1}
                                    className="mt-12 whitespace-pre-line text-h3 font-semibold leading-relaxed"
                                >
                                    {t('heroTitle')}
                                </Reveal>
                                <Reveal
                                    as="p"
                                    delay={0.2}
                                    className="mt-5 whitespace-normal text-caption leading-[2] text-dark lg:!whitespace-pre-line"
                                >
                                    {t('heroBody')}
                                </Reveal>
                                <Reveal delay={0.3} className="mt-15">
                                    <MoreView href="/about" dark ariaLabel={t('moreView')} />
                                </Reveal>
                            </div>

                            <Reveal variants={slideLeft} delay={0.2} className="hidden shrink-0 mt-0 lg:mt-4 lg:block">
                                <div className="mb-2 flex justify-end">
                                    <Icon name="i-sig" width={168} height={44} />
                                </div>
                                <div className="relative h-[290px] w-[220px] rounded-tl-[80px] overflow-hidden lg:h-[294px] lg:w-[235px]">
                                    <Image
                                        src="/images/img-s1-01.jpg"
                                        alt={ta('silk')}
                                        fill
                                        quality={90}
                                        sizes="(min-width:1024px) 240px, 220px"
                                        className="object-cover"
                                    />
                                </div>
                            </Reveal>
                        </div>
                    </Panel>

                    {/* 시술카드 */}
                    <Panel width={1498} className="bg-dark text-cream">
                        <Image
                            src="/images/bg-sub-02.jpg"
                            alt=""
                            fill
                            quality={95}
                            sizes="(min-width:1024px) 1080px, 1080px"
                            className="object-cover"
                        />
                        {/* 원본이 세로 730px 뿐이라 모바일에서 확대된다. 오버레이로 노이즈를 눌러준다 */}
                        <span aria-hidden="true" className="absolute inset-0 bg-dark/45 lg:hidden" />

                        <div className="relative mx-auto flex h-full w-full max-w-[1230px] flex-col justify-center px-6 py-20 lg:px-0 lg:py-0">
                            <Reveal className="flex flex-col items-center justify-center lg:hidden">
                                <h2 className="font-display text-h2">Treatments</h2>
                                <p className="mt-6 whitespace-pre-line text-center text-small font-medium leading-[1.7] text-cream/90">
                                    {t('treatLead')}
                                </p>
                            </Reveal>

                            <Reveal className="hidden lg:flex lg:items-start lg:gap-10">
                                <h2 className="font-display text-24">Treatments</h2>
                                <div className="mt-1.5 flex gap-2">
                                    <span>:</span>
                                    <p className="whitespace-pre-line text-caption font-medium leading-[1.9] text-cream/90">
                                        {t('treatLead')}
                                    </p>
                                </div>
                            </Reveal>

                            {/* 카드 288x198 고정. flex-wrap 이라 gap 이 항상 26px 이고 들어가는 만큼 접힌다 */}
                            <RevealGroup
                                as="ul"
                                className="mt-10 flex flex-wrap justify-center gap-x-[26px] gap-y-7 lg:mt-12"
                            >
                                {TREATMENTS.map((item) => (
                                    <TreatmentCard
                                        key={item.en}
                                        en={item.en}
                                        n={item.n}
                                        slug={item.slug}
                                        desc={tc(item.slug)}
                                        alt={ta(`card_${item.slug}`)}
                                    />
                                ))}
                            </RevealGroup>
                        </div>
                    </Panel>

                    {/* 둘러보기 */}
                    <Panel width={1080} className="bg-cream">
                        <Image
                            src="/images/bg-sub-03.jpg"
                            alt=""
                            fill
                            quality={95}
                            sizes="(min-width:1024px) 1080px, 1080px"
                            className="object-cover"
                        />
                        {/* 원본이 세로 730px 뿐이라 모바일에서 확대된다. 밝은 층으로 노이즈를 눌러준다 */}
                        <span aria-hidden="true" className="absolute inset-0 bg-cream/55 lg:hidden" />

                        <div className="relative flex h-full flex-col justify-center px-6 py-20 lg:px-0 lg:py-0">
                            <div className="mx-auto w-full lg:max-w-[843px]">
                                <Reveal className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-10">
                                    <h2 className="shrink-0 font-display text-h3">HARU YOUNG Space</h2>
                                    <div className="flex gap-2 mt-1.5">
                                        <span>:</span>
                                        <p className="whitespace-normal text-caption leading-[1.9] font-medium lg:whitespace-pre-line">
                                            {t('spaceLead')}
                                        </p>
                                    </div>
                                </Reveal>

                                <PhotoGallery
                                    photos={SPACE_PHOTOS.map((ph) => ({ ...ph, alt: ta(ph.alt) }))}
                                    className="mt-10 grid auto-rows-[84px] grid-cols-4 gap-2 sm:auto-rows-[92px] sm:grid-cols-6 lg:mt-12 lg:auto-rows-auto lg:grid-cols-[repeat(48,minmax(0,1fr))] lg:grid-rows-[176px_136px_106px] lg:gap-[9px]"
                                />
                            </div>
                        </div>
                    </Panel>

                    {/* 프로모션 + 카테고리 */}
                    <Panel width={1088}>
                        <div className="flex h-full flex-col">
                            {/* 프로모션 */}
                            <div className="relative bg-dark px-6 py-16 text-cream lg:h-[45%] lg:px-0 lg:py-0">
                                <Image
                                    src="/images/bg-sub-04.jpg"
                                    alt=""
                                    fill
                                    quality={95}
                                    sizes="(min-width:1024px) 1088px, 1050px"
                                    className="object-cover"
                                />
                                <PromotionBoard />
                            </div>

                            {/* 카테고리 */}
                            <div className="bg-cream px-6 py-16 lg:h-[55%] lg:px-0 lg:py-0">
                                <div className="flex h-full items-center">
                                    <div className="mx-auto flex w-full flex-col gap-10 lg:max-w-[828px] lg:flex-row lg:items-start lg:gap-[11px]">
                                        <Reveal variants={slideRight} className="shrink-0 lg:w-[200px]">
                                            <h2 className="font-display text-24">Category</h2>
                                            <p className="mt-3.5 whitespace-normal text-caption font-medium leading-[1.7] text-dark lg:whitespace-pre-line">
                                                {t('categoryLead')}
                                            </p>
                                        </Reveal>

                                        <CategoryGrid items={TREATMENTS} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Panel>
                </HorizontalScroll>
            </main>
        </>
    );
}
