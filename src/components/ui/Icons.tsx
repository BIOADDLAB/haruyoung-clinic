import Image from 'next/image';

export function Icon({
    name,
    size = 24,
    width,
    height,
    className = '',
    alt = '',
}: {
    name: string;
    size?: number;
    width?: number;
    height?: number;
    className?: string;
    alt?: string;
}) {
    return (
        <Image
            src={`/images/${name}.svg`}
            alt={alt}
            width={width ?? size}
            height={height ?? size}
            unoptimized
            className={`h-auto ${className ?? ''}`}
        />
    );
}

type P = { className?: string };

const stroke = (className?: string) => ({
    className: `stroke-current ${className ?? ''}`,
    viewBox: '0 0 24 24',
    fill: 'none',
    strokeWidth: 1.2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
});

export const IconChevron = ({ className }: P) => (
    <svg {...stroke(className)}>
        <path d="M6 9.5l6 6 6-6" />
    </svg>
);

export const IconArrow = ({ className }: P) => (
    <svg {...stroke(className)}>
        <path d="M4 12h15M13.5 6.5L20 12l-6.5 5.5" />
    </svg>
);
