import { addDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';
import type { Reservation, ReservationSeed } from '@/types/reservation';

const col = collection(db, 'reservations');

export async function addReservation(data: ReservationSeed) {
    const ref = await addDoc(col, data);
    return ref.id;
}

/** 관리자 확인용. 최신순 */
export async function getReservations(): Promise<Reservation[]> {
    const snap = await getDocs(query(col, orderBy('createdAt', 'desc')));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Reservation);
}
