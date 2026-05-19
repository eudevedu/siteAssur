import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  Phone, 
  Calendar, 
  CheckCircle2,
  Clock,
  Archive,
  Trash2,
  MessageSquare,
  Loader2,
  MapPin,
  Briefcase,
  Instagram,
  UserPlus,
  Download,
  Eye,
  Info
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { logsApi } from '../../lib/api/logs'
import ConfirmModal from '../components/ConfirmModal'

const statusMap = {
  new: { label: 'Novo', color: 'bg-blue-100 text-blue-700', icon: Clock },
  contacted: { label: 'Contatado', color: 'bg-purple-100 text-purple-700', icon: MessageSquare },
  qualified: { label: 'Qualificado', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  converted: { label: 'Convertido', color: 'bg-amber-100 text-amber-700', icon: CheckCircle2 },
  archived: { label: 'Arquivado', color: 'bg-slate-100 text-slate-700', icon: Archive },
}

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSource, setFilterSource] = useState('all')
  const [forms, setForms] = useState([])
  
  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [leadToDelete, setLeadToDelete] = useState(null)

  useEffect(() => {
    fetchLeads()
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      const { data, error } = await supabase.from('forms').select('title, slug')
      if (error) throw error
      setForms(data || [])
    } catch (error) {
      console.error('Erro ao buscar formulários:', error)
    }
  }

  const getSourceTitle = (source) => {
    if (!source || source === 'landing_page') return 'Página Principal'
    const form = forms.find(f => f.slug === source)
    return form ? form.title : source
  }

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setLeads(data || [])
    } catch (error) {
      console.error('Erro ao buscar leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateLeadStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error
      
      const lead = leads.find(l => l.id === id)
      await logsApi.logAction('Atualizou status de lead', 'lead', id, { name: lead?.name, status: newStatus })
      
      setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead))
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const deleteLead = async () => {
    if (!leadToDelete) return

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadToDelete.id)

      if (error) throw error
      
      await logsApi.logAction('Excluiu lead', 'lead', leadToDelete.id, { name: leadToDelete.name })
      
      setLeads(leads.filter(lead => lead.id !== leadToDelete.id))
      setLeadToDelete(null)
    } catch (error) {
      console.error('Erro ao excluir lead:', error)
    }
  }

  const handleDeleteClick = (lead) => {
    setLeadToDelete(lead)
    setIsDeleteModalOpen(true)
  }

  const exportToCSV = () => {
    if (filteredLeads.length === 0) {
      alert('Não há leads para exportar.')
      return
    }

    const headers = [
      'Nome',
      'Telefone',
      'Cidade',
      'Bairro',
      'Profissão',
      'Instagram',
      'Indicação',
      'Status',
      'Origem',
      'Data de Criação'
    ]

    const rows = filteredLeads.map(lead => [
      lead.name,
      lead.phone,
      lead.city || '',
      lead.neighborhood || '',
      lead.profession || '',
      lead.instagram || '',
      lead.referrer || '',
      statusMap[lead.status]?.label || lead.status,
      getSourceTitle(lead.source),
      new Date(lead.created_at).toLocaleDateString('pt-BR')
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    const timestamp = new Date().toISOString().split('T')[0]
    link.setAttribute('href', url)
    link.setAttribute('download', `leads-${timestamp}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.city && lead.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.neighborhood && lead.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.profession && lead.profession.toLowerCase().includes(searchTerm.toLowerCase())) ||
      lead.phone.includes(searchTerm)
    
      const matchesFilter = filterStatus === 'all' || lead.status === filterStatus
      
      // Smart source matching: match by slug OR by title (for legacy data)
      const matchesSource = filterSource === 'all' || 
                           lead.source === filterSource || 
                           (forms.find(f => f.slug === filterSource)?.title === lead.source)

      return matchesSearch && matchesFilter && matchesSource
    })

    const sourcesOptions = [
      ...forms.map(f => ({ value: f.slug, label: f.title })),
      ...leads
        .map(l => l.source)
        .filter(s => {
          if (!s || s === 'landing_page') return false
          // Ignore if it's already a slug or a title of an existing form
          if (forms.find(f => f.slug === s || f.title === s)) return false
          return true
        })
        .map(s => ({ value: s, label: s }))
    ]
    
    // Deduplicate by label to ensure a clean UI
    const uniqueSources = Array.from(new Map(sourcesOptions.map(item => [item.label, item])).values())
      .sort((a, b) => a.label.localeCompare(b.label))

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Leads & Contatos</h1>
          <p className="text-slate-500">Gerencie as pessoas que entraram em contato pelo site.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-sm"
            title="Exportar lista atual para CSV"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2">
            <Users size={20} className="text-patriotic-green" />
            <span className="font-bold text-slate-700">{leads.length} Total</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome, cidade, bairro, profissão..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-patriotic-green/20 focus:border-patriotic-green transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <select
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-patriotic-green/20 focus:border-patriotic-green appearance-none transition-all"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Todos os Status</option>
            <option value="new">Novos</option>
            <option value="contacted">Contatados</option>
            <option value="qualified">Qualificados</option>
            <option value="converted">Convertidos</option>
            <option value="archived">Arquivados</option>
          </select>
        </div>

        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <select
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-patriotic-green/20 focus:border-patriotic-green appearance-none transition-all"
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
          >
            <option value="all">Todas as Origens</option>
            {uniqueSources.map(source => (
              <option key={source.value} value={source.value}>{source.label}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={fetchLeads}
          className="flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all font-bold"
        >
          <Loader2 size={20} className={loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider">Lead</th>
                <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider">Origem</th>
                <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider">Localização / Info</th>
                <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider">Outros Dados</th>
                <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-patriotic-green mb-2" size={32} />
                    <p className="text-slate-500 font-medium">Carregando leads...</p>
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <Users size={32} />
                    </div>
                    <p className="text-slate-500 font-medium">Nenhum lead encontrado.</p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                          {lead.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{lead.name}</div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                            <Phone size={12} /> {lead.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {getSourceTitle(lead.source)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin size={14} className="text-slate-400" />
                          {lead.city} - {lead.neighborhood}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                          <Briefcase size={14} className="text-slate-400" />
                          {lead.profession}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {lead.instagram && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Instagram size={14} className="text-pink-500" />
                            {lead.instagram}
                          </div>
                        )}
                        {lead.referrer && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <UserPlus size={14} className="text-blue-500" />
                            Indicação: {lead.referrer}
                          </div>
                        )}
                        {lead.message && (
                          <div className="pt-2">
                            <div className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 group/msg relative">
                              <Info size={14} className="text-patriotic-green mt-0.5 shrink-0" />
                              <div className="text-[10px] text-slate-500 font-medium whitespace-pre-line leading-relaxed max-h-[60px] overflow-hidden group-hover/msg:max-h-none transition-all">
                                {lead.message}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusMap[lead.status]?.color || 'bg-slate-100 text-slate-700'}`}>
                        {React.createElement(statusMap[lead.status]?.icon || Clock, { size: 12 })}
                        {statusMap[lead.status]?.label || lead.status}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 font-medium">
                        {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <select 
                          className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-patriotic-green"
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        >
                          <option value="new">Novo</option>
                          <option value="contacted">Contatado</option>
                          <option value="qualified">Qualificado</option>
                          <option value="converted">Convertido</option>
                          <option value="archived">Arquivado</option>
                        </select>
                        
                        <a 
                          href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Falar no WhatsApp"
                        >
                          <MessageSquare size={18} />
                        </a>

                        <button 
                          onClick={() => handleDeleteClick(lead)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteLead}
        title="Excluir Lead?"
        description={`Tem certeza que deseja excluir o lead "${leadToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir Agora"
        cancelText="Manter Lead"
        variant="danger"
      />
    </div>
  )
}
