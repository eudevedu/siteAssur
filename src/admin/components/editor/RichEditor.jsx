import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { 
  Bold, Italic, List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon,
  Heading1, Heading2, Undo, Redo
} from 'lucide-react'

const MenuButton = ({ onClick, isActive, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2 rounded hover:bg-slate-100 transition-colors ${isActive ? 'text-patriotic-green bg-patriotic-green/10' : 'text-slate-600'}`}
  >
    {children}
  </button>
)

export default function RichEditor({ value, onChange, placeholder = 'Comece a escrever...' }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-patriotic-green focus-within:border-transparent transition-all">
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap gap-1">
        <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}>
          <Bold size={18} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}>
          <Italic size={18} />
        </MenuButton>
        <div className="w-px h-6 bg-slate-200 mx-1"></div>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })}>
          <Heading1 size={18} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })}>
          <Heading2 size={18} />
        </MenuButton>
        <div className="w-px h-6 bg-slate-200 mx-1"></div>
        <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}>
          <List size={18} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}>
          <ListOrdered size={18} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')}>
          <Quote size={18} />
        </MenuButton>
        <div className="w-px h-6 bg-slate-200 mx-1"></div>
        <MenuButton onClick={() => {
          const url = window.prompt('URL do link:')
          if (url) editor.chain().focus().setLink({ href: url }).run()
        }} isActive={editor.isActive('link')}>
          <LinkIcon size={18} />
        </MenuButton>
        <MenuButton onClick={() => {
          const url = window.prompt('URL da imagem:')
          if (url) editor.chain().focus().setImage({ src: url }).run()
        }}>
          <ImageIcon size={18} />
        </MenuButton>
        <div className="flex-1"></div>
        <MenuButton onClick={() => editor.chain().focus().undo().run()}>
          <Undo size={18} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().redo().run()}>
          <Redo size={18} />
        </MenuButton>
      </div>
      <div className="p-4 prose prose-slate max-w-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
