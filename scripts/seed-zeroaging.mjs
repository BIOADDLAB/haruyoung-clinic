/**
 * Zero Aging Project 시술카드를 등록한다.
 *
 *   ADMIN_FIREBASE_PASSWORD='관리자비밀번호' npm run seed
 *
 * seed-products.mjs 가 products 를 통째로 비우므로 반드시 그 다음에 실행한다.
 *
 * menuSlug 가 zeroaging 인 문서를 모두 지우고 아래 목록으로 다시 넣는다.
 * 여러 번 돌려도 결과가 같다. 등록 후 문구·가격은 관리자 > 수가표 관리에서 고친다.
 */
import { collection, deleteDoc, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db, signInAdmin } from './firebase.mjs';

await signInAdmin();

const MENU_SLUG = 'zeroaging';
const MENU_CATEGORY = 'Zero Aging Project';

/** 회차를 개별 카드로 나눈다. price 가 null 이면 화면에 '가격 문의' 로 나온다 */
const ITEMS = [
    {
        sub: 'Day Young',
        highlight: '관리(필링+관리)',
        description: '아스트로돔, LDM 포함',
        counts: [
            { label: '5회', price: null },
            { label: '10회', price: 1000000 },
        ],
    },
    {
        sub: 'Week Young',
        highlight: '색소레이저(관리+색소/여드름/제네시스 레이저)',
        description: '',
        counts: [
            { label: '5회', price: 970000 },
            { label: '10회', price: 1890000 },
        ],
    },
    {
        sub: 'Month Young',
        highlight: '색소레이저+리프팅레이저+주름보톡스',
        description: '주름보톡스 최소 2회, 리프팅시술 최소 3회',
        counts: [{ label: '10회', price: 2500000 }],
    },
    {
        sub: 'Year Young',
        highlight: '색소레이저+리프팅레이저+주름보톡스+주사(스킨부스터, 물광 등)',
        description: '10회 중 주름보톡스 최소 2회, 주사시술 최소 3회, 리프팅 시술 최소 4회',
        counts: [{ label: '10회', price: 3200000 }],
    },
];

const rows = ITEMS.flatMap((item) =>
    item.counts.map((c) => ({
        menuSlug: MENU_SLUG,
        menuCategory: MENU_CATEGORY,
        subCategory: item.sub,
        name: `${item.sub} ${c.label}`,
        highlight: item.highlight,
        description: item.description,
        price: c.price,
    })),
).map((row, index) => ({ ...row, order: index }));

const col = collection(db, 'products');
const snap = await getDocs(col);
const old = snap.docs.filter((d) => d.data().menuSlug === MENU_SLUG);

console.log(`기존 ${old.length}건 삭제 중…`);
for (const d of old) await deleteDoc(doc(db, 'products', d.id));

const batch = writeBatch(db);
rows.forEach((row) => batch.set(doc(col), row));
await batch.commit();

console.log(`완료. ${rows.length}건 등록`);
process.exit(0);
