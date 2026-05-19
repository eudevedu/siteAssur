import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { projectsApi } from '../../../lib/api/projects'
import { categoriesApi } from '../../../lib/api/categories'
import { logsApi } from '../../../lib/api/logs'
import RichEditor from '../../components/editor/RichEditor'
import ImageUploader from '../../components/ui/ImageUploader'
import { 
  Save, 
  ArrowLeft, 
  Globe, 
  Eye, 
  Settings, 
  Star, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Layout,
  ExternalLink,
  Briefcase
} from 'lucide-react'
import slugify from 'slugify'

import toast from 'react-hot-toast'
import CategoryModal from '../../components/CategoryModal'

export default function ProjectEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = id && id !== 'new'
  
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])
  
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    cover_image_url: '',
    status: 'draft',
    category_id: '',
    featured: false,
    url: '',
    meta_title: '',
    meta_description: ''
  })

  useEffect(() => {
    fetchCategories()
    if (isEditing) fetchProject()
  }, [id])

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll('project')
      setCategories(data || [])
    } catch (err) {
      console.error('Erro ao buscar categorias:', err)
    }
  }

  const fetchProject = async () => {
    setLoading(true)
    try {
      const data = await projectsApi.getById(id)
      if (data) {
        setForm(data)
      } else {
        navigate('/admin/projects')
      }
    } catch (err) {
      console.error('Erro ao buscar projeto:', err)
      navigate('/admin/projects')
    } finally {
      setLoading(false)
    }
  }

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  const handleQuickAddCategory = async (name) => {
    const slug = slugify(name, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g })
    
    try {
      const newCat = await categoriesApi.create({ 
        name, 
        slug, 
        type: 'project',
        description: '' 
      })
      
      if (!newCat) throw new Error('O servidor não retornou os dados da nova categoria.')
      
      setCategories(prev => [...prev, newCat])
      setForm(prev => ({ ...prev, category_id: newCat.id }))
      
      toast.success('Categoria criada e selecionada!')
    } catch (err) {
      console.error('Erro detalhado ao criar categoria:', err)
      toast.error('Erro ao criar categoria: ' + err.message)
      throw err // Re-throw to keep modal open if needed
    }
  }

  const handleTitleChange = (e) => {
    const title = e.target.value
    setForm({ 
      ...form, 
      title, 
      slug: slugify(title, { lower: true, strict: true }),
      meta_title: title
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const toastId = toast.loading('Salvando projeto...')
    
    // Sanitize data: only send columns that exist in the database
    const saveData = {
      title: form.title,
      slug: form.slug,
      description: form.description,
      content: form.content,
      cover_image_url: form.cover_image_url,
      status: form.status,
      category_id: form.category_id || null,
      featured: form.featured,
      url: form.url,
      meta_title: form.meta_title,
      meta_description: form.meta_description
    }

    try {
      if (isEditing) {
        await projectsApi.update(id, saveData)
        await logsApi.logAction('Editou projeto', 'project', id, { title: saveData.title })
        toast.success('Projeto atualizado com sucesso!', { id: toastId })
      } else {
        const newProject = await projectsApi.create(saveData)
        await logsApi.logAction('Criou novo projeto', 'project', newProject?.id, { title: saveData.title })
        toast.success('Projeto criado com sucesso!', { id: toastId })
        navigate(`/admin/projects/edit/${newProject.id}`, { replace: true })
      }
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar: ' + err.message, { id: toastId })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin text-patriotic-green" size={40} />
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8 max-w-7xl mx-auto px-4 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link 
              to="/admin/projects"
              className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {isEditing ? 'Editar Projeto' : 'Novo Projeto'}
              </h1>
              <p className="text-sm text-slate-500">Documente suas conquistas para o público.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select 
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-patriotic-green/20 font-bold text-slate-700"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
            </select>
            
            <button 
              type="submit" 
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-patriotic-green text-white rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg disabled:opacity-70"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Salvar Projeto
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Título do Projeto / Obra</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-bold text-xl"
                  value={form.title || ''}
                  onChange={handleTitleChange}
                  placeholder="Ex: Reforma da Praça Central"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Slug (URL)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">/projetos/</span>
                  <input
                    required
                    type="text"
                    className="w-full pl-24 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-xl outline-none transition-all font-mono text-sm"
                    value={form.slug || ''}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Descrição Curta (Resumo)</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-xl outline-none transition-all resize-none"
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Um breve resumo do projeto para a listagem..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Detalhes Completos</label>
                <RichEditor 
                  value={form.content} 
                  onChange={(content) => setForm({ ...form, content })} 
                  placeholder="Descreva o projeto, o impacto social, o investimento, etc..."
                />
              </div>
            </div>

            {/* SEO Section */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Globe size={20} className="text-blue-500" />
                Otimização de Busca (SEO)
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Meta Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-xl outline-none transition-all"
                    value={form.meta_title || ''}
                    onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Meta Description</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-xl outline-none transition-all resize-none"
                    value={form.meta_description || ''}
                    onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Options */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Settings size={20} className="text-patriotic-green" />
                Opções de Exibição
              </h3>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${form.featured ? 'bg-patriotic-yellow/10 text-patriotic-yellow' : 'bg-slate-200 text-slate-400'}`}>
                    <Star size={20} fill={form.featured ? "currentColor" : "none"} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Destaque</div>
                    <div className="text-[10px] text-slate-500 uppercase font-black">Página Inicial</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-patriotic-green"></div>
                </label>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">Categoria</label>
                  <button 
                    type="button"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="text-[10px] font-black text-patriotic-green uppercase hover:underline"
                  >
                    + Criar Nova
                  </button>
                </div>
                <select
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-xl outline-none transition-all font-medium text-slate-700"
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                >
                  <option value="">Sem categoria</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Link Externo (Opcional)</label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="url"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-xl outline-none transition-all text-sm"
                    value={form.url || ''}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://exemplo.com.br"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <ImageUploader 
                value={form.cover_image_url} 
                onChange={(url) => setForm({ ...form, cover_image_url: url })} 
                label="Capa do Projeto"
              />
              <p className="text-[10px] text-slate-400 mt-4 text-center">Recomendado: 1200x800px (JPG ou PNG)</p>
            </div>
          </div>
        </div>
      </form>

      <CategoryModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleQuickAddCategory}
        type="project"
        title="Nova Categoria de Projeto"
      />
    </>
  )
}
