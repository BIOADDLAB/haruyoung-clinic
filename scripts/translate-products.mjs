/**
 * 시술 한국어는 그대로 두고, 영·중문 필드만 Firestore 에 채운다.
 *
 * 쓰기는 Firebase CLI 로그인(프로젝트 소유자) 토큰으로 한다. 보안 규칙의 관리자 UID 가 아니어도
 * Cloud Firestore API 는 콘솔과 같이 규칙을 우회한다.
 */
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { SUB, NAME, HIGHLIGHT } from './data/product-i18n-short.mjs';
import { DESC as DESC_A } from './data/product-i18n-desc-a.mjs';
import { DESC_B } from './data/product-i18n-desc-b.mjs';
import { DESC_C } from './data/product-i18n-desc-c.mjs';

const PROJECT = 'haruyoungclinic';
const FIREBASE_TOOLS = join(homedir(), '.config/configstore/firebase-tools.json');
const CLIENT_ID = '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
const CLIENT_SECRET = 'jEQUL7WUnb0BAYE8I1MWpEgB';

function toMap(rows) {
    const m = new Map();
    for (const [ko, en, zh] of rows) {
        m.set(norm(ko), { en, zh });
    }
    return m;
}

function norm(s) {
    return String(s ?? '')
        .replace(/\r\n/g, '\n')
        .trim()
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n[ \t]+/g, '\n')
        .replace(/[ \t]{2,}/g, ' ');
}

const maps = {
    subCategory: toMap(SUB),
    name: toMap(NAME),
    highlight: toMap(HIGHLIGHT),
    description: toMap([...DESC_A, ...DESC_B, ...DESC_C]),
};

function lookup(kind, raw) {
    const n = norm(raw);
    if (!n) return { en: '', zh: '' };
    const hit = maps[kind].get(n);
    if (!hit) return null;
    return hit;
}

async function accessToken() {
    const cfg = JSON.parse(await readFile(FIREBASE_TOOLS, 'utf8'));
    const tokens = cfg.tokens ?? {};
    if (tokens.access_token && tokens.expires_at && Date.now() < tokens.expires_at - 60_000) {
        return tokens.access_token;
    }
    const body = new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: tokens.refresh_token,
        grant_type: 'refresh_token',
    });
    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });
    if (!res.ok) throw new Error(`토큰 갱신 실패 ${res.status}`);
    const json = await res.json();
    return json.access_token;
}

function strField(v) {
    return { stringValue: v ?? '' };
}

const products = JSON.parse(await readFile('scripts/data/products-live.json', 'utf8'));
const missing = { subCategory: new Set(), name: new Set(), highlight: new Set(), description: new Set() };
const writes = [];

for (const p of products) {
    const fields = {};
    const mask = [];
    for (const kind of ['subCategory', 'name', 'highlight', 'description']) {
        const raw = p[kind] ?? '';
        if (!norm(raw)) continue;
        const hit = lookup(kind, raw);
        if (!hit) {
            missing[kind].add(norm(raw));
            continue;
        }
        const enKey = `${kind}En`;
        const zhKey = `${kind}Zh`;
        fields[enKey] = strField(hit.en);
        fields[zhKey] = strField(hit.zh);
        mask.push(enKey, zhKey);
    }
    if (!mask.length) continue;
    writes.push({
        update: {
            name: `projects/${PROJECT}/databases/(default)/documents/products/${p.id}`,
            fields,
        },
        updateMask: { fieldPaths: mask },
        updateTransforms: [],
    });
}

const missCount = Object.values(missing).reduce((n, s) => n + s.size, 0);
if (missCount) {
    console.error('번역이 비는 문구가 있어 저장을 멈춥니다.');
    for (const [kind, set] of Object.entries(missing)) {
        if (!set.size) continue;
        console.error(`\n[${kind}] ${set.size}`);
        for (const s of set) console.error('---\n' + s);
    }
    process.exit(1);
}

const token = await accessToken();
const chunk = 40;
let done = 0;
for (let i = 0; i < writes.length; i += chunk) {
    const slice = writes.slice(i, i + chunk);
    const res = await fetch(
        `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents:batchWrite`,
        {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ writes: slice }),
        },
    );
    const json = await res.json();
    if (!res.ok) {
        console.error(JSON.stringify(json, null, 2));
        process.exit(1);
    }
    const failed = (json.writeResults ?? []).filter((r, idx) => json.status?.[idx]);
    if (json.status) {
        const err = json.status.find((s) => s && Number(s.code) > 0);
        if (err) {
            console.error(JSON.stringify(json.status, null, 2).slice(0, 2000));
            process.exit(1);
        }
    }
    done += slice.length;
    console.log(`${done}/${writes.length}`);
}

console.log(`완료. ${writes.length}건 영·중문 필드 저장 (한국어 원문은 유지).`);
process.exit(0);
