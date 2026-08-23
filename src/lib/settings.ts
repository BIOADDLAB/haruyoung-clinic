import { doc, getDoc, setDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from './firebase';
import { defaultReservationHours, type PopupSetting, type PromotionBannerSetting, type ReservationHoursSetting } from '@/types/settings';

/** 사이트 전역 설정은 settings 컬렉션에 문서 하나씩 둔다 */
const PROMOTION_BANNER_DOC = doc(db, 'settings', 'promotionBanner');
const POPUP_DOC = doc(db, 'settings', 'popup');
const RESERVATION_HOURS_DOC = doc(db, 'settings', 'reservationHours');

/**
 * 문서가 없거나 Firestore 규칙이 막혀 있어도 null 을 돌려준다.
 * 프로모션 배너 설정은 곁다리 값이라 이것 때문에 화면이 죽으면 안 된다.
 */
async function readDoc<T>(ref: typeof PROMOTION_BANNER_DOC): Promise<T | null> {
    try {
        const snap = await getDoc(ref);
        return snap.exists() ? (snap.data() as T) : null;
    } catch (e) {
        console.warn('[settings] 읽기 실패. 기본값으로 진행합니다.', e);
        return null;
    }
}

export function getPromotionBannerSetting() {
    return readDoc<PromotionBannerSetting>(PROMOTION_BANNER_DOC);
}

export async function savePromotionBannerSetting(data: PromotionBannerSetting) {
    await setDoc(PROMOTION_BANNER_DOC, data);
}

export function getPopupSetting() {
    return readDoc<PopupSetting>(POPUP_DOC);
}

export async function savePopupSetting(data: PopupSetting) {
    await setDoc(POPUP_DOC, data);
}

export async function getReservationHoursSetting() {
    return (await readDoc<ReservationHoursSetting>(RESERVATION_HOURS_DOC)) ?? defaultReservationHours();
}

export async function saveReservationHoursSetting(data: ReservationHoursSetting) {
    await setDoc(RESERVATION_HOURS_DOC, data);
}

/** 팝업 이미지 업로드. 같은 파일명이 겹치지 않도록 시각을 붙인다 */
export async function uploadPopupImage(file: File) {
    const path = `popups/${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`;
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
}

/** 교체·삭제된 이미지를 Storage 에서 지운다. 이미 없으면 조용히 넘어간다 */
export async function deletePopupImage(url: string) {
    if (!url.includes('/o/')) return;
    try {
        await deleteObject(ref(storage, url));
    } catch {}
}
