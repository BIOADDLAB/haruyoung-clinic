import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, orderBy, query, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { toAuthEmail, type Member, type MemberSeed } from '@/types/member';

const col = collection(db, 'members');

/** 아이디 중복 확인. loginId 는 문서에만 있으므로 전체를 훑는다 (회원 수가 적을 때 충분) */
export async function isLoginIdTaken(loginId: string) {
    const snap = await getDocs(col);
    return snap.docs.some((d) => (d.data() as MemberSeed).loginId === loginId.trim().toLowerCase());
}

export async function signUp(data: MemberSeed & { password: string }) {
    const { password, ...profile } = data;
    const cred = await createUserWithEmailAndPassword(auth, toAuthEmail(profile.loginId), password);
    await setDoc(doc(db, 'members', cred.user.uid), profile);
    return cred.user.uid;
}

export async function signIn(loginId: string, password: string) {
    const cred = await signInWithEmailAndPassword(auth, toAuthEmail(loginId), password);
    return cred.user.uid;
}

export async function signOutMember() {
    await signOut(auth);
}

export async function getMember(user: User): Promise<Member | null> {
    const snap = await getDoc(doc(db, 'members', user.uid));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Member) : null;
}

/** 관리자 목록용. 가입 최신순 */
export async function getMembers(): Promise<Member[]> {
    const snap = await getDocs(query(col, orderBy('createdAt', 'desc')));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Member);
}
