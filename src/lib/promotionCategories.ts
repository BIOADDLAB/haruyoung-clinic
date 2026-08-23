import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import type { PromotionCategory, PromotionCategorySeed } from '@/types/promotion';

const col = collection(db, 'promotionCategories');

export async function getPromotionCategories(): Promise<PromotionCategory[]> {
    try {
        const snap = await getDocs(query(col, orderBy('order', 'asc')));
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PromotionCategory);
    } catch (e) {
        console.warn('[promotionCategories] 읽기 실패. 카테고리 없이 진행합니다.', e);
        return [];
    }
}

export async function addPromotionCategory(data: PromotionCategorySeed) {
    await addDoc(col, data);
}

export async function updatePromotionCategory(id: string, data: Partial<PromotionCategorySeed>) {
    await updateDoc(doc(db, 'promotionCategories', id), data);
}

/** 카테고리를 지운 뒤, 그 칸에 있던 프로모션은 미분류로 돌려놓는다 */
export async function deletePromotionCategory(id: string) {
    const promotions = await getDocs(collection(db, 'promotions'));
    const batch = writeBatch(db);
    promotions.docs.forEach((d) => {
        if (d.data().categoryId === id) batch.update(d.ref, { categoryId: '' });
    });
    batch.delete(doc(db, 'promotionCategories', id));
    await batch.commit();
}

export async function reorderPromotionCategories(ordered: PromotionCategory[]) {
    const batch = writeBatch(db);
    ordered.forEach((c, idx) => batch.update(doc(db, 'promotionCategories', c.id), { order: idx }));
    await batch.commit();
}
