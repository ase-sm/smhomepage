import { useRef, useState } from 'react'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table'
import { Placeholder } from '@tiptap/extensions'
import { ApiError, api } from '../../api/client'

const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'gif']
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
export const IMAGE_FORMAT_ERROR = 'jpg · jpeg · png · gif 형식만 삽입할 수 있습니다.'
export const IMAGE_SIZE_ERROR = '이미지 용량은 10MB를 넘을 수 없습니다.'

interface RichEditorProps {
  initialContent: string
  onChange: (html: string, isEmpty: boolean) => void
  onError: (message: string) => void
  invalid?: boolean
  id?: string
}

const ALIGN_CYCLE = ['left', 'center', 'right'] as const

export default function RichEditor({ initialContent, onChange, onError, invalid, id }: RichEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [tableMenu, setTableMenu] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, protocols: ['http', 'https'] },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ inline: false }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: '내용을 입력해 주세요.' }),
    ],
    content: initialContent,
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor }) => onChange(editor.getHTML(), isEditorEmpty(editor)),
  })

  const uploadImage = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!IMAGE_EXT.includes(ext)) return onError(IMAGE_FORMAT_ERROR)
    if (file.size > MAX_IMAGE_BYTES) return onError(IMAGE_SIZE_ERROR)
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const { url } = await api.post<{ url: string }>('/api/admin/uploads/images', form)
      editor?.chain().focus().setImage({ src: url, alt: '' }).run()
    } catch (e) {
      onError(e instanceof ApiError && e.status !== 0 && e.status < 500 ? e.message : '이미지 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const setLink = () => {
    if (!editor) return
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('링크 주소를 입력해 주세요. (비우면 링크 해제)', prev ?? 'https://')
    if (url === null) return
    const trimmed = url.trim()
    if (trimmed === '' || trimmed === 'https://') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    if (!/^https?:\/\/\S+$/.test(trimmed)) {
      onError('링크는 http:// 또는 https:// 로 시작해야 합니다.')
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: trimmed, target: '_blank' }).run()
  }

  const cycleAlign = () => {
    if (!editor) return
    const current = ALIGN_CYCLE.find((a) => editor.isActive({ textAlign: a })) ?? 'left'
    const next = ALIGN_CYCLE[(ALIGN_CYCLE.indexOf(current) + 1) % ALIGN_CYCLE.length]
    editor.chain().focus().setTextAlign(next).run()
  }

  const currentAlign = editor ? (ALIGN_CYCLE.find((a) => editor.isActive({ textAlign: a })) ?? 'left') : 'left'
  const alignLabel = { left: '정렬', center: '정렬(가운데)', right: '정렬(오른쪽)' }[currentAlign]

  const tableAction = (fn: (e: Editor) => void) => {
    if (editor) fn(editor)
    setTableMenu(false)
  }

  return (
    <div className={`editor${invalid ? ' has-error' : ''}`} id={id}>
      <div className="editor__toolbar" role="toolbar" aria-label="본문 서식">
        <ToolButton label="제목" active={editor?.isActive('heading', { level: 2 })}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} />
        <ToolButton label="B" bold active={editor?.isActive('bold')}
          onClick={() => editor?.chain().focus().toggleBold().run()} title="굵게" />
        <ToolButton label="I" italic active={editor?.isActive('italic')}
          onClick={() => editor?.chain().focus().toggleItalic().run()} title="기울임" />
        <ToolButton label="U" underline active={editor?.isActive('underline')}
          onClick={() => editor?.chain().focus().toggleUnderline().run()} title="밑줄" />
        <ToolButton label="목록" active={editor?.isActive('bulletList')}
          onClick={() => editor?.chain().focus().toggleBulletList().run()} />
        <ToolButton label={alignLabel} active={currentAlign !== 'left'} onClick={cycleAlign} />
        <ToolButton label="링크" active={editor?.isActive('link')} onClick={setLink} />
        <ToolButton label={uploading ? '업로드 중…' : '이미지'} disabled={uploading}
          onClick={() => fileRef.current?.click()} />
        <div className="editor__table-wrap">
          <ToolButton label="표" active={editor?.isActive('table') || tableMenu} onClick={() => setTableMenu((v) => !v)} />
          {tableMenu && (
            <div className="editor__table-menu" role="menu">
              <button type="button" role="menuitem"
                onClick={() => tableAction((e) => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())}>
                표 삽입 (3×3)
              </button>
              <button type="button" role="menuitem" disabled={!editor?.isActive('table')}
                onClick={() => tableAction((e) => e.chain().focus().addRowAfter().run())}>행 추가</button>
              <button type="button" role="menuitem" disabled={!editor?.isActive('table')}
                onClick={() => tableAction((e) => e.chain().focus().addColumnAfter().run())}>열 추가</button>
              <button type="button" role="menuitem" disabled={!editor?.isActive('table')}
                onClick={() => tableAction((e) => e.chain().focus().deleteRow().run())}>행 삭제</button>
              <button type="button" role="menuitem" disabled={!editor?.isActive('table')}
                onClick={() => tableAction((e) => e.chain().focus().deleteColumn().run())}>열 삭제</button>
              <button type="button" role="menuitem" disabled={!editor?.isActive('table')}
                onClick={() => tableAction((e) => e.chain().focus().deleteTable().run())}>표 삭제</button>
            </div>
          )}
        </div>
        <ToolButton label="되돌리기" disabled={!editor?.can().undo()}
          onClick={() => editor?.chain().focus().undo().run()} />
      </div>
      <EditorContent editor={editor} className="editor__area rich-content" />
      <input
        ref={fileRef}
        type="file"
        accept=".jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) void uploadImage(file)
        }}
      />
    </div>
  )
}

function isEditorEmpty(editor: Editor): boolean {
  if (!editor.isEmpty) {
    return editor.getText().trim() === '' && !editor.getHTML().includes('<img')
  }
  return true
}

function ToolButton({
  label,
  onClick,
  active,
  disabled,
  bold,
  italic,
  underline,
  title,
}: {
  label: string
  onClick: () => void
  active?: boolean
  disabled?: boolean
  bold?: boolean
  italic?: boolean
  underline?: boolean
  title?: string
}) {
  return (
    <button
      type="button"
      className={`editor__tool${active ? ' is-active' : ''}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      title={title ?? label}
      style={{
        fontWeight: bold ? 700 : undefined,
        fontStyle: italic ? 'italic' : undefined,
        textDecoration: underline ? 'underline' : undefined,
      }}
    >
      {label}
    </button>
  )
}
