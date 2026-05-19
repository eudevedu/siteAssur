import React, { useState, useEffect } from 'react'
import { Send, Loader2, CheckCircle2, User, Phone, MapPin, Briefcase, Instagram, UserPlus, ArrowLeft, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { formsApi } from '../../lib/api/forms'
import { useSettings } from '../../context/SettingsContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SEO from '../components/SEO'

export default function LeadPage() {
  const { settings, loading: settingsLoading } = useSettings()
  const [form, setForm] = useState(null)
  const [loadingForm, setLoadingForm] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchForm()
    window.scrollTo(0, 0)
  }, [])

  const fetchForm = async () => {
    setLoadingForm(true)
    setError(null)
    try {
      const data = await formsApi.getBySlug('participar')
      if (!data) {
        throw new Error('Formulário "participar" não encontrado no banco de dados.')
      }
      setForm(data)

      // Initialize form data
      const initialData = {}
      data.fields.forEach(f => initialData[f.id] = '')
      setFormData(initialData)
    } catch (err) {
      console.error('Erro ao buscar formulário de leads:', err)
      setError(err.message || 'Erro ao carregar o formulário.')
    } finally {
      setLoadingForm(false)
    }
  }

  if (settingsLoading || loadingForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-slate-900" size={40} />
      </div>
    )
  }

  if (error || !form || !settings) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6 bg-white p-8 md:p-12 rounded-[32px] shadow-lg border border-slate-100">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto">
              <AlertCircle size={32} />
            </div>
            <h1 className="text-3xl font-display font-black text-slate-900">Ops!</h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              {error || 'O formulário "participar" não pôde ser carregado.'}
            </p>
            <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
              <ArrowLeft size={20} /> Voltar para o Início
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const { colors, socials } = settings

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // 1. Submit to form_submissions
      await formsApi.submit(form.id, formData)

      const mappedFieldIds = new Set()
      const getFieldByLabel = (labelParts) => {
        const field = form.fields.find(f => 
          labelParts.some(part => f.label.toLowerCase().includes(part.toLowerCase()))
        )
        if (field) mappedFieldIds.add(field.id)
        return field ? formData[field.id] : ''
      }

      const name = getFieldByLabel(['nome', 'name', 'completo']) || 'Sem nome'
      const phone = getFieldByLabel(['telefone', 'whatsapp', 'celular', 'phone', 'contato']) || ''
      const city = getFieldByLabel(['cidade', 'município', 'city', 'local']) || ''
      const neighborhood = getFieldByLabel(['bairro', 'neighborhood', 'região']) || ''
      const profession = getFieldByLabel(['profissão', 'cargo', 'trabalho', 'profession']) || ''
      const referrer = getFieldByLabel(['indicação', 'indicado', 'quem indicou', 'referrer']) || ''
      const instagram = getFieldByLabel(['instagram', 'ig', 'social']) || ''

      // Format only fields that were NOT mapped to main columns
      const formattedData = form.fields
        .filter(f => !mappedFieldIds.has(f.id))
        .map(f => `${f.label}: ${formData[f.id] || '-'}`)
        .join('\n')

      const leadPayload = {
        name,
        phone,
        city,
        neighborhood,
        profession,
        referrer,
        instagram,
        source: form.slug || 'landing_page',
        message: formattedData
      }

      await supabase.from('leads').insert([leadPayload])

      setSuccess(true)

      // 3. Handle Redirect
      let finalRedirectUrl = form.settings.redirectUrl || ''

      if (!finalRedirectUrl) {
        // Default to WhatsApp with formatted message
        const messageLines = [`Olá! Meu nome é ${leadPayload.name}. Gostaria de mais informações sobre o projeto.`]
        if (leadPayload.city) messageLines.push(`📍 Município: ${leadPayload.city}`)
        if (leadPayload.neighborhood) messageLines.push(`🏠 Bairro: ${leadPayload.neighborhood}`)
        if (leadPayload.profession) messageLines.push(`💼 Profissão: ${leadPayload.profession}`)

        const message = messageLines.join('\n')
        const encodedMessage = encodeURIComponent(message)
        finalRedirectUrl = `https://wa.me/${socials.whatsapp}?text=${encodedMessage}`
      }

      setTimeout(() => {
        window.open(finalRedirectUrl, finalRedirectUrl.startsWith('http') ? '_blank' : '_self')
        setSuccess(false)
        // Reset form
        const resetData = {}
        form.fields.forEach(f => resetData[f.id] = '')
        setFormData(resetData)
      }, 2000)

    } catch (err) {
      console.error('Erro ao enviar lead:', err)
      setError('Houve um erro ao enviar suas informações. Por favor, tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO title={form.title} description={form.description} />
      <Header />

      <main className="pt-32 pb-20 max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image / Info Side */}
            <div className="relative bg-slate-900 p-12 text-white flex flex-col justify-between overflow-hidden min-h-[400px] lg:min-h-auto">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, ${colors?.primary || '#006738'} 1px, transparent 0)`,
                  backgroundSize: '24px 24px'
                }}
              ></div>

              <div className="relative z-10 space-y-6">
                <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
                  <ArrowLeft size={16} /> Voltar para o Início
                </Link>
                <h1 className="text-4xl md:text-5xl font-display font-black leading-tight">
                  {form.title}
                </h1>
                <p className="text-white/70 text-lg font-medium leading-relaxed">
                  {form.description}
                </p>
              </div>

              <div className="relative z-10 pt-12">
                <p className="text-xs font-bold text-white/50 uppercase tracking-widest">
                  {form.settings.sidebarFooterText || 'Junte-se a nós nessa caminhada!'}
                </p>
              </div>
            </div>

            {/* Form Side */}
            <div className="p-8 md:p-12">
              {success ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center animate-bounce">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                  </div>
                  <h3 className="text-3xl font-display font-black text-slate-900">{form.settings.successTitle || 'Sucesso!'}</h3>
                  <p className="text-slate-500 whitespace-pre-line">
                    {form.settings.successMessage}
                  </p>
                  <div className="pt-4">
                    <Loader2 className="animate-spin mx-auto text-emerald-500" size={32} />
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-4">
                    {form.fields.map(field => (
                      <div key={field.id} className="space-y-1">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>

                        {field.type === 'textarea' ? (
                          <textarea
                            required={field.required}
                            placeholder={field.placeholder}
                            className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-medium min-h-[100px]"
                            value={formData[field.id]}
                            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                          />
                        ) : field.type === 'select' ? (
                          <select
                            required={field.required}
                            className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-medium appearance-none"
                            value={formData[field.id]}
                            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                          >
                            <option value="">Selecione...</option>
                            {field.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <input
                            required={field.required}
                            type={field.type}
                            placeholder={field.placeholder}
                            className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-medium"
                            value={formData[field.id]}
                            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-5 text-white rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-8"
                    style={{ backgroundColor: colors?.primary || '#006738', boxShadow: `0 10px 20px -5px ${colors?.primary || '#006738'}4D` }}
                  >
                    {submitting ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                    {submitting ? 'ENVIANDO...' : (form.settings.submitButtonText || 'ENVIAR').toUpperCase()}
                  </button>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold">
                      <AlertCircle size={20} /> {error}
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
