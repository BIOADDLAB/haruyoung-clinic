type EquipmentDevice = {
    key: string;
    image: string;
};

type EquipmentSection = {
    id: string;
    english: string;
    keywords: string;
    photo: string;
    devices: readonly EquipmentDevice[];
};

// 이미지 파일명과 섹션 순서는 장비소개 시안 기준입니다.
export const EQUIPMENT_SECTIONS = [
    {
        id: 'skin',
        english: 'Skin & Body Diagnosis',
        keywords: 'Monitoring · Composition · Balance',
        photo: 'img-equ-skin-01.jpg',
        devices: [
            { key: 'metavu', image: 'img-equ-skin-02.png' },
            { key: 'inbody', image: 'img-equ-skin-03.png' },
        ],
    },
    {
        id: 'redness',
        english: 'Redness · Pigmentation',
        keywords: 'Calming · Tone · Clarity',
        photo: 'img-equ-redness-01.jpg',
        devices: [
            { key: 'selectv', image: 'img-equ-redness-02.png' },
            { key: 'clarity', image: 'img-equ-redness-03.png' },
            { key: 'picosure', image: 'img-equ-redness-04.png' },
            { key: 'picoplus', image: 'img-equ-redness-05.png' },
        ],
    },
    {
        id: 'scar',
        english: 'Scar · Pore Care',
        keywords: 'Texture · Regeneration · Refinement',
        photo: 'img-equ-scar-01.jpg',
        devices: [
            { key: 'neobeam', image: 'img-equ-scar-02.png' },
            { key: 'dermashine', image: 'img-equ-scar-03.png' },
            { key: 'upulse', image: 'img-equ-scar-04.png' },
            { key: 'potenza', image: 'img-equ-scar-05.png' },
            { key: 'picosure', image: 'img-equ-scar-06.png' },
            { key: 'picoplus', image: 'img-equ-scar-07.png' },
        ],
    },
    {
        id: 'tight',
        english: 'Tightening · Lifting',
        keywords: 'Firmness · Elasticity · Contour',
        photo: 'img-equ-tight-01.jpg',
        devices: [
            { key: 'density', image: 'img-equ-tight-02.png' },
            { key: 'linearz', image: 'img-equ-tight-03.png' },
            { key: 'thermage', image: 'img-equ-tight-04.png' },
            { key: 'ultherapyprime', image: 'img-equ-tight-05.png' },
            { key: 'inmode', image: 'img-equ-tight-06.png' },
            { key: 'fascella', image: 'img-equ-tight-07.png' },
        ],
    },
    {
        id: 'sooth',
        english: 'Soothing · Regeneration',
        keywords: 'Calming · Renewal · Texture',
        photo: 'img-equ-sooth-01.jpg',
        devices: [
            { key: 'astrodome', image: 'img-equ-sooth-02.png' },
            { key: 'clarity', image: 'img-equ-sooth-03.png' },
        ],
    },
    {
        id: 'mole',
        english: 'Mole · Wart Removal',
        keywords: 'Precision · Safety · Recovery',
        photo: 'img-equ-mole-01.jpg',
        devices: [{ key: 'upulse', image: 'img-equ-mole-02.png' }],
    },
    {
        id: 'body',
        english: 'Body Contouring',
        keywords: 'Shape · Firmness · Balance',
        photo: 'img-equ-body-01.jpg',
        devices: [
            { key: 'fascella', image: 'img-equ-body-02.png' },
            { key: 'inmodebody', image: 'img-equ-body-04.png' },
        ],
    },
] as const satisfies readonly EquipmentSection[];

export type { EquipmentSection };
