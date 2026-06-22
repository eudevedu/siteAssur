import React, { useState, useEffect } from 'react'
import { ArrowRight, MessageCircle, Play, Newspaper, Calendar, ShieldCheck, Zap, Heart, Star, Users, MapPin, Award, Loader2, Instagram, Briefcase } from 'lucide-react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useSettings } from '../../context/SettingsContext'
import LeadForm from '../components/LeadForm'
import SEO from '../components/SEO'
import { postsApi } from '../../lib/api/posts'
import { projectsApi } from '../../lib/api/projects'

// Helper to get Lucide icon by name
const IconComponent = ({ name, ...props }) => {
  const icons = { ShieldCheck, MapPin, Heart, Star, Users, Zap, Award }
  const Icon = icons[name] || Star
  return <Icon {...props} />
}

const MouseGlow = ({ color = 'rgba(0, 103, 56, 0.08)' }) => {
  useEffect(() => {
    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`)
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-500 hidden lg:block"
      style={{
        background: `radial-gradient(600px at var(--mouse-x, 0px) var(--mouse-y, 0px), ${color}, transparent 80%)`
      }}
    />
  )
}



export default function Home() {
  const { settings, loading } = useSettings()
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false)
  const [latestPosts, setLatestPosts] = useState(() => {
    const saved = sessionStorage.getItem('home_posts')
    return saved ? JSON.parse(saved) : []
  })
  const [featuredProjects, setFeaturedProjects] = useState(() => {
    const saved = sessionStorage.getItem('home_projects')
    return saved ? JSON.parse(saved) : []
  })
  const [dataLoading, setDataLoading] = useState(() => {
    return !sessionStorage.getItem('home_posts') || !sessionStorage.getItem('home_projects')
  })

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      const [posts, projects] = await Promise.all([
        postsApi.getAll({ status: 'published', limit: 3 }),
        projectsApi.getAll({ status: 'published', limit: 4 })
      ])
      const pData = posts || []
      const prData = projects?.filter(p => p.featured).slice(0, 4) || projects?.slice(0, 4) || []
      
      setLatestPosts(pData)
      setFeaturedProjects(prData)
      
      sessionStorage.setItem('home_posts', JSON.stringify(pData))
      sessionStorage.setItem('home_projects', JSON.stringify(prData))
    } catch (err) {
      console.error('Erro ao carregar dados da home:', err)
    } finally {
      setDataLoading(false)
    }
  }

  if (loading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-slate-100 border-t-patriotic-green rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  const { general, hero, colors, stats, socials, nav } = settings

  const renderHeroTitle = () => {
    const title = hero.title || 'Vamos juntos fazer o melhor!'
    const accent = hero.titleAccent || 'melhor!'
    if (!title.includes(accent)) {
      return (
        <span>
          {title}{' '}
          <span 
            className="text-transparent bg-clip-text bg-gradient-to-br"
            style={{ backgroundImage: `linear-gradient(to bottom right, ${colors.primary}, ${colors.primary}CC)` }}
          >
            {accent}
          </span>
        </span>
      )
    }
    const parts = title.split(accent)
    return (
      <span>
        {parts[0]}
        <span 
          className="text-transparent bg-clip-text bg-gradient-to-br"
          style={{ backgroundImage: `linear-gradient(to bottom right, ${colors.primary}, ${colors.primary}CC)` }}
        >
          {accent}
        </span>
        {parts.slice(1).join(accent)}
      </span>
    )
  }

  const renderProjectsTitle = () => {
    const title = settings.projects?.title || 'Trabalho que Transforma.'
    const accent = settings.projects?.titleAccent || 'Transforma.'
    if (!title.includes(accent)) {
      return <span>{title} <span className="italic" style={{ color: colors.primary }}>{accent}</span></span>
    }
    const parts = title.split(accent)
    return (
      <span>
        {parts[0]}
        <span className="italic" style={{ color: colors.primary }}>{accent}</span>
        {parts.slice(1).join(accent)}
      </span>
    )
  }

  const renderBlogTitle = () => {
    const title = settings.blog?.title || 'Últimas Notícias.'
    const accent = settings.blog?.titleAccent || 'Notícias.'
    if (!title.includes(accent)) {
      return (
        <span>
          {title}{' '}
          <span className="underline underline-offset-8" style={{ textDecorationColor: colors.secondary, color: colors.primary }}>
            {accent}
          </span>
        </span>
      )
    }
    const parts = title.split(accent)
    return (
      <span>
        {parts[0]}
        <span className="underline underline-offset-8" style={{ textDecorationColor: colors.secondary, color: colors.primary }}>
          {accent}
        </span>
        {parts.slice(1).join(accent)}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-white selection:bg-slate-900 selection:text-white relative">
      <SEO />
      <MouseGlow color={`${colors.primary}14`} />
      <Header />

      {/* Hero section moved inside Home to access state */}
      <section className="relative min-h-[85vh] flex items-center pt-32 lg:pt-40 pb-32 lg:pb-48 overflow-hidden bg-white mesh-gradient">
        <div
          className="absolute top-20 right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse-glow"
          style={{ backgroundColor: `${colors.primary}1A` }}
        ></div>
        <div
          className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] animate-pulse-glow"
          style={{ backgroundColor: `${colors.secondary}1A` }}
        ></div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-8 text-center lg:text-left mb-12 lg:mb-0">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-md border border-white rounded-full shadow-sm">
              <span className="flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-2 w-2 rounded-full opacity-75"
                  style={{ backgroundColor: colors.primary }}
                ></span>
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ backgroundColor: colors.primary }}
                ></span>
              </span>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-600">{general.slogan}</span>
            </div>

            <h1 className="text-6xl lg:text-9xl font-display font-black text-slate-900 leading-[0.9] tracking-tighter">
              {renderHeroTitle()}
            </h1>

            <p className="text-xl text-slate-500 max-w-xl font-medium leading-relaxed">
              {general.description}
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4 md:gap-3 justify-center lg:justify-start">
              <Link
                to="/participar"
                className="group relative px-10 py-4 text-white rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl bg-slate-900 flex items-center justify-center h-[60px]"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.primary}CC)` }}
                ></div>
                <span className="relative flex items-center gap-3 text-base">
                  {hero.ctaPrimary} <ArrowRight size={18} />
                </span>
              </Link>

              <a 
                href={hero.ctaSecondaryUrl || settings.socials.instagram}
                target="_blank"
                rel="noreferrer"
                className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-800 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-md active:scale-95 h-[60px]"
              >
                <div className="w-9 h-9 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center">
                  <Instagram size={18} />
                </div>
                <span className="text-base">{hero.ctaSecondary}</span>
              </a>
            </div>
          </div>

          <div className="relative group">
            <div
              className="absolute -inset-4 rounded-[60px] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"
              style={{ backgroundImage: `linear-gradient(to bottom right, ${colors.primary}33, ${colors.secondary}33)` }}
            ></div>
            <div className="relative rounded-[50px] overflow-hidden border-[12px] border-white shadow-2xl aspect-[4/5] bg-slate-100 animate-float">
              {hero.hero_image_url ? (
                <img 
                  src={hero.hero_image_url} 
                  alt={general.name} 
                  loading="eager"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-display font-black text-4xl opacity-20 text-center px-10">
                  Adicione sua foto nas configurações
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-10 left-10 right-10 text-white">
                <div className="text-4xl font-display font-black mb-1">{general.name}</div>
                <div
                  className="font-bold uppercase tracking-widest text-sm mb-4"
                  style={{ color: colors.secondary }}
                >
                  {hero.photoSub || 'Liderança & Inovação'}
                </div>
                <div className="flex gap-2">
                  {(hero.badge1 || !('badge1' in hero)) && <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase">{hero.badge1 || 'Ficha Limpa'}</div>}
                  {(hero.badge2 || !('badge2' in hero)) && <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase">{hero.badge2 || 'Resultados'}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Projetos em Destaque */}
      {featuredProjects.length > 0 && (
        <section className="py-32 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="space-y-4">
                <h2 
                  className="text-sm font-black uppercase tracking-[0.4em]"
                  style={{ color: colors.primary }}
                >
                  {settings.projects?.subtitle || 'Conquistas & Ações'}
                </h2>
                <h3 className="text-5xl font-display font-black text-slate-900 leading-tight">
                  {renderProjectsTitle()}
                </h3>
              </div>
              <Link 
                to="/projetos"
                className="flex items-center gap-2 font-black text-sm uppercase tracking-widest hover:gap-4 transition-all"
                style={{ color: colors.primary }}
              >
                Ver todos os projetos <ArrowRight size={18} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredProjects.map((project) => (
                <Link 
                  key={project.id} 
                  to={`/projetos/${project.slug}`}
                  className="group bg-white rounded-[40px] overflow-hidden border border-slate-100 hover:border-transparent hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row h-full"
                >
                  <div className="md:w-2/5 aspect-video md:aspect-auto overflow-hidden">
                    {project.cover_image_url ? (
                      <img 
                        src={project.cover_image_url} 
                        alt={project.title} 
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                        <Briefcase size={40} />
                      </div>
                    )}
                  </div>
                  <div className="p-8 md:w-3/5 flex flex-col justify-center space-y-4">
                    <div className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-slate-50 rounded-md w-fit text-slate-500">
                      {project.categories?.name || 'Projeto'}
                    </div>
                    <h4 className="text-2xl font-bold text-slate-900 leading-tight group-hover:text-patriotic-green transition-colors">
                      {project.title}
                    </h4>
                    <p className="text-slate-500 text-sm line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Seção de Notícias / Blog */}
      {latestPosts.length > 0 && (
        <section className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20 space-y-4">
              <h2 
                className="text-sm font-black uppercase tracking-[0.4em]"
                style={{ color: colors.primary }}
              >
                {settings.blog?.subtitle || 'Fique por Dentro'}
              </h2>
              <h3 className="text-5xl font-display font-black text-slate-900">
                {renderBlogTitle()}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestPosts.map((post) => (
                <Link 
                  key={post.id} 
                  to={`/blog/${post.slug}`}
                  className="group flex flex-col space-y-6"
                >
                  <div className="aspect-video rounded-[32px] overflow-hidden relative">
                    {post.cover_image_url ? (
                      <img 
                        src={post.cover_image_url} 
                        alt={post.title} 
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                        <Newspaper size={40} />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900">
                      {post.categories?.name || 'Notícia'}
                    </div>
                  </div>
                  <div className="space-y-3 px-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <Calendar size={14} />
                      {new Date(post.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </div>
                    <h4 className="text-2xl font-bold text-slate-900 leading-tight group-hover:text-patriotic-green transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-2 text-sm font-black text-patriotic-green group-hover:gap-4 transition-all uppercase tracking-widest pt-2">
                      Ler notícia <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-20 text-center">
              <Link 
                to="/blog"
                className="inline-flex items-center gap-3 px-10 py-4 border-2 border-slate-900 rounded-2xl font-black hover:bg-slate-900 hover:text-white transition-all shadow-xl"
              >
                VER TODAS AS NOTÍCIAS <Newspaper size={20} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* BentoGrid mantido como base para outras seções se necessário, mas agora substituído pelo conteúdo real */}

      <LeadForm
        isOpen={isLeadFormOpen}
        onClose={() => setIsLeadFormOpen(false)}
        settings={settings}
      />


      {/* Floating Action Button */}
      {nav.showFloatingButton !== false && (
        <a
          href={nav.floatingButtonLink || `https://wa.me/${socials.whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-10 right-10 z-50 group"
        >
          <div className="absolute inset-0 bg-emerald-500 rounded-full blur-3xl opacity-40 group-hover:opacity-80 transition-opacity"></div>
          <div className="relative bg-emerald-500 text-white p-5 rounded-full shadow-2xl flex items-center gap-3 transition-all hover:pr-8 group-hover:scale-110 active:scale-95 group">
            <MessageCircle size={32} />
            <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 font-black uppercase tracking-wider text-sm">
              {nav.floatingButtonText || 'Falar com a Equipe'}
            </span>
          </div>
        </a>
      )}

      <Footer />
    </div>
  )
}
