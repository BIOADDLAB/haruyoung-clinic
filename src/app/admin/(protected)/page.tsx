import Link from 'next/link';

export default function AdminHome() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-[#3a322c]">관리자</h1>
            <p className="mt-2 text-neutral-500">메뉴에서 관리할 항목을 선택하세요.</p>
            <div className="mt-6">
                <Link href="/admin/products" className="text-[#3a322c] underline">
                    수가표 관리로 이동
                </Link>
            </div>
        </div>
    );
}
