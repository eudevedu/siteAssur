import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { postsApi } from '../../../lib/api/posts'
import { logsApi } from '../../../lib/api/logs'
import { 
  FileText, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Calendar,
  ChevronRight,
  Filter,
  Newspaper,
  AlertTriangle,
  X,
  Check
} from 'lucide-react'
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

export default function PostsList() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // all, published, draft
  const navigate = useNavigate()

  useEffect(() => {
    fetchPosts()
  }, [])

  const [deletingId, setDeletingId] = useState(null)
  const [isActionLoading, setIsActionLoading] = useState(false)

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const data = await postsApi.getAll()
      setPosts(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    setIsActionLoading(true)
    try {
      const postToDelete = posts.find(p => p.id === id)
      await postsApi.delete(id)
      
      if (postToDelete) {
        await logsApi.logAction('Excluiu notícia/post', 'post', id, { title: postToDelete.title, slug: postToDelete.slug })
      }

      setPosts(posts.filter(p => p.id !== id))
      setDeletingId(null)
    } catch (err) {
      alert('Erro ao excluir: ' + err.message)
    } finally {
      setIsActionLoading(false)
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || post.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notícias & Blog</h1>
          <p className="text-slate-500">Comunique suas ações e opiniões para seus eleitores.</p>
        </div>
        
        <Link 
          to="/admin/posts/new"
          className="flex items-center gap-2 px-6 py-3 bg-patriotic-green text-white rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
        >
          <Plus size={20} />
          Nova Notícia
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por título..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-patriotic-green/20 focus:border-patriotic-green transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'published', label: 'Publicadas' },
            { id: 'draft', label: 'Rascunhos' }
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === opt.id 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider">Notícia</th>
                <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider">Categoria</th>
                <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider">Data</th>
                <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-patriotic-green mb-2" size={32} />
                    <p className="text-slate-500 font-medium">Carregando notícias...</p>
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <Newspaper size={32} />
                    </div>
                    <p className="text-slate-500 font-medium">Nenhuma notícia encontrada.</p>
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/50 transition-colors group relative">
                    <td className="px-6 py-4">
                      {deletingId === post.id && (
                        <div className="absolute inset-0 z-10 bg-red-600 flex items-center justify-between px-6 text-white animate-in slide-in-from-right duration-200">
                          <div className="flex items-center gap-3">
                            <AlertTriangle size={20} />
                            <span className="font-bold text-sm">Excluir esta notícia permanentemente?</span>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setDeletingId(null)}
                              className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors"
                            >
                              Cancelar
                            </button>
                            <button 
                              onClick={() => handleDelete(post.id)}
                              disabled={isActionLoading}
                              className="px-6 py-1.5 bg-white text-red-600 rounded-lg text-xs font-black hover:bg-slate-100 transition-all flex items-center gap-2"
                            >
                              {isActionLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                              SIM, EXCLUIR
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                          {post.cover_image_url ? (
                            <img src={post.cover_image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                              <Newspaper size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1">{post.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">
                            /{post.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-black uppercase tracking-widest">
                        {post.categories?.name || 'Geral'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 font-medium flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-400" />
                        {format(new Date(post.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${post.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {post.status === 'published' ? <Eye size={12} /> : <EyeOff size={12} />}
                        {post.status === 'published' ? 'Publicada' : 'Rascunho'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => navigate(`/admin/posts/edit/${post.id}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-all font-bold text-xs"
                        >
                          <Edit2 size={14} />
                          Editar
                        </button>
                        
                        <a 
                          href={`/blog/${post.slug}`}
                          rel="noreferrer"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver no site"
                        >
                          <ExternalLink size={16} />
                        </a>

                        <button 
                          onClick={() => setDeletingId(post.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
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
    </div>
  )
}
