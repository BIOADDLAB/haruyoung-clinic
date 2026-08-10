export type Member = {
    /** Firebase Auth uid 를 그대로 문서 id 로 쓴다 */
    id: string;
    /** 로그인 아이디. 이메일이 아니라 사용자가 정한 문자열 */
    loginId: string;
    name: string;
    phone: string;
    createdAt: number;
};

export type MemberSeed = Omit<Member, 'id'>;

/**
 * Firebase Auth 는 이메일만 받는다.
 * 아이디 기반 로그인을 쓰기 위해 내부 도메인을 붙여 가짜 이메일로 변환한다.
 */
export const ID_DOMAIN = '@haruyoung.local';
export const toAuthEmail = (loginId: string) => `${loginId.trim().toLowerCase()}${ID_DOMAIN}`;
