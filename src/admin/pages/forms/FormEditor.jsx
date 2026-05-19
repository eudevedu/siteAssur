import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  GripVertical,
  Type,
  Mail,
  Phone,
  Hash,
  AlignLeft,
  ChevronDown,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { formsApi } from '../../../lib/api/forms'
import { logsApi } from '../../../lib/api/logs'
import slugify from 'slugify'

const FIELD_TYPES = [
  { id: 'text', label: 'Texto Curto', icon: Type },
  { id: 'textarea', label: 'Texto Longo', icon: AlignLeft },
  { id: 'email', label: 'E-mail', icon: Mail },
  { id: 'tel', label: 'Telefone', icon: Phone },
  { id: 'number', label: 'Número', icon: Hash },
  { id: 'select', label: 'Seleção (Dropdown)', icon: ChevronDown },
]

export default function FormEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(id ? true : false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    fields: [],
    settings: {
      submitButtonText: 'Enviar',
      successMessage: 'Obrigado por preencher o formulário!',
      redirectUrl: '',
      sidebarFooterText: 'Junte-se a nós nessa caminhada!'
    }
  })

  useEffect(() => {
    if (id) fetchForm()
  }, [id])

  const fetchForm = async () => {
    try {
      const data = await formsApi.getAll()
      const form = data.find(f => f.id === id)
      if (form) {
        setFormData(form)
      } else {
        setError('Formulário não encontrado.')
      }
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar formulário.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddField = (type) => {
    const newField = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: `Novo Campo de ${FIELD_TYPES.find(t => t.id === type).label}`,
      placeholder: '',
      required: false,
      options: type === 'select' ? ['Opção 1', 'Opção 2'] : []
    }
    setFormData({ ...formData, fields: [...formData.fields, newField] })
  }

  const handleUpdateField = (fieldId, updates) => {
    const newFields = formData.fields.map(f => 
      f.id === fieldId ? { ...f, ...updates } : f
    )
    setFormData({ ...formData, fields: newFields })
  }

  const handleRemoveField = (fieldId) => {
    setFormData({ ...formData, fields: formData.fields.filter(f => f.id !== fieldId) })
  }

  const handleMoveField = (index, direction) => {
    const newFields = [...formData.fields]
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= newFields.length) return
    
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]]
    setFormData({ ...formData, fields: newFields })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (id) {
        await formsApi.update(id, formData)
        await logsApi.logAction('Editou formulário', 'form', id, { title: formData.title })
      } else {
        const slug = formData.slug || slugify(formData.title, { lower: true, strict: true })
        const newForm = await formsApi.create({ ...formData, slug })
        await logsApi.logAction('Criou novo formulário', 'form', newForm?.id, { title: formData.title, slug })
      }
      navigate('/admin/forms')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Erro ao salvar formulário.')
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
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin/forms" className="p-2 hover:bg-slate-100 rounded-lg transition-colors shrink-0">
            <ArrowLeft size={24} className="text-slate-600" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 truncate">{id ? 'Editar Formulário' : 'Novo Formulário'}</h1>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-patriotic-green text-white rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Salvar Formulário
        </button>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Informações Básicas</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Título</label>
              <input 
                required
                type="text" 
                className="w-full p-3 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-xl outline-none transition-all font-medium"
                placeholder="Ex: Pesquisa de Bairro"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Slug (URL)</label>
              <input 
                type="text" 
                className="w-full p-3 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-xl outline-none transition-all font-mono text-sm"
                placeholder="pesquisa-bairro"
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Descrição</label>
              <textarea 
                className="w-full p-3 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-xl outline-none transition-all font-medium min-h-[100px]"
                placeholder="Descreva o propósito deste formulário..."
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Configurações de Envio</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Texto do Botão</label>
              <input 
                type="text" 
                className="w-full p-3 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-xl outline-none transition-all font-medium"
                value={formData.settings.submitButtonText || ''}
                onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, submitButtonText: e.target.value } })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Mensagem de Sucesso</label>
              <input 
                type="text" 
                className="w-full p-3 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-xl outline-none transition-all font-medium"
                value={formData.settings.successMessage || ''}
                onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, successMessage: e.target.value } })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                Link de Redirecionamento
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">(Opcional)</span>
              </label>
              <input 
                type="text" 
                className="w-full p-3 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-xl outline-none transition-all font-medium"
                placeholder="https://wa.me/..."
                value={formData.settings.redirectUrl || ''}
                onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, redirectUrl: e.target.value } })}
              />
              <p className="text-[10px] text-slate-500 ml-1">Ex: Link do WhatsApp ou página de obrigado.</p>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-50">
              <label className="text-sm font-bold text-slate-700 ml-1">Texto do Rodapé Lateral</label>
              <input 
                type="text" 
                className="w-full p-3 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-xl outline-none transition-all font-medium"
                placeholder="Ex: Junte-se a nós nessa caminhada!"
                value={formData.settings.sidebarFooterText || ''}
                onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, sidebarFooterText: e.target.value } })}
              />
              <p className="text-[10px] text-slate-500 ml-1">Texto que aparece na barra lateral do formulário.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Fields Builder */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm min-h-[500px]">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Campos do Formulário</h2>
                <p className="text-slate-500 text-sm">Monte seu formulário adicionando os campos abaixo.</p>
              </div>

              {/* Field Types Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                {FIELD_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => handleAddField(type.id)}
                    className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-patriotic-green hover:text-patriotic-green hover:shadow-md transition-all group"
                  >
                    <div className="p-2 bg-slate-50 group-hover:bg-patriotic-green/10 rounded-lg transition-colors">
                      <type.icon size={18} className="text-slate-400 group-hover:text-patriotic-green" />
                    </div>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {formData.fields.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                  <p className="text-slate-400 font-medium">Nenhum campo adicionado ainda.<br />Clique nos tipos de campo acima para começar.</p>
                </div>
              ) : (
                formData.fields.map((field, index) => (
                  <div key={field.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 group relative">
                    <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="text-slate-300" />
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Etiqueta (Label)</label>
                            <input 
                              type="text" 
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-patriotic-green text-sm font-bold"
                              value={field.label}
                              onChange={(e) => handleUpdateField(field.id, { label: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Placeholder</label>
                            <input 
                              type="text" 
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-patriotic-green text-sm"
                              value={field.placeholder || ''}
                              onChange={(e) => handleUpdateField(field.id, { placeholder: e.target.value })}
                            />
                          </div>
                        </div>

                        {field.type === 'select' && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Opções (Separadas por vírgula)</label>
                            <input 
                              type="text" 
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-patriotic-green text-sm"
                              value={field.options.join(', ')}
                              onChange={(e) => handleUpdateField(field.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex md:flex-col justify-end gap-2">
                        <div className="flex items-center gap-2 mr-4 md:mr-0 md:mb-4">
                          <input 
                            type="checkbox" 
                            id={`req-${field.id}`}
                            checked={field.required}
                            onChange={(e) => handleUpdateField(field.id, { required: e.target.checked })}
                            className="w-4 h-4 accent-patriotic-green"
                          />
                          <label htmlFor={`req-${field.id}`} className="text-[10px] font-black uppercase text-slate-500">Obrigatório</label>
                        </div>
                        
                        <div className="flex gap-1">
                          <button onClick={() => handleMoveField(index, -1)} className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900"><MoveUp size={14} /></button>
                          <button onClick={() => handleMoveField(index, 1)} className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900"><MoveDown size={14} /></button>
                          <button onClick={() => handleRemoveField(field.id)} className="p-1.5 bg-white border border-slate-200 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute top-2 right-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                      {FIELD_TYPES.find(t => t.id === field.type).label}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
