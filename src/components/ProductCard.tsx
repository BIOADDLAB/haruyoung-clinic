'use client';

import type { Product } from '@/types/product';

export default function ProductCard({
    p,
    checked,
    onCheck,
    right,
    left,
}: {
    p: Product;
    checked?: boolean; // 방문자: 장바구니 담기 체크
    onCheck?: (id: string) => void;
    right?: React.ReactNode; // 관리자: 수정/삭제 버튼
    left?: React.ReactNode; // 관리자: 드래그 핸들
}) {
    return (
        <article className="flex gap-3 rounded-lg border border-black/10 bg-white px-7 py-6">
            {left}

            <div className="flex-1">
                <h3 className="text-[17px] font-bold text-[#3a322c]">{p.name}</h3>

                {p.highlight && <p className="mt-3 text-[14px] font-semibold text-[#3a322c]">{p.highlight}</p>}

                {p.description && (
                    <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-neutral-600">
                        {p.description}
                    </p>
                )}

                <div className="mt-5 flex items-center justify-end gap-3">
                    {onCheck && (
                        <input
                            type="checkbox"
                            checked={!!checked}
                            onChange={() => onCheck(p.id)}
                            className="h-4 w-4 accent-[#3a322c]"
                        />
                    )}
                    <span className="text-[17px] font-bold text-[#3a322c]">
                        {p.price === null ? '가격 문의' : p.price.toLocaleString() + '원'}
                    </span>
                    {right}
                </div>
            </div>
        </article>
    );
}
