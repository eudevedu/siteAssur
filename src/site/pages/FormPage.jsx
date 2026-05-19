import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Loader2, 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { formsApi } from '../../lib/api/forms'
import { supabase } from '../../lib/supabase'
import { useSettings } from '../../context/SettingsContext'

export default function FormPage() {
  const { slug } = useParams()
  const { settings, loading: settingsLoading } = useSettings()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    fetchForm()
    window.scrollTo(0, 0)
  }, [slug])

  const fetchForm = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await formsApi.getBySlug(slug)
      setForm(data)
    } catch (err) {
      console.error('Erro ao buscar formulário:', err)
      setError('Formulário não encontrado ou ocorreu um erro.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // 1. Save to raw submissions
      await formsApi.submit(form.id, formData)

      // 2. Map to leads table
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
        source: form.slug,
        message: formattedData
      }

      await supabase.from('leads').insert([leadPayload])

      setSubmitted(true)
      
      const redirectUrl = form.settings.redirectUrl || '/'
      
      setTimeout(() => {
        window.location.href = redirectUrl
      }, 3000)
    } catch (err) {
      console.error('Erro ao enviar formulário:', err)
      setError('Ocorreu um erro ao enviar suas respostas. Por favor, tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-slate-900" size={40} />
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <h1 className="text-3xl font-display font-black text-slate-900">Ops!</h1>
            <p className="text-slate-500 font-medium">{error || 'Formulário não encontrado.'}</p>
            <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl">
              <ArrowLeft size={20} /> Voltar para o Início
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-slate-900 selection:text-white">
      <SEO title={form.title} description={form.description} />
      <Header />
      
      <main className="pt-32 pb-20 max-w-5xl mx-auto px-6">
        <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Info Side (Style from LeadPage) */}
            <div className="relative bg-slate-900 p-12 text-white flex flex-col justify-between overflow-hidden min-h-[400px] lg:min-h-auto">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, ${settings.colors.primary} 1px, transparent 0)`,
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
              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12 animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                  </div>
                  <h2 className="text-3xl font-display font-black text-slate-900 leading-tight">
                    {form.settings.successMessage}
                  </h2>
                  <p className="text-slate-500 font-medium">Suas respostas foram registradas com sucesso.</p>
                  <div className="pt-4 flex items-center justify-center gap-2 text-patriotic-green font-bold">
                    <Loader2 className="animate-spin" size={20} />
                    Redirecionando...
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    {form.fields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        
                        {field.type === 'textarea' ? (
                          <textarea
                            required={field.required}
                            placeholder={field.placeholder}
                            className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-medium min-h-[120px]"
                            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                          />
                        ) : field.type === 'select' ? (
                          <select
                            required={field.required}
                            className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-medium appearance-none"
                            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                          >
                            <option value="">Selecione uma opção...</option>
                            {field.options.map((opt, i) => (
                              <option key={i} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            required={field.required}
                            type={field.type}
                            placeholder={field.placeholder}
                            className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-patriotic-green focus:bg-white rounded-2xl outline-none transition-all font-medium"
                            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-5 text-white rounded-2xl font-black text-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-8"
                    style={{ 
                      backgroundColor: settings.colors.primary, 
                      boxShadow: `0 15px 30px -10px ${settings.colors.primary}66` 
                    }}
                  >
                    {submitting ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                    {submitting ? 'ENVIANDO...' : form.settings.submitButtonText.toUpperCase()}
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
