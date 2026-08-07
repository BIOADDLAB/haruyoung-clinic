import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import type { Promotion, PromotionSeed } from '@/types/promotion';

const col = collection(db, 'promotions');

export async function getPromotions(): Promise<Promotion[]> {
    const snap = await getDocs(query(col, orderBy('order', 'asc')));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Promotion);
}

export async function addPromotion(data: PromotionSeed) {
    await addDoc(col, data);
}

export async function updatePromotion(id: string, data: Partial<PromotionSeed>) {
    await updateDoc(doc(db, 'promotions', id), data);
}

export async function deletePromotion(id: string) {
    await deleteDoc(doc(db, 'promotions', id));
}

export async function reorderPromotions(ordered: Promotion[]) {
    const batch = writeBatch(db);
    ordered.forEach((p, idx) => batch.update(doc(db, 'promotions', p.id), { order: idx }));
    await batch.commit();
}
