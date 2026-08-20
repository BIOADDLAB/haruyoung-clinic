/**
 * products 컬렉션을 JSON 으로 내려받는다. 시드 전에 반드시 한 번 돌린다.
 *
 *   node scripts/backup-products.mjs
 *
 * 결과: products-backup-YYYYMMDD-HHmm.json
 */
import { writeFile } from 'node:fs/promises';
import { collection, getDocs } from 'firebase/firestore';
import { db, signInAdmin } from './firebase.mjs';

await signInAdmin();

const snap = await getDocs(collection(db, 'products'));
const d = new Date();
const p = (n) => String(n).padStart(2, '0');
const file = `products-backup-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.json`;

await writeFile(
    file,
    JSON.stringify(
        snap.docs.map((x) => ({ id: x.id, ...x.data() })),
        null,
        2,
    ),
    'utf-8',
);
console.log(`${snap.size}건 저장 → ${file}`);
process.exit(0);
