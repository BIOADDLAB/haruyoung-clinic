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
        description: '전용 필링으로 각질과 노폐물을 부드럽게 제거해 피부 턴오버를 정상화한 뒤, 개인 피부 상태에 맞춘 맞춤 관리를 이어서 진행하는 프로그램입니다. 반복적인 필링 사이클을 통해 노화로 둔해지고 칙칙해진 피부결을 점진적으로 정돈해, 맑고 어려 보이는 피부로 가꿔줍니다.',
        counts: [
            { label: '5회', price: 600000 },
            { label: '10회', price: 1000000 },
        ],
    },
    {
        sub: 'Week Young',
        highlight: '색소레이저(관리+색소/여드름/콜라겐토닝)',
        description: '색소 개선 레이저와 여드름 관리, 콜라겐토닝을 하나의 세션 안에 통합해 진행하는 프로그램으로, 칙칙한 톤과 트러블성 피부, 저하된 탄력을 동시에 케어합니다. 정기적인 회차 진행을 통해 색소침착 완화와 피부결 개선 효과가 누적되어, 맑고 매끈한 피부결을 완성해줍니다.',
        counts: [
            { label: '5회', price: 970000 },
            { label: '10회', price: 1890000 },
        ],
    },
    {
        sub: 'Month Young',
        highlight: '색소레이저+리프팅레이저+주름보톡스',
        description: '색소 개선 레이저와 리프팅 레이저, 표정 주름을 완화하는 보톡스까지 함께 진행하는 복합 프로그램입니다. 피부 톤 개선, 콜라겐 재생을 통한 탄력 리프팅, 표정 주름 완화가 유기적으로 작용해, 한 프로그램 안에서 탄력 있고 화사한 인상으로 변화를 만들어줍니다.',
        counts: [
            { label: '10회', price: 2500000 },
        ],
    },
    {
        sub: 'Year Young',
        highlight: '색소레이저+리프팅레이저+주름보톡스+주사(스킨부스터,물광,연어,색소)',
        description: '색소·리프팅·주름 케어에 스킨부스터, 물광주사, 연어주사, 색소 개선 주사까지 더한 최상위 통합 프로그램입니다. 레이저와 보톡스로 표면적인 톤·탄력·주름을 관리하는 동시에, 주사 시술로 진피층 깊은 곳까지 수분과 재생 성분을 채워, 속부터 겉까지 완성도 높은 동안 피부를 만들어줍니다.',
        counts: [
            { label: '10회', price: 3200000 },
        ],
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
