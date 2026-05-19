import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Loader2,
  MessageSquare,
  Eye,
  Settings as SettingsIcon,
  AlertTriangle,
  X,
  Check
} from 'lucide-react'
import { formsApi } from '../../../lib/api/forms'
import { supabase } from '../../../lib/supabase'
import { logsApi } from '../../../lib/api/logs'

export default function FormsList() {
  const navigate = useNavigate()
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [isActionLoading, setIsActionLoading] = useState(false)

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    setLoading(true)
    try {
      const data = await formsApi.getAll()
      setForms(data || [])
    } catch (error) {
      console.error('Erro ao buscar formulários:', error)
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
      const formToDelete = forms.find(f => f.id === id)
      
      await formsApi.delete(id)
      
      // Also delete related leads from the CRM
      if (formToDelete && formToDelete.slug) {
        await supabase.from('leads').delete().eq('source', formToDelete.slug)
        await logsApi.logAction('Excluiu formulário e seus leads', 'form', id, { title: formToDelete.title, slug: formToDelete.slug })
      }
      
      setForms(forms.filter(f => f.id !== id))
      setDeletingId(null)
    } catch (error) {
      console.error('Erro ao excluir formulário:', error)
      alert('Erro ao excluir formulário: ' + error.message)
    } finally {
      setIsActionLoading(false)
    }
  }

  const allForms = forms

  const filteredForms = allForms.filter(form => 
    form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Formulários Personalizados</h1>
          <p className="text-slate-500">Crie e gerencie formulários para diferentes finalidades (pesquisas, filiação, ouvidoria).</p>
        </div>
        
        <Link 
          to="/admin/forms/new"
          className="flex items-center gap-2 px-6 py-3 bg-patriotic-green text-white rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
        >
          <Plus size={20} />
          Criar Novo Formulário
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Buscar formulários..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-patriotic-green/20 focus:border-patriotic-green transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="animate-spin mx-auto text-patriotic-green mb-4" size={40} />
          <p className="text-slate-500 font-medium">Carregando formulários...</p>
        </div>
      ) : filteredForms.length === 0 ? (
        <div className="bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <ClipboardList size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum formulário criado</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">Comece a coletar dados importantes criando seu primeiro formulário personalizado.</p>
          <Link 
            to="/admin/forms/new"
            className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
          >
            <Plus size={20} /> Criar Primeiro Formulário
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.map((form) => (
            <div key={form.id} className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              
              {/* Inline Confirmation Overlay */}
              {deletingId === form.id && (
                <div className="absolute inset-0 z-20 bg-red-600 p-6 flex flex-col items-center justify-center text-center text-white animate-in fade-in duration-200">
                  <AlertTriangle size={32} className="mb-2" />
                  <h4 className="font-bold mb-1">Excluir formulário?</h4>
                  <p className="text-xs text-white/80 mb-6">Esta ação não pode ser desfeita e apagará todas as respostas.</p>
                  <div className="flex gap-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingId(null);
                      }}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, form.id)}
                      disabled={isActionLoading}
                      className="px-6 py-2 bg-white text-red-600 rounded-lg text-sm font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                      {isActionLoading ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                      EXCLUIR
                    </button>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${form.type === 'system' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                    {form.type === 'system' ? <SettingsIcon size={24} /> : <ClipboardList size={24} />}
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => navigate(form.submissionsPath || `/admin/forms/submissions/${form.id}`)}
                      className="p-2 text-slate-400 hover:text-patriotic-green hover:bg-patriotic-green/5 rounded-xl transition-all"
                      title="Ver Respostas"
                    >
                      <MessageSquare size={18} />
                    </button>
                    <button 
                      onClick={() => navigate(form.editPath || `/admin/forms/edit/${form.id}`)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-patriotic-green transition-colors">{form.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{form.description || 'Sem descrição.'}</p>
                
                <div className="flex items-center gap-2 text-xs font-mono bg-slate-50 p-2 rounded-lg text-slate-600 mb-6">
                  <Eye size={12} /> /f/{form.slug}
                </div>
              </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {form.fields?.length || 0} Campos
                </span>
                <div className="flex gap-2">
                  <a 
                    href={form.type === 'system' ? `/${form.slug}` : `/f/${form.slug}`}
                    rel="noreferrer"
                    className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    <ExternalLink size={18} />
                  </a>
                  {form.type !== 'system' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingId(form.id);
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
