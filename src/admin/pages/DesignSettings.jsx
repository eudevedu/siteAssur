import React, { useState, useEffect } from 'react'
import { 
  Palette, 
  Save, 
  Loader2, 
  Type, 
  RefreshCw,
  Eye,
  CheckCircle2
} from 'lucide-react'
import { settingsApi } from '../../lib/api/settings'
import { logsApi } from '../../lib/api/logs'
import { useSettings } from '../../context/SettingsContext'
import toast from 'react-hot-toast'

export default function DesignSettings() {
  const { settings, refreshSettings } = useSettings()
  const [siteSettings, setSiteSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (settings) {
      setSiteSettings(JSON.parse(JSON.stringify(settings)))
      setLoading(false)
    }
  }, [settings])

  const handleSaveSettings = async (key, value) => {
    setIsSaving(true)
    const toastId = toast.loading('Salvando alterações de design...')
    try {
      await settingsApi.update(key, value)
      toast.success('Design atualizado com sucesso!', { id: toastId })
      
      // Run in the background without blocking the save animation
      refreshSettings()
      logsApi.logAction('Atualizou identidade visual: ' + key, 'settings', key)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar design.', { id: toastId })
    } finally {
      setIsSaving(false)
    }
  }

  const updateColor = (field, val) => {
    setSiteSettings({
      ...siteSettings,
      colors: { ...siteSettings.colors, [field]: val }
    })
  }

  const updateGeneral = (field, val) => {
    setSiteSettings({
      ...siteSettings,
      general: { ...siteSettings.general, [field]: val }
    })
  }

  if (loading || !siteSettings) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="animate-spin text-patriotic-green" size={40} />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Identidade Visual</h1>
          <p className="text-slate-500">Personalize as cores e a marca principal do seu site.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Color Palette Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Palette size={20} className="text-patriotic-green" />
              Paleta de Cores do Site
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Primary Color */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">Cor Principal</label>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">{siteSettings.colors?.primary}</span>
                </div>
                <div className="flex gap-4 items-center">
                  <input 
                    type="color"
                    className="w-16 h-16 rounded-2xl cursor-pointer border-none bg-transparent"
                    value={siteSettings.colors?.primary}
                    onChange={(e) => updateColor('primary', e.target.value)}
                  />
                  <div className="flex-1 space-y-1">
                    <input 
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-sm font-mono"
                      value={siteSettings.colors?.primary}
                      onChange={(e) => updateColor('primary', e.target.value)}
                    />
                    <p className="text-[10px] text-slate-400">Usada em botões e no topo.</p>
                  </div>
                </div>
              </div>

              {/* Secondary Color */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">Cor Secundária</label>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">{siteSettings.colors?.secondary}</span>
                </div>
                <div className="flex gap-4 items-center">
                  <input 
                    type="color"
                    className="w-16 h-16 rounded-2xl cursor-pointer border-none bg-transparent"
                    value={siteSettings.colors?.secondary}
                    onChange={(e) => updateColor('secondary', e.target.value)}
                  />
                  <div className="flex-1 space-y-1">
                    <input 
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-sm font-mono"
                      value={siteSettings.colors?.secondary}
                      onChange={(e) => updateColor('secondary', e.target.value)}
                    />
                    <p className="text-[10px] text-slate-400">Usada em fundos e gradientes.</p>
                  </div>
                </div>
              </div>

              {/* Footer Color */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">Cor do Rodapé</label>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">{siteSettings.colors?.footer || '#020617'}</span>
                </div>
                <div className="flex gap-4 items-center">
                  <input 
                    type="color"
                    className="w-16 h-16 rounded-2xl cursor-pointer border-none bg-transparent"
                    value={siteSettings.colors?.footer || '#020617'}
                    onChange={(e) => updateColor('footer', e.target.value)}
                  />
                  <div className="flex-1 space-y-1">
                    <input 
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-sm font-mono"
                      value={siteSettings.colors?.footer || '#020617'}
                      onChange={(e) => updateColor('footer', e.target.value)}
                    />
                    <p className="text-[10px] text-slate-400">Define a cor de fundo do rodapé.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <button 
                onClick={() => handleSaveSettings('colors', siteSettings.colors)}
                disabled={isSaving}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
              >
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Aplicar Novas Cores
              </button>
            </div>
          </div>

          {/* Branding Section */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Type size={20} className="text-patriotic-green" />
              Nomes e Marca
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome Completo do Candidato</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-patriotic-green/20"
                  value={siteSettings.general?.name || ''}
                  onChange={(e) => updateGeneral('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sigla / Iniciais (Logo)</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-patriotic-green/20"
                  maxLength="4"
                  value={siteSettings.general?.shortName || ''}
                  onChange={(e) => updateGeneral('shortName', e.target.value)}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Slogan de Campanha</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-patriotic-green/20"
                  value={siteSettings.general?.slogan || ''}
                  onChange={(e) => updateGeneral('slogan', e.target.value)}
                />
              </div>
            </div>

            <button 
              onClick={() => handleSaveSettings('general', siteSettings.general)}
              disabled={isSaving}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
            >
              Salvar Identidade Nomimal
            </button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-8">
          <div className="bg-slate-900 p-8 rounded-[32px] shadow-2xl space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 transition-all duration-500 group-hover:scale-150" style={{ backgroundColor: siteSettings.colors?.primary }}></div>
            
            <h3 className="text-white font-bold flex items-center gap-2">
              <Eye size={20} className="text-patriotic-green" />
              Pré-visualização
            </h3>

            <div className="space-y-6 relative z-10">
              {/* Logo Preview */}
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg rotate-3 transition-transform hover:rotate-0"
                  style={{ backgroundColor: siteSettings.colors?.primary }}
                >
                  {siteSettings.general?.shortName || 'AM'}
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-sm leading-none">{siteSettings.general?.name || 'Nome do Político'}</span>
                  <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest mt-1">Candidato Estadual</span>
                </div>
              </div>

              {/* Button Preview */}
              <div className="space-y-2">
                <div 
                  className="w-full py-2 px-4 rounded-xl text-white text-[10px] font-black uppercase tracking-widest text-center shadow-lg"
                  style={{ backgroundColor: siteSettings.colors?.primary, boxShadow: `0 4px 12px ${siteSettings.colors?.primary}4D` }}
                >
                  Botão Primário
                </div>
                <div 
                  className="w-full py-2 px-4 rounded-xl text-white text-[10px] font-black uppercase tracking-widest text-center border-2 border-slate-700"
                  style={{ borderColor: siteSettings.colors?.secondary }}
                >
                  Botão Secundário
                </div>
              </div>

              {/* Progress/Accent Preview */}
              <div className="space-y-1">
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-2/3" style={{ backgroundColor: siteSettings.colors?.primary }}></div>
                </div>
                <div 
                  className="mt-4 p-2 rounded-lg border border-slate-800 flex items-center justify-center text-[8px] text-slate-500 font-bold uppercase tracking-widest"
                  style={{ backgroundColor: siteSettings.colors?.footer || '#020617' }}
                >
                  Amostra Rodapé
                </div>
                <p className="text-[10px] text-slate-500 text-center italic mt-2">Amostra de cores aplicada no layout</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-6 rounded-[24px] space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <RefreshCw size={16} className="animate-spin-slow" />
              Impacto Imediato
            </div>
            <p className="text-xs text-amber-700 leading-relaxed">
              Ao salvar estas configurações, as cores de todo o site serão atualizadas instantaneamente, incluindo links, ícones, fundos e componentes interativos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
