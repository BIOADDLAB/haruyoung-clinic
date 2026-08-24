export {};

declare global {
    interface Window {
        naver?: {
            maps: {
                Map: new (
                    el: HTMLElement,
                    opts: {
                        center: unknown;
                        zoom?: number;
                        scaleControl?: boolean;
                        mapDataControl?: boolean;
                        logoControl?: boolean;
                    },
                ) => { autoResize: () => void };
                LatLng: new (lat: number, lng: number) => unknown;
                Marker: new (opts: { position: unknown; map: unknown; title?: string }) => unknown;
                Event: {
                    addListener: (target: unknown, event: string, handler: () => void) => unknown;
                };
            };
        };
    }
}
