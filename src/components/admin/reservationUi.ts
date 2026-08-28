import type { ReservationStatus } from '@/types/reservation';

export const RESERVATION_TONE: Record<ReservationStatus, string> = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    done: 'bg-neutral-200 text-neutral-600',
    canceled: 'bg-rose-100 text-rose-700',
};

export const VISIT_LABEL: Record<string, string> = { visitFirst: '초진', visitAgain: '재진' };

export const STATUS_PICK: Record<ReservationStatus, { on: string; off: string }> = {
    pending: { on: 'bg-amber-500 text-white', off: 'border border-amber-300 text-amber-700 bg-white' },
    confirmed: { on: 'bg-blue-600 text-white', off: 'border border-blue-300 text-blue-700 bg-white' },
    done: { on: 'bg-neutral-600 text-white', off: 'border border-neutral-300 text-neutral-600 bg-white' },
    canceled: { on: 'bg-rose-500 text-white', off: 'border border-rose-300 text-rose-600 bg-white' },
};

export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
