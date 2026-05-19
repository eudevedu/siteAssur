import React, { useState, useEffect } from 'react'
import { authorsApi } from '../../../lib/api/authors'
import { logsApi } from '../../../lib/api/logs'
import { 
  UserPlus, 
  Trash2, 
  Edit2, 
  Loader2, 
  Search, 
  User,
  X,
  Plus,
  AlertTriangle,
  Check,
  Camera
} from 'lucide-react'
import ImageUploader from '../../components/ui/ImageUploader'

export default function AuthorsList() {
  const [authors, setAuthors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAuthor, setEditingAuthor] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [isActionLoading, setIsActionLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    avatar_url: ''
  })

  useEffect(() => {
    fetchAuthors()
  }, [])

  const fetchAuthors = async () => {
    setLoading(true)
    try {
      const data = await authorsApi.getAll()
      setAuthors(data || [])
    } catch (err) {
      console.error('Erro ao buscar autores:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (author = null) => {
    if (author) {
      setEditingAuthor(author)
      setFormData(author)
    } else {
      setEditingAuthor(null)
      setFormData({ name: '', role: '', bio: '', avatar_url: '' })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsActionLoading(true)
    try {
      if (editingAuthor) {
        await authorsApi.update(editingAuthor.id, formData)
        await logsApi.logAction('Editou autor', 'author', editingAuthor.id, { name: formData.name })
      } else {
        const newAuthor = await authorsApi.create(formData)
        await logsApi.logAction('Criou novo autor', 'author', newAuthor?.id, { name: formData.name })
      }
      fetchAuthors()
      setIsModalOpen(false)
    } catch (err) {
      alert('Erro ao salvar autor: ' + err.message)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDelete = async (e, id) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    setIsActionLoading(true)
    try {
      const authorToDelete = authors.find(a => a.id === id)
      await authorsApi.delete(id)
      
      if (authorToDelete) {
        await logsApi.logAction('Excluiu autor', 'author', id, { name: authorToDelete.name })
      }

      setAuthors(authors.filter(a => a.id !== id))
      setDeletingId(null)
    } catch (err) {
      alert('Erro ao excluir: ' + err.message)
    } finally {
      setIsActionLoading(false)
    }
  }

  const filteredAuthors = authors.filter(author => 
    author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    author.role?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Autores & Colunistas</h1>
          <p className="text-slate-500">Gerencie as pessoas que assinam as notícias do portal.</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-patriotic-green text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-patriotic-green/20 hover:scale-105 active:scale-95 transition-all"
        >
          <UserPlus size={20} />
          NOVO AUTOR
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nome ou cargo..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-patriotic-green/20 focus:border-patriotic-green transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="animate-spin mx-auto text-patriotic-green mb-4" size={40} />
            <p className="text-slate-500 font-medium">Carregando autores...</p>
          </div>
        ) : filteredAuthors.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-sm">
            <User size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500">Nenhum autor cadastrado ainda.</p>
          </div>
        ) : (
          filteredAuthors.map((author) => (
            <div key={author.id} className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden">
              
              {/* Confirmation Overlay */}
              {deletingId === author.id && (
                <div className="absolute inset-0 z-20 bg-red-600 p-6 flex flex-col items-center justify-center text-white animate-in fade-in duration-200">
                  <AlertTriangle size={32} className="mb-2" />
                  <h4 className="font-bold mb-1 text-sm">Excluir autor?</h4>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => setDeletingId(null)} className="px-3 py-1.5 bg-white/20 rounded-lg text-xs font-bold">Não</button>
                    <button onClick={(e) => handleDelete(e, author.id)} className="px-4 py-1.5 bg-white text-red-600 rounded-lg text-xs font-black">SIM</button>
                  </div>
                </div>
              )}

              <div className="w-20 h-20 bg-slate-100 rounded-full mb-4 overflow-hidden border-2 border-white shadow-md group-hover:border-patriotic-green/20 transition-all">
                {author.avatar_url ? (
                  <img src={author.avatar_url} alt={author.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-2xl">
                    {author.name.charAt(0)}
                  </div>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-900 group-hover:text-patriotic-green transition-colors">{author.name}</h3>
              <p className="text-xs font-black uppercase tracking-widest text-patriotic-green mb-3">{author.role || 'Autor'}</p>
              <p className="text-sm text-slate-500 line-clamp-2 mb-6 px-4">{author.bio || 'Sem biografia cadastrada.'}</p>

              <div className="flex gap-2 pt-4 border-t border-slate-50 w-full justify-center">
                <button 
                  onClick={() => handleOpenModal(author)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingId(author.id);
                  }}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <UserPlus size={24} className="text-patriotic-green" />
                {editingAuthor ? 'Editar Autor' : 'Novo Autor'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <ImageUploader 
                  value={formData.avatar_url} 
                  onChange={(url) => setFormData({...formData, avatar_url: url})} 
                  label="Foto do Autor"
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome Completo</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-patriotic-green/20 focus:bg-white transition-all font-bold"
                    placeholder="Ex: Maria Souza"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Cargo / Título</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-patriotic-green/20 focus:bg-white transition-all font-bold"
                    placeholder="Ex: Assessora de Imprensa"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Biografia Curta</label>
                  <textarea
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-patriotic-green/20 focus:bg-white transition-all min-h-[100px] text-sm"
                    placeholder="Fale um pouco sobre o autor..."
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="w-full py-4 bg-patriotic-green text-white rounded-2xl font-black shadow-lg shadow-patriotic-green/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {isActionLoading ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                  {editingAuthor ? 'SALVAR ALTERAÇÕES' : 'CRIAR AUTOR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
