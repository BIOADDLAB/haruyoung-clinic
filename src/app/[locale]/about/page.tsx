import type { Metadata } from 'next';
import Image from 'next/image';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import HorizontalScroll, { Panel } from '@/components/ui/HorizontalScroll';
import { Icon } from '@/components/ui/Icons';
import PhotoGallery, { type GalleryPhoto } from '@/components/ui/PhotoGallery';
import Reveal from '@/components/ui/Reveal';
import { RevealGroup, RevealItem } from '@/components/ui/RevealGroup';
import { drawLine, fadeUpSlow, slideLeft } from '@/lib/motion';

export const metadata: Metadata = {
    title: '병원소개',
    description:
        '하루영의원의 철학과 대표원장, 그리고 하이엔드 리조트 스파를 닮은 프라이빗 공간을 소개합니다. 피부를 위한 가장 깊은 쉼을 설계합니다.',
    alternates: { canonical: '/about' },
};

const CAREERS = [
    '前 강남 사적인 아름다움 지유 총괄원장',
    '前 뮤즈 강남점 원장',
    '前 아비쥬 잠실새내점 원장',
    '前 톡스앤필 구리점 원장',
    '대한미용레이저학회',
    '대한미용외과학회',
    '대한비만미용치료학회',
    '대한필러학회',
    '대한레이저피부모발학회',
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

export default function AboutPage() {
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
                                        className="text-center font-gara text-[26px] font-bold italic leading-[30px] text-dark lg:text-left lg:text-34 lg:leading-[38px]"
                                    >
                                        A Moment of Pause,
                                        <br />
                                        Timeless Beauty
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
                                                alt="하루영의원 케어를 상징하는 패브릭 위의 꽃"
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
                                                alt="하루영의원 시술실 리넨 침구 클로즈업"
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
                                            className="text-[21px] font-bold leading-[29px] lg:text-24 lg:leading-[34px]"
                                        >
                                            피부를 위한 가장 깊은 쉼을
                                            <br />
                                            설계합니다.
                                        </Reveal>

                                        <Reveal
                                            as="p"
                                            delay={0.15}
                                            className="mt-5 text-[14px] font-medium leading-[22px] text-dark lg:mt-[30px] lg:text-samll lg:leading-[24px]"
                                        >
                                            하루영은 단순한 시술을 넘어,
                                            <br />
                                            피부가 가장 편안한 순간을 경험할 수 있도록 설계합니다.
                                            <br />
                                            오직 당신만을 위한 맞춤 케어로
                                            <br />
                                            시간이 지나도 자연스러운 아름다움이
                                            <br />
                                            오래도록 이어지는 휴식을 선사합니다.
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
                                            alt="하루영의원 케어를 상징하는 패브릭 위의 꽃"
                                            fill
                                            quality={90}
                                            sizes="216px"
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="absolute right-0 top-0 z-10 h-[192px] w-[155px] overflow-hidden rounded-t-full">
                                        <Image
                                            src="/images/img-sub-02.jpg"
                                            alt="하루영의원 시술실 리넨 침구 클로즈업"
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

                    {/* 원장 소개 */}
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
                                            aria-label="하루영의원 홍길동 대표원장 프로필 사진"
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
                                                홍길동 <span className="text-16 font-normal">대표원장</span>
                                            </span>
                                        </p>
                                        <Icon name="i-sig" width={129} height={37} className="pb-1" />
                                    </Reveal>

                                    {/* 구분선 */}
                                    <Reveal
                                        variants={drawLine}
                                        delay={0.2}
                                        className="mt-6 h-px w-[46px] origin-left bg-dark/40 lg:mt-[26px]"
                                    />

                                    {/* 경력 리스트 */}
                                    <RevealGroup as="ul" className="mt-7 text-center lg:mt-[33px] lg:text-left">
                                        {CAREERS.map((c) => (
                                            <RevealItem
                                                as="li"
                                                key={c}
                                                className="text-small leading-[32px] text-dark lg:leading-[35px]"
                                            >
                                                {c}
                                            </RevealItem>
                                        ))}
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
                                        aria-label="하루영의원 홍길동 대표원장 프로필 사진"
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
                                        className="mt-[66px] text-24 font-bold leading-[36px]"
                                    >
                                        하루의 쉼표가 만드는 영원한 시간,
                                        <br />
                                        오직 당신만을 위해 설계된
                                        <br />
                                        특별한 피부 휴식.
                                    </Reveal>
                                    <Reveal
                                        as="p"
                                        delay={0.2}
                                        className="mt-[46px] whitespace-normal text-small font-medium leading-[24px] text-dark lg:whitespace-pre-line"
                                    >
                                        {
                                            '하루영의원은 바쁜 일상에서 벗어나,\n이국적인 하이엔드 리조트 스파에 들어선 듯한 평온함을 선사합니다.\n격조 높은 프라이빗 공간, 피부의 미세한 결까지 배려하는 따뜻한\n손길 속에서 당신의 피부는 가장 편안한 상태로 되돌아갑니다.'
                                        }
                                    </Reveal>
                                    <Reveal
                                        as="p"
                                        delay={0.3}
                                        className="mt-[30px] whitespace-normal text-small font-medium leading-[24px] text-dark lg:whitespace-pre-line"
                                    >
                                        {
                                            '흔히 말하는 획일화된 시술이나 유행을 따르지 않습니다.\n우리는 당신이 살아온 시간과 피부의 이야기에 귀를 기울이며,\n매일 조금씩 더 빛나는 내일을 설계합니다.'
                                        }
                                    </Reveal>
                                </div>

                                <PhotoGallery
                                    photos={SPACE_PHOTOS}
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
