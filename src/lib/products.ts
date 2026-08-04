import { collection, getDocs, orderBy, query, doc, deleteDoc, updateDoc, addDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import type { Product, ProductSeed } from '@/types/product';

const col = collection(db, 'products');

export async function getProducts(): Promise<Product[]> {
    const snap = await getDocs(query(col, orderBy('order', 'asc')));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);
}

export async function addProduct(data: ProductSeed) {
    await addDoc(col, data);
}

export async function updateProduct(id: string, data: Partial<ProductSeed>) {
    await updateDoc(doc(db, 'products', id), data);
}

export async function deleteProduct(id: string) {
    await deleteDoc(doc(db, 'products', id));
}

export async function reorderProducts(ordered: Product[]) {
    const batch = writeBatch(db);
    ordered.forEach((p, idx) => {
        batch.update(doc(db, 'products', p.id), { order: idx });
    });
    await batch.commit();
}
