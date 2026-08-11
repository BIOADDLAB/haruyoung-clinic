import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
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

    // 탈퇴 처리된 계정은 Auth 에 남아 있어도 들어올 수 없다
    const snap = await getDoc(doc(db, 'members', cred.user.uid));
    if (snap.exists() && (snap.data() as MemberSeed).deletedAt) {
        await signOut(auth);
        throw new Error('삭제된 계정입니다.');
    }

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

/**
 * 회원 삭제. 문서에 삭제 시각만 남기고 Firebase Auth 계정은 그대로 둔다.
 * 계정까지 지우려면 Admin SDK 와 서버 라우트가 필요하다.
 *
 * 되돌리지 않는다. 언제 지웠는지 기록이 남아야 한다.
 */
export async function deleteMember(id: string) {
    await updateDoc(doc(db, 'members', id), { deletedAt: Date.now() });
}
