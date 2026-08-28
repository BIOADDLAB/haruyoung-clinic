import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    runTransaction,
    setDoc,
    updateDoc,
    where,
    type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { holdsReservationSlot, type Reservation, type ReservationSeed } from '@/types/reservation';

const col = collection(db, 'reservations');
const slotsCol = collection(db, 'reservationSlots');

export class SlotTakenError extends Error {
    constructor() {
        super('SLOT_TAKEN');
        this.name = 'SlotTakenError';
    }
}

export function reservationSlotId(date: string, time: string) {
    return `${date}_${time.replace(':', '-')}`;
}

function slotRef(date: string, time: string) {
    return doc(db, 'reservationSlots', reservationSlotId(date, time));
}

/**
 * 같은 날짜·30분 칸은 문서 하나로 잠근다.
 * 예약과 슬롯을 한 트랜잭션으로 써서 동시에 두 건이 들어가는 일을 막는다.
 */
export async function addReservation(data: ReservationSeed) {
    const resRef = doc(col);
    const hold = slotRef(data.date, data.time);

    try {
        await runTransaction(db, async (tx) => {
            const taken = await tx.get(hold);
            if (taken.exists()) throw new SlotTakenError();
            tx.set(hold, { date: data.date, time: data.time });
            tx.set(resRef, data);
        });
    } catch (e) {
        if (e instanceof SlotTakenError) throw e;
        const code = e && typeof e === 'object' && 'code' in e ? String((e as { code: string }).code) : '';
        if (code.includes('already-exists')) throw new SlotTakenError();
        throw e;
    }
    return resRef.id;
}

/** 해당 날짜에 이미 잠긴 시각. 문서 id 로 먼저 확인하고, 이후 목록 쿼리로 실시간 갱신한다 */
export function subscribeOccupiedTimes(
    date: string,
    candidates: string[],
    onTimes: (times: string[]) => void,
    onError: (e: Error) => void,
): Unsubscribe {
    if (!date) {
        onTimes([]);
        return () => {};
    }

    let cancelled = false;
    let unsubSnap: Unsubscribe = () => {};
    const fromGet = new Set<string>();
    const fromQuery = new Set<string>();
    const emit = () => {
        if (!cancelled) onTimes([...new Set([...fromGet, ...fromQuery])]);
    };

    Promise.all(candidates.map((time) => getDoc(slotRef(date, time))))
        .then((snaps) => {
            if (cancelled) return;
            candidates.forEach((time, i) => {
                if (snaps[i].exists()) fromGet.add(time);
            });
            emit();
            unsubSnap = onSnapshot(
                query(slotsCol, where('date', '==', date)),
                (snap) => {
                    fromQuery.clear();
                    for (const d of snap.docs) {
                        const time = String(d.data().time ?? '');
                        if (time) fromQuery.add(time);
                    }
                    emit();
                },
                () => {
                    // 목록 쿼리가 막혀도 getDoc 결과만으로 칸을 가린다
                },
            );
        })
        .catch((e) => {
            if (!cancelled) onError(e instanceof Error ? e : new Error('occupied'));
        });

    return () => {
        cancelled = true;
        unsubSnap();
    };
}

export async function isTimeTaken(date: string, time: string) {
    const snap = await getDoc(slotRef(date, time));
    return snap.exists();
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

/** 예전 예약처럼 슬롯 문서가 없으면 만든다. 관리자 화면을 열 때 한 번 맞춘다 */
export async function syncReservationSlots(list: Reservation[]) {
    const wanted = new Map<string, { date: string; time: string }>();
    for (const r of list) {
        if (!holdsReservationSlot(r.status) || !r.date || !r.time) continue;
        const id = reservationSlotId(r.date, r.time);
        if (!wanted.has(id)) wanted.set(id, { date: r.date, time: r.time });
    }
    if (wanted.size === 0) return;

    await Promise.all(
        [...wanted.entries()].map(([id, payload]) => setDoc(doc(db, 'reservationSlots', id), payload)),
    );
}

/** 해당 칸을 아직 쓰는 예약이 없으면 잠금을 푼다 */
export async function reconcileReservationSlot(date: string, time: string, list: Reservation[]) {
    if (!date || !time) return;
    const held = list.some((r) => r.date === date && r.time === time && holdsReservationSlot(r.status));
    const ref = slotRef(date, time);
    if (held) await setDoc(ref, { date, time });
    else await deleteDoc(ref).catch(() => {});
}
