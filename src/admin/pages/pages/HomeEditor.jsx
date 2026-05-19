import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Save, 
  Globe, 
  Share2, 
  Phone, 
  Palette, 
  Layout, 
  Monitor, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Plus,
  Trash2
} from 'lucide-react'
import { settingsApi } from '../../../lib/api/settings'
import { logsApi } from '../../../lib/api/logs'
import { useSettings } from '../../../context/SettingsContext'
import ImageUploader from '../../components/ui/ImageUploader'

export default function HomeEditor() {
  const navigate = useNavigate()
  const { settings: currentSettings, refreshSettings } = useSettings()
  const [activeTab, setActiveTab] = useState('hero')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  
  const [formData, setFormData] = useState({
    general: { name: '', shortName: '', slogan: '', description: '' },
    contact: { email: '', phone: '', address: '' },
    socials: { facebook: '', instagram: '', twitter: '', youtube: '', whatsapp: '' },
    colors: { primary: '#006738', secondary: '#FFD100', accent: '#0038A8' },
    hero: { title: '', titleAccent: '', ctaPrimary: '', ctaSecondary: '', hero_image_url: '', ctaSecondaryUrl: '' },
    nav: { sticky: true, showContactButton: true },
    footer: { copyrightText: '', showTransparencyLink: true, links: [] },
    leadForm: { title: '', titleAccent: '', subtitle: '', buttonText: '', successTitle: '', successMessage: '', redirectUrl: '' }
  })

  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (currentSettings && !isInitialized) {
      setFormData(currentSettings)
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
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      await settingsApi.updateMultiple(formData)
      setMessage({ type: 'success', text: 'Página inicial atualizada com sucesso!' })
      
      // Run secondary updates and audit logging in the background without blocking the UI
      refreshSettings()
      logsApi.logAction('Atualizou Página Inicial', 'page', 'home')
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'Erro ao salvar alterações.' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 5000)
    }
  }

  const tabs = [
    { id: 'hero', label: 'Conteúdo Hero', icon: Layout },
  ]

  if (!currentSettings && !loading) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-patriotic-green" size={40} /></div>

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/pages')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Editar Página Inicial</h1>
            <p className="text-slate-500">Personalize o visual, as cores e as informações principais do seu site.</p>
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
            Publicar Alterações
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-patriotic-green text-white shadow-md' 
                  : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200 shadow-sm'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8">
              <form onSubmit={handleSave} className="space-y-8">
                {activeTab === 'hero' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Título Principal (Hero)</label>
                      <input 
                        type="text" 
                        value={formData.hero.title || ''}
                        onChange={(e) => handleInputChange('hero', 'title', e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-patriotic-green outline-none transition-all"
                        placeholder="Ex: Juntos por uma cidade..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Palavra de Destaque (Gradiante)</label>
                      <input 
                        type="text" 
                        value={formData.hero.titleAccent || ''}
                        onChange={(e) => handleInputChange('hero', 'titleAccent', e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-patriotic-green outline-none transition-all"
                        placeholder="Ex: Melhor"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Texto Botão Primário</label>
                        <input 
                          type="text" 
                          value={formData.hero.ctaPrimary || ''}
                          onChange={(e) => handleInputChange('hero', 'ctaPrimary', e.target.value)}
                          className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-patriotic-green outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Texto Botão Secundário</label>
                        <input 
                          type="text" 
                          value={formData.hero.ctaSecondary || ''}
                          onChange={(e) => handleInputChange('hero', 'ctaSecondary', e.target.value)}
                          className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-patriotic-green outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Link do Botão Secundário</label>
                      <input 
                        type="url" 
                        value={formData.hero.ctaSecondaryUrl || ''}
                        onChange={(e) => handleInputChange('hero', 'ctaSecondaryUrl', e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-patriotic-green outline-none"
                        placeholder="https://instagram.com/seu-perfil"
                      />
                    </div>
                    <div className="pt-4">
                      <ImageUploader 
                        label="Imagem de Destaque (Hero)"
                        value={formData.hero.hero_image_url}
                        onChange={(url) => handleInputChange('hero', 'hero_image_url', url)}
                      />
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
