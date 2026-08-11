import Image from 'next/image';

export default function Banner({
    file,
    en,
    ko,
    lead,
    tall,
}: {
    file: string;
    /** 영문. 양옆에 작은 점이 붙는다 */
    en: string;
    ko: string;
    /** 프로모션 배너 맨 위 로고 타이포 */
    lead?: string;
    /** 프로모션은 세로가 두 배 이상이다 */
    tall?: boolean;
}) {
    return (
        <div
            className={`relative w-full max-w-[896px] overflow-hidden ${
                tall ? 'aspect-[896/421]' : 'aspect-[896/195]'
            }`}
        >
            <Image
                src={`/images/${file}.jpg`}
                alt=""
                fill
                priority
                quality={92}
                sizes="(min-width:1024px) 896px, 896px"
                className="object-cover"
            />

            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                {lead && <p className="mb-10 font-display text-h3 text-cream">{lead}</p>}

                <p
                    className={`flex items-center gap-3 font-display ${
                        tall ? 'text-h3 text-cream' : 'text-20 text-dark'
                    }`}
                >
                    <Dot tall={tall} />
                    {en}
                    <Dot tall={tall} />
                </p>

                <p className={`text-small font-semibold ${tall ? 'mt-1 text-cream/85' : 'mt-1.5 text-dark/85'}`}>
                    {ko}
                </p>
            </div>
        </div>
    );
}

function Dot({ tall }: { tall?: boolean }) {
    return (
        <span
            aria-hidden="true"
            className={`relative inline-block h-2 w-2 rounded-full ${tall ? 'bg-cream/30' : 'bg-dark/25'}`}
        >
            <span
                className={`absolute left-1/2 top-1/2 inline-block h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                    tall ? 'bg-cream' : 'bg-dark'
                }`}
            />
        </span>
    );
}
