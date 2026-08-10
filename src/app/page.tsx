import Image from 'next/image';
import MoreView from '@/components/ui/MoreView';
import CategoryGrid from './CategoryGrid';
import HeroVisual, { HERO_HOLD } from './HeroVisual';
import PromotionBoard from './PromotionBoard';
import TreatmentCard from './TreatmentCard';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import HorizontalScroll, { Panel } from '@/components/ui/HorizontalScroll';
import { Icon } from '@/components/ui/Icons';
import PhotoGallery, { type GalleryPhoto } from '@/components/ui/PhotoGallery';
import Reveal from '@/components/ui/Reveal';
import { RevealGroup } from '@/components/ui/RevealGroup';
import { fadeUpSlow, slideLeft, slideRight } from '@/lib/motion';
import IntroLoader from './IntroLoader';

const TREATMENTS = [
    {
        en: 'Zero Lifting',
        ko: '리프팅',
        slug: 'lifting',
        n: '01',
        desc: '처지지 않는 탄력,\n노화 시계를\n되돌리는 리프팅',
        alt: '하루영의원 리프팅 시술을 상징하는 크림 텍스처',
    },
    {
        en: 'Zero Pigment',
        ko: '색소치료',
        slug: 'pigment',
        n: '02',
        desc: '색소가 만든 나이,\n맑고 투명한\n본연의 피부로',
        alt: '하루영의원 색소치료 후 맑아진 목과 어깨 피부',
    },
    {
        en: 'Zero Acne',
        ko: '여드름치료',
        slug: 'acne',
        n: '03',
        desc: '트러블의 뿌리\n노화 신호, 근본부터\n진정시키는 케어',
        alt: '하루영의원 여드름치료를 상징하는 얇은 실크 커튼',
    },
    {
        en: 'Zero Petit',
        ko: '쁘띠라인',
        slug: 'petit',
        n: '04',
        desc: '자연스러운 볼륨,\n균형 잡힌 아름다움을\n완성하는 쁘띠 시술',
        alt: '하루영의원 쁘띠라인 시술을 상징하는 반투명 패브릭',
    },
    {
        en: 'Zero Care',
        ko: '피부관리',
        slug: 'care',
        n: '05',
        desc: '피부 본연의\n컨디션을 채우는\n맞춤 관리와 수액케어',
        alt: '하루영의원 피부관리·수액 케어를 상징하는 물결',
    },
    {
        en: 'Zero Smooth',
        ko: '제모',
        slug: 'hair',
        n: '06',
        desc: '매일의 번거로움 없이\n매끈한 피부를 만드는\n제모 솔루션',
        alt: '하루영의원 제모 시술 후 매끈한 팔과 다리',
    },
    {
        en: 'Zero Body',
        ko: '바디라인',
        slug: 'body',
        n: '07',
        desc: '탄력과 라인을 함께\n바디 밸런스를\n완성하는 바디 케어',
        alt: '하루영의원 바디라인 케어를 받은 바디 실루엣',
    },
    {
        en: 'Zero Skinbooster',
        ko: '스킨부스터',
        slug: 'booster',
        n: '08',
        desc: '건조함이 만든\n피부 고민, 속부터\n채우는 스킨부스터',
        alt: '하루영의원 스킨부스터 시술에 사용되는 세럼 방울',
    },
];

const SPACE_PHOTOS: GalleryPhoto[] = [
    {
        src: '/images/img-tour-01.jpg',
        alt: '하루영의원 입구 간접조명 복도',
        className: 'col-span-4 row-span-2 sm:col-span-3 sm:row-span-3 lg:col-span-20 lg:row-span-1',
    },
    {
        src: '/images/img-tour-02.jpg',
        alt: '하루영의원 리셉션 라운지 전경',
        className: 'col-span-2 row-span-2 sm:col-span-3 sm:row-span-3 lg:col-span-18 lg:row-span-1',
    },
    {
        src: '/images/img-tour-03.jpg',
        alt: '하루영의원 상담실 창가 좌석',
        className: 'col-span-2 row-span-2 sm:col-span-2 sm:row-span-2 lg:col-span-10 lg:row-span-1',
    },
    {
        src: '/images/img-tour-04.jpg',
        alt: '하루영의원 1인 시술실 베드',
        className: 'col-span-2 row-span-3 sm:col-span-2 sm:row-span-2 lg:col-span-14 lg:row-span-2',
    },
    {
        src: '/images/img-tour-05.jpg',
        alt: '하루영의원 프라이빗 파우더룸',
        className: 'col-span-2 row-span-3 sm:col-span-2 sm:row-span-2 lg:col-span-13 lg:row-span-2',
    },
    {
        src: '/images/img-tour-06.jpg',
        alt: '하루영의원 다인 시술실 베드 라인',
        className: 'col-span-4 row-span-2 sm:col-span-3 sm:row-span-2 lg:col-span-21 lg:row-span-1',
    },
    {
        src: '/images/img-tour-07.jpg',
        alt: '하루영의원 우드 루버 마감 복도',
        className: 'col-span-4 row-span-2 sm:col-span-3 sm:row-span-2 lg:col-span-21 lg:row-span-1',
    },
];

export default function Home() {
    return (
        <>
            <IntroLoader />

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
                                    className="mt-12 text-h3 font-semibold leading-relaxed"
                                >
                                    오직 당신만을 위해 설계된
                                    <br />
                                    특별한 피부 휴식.
                                </Reveal>
                                <Reveal
                                    as="p"
                                    delay={0.2}
                                    className="mt-5 whitespace-normal text-caption leading-[2] text-dark lg:whitespace-pre-line"
                                >
                                    {
                                        '하루영의원은 바쁜 일상 속 잠시 멈춰 선 시간처럼,\n피부에 가장 편안한 휴식을 선사합니다.\n오직 당신만을 위해 설계된 맞춤 케어로 자연스러운\n아름다움이 오래도록 이어지도록 설계합니다.'
                                    }
                                </Reveal>
                                <Reveal delay={0.3} className="mt-15">
                                    <MoreView href="/about" dark ariaLabel="하루영 철학 더 보기" />
                                </Reveal>
                            </div>

                            <Reveal variants={slideLeft} delay={0.2} className="hidden shrink-0 mt-0 lg:mt-4 lg:block">
                                <div className="mb-2 flex justify-end">
                                    <Icon name="i-sig" width={168} height={44} />
                                </div>
                                <div className="relative h-[290px] w-[220px] rounded-tl-[80px] overflow-hidden lg:h-[294px] lg:w-[235px]">
                                    <Image
                                        src="/images/img-s1-01.jpg"
                                        alt="하루영의원 케어를 상징하는 실크를 감싼 손"
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
                            sizes="(min-width:1024px) 1498px, 1498px"
                            className="object-cover"
                        />
                        {/* 원본이 세로 730px 뿐이라 모바일에서 확대된다. 오버레이로 노이즈를 눌러준다 */}
                        <span aria-hidden="true" className="absolute inset-0 bg-dark/45 lg:hidden" />

                        <div className="relative mx-auto flex h-full w-full max-w-[1230px] flex-col justify-center px-6 py-20 lg:px-0 lg:py-0">
                            <Reveal className="flex flex-col items-center justify-center lg:hidden">
                                <h2 className="font-display text-h2">Treatments</h2>
                                <p className="mt-6 whitespace-pre-line text-center text-small font-medium leading-[1.7] text-cream/90">
                                    {'나이보다 어려 보이는 피부,\n시간을 거스르는 하루영만의 재모델링 케어.'}
                                </p>
                            </Reveal>

                            <Reveal className="hidden lg:flex lg:items-start lg:gap-10">
                                <h2 className="font-display text-24">Treatments</h2>
                                <div className="mt-1.5 flex gap-2">
                                    <span>:</span>
                                    <p className="whitespace-pre-line text-caption font-medium leading-[1.9] text-cream/90">
                                        {'나이보다 어려 보이는 피부,\n시간을 거스르는 하루영만의 재모델링 케어.'}
                                    </p>
                                </div>
                            </Reveal>

                            {/* 카드 288x198 고정. flex-wrap 이라 gap 이 항상 26px 이고 들어가는 만큼 접힌다 */}
                            <RevealGroup
                                as="ul"
                                className="mt-10 flex flex-wrap justify-center gap-x-[26px] gap-y-7 lg:mt-12"
                            >
                                {TREATMENTS.map((t) => (
                                    <TreatmentCard key={t.en} en={t.en} n={t.n} desc={t.desc} alt={t.alt} />
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
                                            {
                                                '하루영의 공간은 피부가 편안히 쉬어갈 수 있는 시간을 설계합니다.\n  차분한 분위기와 섬세한 디테일로 머무는 모든 순간이 온전한 휴식이 될 수 있도록 완성했습니다.'
                                            }
                                        </p>
                                    </div>
                                </Reveal>

                                <PhotoGallery
                                    photos={SPACE_PHOTOS}
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
                                                {'당신의 피부를 위한\n맞춤 솔루션을 만나보세요.'}
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
