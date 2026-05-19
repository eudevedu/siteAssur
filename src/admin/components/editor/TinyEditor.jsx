import React from 'react'
import { Editor } from '@tinymce/tinymce-react'

export default function TinyEditor({ value, onChange }) {
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <Editor
        apiKey={import.meta.env.VITE_TINYMCE_API_KEY || 'no-api-key'}
        init={{
          height: 500,
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: 'body { font-family:Inter,Helvetica,Arial,sans-serif; font-size:16px }',
          skin: 'oxide',
          content_css: 'default',
          branding: false,
          promotion: false
        }}
        value={value}
        onEditorChange={(content) => onChange(content)}
      />
    </div>
  )
}
