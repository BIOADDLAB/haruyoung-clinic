/**
 * products 컬렉션을 JSON 으로 내려받는다. 시드 전에 반드시 한 번 돌린다.
 *
 *   node scripts/backup-products.mjs
 *
 * 결과: products-backup-YYYYMMDD-HHmm.json
 */
import { writeFile } from 'node:fs/promises';
import { initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore } from 'firebase/firestore';

const app = initializeApp({
    apiKey: 'AIzaSyCkn1jYr3-SaLypMjmJjp7WYg9Xlr70rGQ',
    authDomain: 'haruyoungclinic.firebaseapp.com',
    projectId: 'haruyoungclinic',
    storageBucket: 'haruyoungclinic.firebasestorage.app',
    messagingSenderId: '463252084085',
    appId: '1:463252084085:web:c0f43e3ecd63a58fc82f3c',
});

const snap = await getDocs(collection(getFirestore(app), 'products'));
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
