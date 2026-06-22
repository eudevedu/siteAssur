import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { useSettings } from '../../context/SettingsContext'
import { Loader2, Quote, User, Heart } from 'lucide-react'

export default function About() {
  const { settings, loading } = useSettings()

  if (loading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-slate-900" size={40} />
      </div>
    )
  }

  const { about = {}, colors, general } = settings

  return (
    <div className="min-h-screen bg-slate-50/40 selection:bg-slate-900 selection:text-white">
      <SEO 
        title={about?.title || 'Sobre'} 
        description={about?.subtitle || ''} 
      />
      <Header />

      <main className="pt-40 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Sticky Profile Image Column (Left - 5 Cols) */}
            <div className="lg:col-span-5 lg:sticky lg:top-36 space-y-6">
              <div className="relative group">
                <div 
                  className="absolute -inset-4 rounded-[60px] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-700"
                  style={{ backgroundColor: colors.primary }}
                ></div>
                
                <div className="relative rounded-[50px] overflow-hidden border-[12px] border-white shadow-xl aspect-[4/5] bg-slate-100 transition-all duration-500 hover:shadow-2xl">
                  {about.image_url ? (
                    <img 
                      src={about.image_url} 
                      alt={general.name} 
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-display font-black text-4xl opacity-20 text-center px-10 bg-slate-50">
                      Sua foto aqui
                    </div>
                  )}
                </div>
                
                {/* Badge Overlay */}
                <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-3xl shadow-xl border border-slate-100 max-w-[200px] hidden md:block">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: colors.primary }}>
                      <Heart size={20} fill="currentColor" />
                    </div>
                    <span className="font-black text-xs uppercase tracking-widest text-slate-900">{about.badgeTitle || 'Compromisso Real'}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold leading-tight uppercase tracking-wider">{about.badgeDescription || 'Dedicação total à nossa gente e ao futuro da região.'}</p>
                </div>
              </div>
            </div>

            {/* Biography Content Column (Right - 7 Cols) */}
            <div className="lg:col-span-7 space-y-8 text-left lg:pl-4">
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] border border-slate-200/60 bg-white shadow-sm"
                style={{ color: colors.primary }}
              >
                <User size={14} /> Conheça nossa história
              </div>
              
              <h1 className="text-4xl md:text-6xl font-display font-black text-slate-900 leading-tight">
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

              {about?.subtitle && (
                <div className="relative p-6 md:p-8 bg-white rounded-3xl border-l-[6px] shadow-sm transition-all hover:shadow-md" style={{ borderLeftColor: colors.primary }}>
                  <Quote 
                    size={64} 
                    className="absolute -top-6 -right-4 text-slate-100 pointer-events-none opacity-50" 
                  />
                  <p className="text-lg md:text-xl text-slate-700 font-semibold leading-relaxed italic relative z-10">
                    "{about.subtitle}"
                  </p>
                </div>
              )}

              <div className="space-y-6 pt-4">
                {about?.content ? (
                  about.content.split('\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <p 
                        key={index} 
                        className="text-lg text-slate-600 leading-relaxed font-medium"
                      >
                        {paragraph}
                      </p>
                    )
                  ))
                ) : (
                  <p className="text-lg text-slate-400 italic">
                    Compromisso com o desenvolvimento e o bem-estar de nossa comunidade.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
