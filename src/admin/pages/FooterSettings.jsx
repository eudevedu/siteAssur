import React, { useState, useEffect } from 'react'
import { 
  Layout, 
  Link2, 
  Plus, 
  Trash, 
  Instagram, 
  Facebook, 
  Twitter, 
  Phone, 
  Globe,
  Mail,
  CheckCircle2,
  Save,
  Loader2,
  MessageCircle,
  ChevronUp,
  ChevronDown,
  GripVertical
} from 'lucide-react'
import { settingsApi } from '../../lib/api/settings'
import { logsApi } from '../../lib/api/logs'
import { useSettings } from '../../context/SettingsContext'
import toast from 'react-hot-toast'

export default function FooterSettings() {
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
    const toastId = toast.loading('Salvando alterações...')
    try {
      await settingsApi.update(key, value)
      toast.success('Alterações salvas com sucesso!', { id: toastId })
      
      // Run in the background without blocking the save animation
      refreshSettings()
      logsApi.logAction('Atualizou configurações de ' + key, 'settings', key)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar.', { id: toastId })
    } finally {
      setIsSaving(false)
    }
  }

  const updateHeaderSubtitle = (val) => {
    setSiteSettings({
      ...siteSettings,
      general: { ...siteSettings.general, headerSubtitle: val }
    })
  }

  const updateNavSetting = (field, val) => {
    setSiteSettings({
      ...siteSettings,
      nav: { ...siteSettings.nav, [field]: val }
    })
  }

  const updateFooterLink = (index, field, value) => {
    const currentLinks = siteSettings.footer?.links || []
    const newLinks = [...currentLinks]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setSiteSettings({
      ...siteSettings,
      footer: { ...siteSettings.footer, links: newLinks }
    })
  }

  const addFooterLink = () => {
    const currentLinks = siteSettings.footer?.links || []
    setSiteSettings({
      ...siteSettings,
      footer: { ...siteSettings.footer, links: [...currentLinks, { label: '', url: '' }] }
    })
  }

  const removeFooterLink = (index) => {
    const currentLinks = siteSettings.footer?.links || []
    setSiteSettings({
      ...siteSettings,
      footer: { ...siteSettings.footer, links: currentLinks.filter((_, i) => i !== index) }
    })
  }

  const moveLink = (index, direction) => {
    const currentLinks = [...(siteSettings.footer?.links || [])]
    if (direction === 'up' && index > 0) {
      const temp = currentLinks[index]
      currentLinks[index] = currentLinks[index - 1]
      currentLinks[index - 1] = temp
    } else if (direction === 'down' && index < currentLinks.length - 1) {
      const temp = currentLinks[index]
      currentLinks[index] = currentLinks[index + 1]
      currentLinks[index + 1] = temp
    }
    setSiteSettings({
      ...siteSettings,
      footer: { ...siteSettings.footer, links: currentLinks }
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
          <h1 className="text-3xl font-bold text-slate-900">Menu & Rodapé</h1>
          <p className="text-slate-500">Gerencie a navegação superior e as informações fixas do rodapé.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN: Header & Socials */}
        <div className="space-y-8">
          {/* Header Settings */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Globe size={20} className="text-patriotic-green" />
              Configurações do Topo (Header)
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subtítulo do Logo</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-patriotic-green/20"
                  placeholder="Ex: Mandato Participativo"
                  value={siteSettings.general?.headerSubtitle || ''}
                  onChange={(e) => updateHeaderSubtitle(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-slate-700">Menu Fixo (Sticky)</div>
                  <div className="text-xs text-slate-500 text-balance">O menu acompanha a rolagem da página.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={siteSettings.nav?.sticky !== false}
                    onChange={(e) => updateNavSetting('sticky', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-patriotic-green"></div>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">Botão de Ação no Topo</span>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={siteSettings.nav?.showContactButton !== false}
                      onChange={(e) => updateNavSetting('showContactButton', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-patriotic-green"></div>
                  </label>
                </div>

                {siteSettings.nav?.showContactButton !== false && (
                  <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rótulo</label>
                      <input 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-patriotic-green"
                        placeholder="Ex: Participar"
                        value={siteSettings.nav?.contactButtonText || ''}
                        onChange={(e) => updateNavSetting('contactButtonText', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">URL</label>
                      <input 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-patriotic-green font-mono"
                        placeholder="Ex: /participar"
                        value={siteSettings.nav?.contactButtonLink || ''}
                        onChange={(e) => updateNavSetting('contactButtonLink', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle size={18} className="text-patriotic-green" />
                    <span className="text-sm font-bold text-slate-700">Botão de WhatsApp Flutuante</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={siteSettings.nav?.showFloatingButton !== false}
                      onChange={(e) => updateNavSetting('showFloatingButton', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-patriotic-green"></div>
                  </label>
                </div>

                {siteSettings.nav?.showFloatingButton !== false && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Texto Flutuante</label>
                      <input 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-patriotic-green"
                        placeholder="Ex: Falar com a Equipe"
                        value={siteSettings.nav?.floatingButtonText || ''}
                        onChange={(e) => updateNavSetting('floatingButtonText', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Link Personalizado (Opcional)</label>
                      <input 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-patriotic-green font-mono"
                        placeholder="Ex: https://wa.me/55..."
                        value={siteSettings.nav?.floatingButtonLink || ''}
                        onChange={(e) => updateNavSetting('floatingButtonLink', e.target.value)}
                      />
                      <p className="text-[10px] text-slate-400 ml-1">Deixe vazio para usar o WhatsApp padrão configurado.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button 
                  onClick={async () => {
                    await handleSaveSettings('general', siteSettings.general);
                    await handleSaveSettings('nav', siteSettings.nav);
                  }}
                  disabled={isSaving}
                  className="w-full py-4 bg-patriotic-green text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Salvar Configurações
                </button>
              </div>
            </div>
          </div>

          {/* Socials Section */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Globe size={20} className="text-patriotic-green" />
              Redes Sociais
            </h3>
            <div className="space-y-4">
              {[
                { icon: Instagram, label: 'Instagram', field: 'instagram', color: 'text-pink-500' },
                { icon: Facebook, label: 'Facebook', field: 'facebook', color: 'text-blue-600' },
                { icon: Twitter, label: 'Twitter / X', field: 'twitter', color: 'text-slate-900' },
                { icon: Globe, label: 'YouTube', field: 'youtube', color: 'text-red-600' }
              ].map((social) => (
                <div key={social.field} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-all hover:border-patriotic-green/20">
                  <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm shrink-0 ${social.color}`}>
                    <social.icon size={22} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{social.label}</label>
                    <input 
                      className="w-full bg-transparent border-none p-0 outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300"
                      placeholder={`URL do ${social.label}`}
                      value={siteSettings.socials?.[social.field] || ''}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        socials: { ...siteSettings.socials, [social.field]: e.target.value }
                      })}
                    />
                  </div>
                </div>
              ))}
              <button 
                onClick={() => handleSaveSettings('socials', siteSettings.socials)}
                disabled={isSaving}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
              >
                Salvar Redes Sociais
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Navigation Links, Copyright & Contact */}
        <div className="space-y-8">
          {/* Nav Links */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 size={20} className="text-patriotic-green" />
                Links de Navegação
              </div>
              <button 
                onClick={addFooterLink}
                className="text-xs font-black text-patriotic-green uppercase hover:bg-patriotic-green/5 px-3 py-1.5 rounded-lg transition-all flex items-center gap-2"
              >
                <Plus size={14} /> Adicionar
              </button>
            </h3>
            
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              {siteSettings.footer?.links?.map((link, index) => (
                <div key={index} className="flex gap-3 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 group transition-all hover:shadow-md">
                  <div className="flex flex-col gap-1 shrink-0">
                    <button 
                      onClick={() => moveLink(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-slate-300 hover:text-patriotic-green disabled:opacity-0 transition-all"
                      title="Mover para cima"
                    >
                      <ChevronUp size={18} />
                    </button>
                    <div className="flex justify-center text-slate-300">
                      <GripVertical size={14} />
                    </div>
                    <button 
                      onClick={() => moveLink(index, 'down')}
                      disabled={index === (siteSettings.footer?.links?.length - 1)}
                      className="p-1 text-slate-300 hover:text-patriotic-green disabled:opacity-0 transition-all"
                      title="Mover para baixo"
                    >
                      <ChevronDown size={18} />
                    </button>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rótulo</label>
                        <input 
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-patriotic-green"
                          value={link.label}
                          onChange={(e) => updateFooterLink(index, 'label', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">URL</label>
                        <input 
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-patriotic-green font-mono"
                          value={link.url}
                          onChange={(e) => updateFooterLink(index, 'url', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFooterLink(index)}
                    className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shrink-0"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={() => handleSaveSettings('footer', siteSettings.footer)}
              disabled={isSaving}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Salvar Links
            </button>
          </div>

          {/* Copyright Settings */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-patriotic-green" />
              Copyright & Transparência
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Texto de Direitos Autorais</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-patriotic-green/20"
                  value={siteSettings.footer?.copyrightText || ''}
                  onChange={(e) => setSiteSettings({
                    ...siteSettings,
                    footer: { ...siteSettings.footer, copyrightText: e.target.value }
                  })}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-sm font-bold text-slate-700">Portal da Transparência</span>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={siteSettings.footer?.showTransparencyLink !== false}
                    onChange={(e) => setSiteSettings({
                      ...siteSettings,
                      footer: { ...siteSettings.footer, showTransparencyLink: e.target.checked }
                    })}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-patriotic-green"></div>
                </label>
              </div>
              <button 
                onClick={() => handleSaveSettings('footer', siteSettings.footer)}
                disabled={isSaving}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
              >
                Salvar Copyright
              </button>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Phone size={20} className="text-patriotic-green" />
              Contatos Oficiais
            </h3>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Mail size={14} /> E-mail
                  </label>
                  <input 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-patriotic-green/20"
                    value={siteSettings.contact?.email || ''}
                    onChange={(e) => setSiteSettings({
                      ...siteSettings,
                      contact: { ...siteSettings.contact, email: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Phone size={14} /> Telefone
                  </label>
                  <input 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-patriotic-green/20"
                    value={siteSettings.contact?.phone || ''}
                    onChange={(e) => setSiteSettings({
                      ...siteSettings,
                      contact: { ...siteSettings.contact, phone: e.target.value }
                    })}
                  />
                </div>

              </div>
              <button 
                onClick={() => handleSaveSettings('contact', siteSettings.contact)}
                disabled={isSaving}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
              >
                Salvar Contatos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
