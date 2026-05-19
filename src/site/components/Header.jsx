import React, { useState, useEffect, memo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSettings } from '../../context/SettingsContext'
import { Menu, X, ArrowRight } from 'lucide-react'

function HeaderComponent() {
  const { settings, navPages, loading: settingsLoading } = useSettings()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (settingsLoading || !settings) return null

  const { general, colors, nav } = settings

  // Combine system routes with dynamic pages
  const navItems = [
    { name: 'Início', path: '/' },
    { name: 'Sobre', path: '/sobre' },
    ...navPages.map(page => ({
      name: page.title,
      path: `/p/${page.slug}`
    })),
    { name: 'Meu Trabalho', path: '/projetos' },
    { name: 'Notícias', path: '/blog' },
  ]

  return (
    <nav 
      className={`
        fixed top-0 left-0 right-0 z-[100] transition-all duration-500
        ${isScrolled && nav.sticky ? 'py-3' : 'py-6'}
        ${!nav.sticky ? 'relative' : ''}
      `}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div 
          className={`
            relative flex items-center justify-between px-8 rounded-[32px] transition-all duration-500
            ${isScrolled && nav.sticky
              ? 'bg-white/70 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] border border-white/50 h-20' 
              : 'bg-transparent h-24'}
          `}
        >
          <Link to="/" className="flex items-center gap-3 group">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl rotate-3 group-hover:rotate-0 transition-all duration-500"
              style={{ backgroundColor: colors.primary }}
            >
              {general.shortName}
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-2xl text-slate-900 tracking-tighter leading-none">
                {general.name}
              </span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">
                {general.headerSubtitle || 'Mandato Participativo'}
              </span>
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`
                  text-sm font-black uppercase tracking-widest transition-all relative group
                  ${location.pathname === item.path ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'}
                `}
                style={location.pathname === item.path ? { color: colors.primary } : {}}
              >
                {item.name}
                <span 
                  className={`
                    absolute -bottom-2 left-0 h-1 transition-all duration-300
                    ${location.pathname === item.path ? 'w-full' : 'w-0 group-hover:w-full'}
                  `}
                  style={{ backgroundColor: colors.primary }}
                ></span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {nav.showContactButton && (
                <Link 
                  to={nav.contactButtonLink || '/participar'}
                  className="hidden md:flex btn btn-primary px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:-translate-y-1 transition-all"
                  style={{ backgroundColor: colors.primary, boxShadow: `0 10px 20px -5px ${colors.primary}4D` }}
                >
                  {nav.contactButtonText || 'Participar'}
                  <ArrowRight size={16} />
                </Link>
            )}
            
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-3 bg-slate-100 rounded-2xl text-slate-600 hover:bg-slate-200 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`
        fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[90] lg:hidden transition-all duration-500
        ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
      `}>
        <div className="flex flex-col items-center justify-center h-full gap-8 overflow-y-auto py-20">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-4xl font-display font-black text-white hover:text-patriotic-yellow transition-colors text-center"
            >
              {item.name}
            </Link>
          ))}
          {nav.showContactButton && (
            <Link 
              to={nav.contactButtonLink || '/participar'}
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn btn-secondary px-10 py-5 rounded-3xl text-xl font-black mt-4"
              style={{ backgroundColor: colors.secondary }}
            >
              {nav.contactButtonText || 'Participar'}
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default memo(HeaderComponent)
