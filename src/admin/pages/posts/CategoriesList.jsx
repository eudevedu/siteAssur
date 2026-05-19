import React, { useEffect, useState } from 'react'
import { categoriesApi } from '../../../lib/api/categories'
import { logsApi } from '../../../lib/api/logs'
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Loader2, 
  Tag, 
  Search, 
  Filter, 
  Briefcase, 
  FileText,
  AlertTriangle,
  X,
  Check
} from 'lucide-react'

export default function CategoriesList() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', type: 'post' })
  const [saving, setSaving] = useState(false)
  const [activeType, setActiveType] = useState('post')
  const [deletingId, setDeletingId] = useState(null)
  const [isActionLoading, setIsActionLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [activeType])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const data = await categoriesApi.getAll(activeType)
      setCategories(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category)
      setFormData(category)
    } else {
      setEditingCategory(null)
      setFormData({ name: '', slug: '', description: '', type: activeType })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, formData)
        await logsApi.logAction('Editou categoria', 'category', editingCategory.id, { name: formData.name, type: formData.type })
      } else {
        const newCat = await categoriesApi.create({
          ...formData,
          description: formData.description || ''
        })
        await logsApi.logAction('Criou nova categoria', 'category', newCat?.id, { name: formData.name, type: formData.type })
      }
      fetchCategories()
      handleCloseModal()
    } catch (err) {
      console.error('Erro ao salvar categoria:', err)
      alert('Erro ao salvar categoria: ' + (err.message || 'Erro desconhecido.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (e, id) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    setIsActionLoading(true)
    try {
      const catToDelete = categories.find(c => c.id === id)
      await categoriesApi.delete(id)
      
      if (catToDelete) {
        await logsApi.logAction('Excluiu categoria', 'category', id, { name: catToDelete.name, type: catToDelete.type })
      }

      setCategories(categories.filter(c => c.id !== id))
      setDeletingId(null)
    } catch (err) {
      console.error('Erro ao excluir:', err)
      alert('Erro ao excluir: ' + err.message)
    } finally {
      setIsActionLoading(false)
    }
  }

  const generateSlug = (name) => {
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  }

  const handleNameChange = (e) => {
    const name = e.target.value
    setFormData({ ...formData, name, slug: generateSlug(name) })
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Categorias</h1>
          <p className="text-slate-500">Organize seu conteúdo por temas.</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-patriotic-green text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-patriotic-green/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} />
          NOVA CATEGORIA
        </button>
      </div>

      {/* Tabs for post/project categories */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveType('post')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeType === 'post' ? 'bg-white text-patriotic-green shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <FileText size={18} />
          Postagens
        </button>
        <button 
          onClick={() => setActiveType('project')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeType === 'project' ? 'bg-white text-patriotic-green shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Briefcase size={18} />
          Projetos
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider">Nome</th>
                <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider">Slug</th>
                <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-patriotic-green" size={32} />
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center">
                    <Tag size={40} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500">Nenhuma categoria encontrada para {activeType === 'post' ? 'postagens' : 'projetos'}.</p>
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-50/50 transition-colors group relative">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded-md text-slate-600">{category.slug}</code>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      {/* Confirmation Overlay */}
                      {deletingId === category.id && (
                        <div className="absolute inset-0 z-20 bg-red-600 px-6 flex items-center justify-end gap-3 text-white animate-in slide-in-from-right duration-200">
                          <div className="flex items-center gap-2 text-sm font-bold">
                            <AlertTriangle size={16} /> Excluir categoria?
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setDeletingId(null)}
                              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-all"
                            >
                              Não
                            </button>
                            <button 
                              onClick={(e) => handleDelete(e, category.id)}
                              disabled={isActionLoading}
                              className="px-4 py-1.5 bg-white text-red-600 rounded-lg text-xs font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
                            >
                              {isActionLoading ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                              SIM
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(category)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(category.id);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Tipo</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-patriotic-green/20 focus:bg-white transition-all font-bold"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="post">Notícias / Posts</option>
                  <option value="project">Projetos / Portfólio</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nome</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-patriotic-green/20 focus:bg-white transition-all font-bold"
                  placeholder="Ex: Saúde, Educação..."
                  value={formData.name}
                  onChange={handleNameChange}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Slug (URL)</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-patriotic-green/20 focus:bg-white transition-all font-mono text-xs"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-patriotic-green text-white rounded-2xl font-black shadow-lg shadow-patriotic-green/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                {editingCategory ? 'SALVAR ALTERAÇÕES' : 'CRIAR CATEGORIA'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
