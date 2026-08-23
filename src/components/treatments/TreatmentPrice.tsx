'use client';

import { useTranslations } from 'next-intl';
import CartToggle from '@/components/cart/CartToggle';
import {
    localized,
    localizedPrice,
    localizedTierPrice,
    usableTiers,
    type Locale,
    type Product,
} from '@/types/product';

/** 단일 가격이거나 1회/5회/10회처럼 나눠진 가격을 장바구니 체크와 함께 그린다 */
export default function TreatmentPrice({ product, locale }: { product: Product; locale: Locale }) {
    const t = useTranslations('treatments');
    const name = localized(product, 'name', locale);
    const description = localized(product, 'description', locale);
    const tiers = usableTiers(product);

    if (tiers.length > 0) {
        return (
            <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2">
                {tiers.map((tier) => {
                    const price = localizedTierPrice(tier, locale);
                    const caption = t('sessions', { n: tier.sessions });
                    if (price == null) {
                        return (
                            <span key={tier.sessions} className="text-caption text-dark/50">
                                {caption} {t('askPrice')}
                            </span>
                        );
                    }
                    return (
                        <CartToggle
                            key={tier.sessions}
                            caption={caption}
                            item={{
                                key: `product:${product.id}:${tier.sessions}`,
                                name: `${name} (${caption})`,
                                price,
                                category: product.menuCategory,
                                description,
                                sessions: tier.sessions,
                            }}
                        />
                    );
                })}
            </div>
        );
    }

    const price = localizedPrice(product, locale);
    if (price == null) {
        return <span className="text-caption text-dark/50">{t('askPrice')}</span>;
    }

    return (
        <CartToggle
            item={{
                key: `product:${product.id}`,
                name,
                price,
                category: product.menuCategory,
                description,
            }}
        />
    );
}
