import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { mediaApi } from '../../../lib/api/media'

export default function ImageUploader({ value, onChange, label = 'Imagem de Capa' }) {
  const [loading, setLoading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    setLoading(true)
    try {
      const data = await mediaApi.upload(file)
      onChange(data.url)
    } catch (err) {
      alert('Erro no upload: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [onChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  })

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      
      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-50">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onChange('')
              }}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md border border-red-600 flex items-center justify-center"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-3
            ${isDragActive ? 'border-patriotic-green bg-patriotic-green/5' : 'border-slate-200 hover:border-slate-300 bg-slate-50'}
            ${loading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="p-3 bg-white rounded-xl shadow-sm text-slate-400">
            {loading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">
              {loading ? 'Enviando...' : 'Arraste uma imagem ou clique'}
            </p>
            <p className="text-xs text-slate-500">PNG, JPG até 5MB</p>
          </div>
        </div>
      )}
    </div>
  )
}
