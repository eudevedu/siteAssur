import React, { lazy, Suspense, useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Globe, 
  Settings, 
  Type, 
  Layout,
  ChevronRight
} from 'lucide-react'
import { pagesApi } from '../../../lib/api/pages'
import { logsApi } from '../../../lib/api/logs'
import toast from 'react-hot-toast'

const GrapesEditor = lazy(() => import('../../components/editor/GrapesEditor'))

export default function PageEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('content')
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    status: 'draft',
    show_in_nav: false,
    nav_order: 0,
    meta_title: '',
    meta_description: ''
  })

  useEffect(() => {
    if (isEditing) {
      fetchPage()
    }
  }, [id])

  const fetchPage = async () => {
    try {
      const allPages = await pagesApi.getAll()
      const page = allPages.find(p => p.id === id)
      if (page) {
        setFormData(page)
      } else {
        navigate('/admin/pages')
      }
    } catch (error) {
      console.error('Erro ao buscar página:', error)
      navigate('/admin/pages')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const toastId = toast.loading('Salvando alterações...')
    
    try {
      // Destructure to remove fields that should not be updated directly
      const { id: pageId, created_at, updated_at, ...saveData } = formData

      if (isEditing) {
        await pagesApi.update(id, saveData)
        await logsApi.logAction('Editou página customizada', 'page', id, { title: formData.title })
        toast.success('Página atualizada com sucesso!', { id: toastId })
      } else {
        const newPage = await pagesApi.create(saveData)
        await logsApi.logAction('Criou nova página customizada', 'page', newPage?.id, { title: formData.title })
        toast.success('Página criada com sucesso!', { id: toastId })
      }
      navigate('/admin/pages')
    } catch (error) {
      console.error('Erro detalhado ao salvar:', error)
      toast.error('Erro ao salvar página: ' + (error.message || 'Verifique se o slug é único.'), { id: toastId })
    } finally {
      setSaving(false)
    }
  }

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
    setFormData({ ...formData, slug })
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin text-patriotic-green" size={40} />
      </div>
    )
  }

  return (
    <div className="max-w-[1700px] mx-auto animate-slide-in px-4 md:px-10 py-8">
      <form 
        onSubmit={handleSubmit} 
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault()
          }
        }}
        className="space-y-10"
      >
        {/* Sticky Header Toolbar */}
        <div className="sticky top-20 z-40 -mx-4 px-8 py-6 bg-white/90 backdrop-blur-2xl border-b border-slate-100 mb-10 shadow-lg shadow-slate-200/20 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-8 transition-all duration-300">
          <div className="flex items-center gap-6">
            <Link 
              to="/admin/pages"
              className="group p-3 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-patriotic-green/30 hover:shadow-md transition-all text-slate-400 hover:text-patriotic-green"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Editor de Páginas</span>
                <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                <span className="text-[10px] font-black text-patriotic-green uppercase tracking-[0.3em]">Visual Builder</span>
              </div>
              <h1 className="text-2xl font-display font-black text-slate-900 tracking-tight">
                {isEditing ? formData.title || 'Página Sem Título' : 'Nova Página'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Premium Segmented Control */}
            <div className="bg-slate-100/80 p-1.5 rounded-[20px] flex items-center border border-slate-200/50 shadow-inner">
              {[
                { id: 'content', label: 'Design', icon: Type },
                { id: 'settings', label: 'Config', icon: Settings },
                { id: 'seo', label: 'SEO', icon: Globe }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative flex items-center gap-2.5 px-5 py-2.5 rounded-[14px] text-[11px] font-black uppercase tracking-widest transition-all duration-300
                    ${activeTab === tab.id 
                      ? 'bg-white text-slate-900 shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-slate-200/50' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'}
                  `}
                >
                  <tab.icon size={14} className={activeTab === tab.id ? 'text-patriotic-green' : ''} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="w-px h-8 bg-slate-200 mx-2 hidden lg:block"></div>

            <div className="flex items-center gap-3">
              <div className="relative group">
                <select 
                  className="appearance-none pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-[18px] outline-none focus:ring-4 focus:ring-patriotic-green/10 focus:border-patriotic-green font-bold text-[11px] uppercase tracking-wider text-slate-600 shadow-sm cursor-pointer transition-all"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={14} />
              </div>

              <button 
                type="submit"
                disabled={saving}
                className="group relative flex items-center gap-3 px-8 py-3 bg-slate-900 text-white rounded-[18px] font-black text-[11px] uppercase tracking-widest hover:scale-[1.03] active:scale-95 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-70 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-patriotic-green to-patriotic-green/80 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative flex items-center gap-2">
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  SALVAR ALTERAÇÕES
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Design/Content Tab */}
          <div className={`space-y-6 ${activeTab !== 'content' ? 'hidden' : ''}`}>
            {/* Quick Settings Bar */}
            <div className="bg-white px-8 py-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-end md:items-center">
              <div className="flex-1 space-y-2 w-full">
                <div className="flex items-center gap-2 ml-1">
                  <Type size={12} className="text-slate-400" />
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Título da Página</label>
                </div>
                <input
                  required
                  type="text"
                  placeholder="Dê um nome para esta página..."
                  className="w-full px-0 bg-transparent border-none focus:ring-0 outline-none font-display font-black text-2xl text-slate-900 placeholder:text-slate-200 transition-all"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              
              <div className="w-px h-12 bg-slate-100 hidden md:block"></div>

              <div className="flex-1 space-y-2 w-full">
                <div className="flex items-center gap-2 ml-1">
                  <Globe size={12} className="text-slate-400" />
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Endereço (Slug)</label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 font-bold text-sm bg-slate-50 px-2 py-1 rounded-lg">/p/</span>
                  <input
                    required
                    type="text"
                    className="flex-1 bg-transparent border-none focus:ring-0 outline-none font-mono text-sm font-bold text-slate-600"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                  <button 
                    type="button"
                    onClick={generateSlug}
                    className="p-2 text-slate-400 hover:text-patriotic-green hover:bg-patriotic-green/5 rounded-xl transition-all"
                    title="Gerar automaticamente"
                  >
                    <Globe size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Visual Builder Container */}
            <div className={`bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden relative group ${activeTab !== 'content' ? 'hidden' : ''}`}>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 bg-slate-900/10 backdrop-blur-md rounded-full text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
                Visual Builder Ativo
              </div>
              <Suspense fallback={
                <div className="flex items-center justify-center h-[800px] bg-slate-50">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-patriotic-green" size={36} />
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Carregando Editor...</p>
                  </div>
                </div>
              }>
                <GrapesEditor
                  value={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                />
              </Suspense>
            </div>
          </div>

          {/* Settings Tab */}
          <div className={`${activeTab !== 'settings' ? 'hidden' : ''}`}>
            <div className="max-w-3xl mx-auto w-full py-10">
              <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-xl space-y-10">
                <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[32px] border border-slate-100 transition-all hover:border-patriotic-green/20 group">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-slate-400 group-hover:text-patriotic-green transition-colors">
                      <Layout size={32} />
                    </div>
                    <div>
                      <div className="font-black text-slate-900 uppercase tracking-tight text-lg">Exibir no Menu Principal</div>
                      <div className="text-sm text-slate-500 font-medium">Adicionar um link direto para esta página no site.</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.show_in_nav}
                      onChange={(e) => setFormData({ ...formData, show_in_nav: e.target.checked })}
                    />
                    <div className="w-16 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-patriotic-green"></div>
                  </label>
                </div>

                {formData.show_in_nav && (
                  <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center justify-between gap-8">
                    <div className="flex-1">
                      <div className="font-black text-slate-900 uppercase tracking-tight">Ordem de Exibição</div>
                      <div className="text-sm text-slate-500 font-medium">Define a posição desta página no menu.</div>
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        className="w-full px-4 py-4 bg-white border-2 border-slate-200 focus:border-patriotic-green rounded-2xl outline-none transition-all font-black text-center text-2xl shadow-inner"
                        value={formData.nav_order}
                        onChange={(e) => setFormData({ ...formData, nav_order: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SEO Tab */}
          <div className={`${activeTab !== 'seo' ? 'hidden' : ''}`}>
            <div className="max-w-4xl mx-auto w-full py-10">
              <div className="bg-white p-12 rounded-[48px] border border-slate-200 shadow-2xl space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Meta Title</label>
                      <input
                        type="text"
                        placeholder="Título para os buscadores"
                        className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-3xl outline-none transition-all font-bold text-lg"
                        value={formData.meta_title || ''}
                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Meta Description</label>
                      <textarea
                        rows="5"
                        placeholder="Resumo para os resultados de busca..."
                        className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-3xl outline-none transition-all font-medium leading-relaxed resize-none"
                        value={formData.meta_description || ''}
                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      ></textarea>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center">
                    <div className="p-10 bg-slate-900 rounded-[40px] relative overflow-hidden shadow-2xl">
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-patriotic-green/20 rounded-full blur-3xl"></div>
                      <div className="relative z-10">
                        <div className="text-[10px] font-black text-patriotic-green uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                          <Globe size={14} /> Google Search Preview
                        </div>
                        <div className="text-blue-400 text-2xl font-bold mb-2 hover:underline cursor-pointer line-clamp-2">
                          {formData.meta_title || formData.title || 'Título da Página'}
                        </div>
                        <div className="text-emerald-500 text-sm font-medium mb-4">
                          seusite.com.br/p/{formData.slug || 'url-da-pagina'}
                        </div>
                        <div className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                          {formData.meta_description || 'Uma descrição bem escrita ajuda a atrair mais cliques nos resultados de busca. Escreva algo convincente!'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
