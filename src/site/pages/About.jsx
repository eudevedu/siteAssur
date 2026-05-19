import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { useSettings } from '../../context/SettingsContext'
import { Loader2, Quote, User, Target, Heart } from 'lucide-react'

export default function About() {
  const { settings, loading } = useSettings()

  if (loading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-slate-900" size={40} />
      </div>
    )
  }

  const { about, colors, general } = settings

  return (
    <div className="min-h-screen bg-white selection:bg-slate-900 selection:text-white">
      <SEO 
        title={about?.title || 'Sobre'} 
        description={about?.subtitle || ''} 
      />
      <Header />

      <main className="pt-40 pb-32">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-in slide-in-from-left duration-1000">
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] border border-slate-100 shadow-sm"
                style={{ color: colors.primary }}
              >
                <User size={14} /> Conheça nossa história
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-black text-slate-900 leading-tight">
                {about?.title ? (
                  <>
                    {about.title.split(' ').slice(0, -1).join(' ')} <span style={{ color: colors.primary }}>{about.title.split(' ').slice(-1)}</span>
                  </>
                ) : (
                  <>
                    Sobre <span style={{ color: colors.primary }}>{general.name || 'Nós'}</span>
                  </>
                )}
              </h1>
              <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl border-l-4 pl-8 border-slate-100 italic">
                "{about?.subtitle || ''}"
              </p>
            </div>

            <div className="relative group animate-in zoom-in duration-1000">
              <div 
                className="absolute -inset-4 rounded-[60px] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"
                style={{ backgroundColor: colors.primary }}
              ></div>
              <div className="relative rounded-[50px] overflow-hidden border-[12px] border-white shadow-2xl aspect-[4/5] bg-slate-100">
                {about.image_url ? (
                  <img 
                    src={about.image_url} 
                    alt={general.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-display font-black text-4xl opacity-20 text-center px-10 bg-slate-50">
                    Sua foto aqui
                  </div>
                )}
              </div>
              
              {/* Badge Overlay */}
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 max-w-[200px] hidden md:block">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: colors.primary }}>
                    <Heart size={20} fill="currentColor" />
                  </div>
                  <span className="font-black text-xs uppercase tracking-widest text-slate-900">Compromisso Real</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold leading-tight uppercase tracking-wider">Dedicação total à nossa gente e ao futuro da região.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative">
            <Quote 
              size={120} 
              className="absolute -top-10 -left-16 text-slate-50 opacity-100 pointer-events-none" 
              style={{ color: `${colors.primary}0D` }}
            />
            <div className="relative z-10 space-y-8">
              {about?.content ? (
                about.content.split('\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <p 
                      key={index} 
                      className="text-xl text-slate-600 leading-relaxed font-medium"
                    >
                      {paragraph}
                    </p>
                  )
                ))
              ) : (
                <p className="text-xl text-slate-400 italic">
                  Compromisso com o desenvolvimento e o bem-estar de nossa comunidade.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Values / Mission Section (Optional but nice) */}
        <div className="max-w-7xl mx-auto px-6 mt-32">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-10 bg-slate-50 rounded-[40px] space-y-6 hover:bg-white hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-slate-100 group">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-slate-900 group-hover:scale-110 transition-transform">
                        <Target size={32} style={{ color: colors.primary }} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">Missão</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        {about?.mission || "Promover o desenvolvimento sustentável e a justiça social através de políticas públicas inovadoras e participativas."}
                    </p>
                </div>
                <div className="p-10 bg-slate-50 rounded-[40px] space-y-6 hover:bg-white hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-slate-100 group">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-slate-900 group-hover:scale-110 transition-transform">
                        <User size={32} style={{ color: colors.primary }} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">Valores</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        {about?.values || "Transparência, ética, compromisso com a verdade e respeito absoluto ao cidadão em todas as nossas ações."}
                    </p>
                </div>
                <div className="p-10 bg-slate-50 rounded-[40px] space-y-6 hover:bg-white hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-slate-100 group">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-slate-900 group-hover:scale-110 transition-transform">
                        <Heart size={32} style={{ color: colors.primary }} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">Propósito</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        {about?.purpose || "Construir um legado de orgulho para nossa terra, garantindo oportunidades para as gerações presentes e futuras."}
                    </p>
                </div>
            </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
