export type SettingLocale = 'ko' | 'en' | 'zh';

/** 프로모션 배너 문구. 관리자 > 사이트 설정에서 언어별로 바꾼다 */
export type PromotionBannerSetting = {
    title: string;
    titleEn?: string;
    titleZh?: string;
    subtitle: string;
    subtitleEn?: string;
    subtitleZh?: string;
};

/** 팝업 탭 하나. imageUrl 은 Firebase Storage 다운로드 주소다 */
export type PopupTab = {
    /** 탭 버튼에 보이는 짧은 라벨. 예: 8월 진료일정 */
    label: string;
    labelEn?: string;
    labelZh?: string;
    imageUrl: string;
    /** 이미지를 눌렀을 때 이동할 주소. 비우면 링크 없이 이미지만 보여준다 */
    linkUrl?: string;
};

/** 팝업은 문서 한 건이다. 탭은 최대 POPUP_MAX_TABS 개 */
export type PopupSetting = {
    enabled: boolean;
    tabs: PopupTab[];
};

export const POPUP_MAX_TABS = 5;

/** 해당 언어가 비어 있으면 한국어로 떨어진다. 시술·프로모션 데이터와 같은 규칙이다 */
export function localizedSetting<T extends Record<string, unknown>>(
    item: T,
    field: Extract<keyof T, string>,
    locale: SettingLocale,
) {
    const suffix = locale === 'en' ? 'En' : locale === 'zh' ? 'Zh' : '';
    const value = suffix ? item[`${field}${suffix}` as keyof T] : undefined;
    return String(value || item[field] || '');
}
