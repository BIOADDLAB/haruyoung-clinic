import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
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

export async function updateReservation(id: string, data: Partial<ReservationSeed>) {
    await updateDoc(doc(db, 'reservations', id), data);
}

/**
 * 예약 삭제.
 * 보통은 상태를 '취소' 로 남겨 기록을 보존하지만,
 * 테스트 데이터나 중복 접수는 지울 수 있어야 해서 열어둔다.
 */
export async function deleteReservation(id: string) {
    await deleteDoc(doc(db, 'reservations', id));
}
