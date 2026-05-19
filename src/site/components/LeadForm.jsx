import React, { useState } from 'react'
import { X, Send, Loader2, CheckCircle2, User, Phone, MapPin, Briefcase, Instagram, UserPlus } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function LeadForm({ isOpen, onClose, settings }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    neighborhood: '',
    profession: '',
    referrer: '',
    instagram: ''
  })

  if (!isOpen) return null

  const { leadForm, colors, socials } = settings

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('leads')
        .insert([formData])

      if (error) throw error

      setSuccess(true)
      
      // Determine redirect URL: Custom URL or default WhatsApp
      let redirectUrl = leadForm.redirectUrl
      
      if (!redirectUrl) {
        const message = `Olá! Meu nome é ${formData.name}. Gostaria de mais informações sobre o projeto.
        
📍 Município: ${formData.city}
🏠 Bairro: ${formData.neighborhood}
💼 Profissão: ${formData.profession}
👥 Indicado por: ${formData.referrer}
📸 Instagram: ${formData.instagram}`

        const encodedMessage = encodeURIComponent(message)
        redirectUrl = `https://wa.me/${socials.whatsapp}?text=${encodedMessage}`
      }
      
      setTimeout(() => {
        if (redirectUrl.startsWith('http')) {
          window.location.href = redirectUrl
        } else {
          window.open(redirectUrl, '_blank')
        }
        onClose()
        setSuccess(false)
        setFormData({
          name: '',
          phone: '',
          city: '',
          neighborhood: '',
          profession: '',
          referrer: '',
          instagram: ''
        })
      }, 2000)

    } catch (err) {
      console.error('Erro ao enviar lead:', err)
      alert('Houve um erro ao enviar suas informações. Por favor, tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X size={24} className="text-slate-400" />
        </button>

        {success ? (
          <div className="p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <h3 className="text-3xl font-display font-black text-slate-900">{leadForm.successTitle}</h3>
            <p className="text-slate-500 whitespace-pre-line">
              {leadForm.successMessage.replace('{name}', formData.name)}
            </p>
            <div className="pt-4">
              <Loader2 className="animate-spin mx-auto text-emerald-500" size={32} />
            </div>
          </div>
        ) : (
          <div className="p-8 md:p-12 space-y-8">
            <div className="space-y-2">
              <h3 className="text-3xl font-display font-black text-slate-900 leading-tight">
                {leadForm.title.split(leadForm.titleAccent)[0]}
                <span style={{ color: colors.primary }}>{leadForm.titleAccent}</span>
                {leadForm.title.split(leadForm.titleAccent)[1]}
              </h3>
              <p className="text-slate-500 font-medium">{leadForm.subtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nome Completo</label>
                <input
                  required
                  type="text"
                  className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-medium"
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Município</label>
                <input
                  required
                  type="text"
                  className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-medium"
                  placeholder="Sua cidade"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Bairro</label>
                <input
                  required
                  type="text"
                  className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-medium"
                  placeholder="Seu bairro"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Telefone / WhatsApp</label>
                <input
                  required
                  type="tel"
                  className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-medium"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Profissão</label>
                <input
                  type="text"
                  className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-medium"
                  placeholder="Sua profissão"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Pessoa que Indicou</label>
                <input
                  type="text"
                  className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-medium"
                  placeholder="Quem te indicou?"
                  value={formData.referrer}
                  onChange={(e) => setFormData({ ...formData, referrer: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Instagram</label>
                <input
                  type="text"
                  className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-medium"
                  placeholder="@seuusuario"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 text-white rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                style={{ backgroundColor: colors.primary, boxShadow: `0 10px 20px -5px ${colors.primary}4D` }}
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                {loading ? 'ENVIANDO...' : leadForm.buttonText.toUpperCase()}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
