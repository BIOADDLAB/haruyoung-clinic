import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from './firebase';
import type { Column, ColumnSeed } from '@/types/column';

const col = collection(db, 'columns');

function sortByPublishedAt(list: Column[]) {
    // orderBy 를 쓰면 복합 색인이 필요해서 코드에서 정렬한다. 글 수가 적어 부담 없다
    return list.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

/** 관리자용 전체 목록 (임시저장 포함). Firestore 규칙상 관리자 로그인 상태여야 한다 */
export async function getColumns(): Promise<Column[]> {
    const snap = await getDocs(col);
    return sortByPublishedAt(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Column));
}

/** 공개 목록. 발행된 글만 — 규칙이 published==true 쿼리만 허용한다 */
export async function getPublishedColumns(): Promise<Column[]> {
    try {
        const snap = await getDocs(query(col, where('published', '==', true)));
        return sortByPublishedAt(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Column));
    } catch (e) {
        // 규칙 미배포·일시 장애 시 페이지 전체(빌드 포함)가 죽지 않도록 빈 목록으로 떨어뜨린다
        console.error('[columns] getPublishedColumns failed:', e);
        return [];
    }
}

/** slug 로 발행된 글 하나. 없거나 조회 실패면 null */
export async function getPublishedColumnBySlug(slug: string): Promise<Column | null> {
    try {
        const snap = await getDocs(query(col, where('published', '==', true), where('slug', '==', slug)));
        const d = snap.docs[0];
        return d ? ({ id: d.id, ...d.data() } as Column) : null;
    } catch (e) {
        console.error('[columns] getPublishedColumnBySlug failed:', e);
        return null;
    }
}

export async function addColumn(data: ColumnSeed): Promise<string> {
    const refDoc = await addDoc(col, data);
    return refDoc.id;
}

export async function updateColumn(id: string, data: Partial<ColumnSeed>) {
    await updateDoc(doc(db, 'columns', id), data);
}

/** 글에 딸린 Storage 이미지 URL 전부 — 대표 이미지 + 세 언어 본문(위지윅)에 삽입된 이미지 */
function collectColumnImageUrls(column: Column): string[] {
    const urls = new Set<string>();
    if (column.coverImage) urls.add(column.coverImage);
    for (const html of [column.content, column.en?.content, column.zh?.content]) {
        if (!html) continue;
        for (const m of html.matchAll(/<img[^>]+src="([^"]+)"/g)) {
            // Tiptap 이 속성 안의 & 를 &amp; 로 이스케이프한다
            urls.add(m[1].replace(/&amp;/g, '&'));
        }
    }
    // 우리 Storage 의 columns/ 경로 파일만 지운다 (외부 이미지 보호)
    return [...urls].filter((u) => u.includes('/o/columns%2F'));
}

/** 글과 딸린 이미지(대표·본문)를 함께 지운다 */
export async function deleteColumn(column: Column) {
    await deleteDoc(doc(db, 'columns', column.id));
    await Promise.all(collectColumnImageUrls(column).map((u) => deleteColumnImage(u)));
}

/** 대표 이미지·썸네일·본문 이미지 업로드. Storage 규칙의 columns/ 경로를 쓴다 */
export async function uploadColumnImage(file: File) {
    const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')).replace(/[^\w.]/g, '') : '';
    const path = `columns/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext || '.jpg'}`;
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file, { contentType: file.type || 'image/jpeg' });
    return getDownloadURL(fileRef);
}

/** 교체·삭제된 이미지를 Storage 에서 지운다. 이미 없으면 조용히 넘어간다 */
export async function deleteColumnImage(url: string) {
    if (!url.includes('/o/')) return;
    try {
        await deleteObject(ref(storage, url));
    } catch {}
}
