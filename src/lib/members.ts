import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { toAuthEmail, type Member, type MemberSeed } from '@/types/member';

const col = collection(db, 'members');

/**
 * 아이디 중복은 Firebase Auth 가 막는다.
 * loginId 는 아이디@haruyoung.local 로 1:1 변환되므로, 이미 쓰는 아이디면
 * createUserWithEmailAndPassword 가 auth/email-already-in-use 를 던진다.
 * 예전에는 members 전체를 훑어 미리 확인했는데, 그러려면 회원 목록을
 * 누구에게나 열어야 해서(개인정보) 그만뒀다.
 */
export const ID_TAKEN_CODE = 'auth/email-already-in-use';

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
