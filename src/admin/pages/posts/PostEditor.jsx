import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { postsApi } from '../../../lib/api/posts'
import { categoriesApi } from '../../../lib/api/categories'
import { logsApi } from '../../../lib/api/logs'
import TinyEditor from '../../components/editor/TinyEditor'
import ImageUploader from '../../components/ui/ImageUploader'
import { Save, ChevronLeft, Globe, Eye, Settings, Plus, User, Calendar } from 'lucide-react'
import slugify from 'slugify'
import { supabase } from '../../../lib/supabase'
import toast from 'react-hot-toast'
import CategoryModal from '../../components/CategoryModal'

export default function PostEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [users, setUsers] = useState([])

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image_url: '',
    status: 'draft',
    category_id: '',
    author_id: '',
    meta_title: '',
    meta_description: ''
  })

  useEffect(() => {
    fetchCategories()
    fetchUsers()
    if (id) fetchPost()
  }, [id])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('authors').select('id, name')
      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      console.error('Erro ao buscar autores:', err)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll('post')
      setCategories(data)
    } catch (err) {
      console.error(err)
    }
  }

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  const handleQuickAddCategory = async (name) => {
    const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

    try {
      const newCat = await categoriesApi.create({ name, slug, type: 'post' })
      setCategories([...categories, newCat])
      setForm({ ...form, category_id: newCat.id })
      toast.success('Categoria criada!')
    } catch (err) {
      toast.error('Erro ao criar categoria: ' + err.message)
      throw err
    }
  }

  const fetchPost = async () => {
    try {
      const data = await postsApi.getById(id)
      setForm({
        ...data,
        category_id: data.category_id || '',
        author_id: data.author_id || ''
      })
    } catch (err) {
      console.error('Erro ao buscar notícia:', err)
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
    setLoading(true)
    const toastId = toast.loading('Salvando notícia...')
    try {
      // Destruir campos que não são colunas do banco
      const {
        id: postUuid,
        updated_at,
        categories,
        profiles,
        authors,
        meta_title,
        meta_description,
        tags,
        published_at,
        excerpt,
        ...postData
      } = form

      // Garantir que campos UUID sejam null se vazios
      if (!postData.category_id || postData.category_id === '') {
        postData.category_id = null
      }
      if (!postData.author_id || postData.author_id === '') {
        postData.author_id = null
      }

      if (form.id) {
        await postsApi.update(form.id, postData)
        await logsApi.logAction('Editou notícia/post', 'post', form.id, { title: postData.title })
        toast.success('Notícia atualizada!', { id: toastId })
      } else {
        const newPost = await postsApi.create(postData)
        await logsApi.logAction('Criou nova notícia', 'post', newPost?.id, { title: postData.title })
        toast.success('Notícia criada!', { id: toastId })
      }

      navigate('/admin/posts')
    } catch (err) {
      console.error('Erro detalhado ao salvar:', err)
      toast.error('Erro ao salvar: ' + (err.message || 'Erro desconhecido'), { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/posts')}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {id ? 'Editar Notícia' : 'Nova Notícia'}
              </h2>
              <p className="text-sm text-slate-500">Preencha as informações abaixo.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" className="btn bg-white border border-slate-200 text-slate-700 hover:bg-slate-50">
              <Eye size={18} />
              Previsualizar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              <Save size={18} />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título da Notícia</label>
                <input
                  type="text"
                  required
                  className="input-field text-xl font-bold"
                  value={form.title || ''}
                  onChange={handleTitleChange}
                  placeholder="Ex: Novos investimentos na saúde..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Resumo (Excerpt)</label>
                <textarea
                  className="input-field min-h-[100px] py-3"
                  value={form.excerpt || ''}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Breve resumo da notícia para a listagem..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Conteúdo</label>
                <TinyEditor
                  value={form.content}
                  onChange={(content) => setForm({ ...form, content })}
                />
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Globe size={20} className="text-patriotic-green" />
                SEO & Metadata
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Meta Title</label>
                  <input
                    type="text"
                    className="input-field"
                    value={form.meta_title || ''}
                    onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Meta Description</label>
                  <textarea
                    className="input-field min-h-[80px]"
                    value={form.meta_description || ''}
                    onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Settings size={20} className="text-patriotic-green" />
                Configurações
              </h3>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  Data de Publicação
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={(() => {
                    try {
                      const date = form.created_at ? new Date(form.created_at) : new Date()
                      return isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0]
                    } catch (e) {
                      return new Date().toISOString().split('T')[0]
                    }
                  })()}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val) setForm({ ...form, created_at: new Date(val).toISOString() })
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  className="input-field"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                  <option value="archived">Arquivado</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <User size={14} className="text-slate-400" />
                  Autor
                </label>
                <select
                  className="input-field"
                  value={form.author_id}
                  onChange={(e) => setForm({ ...form, author_id: e.target.value })}
                  required
                >
                  <option value="">Selecionar Autor</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-700">Categoria</label>
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="text-[10px] font-black text-patriotic-green uppercase hover:underline flex items-center gap-1"
                  >
                    <Plus size={10} /> Adicionar
                  </button>
                </div>
                <select
                  className="input-field"
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                >
                  <option value="">Sem categoria</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL)</label>
                <input
                  type="text"
                  className="input-field bg-slate-50 text-slate-500"
                  value={form.slug}
                  readOnly
                />
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <ImageUploader
                value={form.cover_image_url}
                onChange={(url) => setForm({ ...form, cover_image_url: url })}
              />
            </div>
          </div>
        </div>
      </form>

      <CategoryModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleQuickAddCategory}
        type="post"
        title="Nova Categoria de Notícia"
      />
    </>
  )
}
