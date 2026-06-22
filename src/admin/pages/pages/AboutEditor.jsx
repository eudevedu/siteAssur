import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Save, 
  Layout, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Type,
  AlignLeft,
  Heart
} from 'lucide-react'
import { settingsApi } from '../../../lib/api/settings'
import { logsApi } from '../../../lib/api/logs'
import { useSettings } from '../../../context/SettingsContext'
import ImageUploader from '../../components/ui/ImageUploader'

export default function AboutEditor() {
  const navigate = useNavigate()
  const { settings: currentSettings, refreshSettings } = useSettings()
  const [isInitialized, setIsInitialized] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [formData, setFormData] = useState({
    about: {
      title: '',
      subtitle: '',
      content: '',
      image_url: '',
      mission: '',
      values: '',
      purpose: '',
      badgeTitle: '',
      badgeDescription: ''
    }
  })

  useEffect(() => {
    if (currentSettings?.about && !isInitialized) {
      setFormData({
        about: {
          title: currentSettings.about.title || '',
          subtitle: currentSettings.about.subtitle || '',
          content: currentSettings.about.content || '',
          image_url: currentSettings.about.image_url || '',
          mission: currentSettings.about.mission || '',
          values: currentSettings.about.values || '',
          purpose: currentSettings.about.purpose || '',
          badgeTitle: currentSettings.about.badgeTitle || '',
          badgeDescription: currentSettings.about.badgeDescription || ''
        }
      })
      setIsInitialized(true)
    }
  }, [currentSettings, isInitialized])

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setSaving(true)
    setMessage(null)
    
    try {
      await settingsApi.update('about', formData.about)
      setMessage({ type: 'success', text: 'Página Sobre atualizada com sucesso!' })
      alert('Página Sobre salva com sucesso no banco de dados!')
      
      // Run secondary updates and audit logging in the background without blocking the UI
      refreshSettings()
      logsApi.logAction('Atualizou Página Sobre', 'page', 'about')
    } catch (err) {
      console.error('Erro detalhado ao salvar Página Sobre:', err)
      alert('Erro ao salvar no banco de dados:\n' + (err.message || err.description || JSON.stringify(err)))
      setMessage({ type: 'error', text: 'Erro ao salvar alterações.' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 5000)
    }
  }

  if (!currentSettings && !loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="animate-spin text-patriotic-green" size={40} />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/pages')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Editar Página Sobre</h1>
            <p className="text-slate-500">Edite sua biografia, história e foto de perfil de forma simplificada.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {message && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border animate-in fade-in slide-in-from-right-4 ${
              message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-patriotic-green text-white rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Salvar Alterações
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden text-left">
        <div className="p-8 md:p-12">
          <form onSubmit={handleSave} className="space-y-8">
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                    <Type size={14} /> Título da Página
                  </label>
                  <input 
                    type="text" 
                    value={formData.about.title || ''}
                    onChange={(e) => handleInputChange('about', 'title', e.target.value)}
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-patriotic-green/20 focus:border-patriotic-green outline-none transition-all font-bold text-lg"
                    placeholder="Ex: Sobre Assur Mesquita"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                    <Layout size={14} /> Subtítulo
                  </label>
                  <input 
                    type="text" 
                    value={formData.about.subtitle || ''}
                    onChange={(e) => handleInputChange('about', 'subtitle', e.target.value)}
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-patriotic-green/20 focus:border-patriotic-green outline-none transition-all font-medium"
                    placeholder="Ex: Conheça nossa trajetória..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                  <AlignLeft size={14} /> História / Biografia (Texto)
                </label>
                <textarea 
                  value={formData.about.content || ''}
                  onChange={(e) => handleInputChange('about', 'content', e.target.value)}
                  className="w-full p-6 rounded-3xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-patriotic-green/20 focus:border-patriotic-green outline-none transition-all font-medium min-h-[400px] leading-relaxed"
                  placeholder="Escreva aqui sua biografia completa..."
                />
                <p className="text-[10px] text-slate-400 italic">Dica: O texto será formatado automaticamente com parágrafos no site.</p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-6">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Heart size={16} className="text-red-500" />
                  Emblema Lateral da Foto (Destaque)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Título do Emblema</label>
                    <input 
                      type="text" 
                      value={formData.about.badgeTitle || ''}
                      onChange={(e) => handleInputChange('about', 'badgeTitle', e.target.value)}
                      className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-patriotic-green/20 focus:border-patriotic-green outline-none transition-all font-semibold"
                      placeholder="Ex: Compromisso Real"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Descrição do Emblema</label>
                    <input 
                      type="text" 
                      value={formData.about.badgeDescription || ''}
                      onChange={(e) => handleInputChange('about', 'badgeDescription', e.target.value)}
                      className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-patriotic-green/20 focus:border-patriotic-green outline-none transition-all text-sm font-medium"
                      placeholder="Dedicação total à nossa gente e ao futuro da região."
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <ImageUploader 
                  label="Foto de Perfil / Biografia"
                  value={formData.about.image_url}
                  onChange={(url) => handleInputChange('about', 'image_url', url)}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
