export const MENU_CATEGORIES = [
    { slug: 'lifting', name: '리프팅' },
    { slug: 'pigment', name: '색소치료' },
    { slug: 'acne', name: '여드름치료' },
    { slug: 'petit', name: '쁘띠라인' },
    { slug: 'booster', name: '스킨부스터' },
    { slug: 'care', name: '피부관리·수액' },
    { slug: 'hair', name: '제모' },
    { slug: 'body', name: '바디라인' },
] as const;

/** Firestore의 한국어 대분류를 messages 키로 연결한다. */
export const MAIN_CATEGORY_KEYS = {
    리프팅: 'lifting',
    '색소/홍조/잡티': 'pigmentRednessBlemishes',
    '문신 제거': 'tattooRemoval',
    '모공/흉터/여드름': 'poresScarsAcne',
    보톡스: 'botox',
    스킨보톡스: 'skinBotox',
    '윤곽/지방분해주사': 'contourFatDissolving',
    필러: 'filler',
    스킨부스터: 'skinBooster',
    피부관리: 'skinCare',
    '영양 수액': 'ivTherapy',
    '여성 제모': 'womenHairRemoval',
    '남성 제모': 'menHairRemoval',
    '바디관리/다이어트': 'bodyDiet',
} as const;

export function getMainCategoryKey(category: string) {
    return MAIN_CATEGORY_KEYS[category as keyof typeof MAIN_CATEGORY_KEYS];
}
