import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Loader2, ArrowLeft, Calendar, Share2, Facebook, Twitter, Link as LinkIcon } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { pagesApi } from '../../lib/api/pages'
import { useSettings } from '../../context/SettingsContext'
import SEO from '../components/SEO'

export default function DynamicPage() {
  const { slug } = useParams()
  const { settings, loading: settingsLoading } = useSettings()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchPage()
    window.scrollTo(0, 0)
  }, [slug])

  const fetchPage = async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await pagesApi.getBySlug(slug)
      if (data && data.status === 'published') {
        setPage(data)
      } else {
        setError(true)
      }
    } catch (err) {
      console.error('Erro ao buscar página:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-slate-900" size={40} />
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="text-9xl font-display font-black text-slate-200">404</div>
            <h1 className="text-3xl font-display font-black text-slate-900">Página não encontrada</h1>
            <p className="text-slate-500 font-medium">O conteúdo que você está procurando não existe ou foi removido.</p>
            <Link 
              to="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              <ArrowLeft size={20} />
              Voltar para o Início
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white selection:bg-slate-900 selection:text-white">
      <SEO 
        title={page.meta_title || page.title} 
        description={page.meta_description || ''}
      />
      <Header />
      
      {/* Hero Header */}
      <section 
        className="pt-40 pb-20 relative overflow-hidden"
        style={{ backgroundColor: `${settings.colors.primary}05` }}
      >
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/50 to-transparent pointer-events-none"></div>
        <div 
          className="absolute -top-24 -right-24 w-96 h-96 blur-[120px] rounded-full opacity-20"
          style={{ backgroundColor: settings.colors.primary }}
        ></div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="flex items-center gap-2 mb-6 animate-in slide-in-from-left duration-700">
            <Link to="/" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Início</Link>
            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: settings.colors.primary }}>Páginas</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-display font-black text-slate-900 leading-tight animate-in slide-in-from-bottom duration-700">
            {page.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 mt-8 animate-in fade-in duration-1000">
            <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
              <Calendar size={18} className="text-slate-300" />
              Atualizado em {new Date(page.updated_at).toLocaleDateString('pt-BR')}
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
                <Facebook size={16} />
              </button>
              <button className="p-2 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-sky-500 hover:border-sky-200 transition-all shadow-sm">
                <Twitter size={16} />
              </button>
              <button className="p-2 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm">
                <LinkIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-20 min-h-[600px]">
        <div 
          className="grapesjs-rendered-content"
          dangerouslySetInnerHTML={{ __html: page.content }}
        ></div>
      </main>

      {/* CTA Section */}
      <section className="py-20 max-w-4xl mx-auto px-6 border-t border-slate-100">
        <div 
          className="rounded-[40px] p-10 md:p-16 text-white text-center relative overflow-hidden group"
          style={{ backgroundColor: settings.colors.primary }}
        >
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
            <Share2 size={200} />
          </div>
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-5xl font-display font-black leading-tight">Gostou deste conteúdo? <br /> Compartilhe com seus amigos.</h2>
            <p className="text-white/70 font-medium max-w-xl mx-auto">Ajude-nos a levar nossas ideias e propostas para mais pessoas. A política se faz com participação!</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2">
                <Facebook size={20} /> Compartilhar
              </button>
              <button className="px-8 py-4 bg-slate-900/20 backdrop-blur-md border border-white/20 text-white rounded-2xl font-black hover:bg-slate-900/40 transition-all flex items-center gap-2">
                <LinkIcon size={20} /> Copiar Link
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
