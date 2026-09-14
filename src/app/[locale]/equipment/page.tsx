import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import EquipmentNav from '@/components/equipment/EquipmentNav';
import Header from '@/components/layout/Header';
import Banner from '@/components/ui/Banner';
import { EQUIPMENT_SECTIONS, type EquipmentSection } from '@/data/equipment';
import { createPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const [t, tm] = await Promise.all([
        getTranslations({ locale, namespace: 'equipment' }),
        getTranslations({ locale, namespace: 'meta' }),
    ]);

    return createPageMetadata({
        locale,
        path: '/equipment',
        title: t('title'),
        description: t('description'),
        clinic: tm('clinic'),
        ogAlt: tm('ogAlt'),
    });
}

export default async function EquipmentPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'equipment' });
    const items = EQUIPMENT_SECTIONS.map(({ id }) => ({
        id: `equipment-${id}`,
        label: t(`sections.${id}.nav`),
    }));

    return (
        <>
            <Header dark />
            <EquipmentNav items={items} label={t('navLabel')} />

            <main className="site-sub min-h-dvh bg-cream">
                <h1 className="sr-only">{t('title')}</h1>
                <div className="w-full max-w-[896px] pb-28 lg:pb-24">
                    <div className="[&>div]:min-h-28 sm:[&>div]:min-h-0">
                        <Banner file="img-banner-01" en="Equipment" ko={t('subtitle')} />
                    </div>

                    <div className="space-y-14 px-5 pt-12 sm:px-6 lg:space-y-16 lg:px-12 lg:pt-14">
                        {EQUIPMENT_SECTIONS.map((section: EquipmentSection) => {
                            const id = `equipment-${section.id}`;
                            const title = t(`sections.${section.id}.title`);
                            const tags = t.raw(`sections.${section.id}.tags`) as string[];

                            return (
                                <section
                                    key={section.id}
                                    id={id}
                                    aria-labelledby={`${id}-title`}
                                    tabIndex={-1}
                                    className="scroll-mt-32 focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-brown lg:scroll-mt-8"
                                >
                                    <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2 border-b border-[#816854] pb-3">
                                        <h2
                                            id={`${id}-title`}
                                            className="flex flex-wrap items-baseline gap-x-3 gap-y-1  font-extrabold break-keep text-[20px]"
                                        >
                                            {title}
                                            {locale !== 'en' && (
                                                <span lang="en" className="text-[18px] font-bold">
                                                    {section.english}
                                                </span>
                                            )}
                                        </h2>
                                        <p lang="en" className="font-display text-caption-sm text-dark/75">
                                            {section.keywords}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-[#816854]">
                                        <div className="flow-root p-5 sm:p-6">
                                            <Image
                                                src={`/images/${section.photo}`}
                                                alt=""
                                                width={408}
                                                height={476}
                                                sizes="(min-width: 1024px) 204px, (min-width: 640px) 190px, 110px"
                                                className="float-right mb-4 ml-4 h-auto w-[32%] max-w-[204px] rounded-md sm:mb-0 sm:ml-6 sm:w-[27%]"
                                            />
                                            <h3 lang="en" className="mb-3 font-display text-16 text-[#816854]">
                                                01{' '}
                                                <span aria-hidden="true" className="mx-1 text-[#816854]">
                                                    |
                                                </span>{' '}
                                                About
                                            </h3>
                                            <p className="text-[14px] leading-[1.85] whitespace-normal min-[1400px]:whitespace-pre-line break-keep">
                                                {t(`sections.${section.id}.about`)}
                                            </p>
                                            <ul className="mt-5 flex flex-wrap gap-2" aria-label={t('concerns')}>
                                                {tags.map((tag) => (
                                                    <li
                                                        key={tag}
                                                        className="rounded-full text-[#816854] border border-[#816854] px-2.5 py-1 text-caption-sm leading-relaxed"
                                                    >
                                                        {tag}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="border-t border-[#816854] p-5 sm:p-6">
                                            <h3 lang="en" className="mb-3 font-display text-16 text-[#816854]">
                                                02{' '}
                                                <span aria-hidden="true" className="mx-1 text-[#816854]">
                                                    |
                                                </span>{' '}
                                                Device
                                            </h3>
                                            <p className="mb-6 text-[14px] leading-relaxed break-keep">
                                                {t(`sections.${section.id}.device`)}
                                            </p>
                                            <ul className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-4">
                                                {section.devices.map((device) => (
                                                    <li
                                                        key={device.image}
                                                        className="relative min-w-0 bg-[#CCB194]/20 rounded-[8px]"
                                                    >
                                                        {device.badge && (
                                                            <Image
                                                                src="/images/l-equ-skin.svg"
                                                                alt=""
                                                                width={45}
                                                                height={64}
                                                                className="absolute -top-6 left-2 z-10 h-auto w-9 sm:w-[45px]"
                                                            />
                                                        )}
                                                        <figure className="flex h-full flex-col">
                                                            <Image
                                                                src={`/images/${device.image}`}
                                                                alt=""
                                                                width={360}
                                                                height={270}
                                                                sizes="(min-width: 1280px) 180px, (min-width: 640px) 160px, 45vw"
                                                                className="aspect-[4/3] h-auto w-full object-contain"
                                                            />
                                                            <figcaption className="mt-auto px-2 pt-1 pb-4 text-center text-caption leading-relaxed break-keep">
                                                                {t(`devices.${device.key}`)}
                                                            </figcaption>
                                                        </figure>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                </div>
            </main>
        </>
    );
}
