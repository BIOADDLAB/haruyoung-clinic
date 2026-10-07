/**
 * 칼럼 본문 HTML 공통 스타일.
 * 관리자 에디터와 공개 상세 페이지가 같은 클래스를 써서 작성 화면과 실제 화면이 일치한다.
 * 타이포그래피 플러그인 없이 Tailwind 자손 선택자로 구성한다.
 */
export const COLUMN_HTML_CLASS = [
    'text-dark leading-[1.9] text-body',
    '[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-20 [&_h2]:font-bold lg:[&_h2]:text-24',
    '[&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-18 [&_h3]:font-semibold lg:[&_h3]:text-20',
    '[&_p]:my-3',
    '[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6',
    '[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6',
    '[&_li]:my-1',
    '[&_blockquote]:my-5 [&_blockquote]:border-l-2 [&_blockquote]:border-tan [&_blockquote]:pl-4 [&_blockquote]:text-dark/70',
    '[&_a]:underline [&_a]:underline-offset-2',
    '[&_img]:my-5 [&_img]:max-w-full [&_img]:rounded-lg',
    '[&_hr]:my-8 [&_hr]:border-beige',
    '[&_strong]:font-bold',
].join(' ');
