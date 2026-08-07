import { useSyncExternalStore } from 'react';

const noopSubscribe = () => () => {};

/** 서버에서 false, 클라이언트에서 true. effect·setState 없이 마운트를 판정한다 */
export function useMounted() {
    return useSyncExternalStore(
        noopSubscribe,
        () => true,
        () => false,
    );
}
