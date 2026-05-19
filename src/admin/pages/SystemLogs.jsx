import React, { useState, useEffect } from 'react'
import { 
  Shield, 
  History, 
  Search, 
  Filter, 
  User, 
  Clock, 
  Activity,
  FileText,
  ClipboardList,
  Briefcase,
  AlertCircle,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { logsApi } from '../../lib/api/logs'

export default function SystemLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await logsApi.getAll()
      setLogs(data || [])
    } catch (error) {
      console.error('Erro ao buscar logs:', error)
      setError('Não foi possível carregar os logs. Verifique se a tabela "system_logs" existe no Supabase.')
    } finally {
      setLoading(false)
    }
  }

  const getEntityIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'form': return <ClipboardList className="text-blue-500" size={18} />
      case 'post': return <FileText className="text-emerald-500" size={18} />
      case 'project': return <Briefcase className="text-amber-500" size={18} />
      default: return <Activity className="text-slate-400" size={18} />
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterType === 'all' || log.entity_type === filterType
    
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Shield className="text-patriotic-green" size={32} />
            Logs do Sistema
          </h1>
          <p className="text-slate-500">Histórico completo de ações administrativas e alterações no CMS.</p>
        </div>
        
        <button 
          onClick={fetchLogs}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por ação, usuário ou entidade..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-patriotic-green/20 focus:border-patriotic-green transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4">
          <select 
            className="px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-patriotic-green/20 font-bold text-slate-600 cursor-pointer"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Todas as Entidades</option>
            <option value="form">Formulários</option>
            <option value="post">Posts/Blog</option>
            <option value="project">Projetos</option>
            <option value="page">Páginas</option>
            <option value="user">Usuários</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin mx-auto text-patriotic-green mb-4" size={40} />
            <p className="text-slate-500 font-medium">Carregando histórico...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center px-6">
            <AlertCircle className="mx-auto text-red-400 mb-4" size={60} />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Erro ao carregar logs</h3>
            <p className="text-slate-500 mb-6">{error}</p>
            <div className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs font-mono text-left max-w-lg mx-auto overflow-x-auto">
              # Execute este SQL no Supabase:<br/>
              CREATE TABLE system_logs (...)
            </div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-20 text-center">
            <History className="mx-auto text-slate-200 mb-4" size={60} />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum registro encontrado</h3>
            <p className="text-slate-500">O histórico de atividades está limpo ou não corresponde à sua busca.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">Ação</th>
                  <th className="px-6 py-4">Entidade</th>
                  <th className="px-6 py-4">Data/Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                          {log.profiles?.full_name?.charAt(0) || <User size={14} />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {log.profiles?.full_name || (log.user_id ? `ID: ${log.user_id.substring(0, 8)}...` : 'Sistema')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700 font-medium">{log.action}</div>
                      {log.details && (
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono truncate max-w-xs">
                          {JSON.stringify(log.details)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                        {getEntityIcon(log.entity_type)}
                        <span className="text-xs font-bold uppercase tracking-wider">{log.entity_type || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock size={14} />
                        <span className="text-sm">
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
