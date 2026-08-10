/**
 * 시술 데이터 일괄 등록.
 *
 *   1) 시술페이지-재분류.xlsx 를 시트별로 CSV UTF-8 로 저장한다
 *   2) scripts/data/ 에 넣는다. 파일명은 slug 여야 한다
 *      lifting.csv  pigment.csv  acne.csv    petit.csv
 *      booster.csv  care.csv     hair.csv    body.csv
 *   3) node scripts/backup-products.mjs   ← 먼저 백업
 *   4) node scripts/seed-products.mjs
 *
 * CSV 헤더는 엑셀 그대로여야 한다.
 *   새 대분류 | 중분류 | 시술명 | 주요문장(볼드) | 각 시술 설명 | 정가 (원) | 현재 대분류
 *
 * 기존 products 를 모두 지우고 새로 넣는다. 되돌릴 수 없다.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { initializeApp } from 'firebase/app';
import { collection, deleteDoc, doc, getDocs, getFirestore, writeBatch } from 'firebase/firestore';

const app = initializeApp({
    apiKey: 'AIzaSyCkn1jYr3-SaLypMjmJjp7WYg9Xlr70rGQ',
    authDomain: 'haruyoungclinic.firebaseapp.com',
    projectId: 'haruyoungclinic',
    storageBucket: 'haruyoungclinic.firebasestorage.app',
    messagingSenderId: '463252084085',
    appId: '1:463252084085:web:c0f43e3ecd63a58fc82f3c',
});
const db = getFirestore(app);

const MENU = {
    lifting: '리프팅',
    pigment: '색소치료',
    acne: '여드름치료',
    petit: '쁘띠라인',
    booster: '스킨부스터',
    care: '피부관리·수액',
    hair: '제모',
    body: '바디라인',
};

/** 따옴표 안의 쉼표·줄바꿈까지 다루는 최소 CSV 파서 */
function parseCsv(text) {
    const rows = [];
    let row = [];
    let cell = '';
    let quoted = false;

    for (let i = 0; i < text.length; i += 1) {
        const c = text[i];
        if (quoted) {
            if (c === '"' && text[i + 1] === '"') {
                cell += '"';
                i += 1;
            } else if (c === '"') quoted = false;
            else cell += c;
            continue;
        }
        if (c === '"') quoted = true;
        else if (c === ',') {
            row.push(cell);
            cell = '';
        } else if (c === '\n') {
            row.push(cell);
            rows.push(row);
            row = [];
            cell = '';
        } else if (c !== '\r') cell += c;
    }
    if (cell || row.length) {
        row.push(cell);
        rows.push(row);
    }
    return rows.filter((r) => r.some((v) => v.trim()));
}

const num = (v) => {
    const n = Number(String(v).replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) && n > 0 ? n : null;
};

const dir = join(process.cwd(), 'scripts', 'data');
const files = (await readdir(dir)).filter((f) => f.endsWith('.csv'));
if (files.length === 0) throw new Error('scripts/data 에 csv 가 없습니다.');

const items = [];
for (const f of files) {
    const slug = f.replace('.csv', '');
    if (!MENU[slug]) throw new Error(`파일명이 slug 와 다릅니다: ${f}`);

    const rows = parseCsv(await readFile(join(dir, f), 'utf-8'));
    const head = rows[0].map((h) => h.trim());
    const idx = (name) => head.indexOf(name);

    rows.slice(1).forEach((r) => {
        const name = (r[idx('시술명')] ?? '').trim();
        if (!name) return;
        items.push({
            menuSlug: slug,
            menuCategory: MENU[slug],
            mainCategory: (r[idx('새 대분류')] ?? '').trim(),
            subCategory: (r[idx('중분류')] ?? '').trim(),
            name,
            highlight: (r[idx('주요문장(볼드)')] ?? '').trim(),
            description: (r[idx('각 시술 설명')] ?? '').trim(),
            price: num(r[idx('정가 (원)')]),
            order: items.length,
        });
    });
}

const col = collection(db, 'products');
const old = await getDocs(col);
console.log(`기존 ${old.size}건 삭제 중…`);
for (const d of old.docs) await deleteDoc(doc(db, 'products', d.id));

// writeBatch 는 한 번에 500 건까지다
for (let i = 0; i < items.length; i += 400) {
    const batch = writeBatch(db);
    items.slice(i, i + 400).forEach((it) => batch.set(doc(col), it));
    await batch.commit();
    console.log(`${Math.min(i + 400, items.length)} / ${items.length}`);
}

console.log(`완료. ${items.length}건 등록`);
process.exit(0);
