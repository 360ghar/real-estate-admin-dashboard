import { useCallback, useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered, Code, Quote, ImageIcon, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive: boolean
  icon: React.ReactNode
  title: string
}

const ToolbarButton = ({ onClick, isActive, icon, title }: ToolbarButtonProps) => (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    onClick={onClick}
    title={title}
    className={cn(isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground')}
  >
    {icon}
  </Button>
)

const RichTextEditor = ({ value, onChange, placeholder, disabled }: RichTextEditorProps) => {
  const isUpdatingFromOutside = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Start writing...',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      if (!isUpdatingFromOutside.current) {
        onChange(editor.getHTML())
      }
    },
    editable: !disabled,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none p-4 border rounded-md min-h-[300px]',
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    if (disabled !== undefined) {
      editor.setEditable(!disabled)
    }
  }, [editor, disabled])

  useEffect(() => {
    if (!editor) return
    const currentHtml = editor.getHTML()
    if (value !== currentHtml) {
      isUpdatingFromOutside.current = true
      editor.commands.setContent(value, { emitUpdate: false })
      isUpdatingFromOutside.current = false
    }
  }, [editor, value])

  const setLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL', previousUrl)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    if (!editor) return
    const url = window.prompt('Image URL')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  if (!editor) return null

  return (
    <div className="border rounded-md">
      <div className="border-b p-2 flex flex-wrap gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={<Bold className="h-4 w-4" />}
          title="Bold"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={<Italic className="h-4 w-4" />}
          title="Italic"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          icon={<Heading1 className="h-4 w-4" />}
          title="Heading 1"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          icon={<Heading2 className="h-4 w-4" />}
          title="Heading 2"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          icon={<Heading3 className="h-4 w-4" />}
          title="Heading 3"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={<List className="h-4 w-4" />}
          title="Bullet List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={<ListOrdered className="h-4 w-4" />}
          title="Ordered List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          icon={<Code className="h-4 w-4" />}
          title="Code Block"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          icon={<Quote className="h-4 w-4" />}
          title="Blockquote"
        />
        <ToolbarButton
          onClick={addImage}
          isActive={editor.isActive('image')}
          icon={<ImageIcon className="h-4 w-4" />}
          title="Image"
        />
        <ToolbarButton
          onClick={setLink}
          isActive={editor.isActive('link')}
          icon={<LinkIcon className="h-4 w-4" />}
          title="Link"
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

export default RichTextEditor
