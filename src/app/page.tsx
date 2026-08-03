'use client';

import { useEffect, useState } from 'react';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/types/product';

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);

    const fetchProducts = async () => {
        const snapshot = await getDocs(collection(db, 'products'));
        console.log('문서 개수:', snapshot.size);
        const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Product[];
        setProducts(data);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // #TODO: 콘솔 접근 권한 생기면 이 함수랑 버튼 지우기 — 임시 데이터 주입용
    const addTestProduct = async () => {
        await addDoc(collection(db, 'products'), {
            name: '테스트 시술',
            mainCategory: 'FACE라인',
            subCategory: '리프팅',
            highlight: '테스트용 문구',
            description: 'Firestore 연결 확인용 데이터입니다',
            price: 100000,
            discountPrice: 0,
            eventId: null,
        });
        fetchProducts();
    };

    return (
        <div className="p-10">
            <h1 className="font-display text-h2">Firestore 연결 테스트</h1>
            <button onClick={addTestProduct} className="mt-4 border px-4 py-2">
                테스트 데이터 추가
            </button>
            {products.map((p) => (
                <div key={p.id} className="mt-4">
                    {p.name} - {p.price.toLocaleString()}원
                </div>
            ))}
        </div>
    );
}
