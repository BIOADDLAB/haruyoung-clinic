/**
 * 진료 카테고리. 헤더·서브내비·수가표 관리자·사이트맵이 모두 이 순서를 따른다.
 * name 은 관리자 화면 표기용이고, 사용자 화면 표기는 messages 의 nav/banner 에서 꺼낸다.
 */
export const MENU_CATEGORIES = [
    { slug: 'zeroaging', name: 'Zero Aging Project' },
    { slug: 'lifting', name: '리프팅' },
    { slug: 'pigment', name: '색소치료' },
    { slug: 'acne', name: '여드름치료' },
    { slug: 'body', name: '바디라인' },
    { slug: 'petit', name: '쁘띠라인' },
    { slug: 'care', name: '피부관리' },
    { slug: 'iv', name: '수액' },
    { slug: 'hair', name: '제모' },
    { slug: 'booster', name: '스킨부스터' },
] as const;

/**
 * 카테고리별 기본 섹션 제목.
 * 등록된 시술이 하나도 없어도 관리자 폼 드롭다운에 항상 뜨게 한다.
 * 여기 없는 값은 '+ 직접 입력' 으로 넣으면 되고, 넣는 순간 다음부터 목록에 같이 나온다.
 */
export const SECTION_PRESETS: Record<string, readonly string[]> = {
    zeroaging: ['Day Young', 'Week Young', 'Month Young', 'Year Young'],
};
