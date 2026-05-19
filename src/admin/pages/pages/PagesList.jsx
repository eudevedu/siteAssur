import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  FileText, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Loader2,
  Layout,
  Eye,
  Settings,
  ChevronRight,
  ClipboardList,
  AlertTriangle,
  X,
  Check,
  User
} from 'lucide-react'
import { pagesApi } from '../../../lib/api/pages'
import { formsApi } from '../../../lib/api/forms'
import { logsApi } from '../../../lib/api/logs'

export default function PagesList() {
  const navigate = useNavigate()
  const [pages, setPages] = useState([])
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingItem, setDeletingItem] = useState(null) // { id, type }
  const [isActionLoading, setIsActionLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [pagesData, formsData] = await Promise.all([
        pagesApi.getAll(),
        formsApi.getAll()
      ])
      setPages(pagesData || [])
      setForms(formsData || [])
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (e, item) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    const isForm = item.type === 'form'
    setIsActionLoading(true)
    
    try {
      if (isForm) {
        await formsApi.delete(item.id)
        await logsApi.logAction('Excluiu formulário', 'form', item.id, { title: item.title, slug: item.slug })
        setForms(forms.filter(f => f.id !== item.id))
      } else {
        await pagesApi.delete(item.id)
        await logsApi.logAction('Excluiu página customizada', 'page', item.id, { title: item.title, slug: item.slug })
        setPages(pages.filter(p => p.id !== item.id))
      }
      setDeletingItem(null)
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir: ' + error.message)
    } finally {
      setIsActionLoading(false)
    }
  }

  const systemPages = [
    { id: 'home', title: 'Página Inicial', slug: '', type: 'system', icon: Layout, editPath: '/admin/pages/home' },
    { id: 'sobre', title: 'Sobre', slug: 'sobre', type: 'system', icon: User, editPath: '/admin/pages/about' },
    { id: 'blog', title: 'Blog / Notícias', slug: 'blog', type: 'system', icon: FileText, editPath: '/admin/posts' },
    { id: 'projetos', title: 'Meu Trabalho', slug: 'projetos', type: 'system', icon: Layout, editPath: '/admin/projects' },
  ]

  const mappedForms = forms.map(form => ({
    id: form.id,
    title: form.title,
    slug: form.slug,
    type: 'form',
    icon: ClipboardList,
    editPath: `/admin/forms/edit/${form.id}`,
    viewPath: `/f/${form.slug}`
  }))

  const allPages = [...systemPages, ...mappedForms, ...pages]

  const filteredPages = allPages.filter(page => 
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (page.slug && page.slug.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gerenciar Páginas</h1>
          <p className="text-slate-500">Administre o menu, páginas do sistema e formulários personalizados.</p>
        </div>
        
        <Link 
          to="/admin/pages/new"
          className="flex items-center gap-2 px-6 py-3 bg-patriotic-green text-white rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
        >
          <Plus size={20} />
          Nova Página
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Buscar páginas ou formulários..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-patriotic-green/20 focus:border-patriotic-green transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-8 py-5 font-black text-slate-400 uppercase text-[10px] tracking-widest">Página / Link</th>
                <th className="px-8 py-5 font-black text-slate-400 uppercase text-[10px] tracking-widest">Tipo</th>
                <th className="px-8 py-5 font-black text-slate-400 uppercase text-[10px] tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-patriotic-green mb-4" size={40} />
                    <p className="text-slate-500 font-medium">Carregando estrutura do site...</p>
                  </td>
                </tr>
              ) : filteredPages.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-8 py-20 text-center text-slate-500">
                    Nenhuma página encontrada para sua busca.
                  </td>
                </tr>
              ) : (
                filteredPages.map((page) => (
                  <tr key={page.id} className="hover:bg-slate-50/50 transition-colors group relative">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          page.type === 'system' ? 'bg-amber-50 text-amber-600' : 
                          page.type === 'form' ? 'bg-blue-50 text-blue-600' : 'bg-patriotic-green/10 text-patriotic-green'
                        }`}>
                          {page.icon ? <page.icon size={24} /> : <FileText size={24} />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-lg">{page.title}</div>
                          <div className="text-xs font-mono text-slate-400">
                            {page.slug === '' ? '/' : `/${page.type === 'form' ? 'f' : 'p'}/${page.slug}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        page.type === 'system' ? 'bg-amber-100 text-amber-700' : 
                        page.type === 'form' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {page.type === 'system' ? 'Sistema' : page.type === 'form' ? 'Formulário' : 'Customizada'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right relative">
                      {/* Confirmation Overlay for Table Row */}
                      {deletingItem?.id === page.id && (
                        <div className="absolute inset-0 z-20 bg-red-600 px-8 flex items-center justify-end gap-4 text-white animate-in slide-in-from-right duration-200">
                          <div className="flex items-center gap-2 text-sm font-bold">
                            <AlertTriangle size={18} /> Excluir permanentemente?
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setDeletingItem(null)}
                              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-all"
                            >
                              Não
                            </button>
                            <button 
                              onClick={(e) => handleDelete(e, page)}
                              disabled={isActionLoading}
                              className="px-4 py-1.5 bg-white text-red-600 rounded-lg text-xs font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
                            >
                              {isActionLoading ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                              SIM, EXCLUIR
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => navigate(page.editPath || `/admin/pages/edit/${page.id}`)}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-bold text-sm shadow-sm"
                        >
                          <Edit2 size={14} />
                          Editar {page.type === 'system' ? 'Conteúdo' : ''}
                        </button>
                        
                        <a 
                          href={page.viewPath || (page.slug === '' ? '/' : (page.type === 'system' ? `/${page.slug}` : `/p/${page.slug}`))}
                          rel="noreferrer"
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Ver no site"
                        >
                          <ExternalLink size={20} />
                        </a>

                        {page.type !== 'system' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingItem(page);
                            }}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden group">
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-2xl font-bold mb-4">Dica de Gerenciamento</h3>
          <p className="text-slate-400 leading-relaxed">
            As páginas do sistema (Home, Blog, Projetos) são fundamentais e não podem ser excluídas, mas você pode editar todo o seu conteúdo a qualquer momento. 
            Páginas customizadas e formulários que você criar podem ser removidos quando não forem mais necessários.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
          <Settings size={180} />
        </div>
      </div>
    </div>
  )
}
