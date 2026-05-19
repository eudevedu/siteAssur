import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Briefcase, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Star,
  ChevronRight,
  Filter,
  AlertTriangle,
  X,
  Check
} from 'lucide-react'
import { projectsApi } from '../../../lib/api/projects'
import { logsApi } from '../../../lib/api/logs'

export default function ProjectsList() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // all, published, draft
  const [deletingId, setDeletingId] = useState(null)
  const [isActionLoading, setIsActionLoading] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const data = await projectsApi.getAll()
      setProjects(data || [])
    } catch (error) {
      console.error('Erro ao buscar projetos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (e, id) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    setIsActionLoading(true)
    try {
      const projectToDelete = projects.find(p => p.id === id)
      await projectsApi.delete(id)
      
      if (projectToDelete) {
        await logsApi.logAction('Excluiu projeto', 'project', id, { title: projectToDelete.title, slug: projectToDelete.slug })
      }

      setProjects(projects.filter(p => p.id !== id))
      setDeletingId(null)
    } catch (error) {
      console.error('Erro ao excluir projeto:', error)
      alert('Erro ao excluir projeto: ' + error.message)
    } finally {
      setIsActionLoading(false)
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || project.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Meus Projetos</h1>
          <p className="text-slate-500">Gerencie as obras, conquistas e ações do seu mandato.</p>
        </div>
        
        <Link 
          to="/admin/projects/new"
          className="flex items-center gap-2 px-6 py-3 bg-patriotic-green text-white rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
        >
          <Plus size={20} />
          Novo Projeto
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
            { id: 'all', label: 'Todos' },
            { id: 'published', label: 'Publicados' },
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
                <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider">Projeto</th>
                <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider">Categoria</th>
                <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider">Destaque</th>
                <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-patriotic-green mb-2" size={32} />
                    <p className="text-slate-500 font-medium">Carregando projetos...</p>
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <Briefcase size={32} />
                    </div>
                    <p className="text-slate-500 font-medium">Nenhum projeto encontrado.</p>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50/50 transition-colors group relative">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                          {project.cover_image_url ? (
                            <img src={project.cover_image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                              <Briefcase size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{project.title}</div>
                          <div className="text-xs text-slate-400 font-medium truncate max-w-[200px]">
                            {project.description || 'Sem descrição.'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-black uppercase tracking-widest">
                        {project.categories?.name || 'Geral'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {project.featured ? (
                        <div className="flex items-center gap-1 text-patriotic-yellow">
                          <Star size={16} fill="currentColor" />
                          <span className="text-xs font-bold">Sim</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Não</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${project.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {project.status === 'published' ? <Eye size={12} /> : <EyeOff size={12} />}
                        {project.status === 'published' ? 'Publicado' : 'Rascunho'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      {/* Confirmation Overlay */}
                      {deletingId === project.id && (
                        <div className="absolute inset-0 z-20 bg-red-600 px-6 flex items-center justify-end gap-3 text-white animate-in slide-in-from-right duration-200">
                          <div className="flex items-center gap-2 text-sm font-bold">
                            <AlertTriangle size={16} /> Excluir este projeto?
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setDeletingId(null)}
                              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-all"
                            >
                              Não
                            </button>
                            <button 
                              onClick={(e) => handleDelete(e, project.id)}
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
                          onClick={() => navigate(`/admin/projects/edit/${project.id}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-all font-bold text-xs shadow-sm"
                        >
                          <Edit2 size={14} />
                          Editar
                        </button>
                        
                        <a 
                          href={`/projetos/${project.slug}`}
                          rel="noreferrer"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver no site"
                        >
                          <ExternalLink size={16} />
                        </a>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(project.id);
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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

      {/* Info Box */}
      <div className="bg-patriotic-green/5 border border-patriotic-green/10 p-6 rounded-2xl flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-patriotic-green/10 flex items-center justify-center text-patriotic-green shrink-0">
          <Star size={20} />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-slate-900">Destaques da Vitrine</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            Os projetos marcados como <strong>Destaque</strong> aparecerão na seção principal da sua página inicial. 
            Use isso para dar visibilidade às suas maiores conquistas.
          </p>
        </div>
      </div>
    </div>
  )
}
