import { RESERVATION_HOURS, RESERVATION_LUNCH, RESERVATION_MAX_DAYS } from '@/data/site';

export type SettingLocale = 'ko' | 'en' | 'zh';

/** 프로모션 배너 문구. 관리자 > 프로모션 배너 설정에서 언어별로 바꾼다 */
export type PromotionBannerSetting = {
    /** 없으면 노출 */
    titleVisible?: boolean;
    subtitleVisible?: boolean;
    title: string;
    titleEn?: string;
    titleZh?: string;
    subtitle: string;
    subtitleEn?: string;
    subtitleZh?: string;
};

/** 홈 히어로 배너 문구. 관리자 > 메인 배너 설정에서 언어별로 바꾼다 */
export type HeroBannerSetting = {
    slogan: string;
    sloganEn?: string;
    sloganZh?: string;
    sub: string;
    subEn?: string;
    subZh?: string;
    cta: string;
    ctaEn?: string;
    ctaZh?: string;
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

/** 팝업 이미지 권장 규격. 인스타 피드 세로 게시물(4:5)과 같다 */
export const POPUP_IMAGE_WIDTH = 1080;
export const POPUP_IMAGE_HEIGHT = 1350;

/** 전후사진 한 세트. 갤러리에 나란히 보여 준다 */
export type BeforeAfterItem = {
    /** MENU_CATEGORIES slug. 시술 메뉴와 같은 분류다 */
    menuSlug: string;
    beforeUrl: string;
    afterUrl: string;
};

/** 전후사진 갤러리. settings/beforeAfter 문서다 */
export type BeforeAfterSetting = {
    items: BeforeAfterItem[];
};

/** 요일 하나. 관리자 > 예약 시간 설정에서 바꾼다 */
export type ReservationDayHours = {
    open: boolean;
    start: string;
    end: string;
    lunch: boolean;
};

/** 예약 가능 시간. settings/reservationHours 문서다 */
export type ReservationClosedDate = {
    /** 'YYYY-MM-DD' */
    date: string;
    /** 관리자용. 예: 추석 */
    note: string;
};

/** 요일·휴진일을 무시하고 여는 날짜. 시간은 그날만 따로 둔다 */
export type ReservationOpenDate = {
    date: string;
    note: string;
    start: string;
    end: string;
    lunch: boolean;
};

export type ReservationHoursSetting = {
    /** 키는 '0'(일) … '6'(토) */
    days: Record<string, ReservationDayHours>;
    lunchStart: string;
    lunchEnd: string;
    maxDays: number;
    /** 요일과 무관하게 막는 날짜. 추석·임시휴진 */
    closedDates: ReservationClosedDate[];
    openDates: ReservationOpenDate[];
};

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const TIME_KEY = /^\d{2}:\d{2}$/;

export function normalizeClosedDates(raw: unknown): ReservationClosedDate[] {
    if (!Array.isArray(raw)) return [];
    const seen = new Set<string>();
    const out: ReservationClosedDate[] = [];
    for (const item of raw) {
        const date = typeof item === 'string' ? item : item && typeof item === 'object' ? String((item as { date?: string }).date ?? '') : '';
        if (!DATE_KEY.test(date) || seen.has(date)) continue;
        seen.add(date);
        const note = item && typeof item === 'object' ? String((item as { note?: string }).note ?? '').trim() : '';
        out.push({ date, note });
    }
    out.sort((a, b) => a.date.localeCompare(b.date));
    return out;
}

export const normalizeOpenDates = (raw: unknown): ReservationOpenDate[] => {
    if (!Array.isArray(raw)) return [];
    const seen = new Set<string>();
    const out: ReservationOpenDate[] = [];
    for (const item of raw) {
        if (!item || typeof item !== 'object') continue;
        const row = item as Partial<ReservationOpenDate> & { date?: string };
        const date = String(row.date ?? '');
        if (!DATE_KEY.test(date) || seen.has(date)) continue;
        seen.add(date);
        const start = TIME_KEY.test(String(row.start ?? '')) ? String(row.start) : '10:00';
        const end = TIME_KEY.test(String(row.end ?? '')) ? String(row.end) : '19:00';
        out.push({
            date,
            note: String(row.note ?? '').trim(),
            start,
            end,
            lunch: row.lunch !== false,
        });
    }
    out.sort((a, b) => a.date.localeCompare(b.date));
    return out;
};

export function isReservationForcedOpen(dateKey: string, hours?: ReservationHoursSetting | null) {
    if (!dateKey) return false;
    return (hours?.openDates ?? []).some((d) => d.date === dateKey);
}

export function isReservationClosed(dateKey: string, hours?: ReservationHoursSetting | null) {
    if (!dateKey) return false;
    if (isReservationForcedOpen(dateKey, hours)) return false;
    return (hours?.closedDates ?? []).some((d) => d.date === dateKey);
}

/** 달력에서 고를 수 없는 날. 임시 진료일이면 요일 휴진·지정 휴진을 모두 무시한다 */
export function isReservationDayClosed(dateKey: string, hours?: ReservationHoursSetting | null) {
    if (!dateKey) return true;
    if (isReservationForcedOpen(dateKey, hours)) return false;
    if (isReservationClosed(dateKey, hours)) return true;
    const date = new Date(`${dateKey}T00:00:00`);
    return !hours?.days[String(date.getDay())]?.open;
}

/** 그날 쓸 시작·종료·점심. 임시 진료일이면 그 날짜 시간을 쓴다 */
export function reservationHoursForDate(
    dateKey: string,
    hours?: ReservationHoursSetting | null,
): ReservationDayHours | null {
    if (!dateKey) return null;
    const cfg = hours ?? defaultReservationHours();
    const extra = cfg.openDates.find((d) => d.date === dateKey);
    if (extra) {
        return { open: true, start: extra.start, end: extra.end, lunch: extra.lunch };
    }
    if (isReservationDayClosed(dateKey, cfg)) return null;
    const rule = cfg.days[String(new Date(`${dateKey}T00:00:00`).getDay())];
    return rule ?? null;
}

/** Firestore 에 값이 없을 때 쓰는 기본값. site.ts 진료시간과 같다 */
export function defaultReservationHours(): ReservationHoursSetting {
    const days: ReservationHoursSetting['days'] = {};
    for (let i = 0; i <= 6; i++) {
        const rule = RESERVATION_HOURS[i];
        days[String(i)] = rule
            ? { open: true, start: rule.start, end: rule.end, lunch: rule.lunch }
            : { open: false, start: '10:00', end: '19:00', lunch: true };
    }
    return {
        days,
        lunchStart: RESERVATION_LUNCH.start,
        lunchEnd: RESERVATION_LUNCH.end,
        maxDays: RESERVATION_MAX_DAYS,
        closedDates: [],
        openDates: [],
    };
}

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
