import React, { useEffect, useState } from 'react'
import { mediaApi } from '../../../lib/api/media'
import ImageUploader from '../../components/ui/ImageUploader'
import { Trash2, Copy, Check, Search, Filter, Image as ImageIcon, FileText, AlertCircle, Loader2, X } from 'lucide-react'

export default function MediaLibrary() {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    try {
      const data = await mediaApi.getAll()
      setMedia(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (item) => {
    setDeletingId(item.id)
    try {
      await mediaApi.delete(item.id, item.filename)
      setMedia(prev => prev.filter(m => m.id !== item.id))
      setConfirmDeleteId(null)
    } catch (err) {
      alert('Erro ao excluir: ' + err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const copyToClipboard = (url, id) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredMedia = media.filter(item => 
    item.original_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Biblioteca de Mídia</h1>
          <p className="text-slate-500">Gerencie todos os arquivos e imagens utilizados no site.</p>
        </div>
        
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2">
          <ImageIcon size={20} className="text-patriotic-green" />
          <span className="font-bold text-slate-700">{media.length} Arquivos</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Upload & Search Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ImageIcon size={18} className="text-patriotic-green" />
              Upload de Arquivo
            </h3>
            <ImageUploader onChange={() => fetchMedia()} value="" label="" />
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 mb-2">Filtros</h3>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por nome..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-patriotic-green/20 focus:bg-white transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Media Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="aspect-square bg-slate-100 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-slate-200 border-dashed">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                <Search size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Nenhum arquivo encontrado</h3>
              <p className="text-slate-500">Tente mudar o termo de busca ou faça um novo upload.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMedia.map((item) => (
                <div 
                  key={item.id} 
                  className={`group relative aspect-square bg-white rounded-[32px] overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${deletingId === item.id ? 'opacity-50 grayscale pointer-events-none' : ''}`}
                >
                  <img src={item.url} alt={item.original_name} className="w-full h-full object-cover" />
                  
                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                    {confirmDeleteId === item.id ? (
                      <div className="w-full space-y-2 animate-in fade-in zoom-in-95 duration-200">
                        <p className="text-[10px] font-black text-white text-center uppercase tracking-tighter mb-2">Confirmar Exclusão?</p>
                        <button 
                          onClick={() => handleDelete(item)}
                          className="w-full py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider shadow-lg"
                        >
                          {deletingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          SIM, EXCLUIR
                        </button>
                        <button 
                          onClick={() => setConfirmDeleteId(null)}
                          className="w-full py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider"
                        >
                          <X size={14} />
                          CANCELAR
                        </button>
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={() => copyToClipboard(item.url, item.id)}
                          className="w-full py-2 bg-white rounded-xl text-slate-900 hover:bg-patriotic-green hover:text-white transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider"
                        >
                          {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
                          {copiedId === item.id ? 'Copiado!' : 'Copiar Link'}
                        </button>
                        
                        <button 
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="w-full py-2 bg-red-500/20 text-red-100 border border-red-500/30 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider"
                        >
                          <Trash2 size={14} />
                          Excluir
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Info Badge */}
                  <div className="absolute bottom-4 left-4 right-4 p-2 bg-white/90 backdrop-blur-md rounded-xl group-hover:opacity-0 transition-opacity">
                    <p className="text-[10px] font-bold text-slate-900 truncate text-center">{item.original_name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
