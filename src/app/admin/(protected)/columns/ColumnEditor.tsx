'use client';

import Image from '@tiptap/extension-image';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef, useState } from 'react';
import { COLUMN_HTML_CLASS } from '@/components/column/columnHtml';
import { uploadColumnImage } from '@/lib/columns';

/**
 * 칼럼 본문 위지윅 에디터 (Tiptap).
 * HTML 을 그대로 저장하고, 공개 페이지에서 같은 스타일로 렌더링한다.
 */
export default function ColumnEditor({
    value,
    onChange,
    placeholder,
}: {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
}) {
    const fileInput = useRef<HTMLInputElement>(null);
    /** 본문 이미지 업로드 중 여부. 업로드 동안 버튼을 잠그고 표시를 띄운다 */
    const [uploading, setUploading] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
                link: { openOnClick: false },
            }),
            Image,
        ],
        content: value,
        // Next.js SSR 하이드레이션 불일치 방지
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: `${COLUMN_HTML_CLASS} min-h-[320px] px-4 py-3 outline-none`,
                'aria-label': placeholder || '본문',
            },
        },
        onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    });

    // AI 번역 등으로 바깥에서 내용이 바뀌면 에디터에도 반영한다.
    // 타이핑 중에는 value 가 getHTML() 과 같아서 아무 일도 하지 않는다
    useEffect(() => {
        if (editor && value !== editor.getHTML()) editor.commands.setContent(value || '');
    }, [editor, value]);

    if (!editor) {
        return <div className="min-h-[360px] rounded-lg border border-beige bg-white" />;
    }

    const insertImage = async (file: File) => {
        setUploading(true);
        try {
            const url = await uploadColumnImage(file);
            editor.chain().focus().setImage({ src: url }).run();
        } catch {
            window.alert('이미지 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        } finally {
            setUploading(false);
        }
    };

    const setLink = () => {
        const prev = editor.getAttributes('link').href as string | undefined;
        const url = window.prompt('링크 주소 (비우면 링크 해제)', prev || 'https://');
        if (url === null) return;
        if (!url || url === 'https://') editor.chain().focus().unsetLink().run();
        else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className="relative overflow-hidden rounded-lg border border-beige bg-white">
            <div className="flex flex-wrap items-center gap-1 border-b border-beige bg-cream/60 px-2 py-1.5">
                <ToolButton
                    label="제목"
                    active={editor.isActive('heading', { level: 2 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                    H2
                </ToolButton>
                <ToolButton
                    label="소제목"
                    active={editor.isActive('heading', { level: 3 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                >
                    H3
                </ToolButton>
                <Divider />
                <ToolButton label="굵게" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
                    <b>B</b>
                </ToolButton>
                <ToolButton
                    label="기울임"
                    active={editor.isActive('italic')}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <i>I</i>
                </ToolButton>
                <ToolButton
                    label="밑줄"
                    active={editor.isActive('underline')}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                    <u>U</u>
                </ToolButton>
                <Divider />
                <ToolButton
                    label="글머리 목록"
                    active={editor.isActive('bulletList')}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    ••
                </ToolButton>
                <ToolButton
                    label="번호 목록"
                    active={editor.isActive('orderedList')}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    1.
                </ToolButton>
                <ToolButton
                    label="인용"
                    active={editor.isActive('blockquote')}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                >
                    &ldquo;
                </ToolButton>
                <Divider />
                <ToolButton label="링크" active={editor.isActive('link')} onClick={setLink}>
                    🔗
                </ToolButton>
                <ToolButton label="이미지 삽입" onClick={() => fileInput.current?.click()}>
                    🖼
                </ToolButton>
                <Divider />
                <ToolButton label="실행 취소" onClick={() => editor.chain().focus().undo().run()}>
                    ↩
                </ToolButton>
                <ToolButton label="다시 실행" onClick={() => editor.chain().focus().redo().run()}>
                    ↪
                </ToolButton>

                <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void insertImage(file);
                        e.target.value = '';
                    }}
                />
            </div>

            <EditorContent editor={editor} />

            {/* 업로드 중에는 에디터 전체를 회색 막으로 덮어 재클릭을 막고 중앙에 스피너를 띄운다 */}
            {uploading && (
                <div
                    role="status"
                    aria-label="이미지 업로드 중"
                    className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-400/40"
                >
                    <span
                        aria-hidden="true"
                        className="inline-block h-9 w-9 animate-spin rounded-full border-[3px] border-white/70 border-t-dark"
                    />
                </div>
            )}
        </div>
    );
}

function ToolButton({
    label,
    active,
    onClick,
    children,
}: {
    label: string;
    active?: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className={`flex h-8 min-w-8 items-center justify-center rounded px-1.5 text-sm transition-colors ${
                active ? 'bg-dark text-cream' : 'text-dark/70 hover:bg-beige/60'
            }`}
        >
            {children}
        </button>
    );
}

function Divider() {
    return <span className="mx-1 h-5 w-px bg-beige" />;
}
