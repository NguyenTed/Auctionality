/**
 * Rich Text Editor Component
 * Uses TipTap for React 19 compatibility
 */

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect, useRef } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "",
  className = "",
  style,
}: RichTextEditorProps) {
  const isUpdatingFromProps = useRef(false);
  const lastValueRef = useRef(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      Image,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      if (!isUpdatingFromProps.current) {
        const html = editor.getHTML();
        lastValueRef.current = html;
        onChange(html);
      }
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[200px] p-4 prose prose-sm max-w-none",
      },
    },
  });

  // Sync external value changes to editor (but not when user is editing)
  useEffect(() => {
    if (editor && value !== lastValueRef.current) {
      isUpdatingFromProps.current = true;
      editor.commands.setContent(value);
      lastValueRef.current = value;
      // Reset flag after a microtask to allow onUpdate to fire
      setTimeout(() => {
        isUpdatingFromProps.current = false;
      }, 0);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`border border-gray-300 rounded-lg bg-white ${className}`} style={style}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive("bold") ? "bg-gray-200" : ""
          }`}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive("italic") ? "bg-gray-200" : ""
          }`}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive("strike") ? "bg-gray-200" : ""
          }`}
          title="Strike"
        >
          <s>S</s>
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive("heading", { level: 1 }) ? "bg-gray-200" : ""
          }`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive("heading", { level: 2 }) ? "bg-gray-200" : ""
          }`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive("heading", { level: 3 }) ? "bg-gray-200" : ""
          }`}
          title="Heading 3"
        >
          H3
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive("bulletList") ? "bg-gray-200" : ""
          }`}
          title="Bullet List"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive("orderedList") ? "bg-gray-200" : ""
          }`}
          title="Ordered List"
        >
          1.
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => {
            const url = window.prompt("Enter URL:");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive("link") ? "bg-gray-200" : ""
          }`}
          title="Link"
        >
          🔗
        </button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt("Enter image URL:");
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          className="p-2 rounded hover:bg-gray-100"
          title="Image"
        >
          🖼️
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          className="p-2 rounded hover:bg-gray-100"
          title="Clear Formatting"
        >
          Clear
        </button>
      </div>

      {/* Editor Content */}
      <div className="min-h-[200px]" data-placeholder={placeholder || ""}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

