/**
 * 시술 데이터 일괄 재등록.
 *
 *   1) 하루영 수가표.xlsx 를 CSV UTF-8 로 저장한다 (시트 1개, 3행 헤더부터)
 *   2) scripts/data/수가표.csv 로 넣는다
 *   3) ADMIN_FIREBASE_PASSWORD='관리자비밀번호' npm run seed
 *
 * npm run seed 는 백업 → 전체 재등록 → Zero Aging 추가를 순서대로 돌린다.
 *
 * CSV 헤더는 엑셀 그대로여야 한다.
 *   대분류 | 중분류 | 시술명 | 주요문장(볼드) | 각 시술 설명 | 정가 (원) | 비고
 *
 * '구분' 열은 선택이다. 있으면 섹션 제목이 '구분 - 중분류' 로 합쳐진다.
 * 제모처럼 같은 시술명이 여성·남성으로 두 벌 들어가는 카테고리에 쓴다.
 *
 * 기존 products 를 모두 지우고 새로 넣는다. 되돌릴 수 없다.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { collection, deleteDoc, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db, signInAdmin } from './firebase.mjs';

await signInAdmin();

const CSV_FILE = join(process.cwd(), 'scripts', 'data', '수가표.csv');

/**
 * 엑셀 대분류(영문) → 사이트 카테고리.
 * name 은 관리자 화면 표기용이라 src/constants/categories.ts 와 같은 값을 쓴다.
 */
const MENU = {
    'ZERO LIFTING': { slug: 'lifting', name: '리프팅' },
    'ZERO PIGMENTS': { slug: 'pigment', name: '색소치료' },
    'ZERO ACNE': { slug: 'acne', name: '여드름치료' },
    'ZERO FAT': { slug: 'body', name: '바디라인' },
    PETITE: { slug: 'petit', name: '쁘띠라인' },
    'SKIN CARE': { slug: 'care', name: '피부관리' },
    'IV THERAP': { slug: 'iv', name: '수액' },
    'IV THERAPY': { slug: 'iv', name: '수액' },
    'HAIR REMOVAL': { slug: 'hair', name: '제모' },
    'SKIN BOOSTERS': { slug: 'booster', name: '스킨부스터' },
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

const text = (await readFile(CSV_FILE, 'utf-8')).replace(/^﻿/, '');
const rows = parseCsv(text);
const head = rows[0].map((h) => h.trim());
const idx = (name) => {
    const i = head.indexOf(name);
    if (i === -1) throw new Error(`CSV 에 '${name}' 열이 없습니다. 헤더: ${head.join(' | ')}`);
    return i;
};
const [iMenu, iSub, iName, iHighlight, iDesc, iPrice] = [
    '대분류',
    '중분류',
    '시술명',
    '주요문장(볼드)',
    '각 시술 설명',
    '정가 (원)',
].map(idx);
/** 선택 열이라 없으면 -1 이고 중분류만 섹션 제목이 된다 */
const iGroup = head.indexOf('구분');

/** 엑셀 병합 셀은 첫 줄에만 값이 있다. 빈 칸은 위 값을 그대로 물려받는다 */
let lastMenu = '';
let lastGroup = '';
let lastSub = '';
let lastName = '';

const items = [];
const unknown = new Set();

rows.slice(1).forEach((r) => {
    const menuRaw = (r[iMenu] ?? '').trim();
    const groupRaw = iGroup === -1 ? '' : (r[iGroup] ?? '').trim();
    const subRaw = (r[iSub] ?? '').trim();
    const nameRaw = (r[iName] ?? '').trim();

    // 대분류가 바뀌면 앞 카테고리의 구분을 물려받지 않는다
    if (menuRaw && menuRaw !== lastMenu) lastGroup = '';
    if (menuRaw) lastMenu = menuRaw;
    if (groupRaw) lastGroup = groupRaw;
    if (subRaw) lastSub = subRaw;
    if (nameRaw) lastName = nameRaw;
    if (!lastName) return;

    const menu = MENU[lastMenu];
    if (!menu) {
        unknown.add(lastMenu);
        return;
    }

    items.push({
        menuSlug: menu.slug,
        menuCategory: menu.name,
        /** 페이지 안 섹션 제목. 구분이 있으면 '여성 제모 - 얼굴' 처럼 합친다 */
        subCategory: lastGroup ? `${lastGroup} - ${lastSub}` : lastSub,
        name: lastName,
        highlight: (r[iHighlight] ?? '').trim(),
        description: (r[iDesc] ?? '').trim(),
        price: num(r[iPrice]),
        order: items.length,
    });
});

if (unknown.size) throw new Error(`MENU 표에 없는 대분류: ${[...unknown].map((u) => `'${u}'`).join(', ')}`);

// 같은 카테고리·중분류 안에 이름이 겹치면 화면에서 구분이 안 된다. 등록은 하되 알려준다
const seen = new Map();
const dupes = [];
items.forEach((it) => {
    const key = `${it.menuSlug}|${it.subCategory}|${it.name}`;
    if (seen.has(key)) dupes.push(it);
    else seen.set(key, it);
});

const byMenu = items.reduce((acc, it) => ({ ...acc, [it.menuSlug]: (acc[it.menuSlug] ?? 0) + 1 }), {});
console.log('카테고리별 건수:', byMenu);
console.log(`총 ${items.length}건 / 가격 미입력 ${items.filter((i) => i.price === null).length}건`);

if (dupes.length) {
    console.log(`\n[확인 필요] 이름이 겹치는 ${dupes.length}건. 등록은 되지만 관리자에서 이름을 구분해 주세요.`);
    dupes.forEach((d) => console.log(`  ${d.menuCategory} > ${d.subCategory} > ${d.name} (${d.price ?? '가격문의'})`));
}

const col = collection(db, 'products');
const old = await getDocs(col);
console.log(`\n기존 ${old.size}건 삭제 중…`);
for (const d of old.docs) await deleteDoc(doc(db, 'products', d.id));

// writeBatch 는 한 번에 500 건까지다
for (let i = 0; i < items.length; i += 400) {
    const batch = writeBatch(db);
    items.slice(i, i + 400).forEach((it) => batch.set(doc(col), it));
    await batch.commit();
    console.log(`${Math.min(i + 400, items.length)} / ${items.length}`);
}

console.log(`\n완료. ${items.length}건 등록`);
process.exit(0);
