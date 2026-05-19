import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { postsApi } from '../../lib/api/posts'
import { projectsApi } from '../../lib/api/projects'
import { formsApi } from '../../lib/api/forms'
import { supabase } from '../../lib/supabase'
import { FileText, Briefcase, ClipboardList, Users, Eye, TrendingUp, Clock, Plus, Loader2, ArrowUpRight } from 'lucide-react'

const StatCard = ({ label, value, icon: Icon, color, trend }) => (
  <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm premium-card group relative overflow-hidden">
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-4 rounded-2xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform duration-500`}>
        <Icon size={24} />
      </div>
      {trend && (
        <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 uppercase tracking-tighter">
          <TrendingUp size={10} />
          +{trend}%
        </span>
      )}
    </div>
    <div className="relative z-10">
      <div className="text-3xl font-display font-black text-slate-900 mb-1">{value}</div>
      <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">{label}</div>
    </div>
    
    {/* Decorative background element */}
    <div className={`absolute -bottom-6 -right-6 w-24 h-24 bg-${color}-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
  </div>
)

export default function Dashboard() {
  const [stats, setStats] = useState({ posts: 0, projects: 0, forms: 0, leads: 0 })
  const [recentLeads, setRecentLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [posts, projects, forms, leadsResponse] = await Promise.all([
          postsApi.getAll(),
          projectsApi.getAll(),
          formsApi.getAll(),
          supabase.from('leads').select('*').order('created_at', { ascending: false })
        ])

        setStats({
          posts: posts.length,
          projects: projects.length,
          forms: forms.length,
          leads: leadsResponse.data?.length || 0
        })

        setRecentLeads(leadsResponse.data?.slice(0, 3) || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-patriotic-green" size={40} />
        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Carregando painel...</span>
      </div>
    </div>
  )

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display font-black text-slate-900 mb-2">Visão Geral</h1>
          <p className="text-slate-500 font-medium">Bem-vindo ao centro de comando do seu CMS.</p>
        </div>
        <button
          onClick={() => navigate('/admin/posts/new')}
          className="bg-patriotic-green text-white px-8 py-4 rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-patriotic-green/20 flex items-center gap-3"
        >
          <Plus size={20} />
          NOVA PUBLICAÇÃO
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Leads Totais" value={stats.leads} icon={Users} color="emerald" trend={12} />
        <StatCard label="Notícias Ativas" value={stats.posts} icon={FileText} color="blue" />
        <StatCard label="Projetos" value={stats.projects} icon={Briefcase} color="purple" />
        <StatCard label="Formulários" value={stats.forms} icon={ClipboardList} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div>
              <h3 className="text-xl font-display font-black text-slate-800">Leads Recentes</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Últimos contatos recebidos</p>
            </div>
            <button 
              onClick={() => navigate('/admin/leads')} 
              className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-patriotic-green hover:bg-patriotic-green/5 px-4 py-2 rounded-full transition-all"
            >
              Ver todos <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
          
          <div className="space-y-3 relative z-10">
            {recentLeads.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 text-slate-400 text-sm font-medium italic">
                Nenhum lead recebido ainda.
              </div>
            ) : (
              recentLeads.map((lead) => (
                <div 
                  key={lead.id} 
                  onClick={() => navigate('/admin/leads')} 
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                    <Users size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <div className="font-bold text-slate-800 truncate">{lead.name}</div>
                      <div className="text-[9px] text-slate-400 font-black uppercase tracking-tighter flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 truncate">{lead.email || lead.phone}</div>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight size={14} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-900 p-10 rounded-[40px] text-white relative overflow-hidden flex flex-col justify-between group shadow-2xl shadow-slate-900/20">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-patriotic-yellow mb-6">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-3xl font-display font-black mb-4 leading-tight">Próximos<br />Passos</h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Você tem <span className="text-patriotic-yellow font-bold">{stats.leads} leads</span> na sua base.
              Aproveite o engajamento para converter mais apoiadores!
            </p>
            <button
              onClick={() => navigate('/admin/leads')}
              className="w-full bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-xs hover:bg-patriotic-yellow transition-all flex items-center justify-center gap-3"
            >
              RESPONDER AGORA
              <ArrowUpRight size={16} />
            </button>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 scale-150 transform translate-x-1/4 -translate-y-1/4">
            <Users size={240} />
          </div>
        </div>
      </div>
    </div>
  )
}
