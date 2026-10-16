# 하루영의원 홈페이지 수정 내역 — 2026-10-08

1. ✅ 피부 건강 칼럼 게시판 신설
2. ✅ 사이트맵 보강 (칼럼 연동 + `lastModified`)

모든 개발·테스트는 **별도 테스트용 Firebase 프로젝트(`haruyoung-macrak`)** 에서 진행했습니다.
git에 푸시하고 적용하기 전에 운영계정이 사용하는 Firebase 설정을 동일하게 맞춰야 됩니다.

> ⚠️ **지금 바로 해주셔야 할 일: 아래 "1. 운영 Firebase 계정으로 선행 할 작업내용"만 먼저 완료해 주세요. 완료 확인되는 대로 git에 푸시하겠습니다.**


---

새로 생성된 url

- `/column` — 칼럼 공개 목록, `/column/[slug]` — 상세 페이지
- `/admin/columns` — 관리자 칼럼 관리 (로그인 필요)
- AI 번역 기능까지 포함해 정상 동작 확인됨

---

## 1. 운영 Firebase 계정으로 선행 할 작업내용

### 1-1. Firestore 보안 규칙 배포
Firebase 콘솔 → Firestore Database → 규칙 탭에 아래 내용을 통째로 붙여넣고 게시 (`columns` 컬렉션 규칙이 오늘 새로 추가된 부분이고, 나머지는 기존 규칙 그대로입니다)

```
rules_version = '2';

// firebase deploy --only firestore:rules --project haruyoungclinic
// 콘솔에서만 고치면 이 파일과 어긋나니, 규칙은 여기서 고친 뒤 배포한다.
service cloud.firestore {
  match /databases/{database}/documents {

    // 관리자 계정 UID. Authentication > Users 의 admin@haruyoung.local 행에서 복사한 값
    // 일반 회원도 Firebase Auth 로 로그인하므로(아이디@haruyoung.local),
    // request.auth != null 로 막으면 회원 아무나 통과한다. 반드시 UID 로 본다.
    function isAdmin() {
      return request.auth != null && request.auth.uid == '3zaErqhP1rNXzG9V9MCQc2jSTLw1';
    }

    // 사이트 설정 (메인 배너, 프로모션 배너, 팝업, 전후사진, 예약 시간)
    match /settings/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 수가표
    match /products/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 프로모션
    match /promotions/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 프로모션 카테고리
    match /promotionCategories/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 피부 건강 칼럼. 발행된 글만 공개 조회 가능하다.
    // 공개 측 쿼리는 반드시 where('published','==',true) 를 포함해야 통과한다.
    match /columns/{id} {
      allow read: if resource.data.published == true || isAdmin();
      allow write: if isAdmin();
    }

    // 예약은 쓰기만 열고 읽기는 관리자만
    match /reservations/{id} {
      allow create: if request.resource.data.status == 'pending'
                 && request.resource.data.keys().hasAll(['name','phone','date','time','createdAt']);
      allow read, update, delete: if isAdmin();
    }

    // 30분 칸 점유. 시각만 공개하고 예약자 정보는 넣지 않는다.
    // 같은 id 를 두 번 만들 수 없어서 겹치는 예약을 막는다.
    match /reservationSlots/{id} {
      allow read: if true;
      allow create: if request.resource.data.keys().hasAll(['date', 'time'])
                 && request.resource.data.date is string
                 && request.resource.data.time is string;
      allow update, delete: if isAdmin();
    }

    // 회원. 문서 id 는 Firebase Auth uid 다
    match /members/{uid} {
      allow create: if request.auth != null && request.auth.uid == uid;
      allow get: if request.auth != null && (request.auth.uid == uid || isAdmin());

      // 회원 목록 조회는 관리자만. 이름·전화번호가 담긴 개인정보다.
      // 아이디 중복은 가입 때 Firebase Auth 가 막으므로 목록을 열 필요가 없다.
      allow list: if isAdmin();

      allow update: if request.auth != null && (request.auth.uid == uid || isAdmin());
      allow delete: if false;
    }
  }
}
```

### 1-2. Storage 보안 규칙 게시
Firebase 콘솔 → Storage → 규칙 탭에 아래 내용을 통째로 붙여넣고 게시

```
rules_version = '2';

// Firebase 콘솔 > Storage > 규칙 에 통째로 붙여넣고 게시한다.
// 이 파일은 콘솔 내용과 항상 같게 유지한다.
service firebase.storage {
  match /b/{bucket}/o {
    function isAdmin() {
      return request.auth != null && request.auth.uid == '3zaErqhP1rNXzG9V9MCQc2jSTLw1';
    }

    // 팝업·전후사진 등 관리자가 올리는 이미지
    match /popups/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 칼럼 대표 이미지·본문 이미지
    match /columns/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

---

## 2. 피부 건강 칼럼 게시판 신설

### 기능 요약
- 관리자(`/admin/columns`)에서 Tiptap 위지윅 에디터로 **한국어 원문**을 작성·발행
- "AI 번역 생성" 버튼으로 **Gemini(Firebase AI Logic)** 가 영어·중국어 초안을 생성
- 번역은 **"검수 완료" 체크를 해야만** 해당 언어 페이지가 공개됨 (AI 초안 상태는 절대 비공개)
- 카테고리는 기존 진료 카테고리(`MENU_CATEGORIES`)를 그대로 사용 — 전후사진 관리와 동일한 분류, 화면 표기도 관리자 화면과 통일

### 신규 파일
| 파일 | 설명 |
|---|---|
| `src/types/column.ts` | 칼럼 타입, 언어별 공개 판정 로직 |
| `src/lib/columns.ts` | Firestore CRUD + Storage 업로드/삭제 |
| `src/lib/columnAi.ts` | Gemini 번역·slug 제안·요약 생성 |
| `src/components/column/columnHtml.ts` | 본문 HTML 공통 스타일 (관리자·공개 화면 공용) |
| `src/app/admin/(protected)/columns/page.tsx` | 관리자 칼럼 목록 |
| `src/app/admin/(protected)/columns/ColumnForm.tsx` | 작성·수정 폼 (언어 탭, AI 번역/검수 UI) |
| `src/app/admin/(protected)/columns/ColumnEditor.tsx` | Tiptap 에디터 컴포넌트 |
| `src/app/[locale]/column/page.tsx` | 공개 목록 페이지 |
| `src/app/[locale]/column/[slug]/page.tsx` | 공개 상세 페이지 |

### 수정 파일 (칼럼 관련)
| 파일 | 변경 내용 |
|---|---|
| `firestore.rules` | `columns` 컬렉션 규칙 추가 (발행글만 공개 읽기, 쓰기는 관리자만) |
| `storage.rules` | `columns/` 이미지 경로 쓰기 허용 추가 |
| `src/app/admin/(protected)/nav.ts` | "칼럼 관리" 메뉴 추가 |
| `src/components/layout/SubNav.tsx` | 칼럼 전용 좌측 카테고리 내비게이션(`ColumnNav`) 추가 |
| `src/constants/categories.ts` | `adminCategoryName` 헬퍼 추가 (한국어 화면 카테고리명 통일용) |
| `src/data/site.ts` | 헤더 메뉴에 "COLUMN" 그룹 추가 |
| `src/lib/firebase.ts` | `NEXT_PUBLIC_FIREBASE_*` 환경변수가 있으면 우선 사용하도록 변경 (테스트 프로젝트 전환용, 운영엔 영향 없음) |
| `src/lib/schema.ts` | 칼럼 상세용 `Article` + `BreadcrumbList` JSON-LD 스키마 추가 |
| `src/lib/seo.ts` | 칼럼 언어별 hreflang 생성 헬퍼(`getColumnLanguageAlternates`) 추가 |
| `src/messages/{ko,en,zh}.json` | 칼럼 관련 번역 문구 추가 |
| `package.json` / `package-lock.json` | `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image` 추가 |

---

## 3. 사이트맵 보강

`src/app/sitemap.ts`를 비동기로 변경:
- 발행된 칼럼을 자동으로 사이트맵에 추가 (검수 완료된 언어만, 상세 페이지와 동일한 hreflang 로직 공유)
- 칼럼 글: `lastModified` = 글의 수정일
- 칼럼 목록(`/column`): `lastModified` = 가장 최근 수정된 공개 글의 날짜
- 정적 페이지·시술 카테고리: 실제 수정일 추적이 없어 사이트맵 생성(배포) 시각을 사용
- `revalidate = 300` 추가 — 기존엔 빌드 시 1회만 생성되는 완전 정적 라우트라 새 글이 발행돼도 다음 배포 전까지 반영되지 않았음

---

## 4. 운영 서버 적용(배포) 후 AI 번역 기능을 위해 해야 할 일

> 아래 작업은 Firebase·Google Cloud 콘솔과 ai.studio에서 진행하는 설정이라 코드와는 무관합니다.

1. 콘솔 → **AI Logic** → **Gemini Developer API** 활성화
2. **App Check** → 앱 탭 → haruyoung 웹 앱 → **"+ Fraud Defense(이전 명칭: reCAPTCHA Enterprise)"** 선택해 등록 진행하다 보면 사이트 키 넣는 부분이 나옵니다.
   - 사이트 키 생성: [Google Cloud Console의 reCAPTCHA 페이지](https://console.cloud.google.com/security/recaptcha)에서 **플랫폼 유형: 웹사이트**, 도메인 목록에 `haruyoung.com`, `localhost` 추가, 나머지 설정은 그대로 두고 다음 단계로 진행해 키 ID를 발급받습니다.
   - 발급받은 키 ID를 위 Fraud Defense 등록 화면("reCAPTCHA Enterprise 사이트 키" 입력란)에 붙여넣고 저장합니다.
   - 같은 키 ID를 배포 환경 변수(예시: Vercel 등) `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`에도 설정합니다 (이 값은 공개되어도 되는 값입니다 — 클라이언트 번들에 그대로 노출됩니다). **이 환경 변수가 없으면 App Check가 초기화되지 않고, "적용됨" 상태인 API(AI Logic 등)는 전부 요청이 거부됩니다.**
3. 같은 화면의 **API 탭**에서 "Firebase AI Logic" 행을 **"적용됨"**(기본·재생 모두)으로 설정
   - 코드가 `firebase/app-check`(Fraud Defense)로 App Check를 초기화하고, Gemini 호출에 `useLimitedUseAppCheckTokens: true`를 적용해 "재생 보호"와도 호환되도록 구현되어 있습니다.
   - 설정 변경(등록·적용 상태 전환) 직후에는 전파에 몇 분 정도 걸릴 수 있습니다.
4. [https://ai.studio/projects](https://ai.studio/projects) 에서 결제 수단 등록 + 크레딧 충전
   - Gemini API는 선불 크레딧제입니다. 최소 $10 권장 (Flash 모델 기준 칼럼 1건 번역에 수 원 수준이라 매우 오래 사용 가능)
   - 사용 모델: `gemini-3.8-flash` (`src/lib/columnAi.ts`의 `MODEL` 상수)

> 참고: 코드를 로컬(`npm run dev`)에서 직접 실행해 테스트할 때는 위 reCAPTCHA 대신 **디버그 토큰**이 쓰입니다. 처음 실행하면 브라우저 콘솔에 토큰이 출력되는데, App Check → 앱 → ⋮ 메뉴 → "디버그 토큰 관리"에서 **"이름"**과 **"값"** 칸을 정확히 구분해 등록해야 합니다(이름 칸에 토큰을 넣는 실수를 주의).

---

## 5. 배포 후 확인 체크리스트

- [ ] `/column` 접속 시 정상 표시되는지 (처음엔 글이 없어 빈 목록이 정상)
- [ ] `/admin/columns`에서 새 칼럼 작성 → 저장 → 발행 테스트
- [ ] 대표 이미지·본문 이미지 업로드 정상 동작 (Storage 규칙 배포 후)
- [ ] AI 번역·slug 자동 제안·요약 AI 작성 정상 동작 (4번 섹션 설정 완료 후)
- [ ] 글 삭제 시 이미지도 함께 지워지는지
- [ ] `/sitemap.xml`에 칼럼 URL이 반영되는지
- [ ] (선택) 구글 서치콘솔·네이버 서치어드바이저에 사이트맵 재제출
- [ ] package.json 에 위지윅에디터 관련 설치가 있어 최초 업데이트 후 npm install 필요

---

## 6. 알려진 제약·참고사항

- 글 목록 조회가 전체 로딩 방식이라, 칼럼이 매우 많아지면(수백 건) 관리자 목록·사이트맵 생성 속도에 영향이 있을 수 있습니다. 당장은 문제없는 수준입니다.
- App Check(Fraud Defense)가 "적용됨"으로 설정되어 있어 등록된 도메인 외에서는 AI Logic 호출이 거부됩니다. 운영 배포 도메인이 바뀌거나 새 환경(스테이징 등)을 추가하면 reCAPTCHA Enterprise 키의 허용 도메인 목록에도 추가해야 합니다.
- 대표 이미지를 교체한 뒤 저장하지 않고 취소하면, 이전 이미지 파일이 Storage에 고아 파일로 남을 수 있습니다(발행된 글이 깨지는 것을 막기 위한 의도적 설계). Storage 비용에 큰 영향은 없습니다.
