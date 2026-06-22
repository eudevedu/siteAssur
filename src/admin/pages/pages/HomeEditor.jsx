import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Save, 
  Layout, 
  Monitor, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  FileText,
  Smartphone,
  Eye,
  Sparkles,
  ExternalLink,
  Instagram,
  User,
  Info,
  Award
} from 'lucide-react'
import { settingsApi } from '../../../lib/api/settings'
import { logsApi } from '../../../lib/api/logs'
import { useSettings } from '../../../context/SettingsContext'
import ImageUploader from '../../components/ui/ImageUploader'
import toast from 'react-hot-toast'

export default function HomeEditor() {
  const navigate = useNavigate()
  const { settings: currentSettings, refreshSettings } = useSettings()
  const [activeTab, setActiveTab] = useState('hero')
  const [saving, setSaving] = useState(false)
  const [device, setDevice] = useState('desktop')
  
  const [formData, setFormData] = useState({
    general: { name: '', shortName: '', slogan: '', description: '' },
    contact: { email: '', phone: '', address: '' },
    socials: { facebook: '', instagram: '', twitter: '', youtube: '', whatsapp: '' },
    colors: { primary: '#006738', secondary: '#FFD100', accent: '#0038A8' },
    hero: { title: '', titleAccent: '', ctaPrimary: '', ctaSecondary: '', hero_image_url: '', ctaSecondaryUrl: '', photoSub: '', badge1: '', badge2: '' },
    nav: { sticky: true, showContactButton: true },
    footer: { copyrightText: '', showTransparencyLink: true, links: [] },
    leadForm: { title: '', titleAccent: '', subtitle: '', buttonText: '', successTitle: '', successMessage: '', redirectUrl: '' },
    projects: { subtitle: '', title: '', titleAccent: '', listTitle: '', listDescription: '' },
    blog: { subtitle: '', title: '', titleAccent: '', listTitle: '', listDescription: '' }
  })

  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (currentSettings && !isInitialized) {
      setFormData(prev => ({
        ...prev,
        ...currentSettings,
        general: { ...prev.general, ...currentSettings.general },
        contact: { ...prev.contact, ...currentSettings.contact },
        socials: { ...prev.socials, ...currentSettings.socials },
        colors: { ...prev.colors, ...currentSettings.colors },
        hero: { ...prev.hero, ...currentSettings.hero },
        nav: { ...prev.nav, ...currentSettings.nav },
        footer: { ...prev.footer, ...currentSettings.footer },
        leadForm: { ...prev.leadForm, ...currentSettings.leadForm },
        projects: { ...prev.projects, ...currentSettings.projects },
        blog: { ...prev.blog, ...currentSettings.blog }
      }))
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
    const toastId = toast.loading('Publicando alterações na página inicial...')
    try {
      await settingsApi.updateMultiple(formData)
      toast.success('Página inicial atualizada com sucesso!', { id: toastId })
      refreshSettings()
      logsApi.logAction('Atualizou Página Inicial', 'page', 'home')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar alterações: ' + (err.message || 'Erro de conexão'), { id: toastId })
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'hero', label: 'Destaque (Hero)', icon: Layout },
    { id: 'projects', label: 'Seção de Projetos', icon: Award },
    { id: 'blog', label: 'Seção de Notícias', icon: FileText }
  ]

  if (!currentSettings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-patriotic-green" size={40} />
      </div>
    )
  }

  const primaryColor = formData.colors?.primary || '#006738'
  const secondaryColor = formData.colors?.secondary || '#FFD100'

  // Render Title for Hero Section with Custom Accent color
  const renderHeroTitle = () => {
    const title = formData.hero.title || 'Vamos juntos fazer o melhor!'
    const accent = formData.hero.titleAccent || 'melhor!'
    if (!title.includes(accent)) {
      return <span>{title} <span style={{ color: primaryColor }}>{accent}</span></span>
    }
    const parts = title.split(accent)
    return (
      <span>
        {parts[0]}
        <span style={{ color: primaryColor }} className="font-black">{accent}</span>
        {parts.slice(1).join(accent)}
      </span>
    )
  }

  // Render Section Title with Custom Accent color
  const renderSectionTitle = (titleVal, accentVal, fallbackTitle, fallbackAccent, isItalic = false) => {
    const title = titleVal || fallbackTitle
    const accent = accentVal || fallbackAccent
    if (!title.includes(accent)) {
      return <span>{title} <span style={{ color: primaryColor }} className={isItalic ? 'italic' : ''}>{accent}</span></span>
    }
    const parts = title.split(accent)
    return (
      <span>
        {parts[0]}
        <span style={{ color: primaryColor }} className={`font-black ${isItalic ? 'italic' : ''}`}>{accent}</span>
        {parts.slice(1).join(accent)}
      </span>
    )
  }

  return (
    <div className="space-y-8 max-w-[1700px] mx-auto animate-slide-in px-4 md:px-6">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/pages')}
            className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors text-slate-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Editor do Candidato</span>
              <div className="w-1 h-1 rounded-full bg-slate-200"></div>
              <span className="text-[10px] font-black text-patriotic-green uppercase tracking-[0.3em]">Página Principal</span>
            </div>
            <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">Editar Página Inicial</h1>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2.5 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Publicar Alterações
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Forms (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Segmented Selector for Tabs */}
          <div className="bg-slate-100 p-1.5 rounded-[22px] flex flex-wrap items-center border border-slate-200/50 shadow-inner">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-[16px] text-xs font-black uppercase tracking-wider transition-all duration-300 min-w-[120px]
                  ${activeTab === tab.id 
                    ? 'bg-white text-slate-900 shadow-md border border-slate-200/30' 
                    : 'text-slate-500 hover:text-slate-700'}
                `}
              >
                <tab.icon size={16} className={activeTab === tab.id ? 'text-patriotic-green' : ''} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Content Area */}
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden text-left">
            <div className="p-8">
              <form onSubmit={handleSave} className="space-y-6">
                
                {/* HERO TAB */}
                {activeTab === 'hero' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex gap-3 text-slate-600">
                      <Sparkles size={20} className="text-patriotic-green shrink-0 mt-0.5" />
                      <div className="text-xs font-semibold leading-relaxed">
                        Defina o topo da página (Hero). Use textos impactantes e uma imagem profissional de destaque.
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Título Principal (Hero)</label>
                      <input 
                        type="text" 
                        value={formData.hero.title || ''}
                        onChange={(e) => handleInputChange('hero', 'title', e.target.value)}
                        className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-bold text-lg text-slate-800"
                        placeholder="Ex: Vamos juntos fazer o"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Palavra de Destaque (Gradiante)</label>
                      <input 
                        type="text" 
                        value={formData.hero.titleAccent || ''}
                        onChange={(e) => handleInputChange('hero', 'titleAccent', e.target.value)}
                        className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-bold text-lg text-slate-800"
                        placeholder="Ex: melhor!"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Texto Botão Primário</label>
                        <input 
                          type="text" 
                          value={formData.hero.ctaPrimary || ''}
                          onChange={(e) => handleInputChange('hero', 'ctaPrimary', e.target.value)}
                          className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-semibold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Texto Botão Secundário</label>
                        <input 
                          type="text" 
                          value={formData.hero.ctaSecondary || ''}
                          onChange={(e) => handleInputChange('hero', 'ctaSecondary', e.target.value)}
                          className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-semibold"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Link do Botão Secundário</label>
                      <input 
                        type="url" 
                        value={formData.hero.ctaSecondaryUrl || ''}
                        onChange={(e) => handleInputChange('hero', 'ctaSecondaryUrl', e.target.value)}
                        className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-mono text-sm"
                        placeholder="https://instagram.com/perfil"
                      />
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-6">
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <User size={16} className="text-patriotic-green" />
                        Card de Perfil (Detalhes da Foto)
                      </h4>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Subtítulo / Cargo da Foto</label>
                        <input 
                          type="text" 
                          value={formData.hero.photoSub || ''}
                          onChange={(e) => handleInputChange('hero', 'photoSub', e.target.value)}
                          className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-semibold text-sm"
                          placeholder="Ex: Liderança & Progresso"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Selo / Emblema 1</label>
                          <input 
                            type="text" 
                            value={formData.hero.badge1 || ''}
                            onChange={(e) => handleInputChange('hero', 'badge1', e.target.value)}
                            className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all text-xs font-black"
                            placeholder="Ex: Ficha Limpa"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Selo / Emblema 2</label>
                          <input 
                            type="text" 
                            value={formData.hero.badge2 || ''}
                            onChange={(e) => handleInputChange('hero', 'badge2', e.target.value)}
                            className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all text-xs font-black"
                            placeholder="Ex: Resultados"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <ImageUploader 
                        label="Imagem de Destaque (Hero)"
                        value={formData.hero.hero_image_url}
                        onChange={(url) => handleInputChange('hero', 'hero_image_url', url)}
                      />
                    </div>
                  </div>
                )}

                {/* PROJECTS TAB */}
                {activeTab === 'projects' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex gap-3 text-slate-600">
                      <Award size={20} className="text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs font-semibold leading-relaxed">
                        Customize os títulos das conquistas e ações exibidas no site.
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-800 text-sm">Na Página Inicial</h4>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Subtítulo Superior (Home)</label>
                        <input 
                          type="text" 
                          value={formData.projects.subtitle || ''}
                          onChange={(e) => handleInputChange('projects', 'subtitle', e.target.value)}
                          className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-semibold"
                          placeholder="Ex: Conquistas & Ações"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Título da Seção (Home)</label>
                        <input 
                          type="text" 
                          value={formData.projects.title || ''}
                          onChange={(e) => handleInputChange('projects', 'title', e.target.value)}
                          className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-bold"
                          placeholder="Ex: Trabalho que Transforma."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Palavra de Destaque (Home)</label>
                        <input 
                          type="text" 
                          value={formData.projects.titleAccent || ''}
                          onChange={(e) => handleInputChange('projects', 'titleAccent', e.target.value)}
                          className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-bold"
                          placeholder="Ex: Transforma."
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-4">
                      <h4 className="font-bold text-slate-800 text-sm">Na Página de Listagem (/projetos)</h4>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Título da Página</label>
                        <input 
                          type="text" 
                          value={formData.projects.listTitle || ''}
                          onChange={(e) => handleInputChange('projects', 'listTitle', e.target.value)}
                          className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-bold"
                          placeholder="Ex: Nosso Trabalho"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Descrição Explicativa</label>
                        <textarea 
                          rows="3"
                          value={formData.projects.listDescription || ''}
                          onChange={(e) => handleInputChange('projects', 'listDescription', e.target.value)}
                          className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-medium resize-none text-sm"
                          placeholder="Projetos, obras e conquistas que estão transformando a realidade de nossa região."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* BLOG TAB */}
                {activeTab === 'blog' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex gap-3 text-slate-600">
                      <FileText size={20} className="text-blue-600 shrink-0 mt-0.5" />
                      <div className="text-xs font-semibold leading-relaxed">
                        Customize os títulos das notícias, atualizações e blog.
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-800 text-sm">Na Página Inicial</h4>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Subtítulo Superior (Home)</label>
                        <input 
                          type="text" 
                          value={formData.blog.subtitle || ''}
                          onChange={(e) => handleInputChange('blog', 'subtitle', e.target.value)}
                          className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-semibold"
                          placeholder="Ex: Fique por Dentro"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Título da Seção (Home)</label>
                        <input 
                          type="text" 
                          value={formData.blog.title || ''}
                          onChange={(e) => handleInputChange('blog', 'title', e.target.value)}
                          className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-bold"
                          placeholder="Ex: Últimas Notícias."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Palavra de Destaque (Home)</label>
                        <input 
                          type="text" 
                          value={formData.blog.titleAccent || ''}
                          onChange={(e) => handleInputChange('blog', 'titleAccent', e.target.value)}
                          className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-bold"
                          placeholder="Ex: Notícias."
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-4">
                      <h4 className="font-bold text-slate-800 text-sm">Na Página de Listagem (/blog)</h4>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Título da Página</label>
                        <input 
                          type="text" 
                          value={formData.blog.listTitle || ''}
                          onChange={(e) => handleInputChange('blog', 'listTitle', e.target.value)}
                          className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-bold"
                          placeholder="Ex: Notícias e Atualizações"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Descrição Explicativa</label>
                        <textarea 
                          rows="3"
                          value={formData.blog.listDescription || ''}
                          onChange={(e) => handleInputChange('blog', 'listDescription', e.target.value)}
                          className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-medium resize-none text-sm"
                          placeholder="Fique por dentro de todas as ações, projetos e novidades do nosso mandato."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Right Side: Visual Live Preview (5 columns) */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Eye size={12} />
              Visualização ao Vivo ({tabs.find(t => t.id === activeTab)?.label})
            </span>
          </div>

          <div className="bg-slate-900 rounded-[36px] overflow-hidden border border-slate-800 shadow-2xl transition-all duration-300">
            {/* Device Header Simulator */}
            <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
              </div>
              <div className="text-[9px] font-mono text-slate-500 bg-slate-900/60 px-4 py-1.5 rounded-full border border-slate-800/60 select-none">
                {activeTab === 'hero' ? 'seusite.com.br' : activeTab === 'projects' ? 'seusite.com.br/projetos' : 'seusite.com.br/blog'}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={() => setDevice('desktop')}
                  className={`p-2 rounded-xl transition-all hover:bg-slate-900 ${device === 'desktop' ? 'bg-patriotic-green text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Visualização Desktop"
                >
                  <Monitor size={14} />
                </button>
                <button 
                  type="button" 
                  onClick={() => setDevice('mobile')}
                  className={`p-2 rounded-xl transition-all hover:bg-slate-900 ${device === 'mobile' ? 'bg-patriotic-green text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Visualização Mobile"
                >
                  <Smartphone size={14} />
                </button>
              </div>
            </div>

            {/* Simulated Frame */}
            <div className="bg-slate-950 p-4 transition-all duration-500 flex justify-center">
              <div className={`
                bg-white text-slate-900 w-full overflow-hidden transition-all duration-500 rounded-[24px] relative
                ${device === 'mobile' ? 'max-w-[340px] aspect-[9/16]' : 'w-full aspect-[4/3]'}
              `}>
                
                {/* HERO PREVIEW */}
                {activeTab === 'hero' && (
                  <div className="h-full flex flex-col justify-between p-6 overflow-y-auto select-none relative bg-gradient-to-b from-white via-emerald-50/5 to-white">
                    <div className="absolute top-10 right-[-10%] w-36 h-36 rounded-full blur-[40px] opacity-30" style={{ backgroundColor: primaryColor }}></div>
                    <div className="absolute bottom-10 left-[-10%] w-24 h-24 rounded-full blur-[30px] opacity-20" style={{ backgroundColor: secondaryColor }}></div>
                    
                    {/* Mini navbar preview */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-md" style={{ backgroundColor: primaryColor }}>
                          {formData.general.shortName || 'AM'}
                        </div>
                        <span className="text-[10px] font-black tracking-tight text-slate-800 leading-none">{formData.general.name || 'Candidato'}</span>
                      </div>
                      <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                        {formData.general.slogan || 'Slogan'}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className={`grid items-center gap-6 my-auto relative z-10 ${device === 'mobile' ? 'grid-cols-1 py-4' : 'grid-cols-2'}`}>
                      <div className={`space-y-4 ${device === 'mobile' ? 'text-center' : 'text-left'}`}>
                        <h2 className={`font-display font-black leading-[0.95] text-slate-900 tracking-tighter ${device === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                          {renderHeroTitle()}
                        </h2>
                        
                        <p className={`text-slate-500 font-medium leading-relaxed max-w-sm ${device === 'mobile' ? 'text-[9px] mx-auto' : 'text-[11px]'}`}>
                          {formData.general.description || 'Esta descrição é extraída automaticamente das configurações de marca.'}
                        </p>

                        <div className={`flex flex-wrap gap-2.5 ${device === 'mobile' ? 'justify-center' : 'justify-start'}`}>
                          <div 
                            className="px-4 py-2 text-white font-bold text-[9px] uppercase tracking-wider rounded-xl shadow-md cursor-pointer flex items-center justify-center h-9"
                            style={{ backgroundColor: primaryColor }}
                          >
                            {formData.hero.ctaPrimary || 'Ação 1'}
                          </div>
                          
                          <div className="px-3 py-2 bg-white border border-slate-100 text-slate-800 rounded-xl flex items-center gap-1.5 shadow-sm text-[9px] cursor-pointer h-9">
                            <span className="w-5 h-5 bg-pink-50 text-pink-500 rounded-md flex items-center justify-center">
                              <Instagram size={10} />
                            </span>
                            <span>{formData.hero.ctaSecondary || 'Ação 2'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Photo block */}
                      <div className="relative">
                        <div className={`
                          relative rounded-[22px] overflow-hidden border-4 border-white shadow-xl bg-slate-100 mx-auto aspect-[4/5]
                          ${device === 'mobile' ? 'max-w-[130px]' : 'max-w-[170px]'}
                        `}>
                          {formData.hero.hero_image_url ? (
                            <img src={formData.hero.hero_image_url} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-bold text-[9px] uppercase text-center p-4">
                              Sem foto
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                          <div className="absolute bottom-2 left-2 right-2 text-white text-left">
                            <div className="text-[10px] font-black leading-tight">{formData.general.name || 'Candidato'}</div>
                            <div className="text-[7px] font-bold text-amber-300 uppercase tracking-wider mb-2">{formData.hero.photoSub || 'Liderança & Inovação'}</div>
                            <div className="flex flex-wrap gap-1">
                              {formData.hero.badge1 && <div className="px-1.5 py-0.5 bg-white/10 backdrop-blur-md rounded text-[6px] font-black uppercase">{formData.hero.badge1}</div>}
                              {formData.hero.badge2 && <div className="px-1.5 py-0.5 bg-white/10 backdrop-blur-md rounded text-[6px] font-black uppercase">{formData.hero.badge2}</div>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center pt-3 border-t border-slate-50 text-[7px] text-slate-400 font-bold uppercase tracking-widest">
                      © {new Date().getFullYear()} {formData.general.shortName || 'AM'}
                    </div>
                  </div>
                )}

                {/* PROJECTS PREVIEW */}
                {activeTab === 'projects' && (
                  <div className="h-full flex flex-col justify-between p-6 overflow-y-auto select-none bg-slate-50/50">
                    <div className="space-y-4 my-auto">
                      <div className="space-y-2 text-left">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em]" style={{ color: primaryColor }}>
                          {formData.projects.subtitle || 'Conquistas & Ações'}
                        </span>
                        <h3 className="text-xl md:text-2xl font-display font-black text-slate-900 leading-tight">
                          {renderSectionTitle(formData.projects.title, formData.projects.titleAccent, "Trabalho que Transforma.", "Transforma.", true)}
                        </h3>
                      </div>
                      
                      {/* Fake Project List preview */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                          <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden"></div>
                          <div className="h-2 bg-slate-200 rounded w-2/3"></div>
                          <div className="h-1.5 bg-slate-100 rounded w-full"></div>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                          <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden"></div>
                          <div className="h-2 bg-slate-200 rounded w-2/3"></div>
                          <div className="h-1.5 bg-slate-100 rounded w-full"></div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-wider block mb-1">Na página de Listagem (/projetos)</span>
                        <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-inner space-y-1 text-left">
                          <div className="text-xs font-black" style={{ color: primaryColor }}>{formData.projects.listTitle || 'Nosso Trabalho'}</div>
                          <div className="text-[8px] text-slate-500 leading-normal">{formData.projects.listDescription || 'Projetos, obras e conquistas...'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* BLOG PREVIEW */}
                {activeTab === 'blog' && (
                  <div className="h-full flex flex-col justify-between p-6 overflow-y-auto select-none bg-white">
                    <div className="space-y-4 my-auto">
                      <div className="space-y-2 text-center">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em]" style={{ color: primaryColor }}>
                          {formData.blog.subtitle || 'Fique por Dentro'}
                        </span>
                        <h3 className="text-xl md:text-2xl font-display font-black text-slate-900 leading-tight">
                          {renderSectionTitle(formData.blog.title, formData.blog.titleAccent, "Últimas Notícias.", "Notícias.", false)}
                        </h3>
                      </div>

                      {/* Fake News items */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="space-y-1.5 text-left">
                            <div className="aspect-[4/3] bg-slate-100 rounded-xl"></div>
                            <div className="h-1.5 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-1 bg-slate-100 rounded w-full"></div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-wider block mb-1">Na página de Listagem (/blog)</span>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-inner space-y-1 text-left">
                          <div className="text-xs font-black" style={{ color: primaryColor }}>{formData.blog.listTitle || 'Notícias e Atualizações'}</div>
                          <div className="text-[8px] text-slate-500 leading-normal">{formData.blog.listDescription || 'Fique por dentro de todas as ações...'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
