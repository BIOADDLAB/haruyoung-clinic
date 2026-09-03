/**
 * 같은 시술명이 용량·회차만 다른 카드로 쪼개진 것을 한 장으로 합친다.
 *
 *   ADMIN_FIREBASE_PASSWORD='관리자비밀번호' node scripts/merge-product-tiers.mjs
 *
 * 이미 priceTiers 가 있는 카드는 건드리지 않는다.
 */
import { collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db, signInAdmin } from './firebase.mjs';

await signInAdmin();

const snap = await getDocs(collection(db, 'products'));
const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

function parseAmount(raw) {
    const m = String(raw ?? '').match(/[\d.]+/);
    const n = m ? Number(m[0]) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
}

function suffixOf(name) {
    const m = String(name).match(/\s+(\d+(?:\.\d+)?\s*cc(?:\s*\/\s*\d+\s*회)?|\d+\s*회)\s*$/i);
    return m ? m[1].replace(/\s+/g, ' ').trim() : '';
}

function baseName(name) {
    return String(name)
        .replace(/\s+(\d+(?:\.\d+)?\s*cc(?:\s*\/\s*\d+\s*회)?|\d+\s*회)\s*$/i, '')
        .replace(/\s+/g, ' ')
        .trim();
}

const groups = new Map();

for (const p of products) {
    if (p.priceTiers?.length) continue;
    const key = `${p.menuSlug}|${p.subCategory}|${p.name}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
}

/** 이름은 같고 하이라이트만 다른 카드 */
const sameName = [...groups.values()].filter((arr) => arr.length > 1);

/** 이름 끝에 2cc / 5회 만 다른 카드 */
const byBase = new Map();
for (const p of products) {
    if (p.priceTiers?.length) continue;
    const rest = suffixOf(p.name);
    if (!rest) continue;
    const key = `${p.menuSlug}|${p.subCategory}|${baseName(p.name)}`;
    if (!byBase.has(key)) byBase.set(key, []);
    byBase.get(key).push(p);
}
const suffixName = [...byBase.values()].filter((arr) => {
    if (arr.length < 2) return false;
    const names = new Set(arr.map((p) => p.name));
    return names.size > 1;
});

const seen = new Set();
const jobs = [];
for (const arr of [...sameName, ...suffixName]) {
    const ids = arr.map((p) => p.id).sort().join(',');
    if (seen.has(ids)) continue;
    seen.add(ids);
    jobs.push(arr);
}

function tierFrom(p, fromName) {
    const label = (fromName ? suffixOf(p.name) : '') || String(p.highlight ?? '').trim() || `${p.price ?? ''}원`;
    const row = {
        sessions: parseAmount(label),
        label,
        price: p.price ?? null,
    };
    if (p.priceEn != null) row.priceEn = p.priceEn;
    if (p.priceZh != null) row.priceZh = p.priceZh;
    return row;
}

let updated = 0;
let removed = 0;

for (const arr of jobs) {
    arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const fromName = new Set(arr.map((p) => p.name)).size > 1;
    const keeper = arr[0];
    const extras = arr.slice(1);
    const priceTiers = arr.map((p) => tierFrom(p, fromName));
    const first = priceTiers[0];

    const patch = {
        name: fromName ? baseName(keeper.name) : keeper.name,
        priceTiers,
        price: first?.price ?? keeper.price ?? null,
        highlight: '',
        highlightEn: '',
        highlightZh: '',
    };
    if (first?.priceEn != null) patch.priceEn = first.priceEn;
    if (first?.priceZh != null) patch.priceZh = first.priceZh;

    await updateDoc(doc(db, 'products', keeper.id), patch);
    updated += 1;
    console.log(`KEEP ${keeper.id}  ${patch.name}  ← ${arr.length}장`);
    for (const t of priceTiers) console.log(`     ${t.label}  ${t.price}`);

    for (const extra of extras) {
        await deleteDoc(doc(db, 'products', extra.id));
        removed += 1;
        console.log(` DEL  ${extra.id}`);
    }
}

console.log(`\n합침 ${jobs.length}그룹 / 유지 ${updated} / 삭제 ${removed}`);
process.exit(0);
