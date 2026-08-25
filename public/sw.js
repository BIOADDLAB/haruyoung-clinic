self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

/** Chrome 설치 조건용. 페이지를 캐시하지 않아 프로모션·팝업이 옛 화면으로 남지 않는다 */
self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request));
});
