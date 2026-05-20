import React from 'react'
import { ArrowRight, Facebook, Instagram, Twitter, Mail, Phone } from 'lucide-react'
import { useSettings } from '../../context/SettingsContext'
import { Link } from 'react-router-dom'

const SocialLink = ({ icon: Icon, href }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all border border-slate-700 hover:border-white shadow-lg"
  >
    <Icon size={20} />
  </a>
)

function FooterComponent() {
  const { settings, loading } = useSettings()

  if (loading || !settings) return null

  const { general, colors, contact, socials, footer } = settings

  return (
    <footer 
      className="text-slate-400 py-32 relative overflow-hidden"
      style={{ backgroundColor: colors.footer || '#020617' }}
    >
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>

      <div className={`max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 ${footer.showTransparencyLink ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-20`}>
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg"
              style={{ backgroundColor: colors.primary }}
            >
              {general.shortName}
            </div>
            <span className="font-display font-black text-2xl text-white tracking-tight">
              {general.name}
            </span>
          </div>
          <p className="text-lg leading-relaxed font-medium">
            {general.slogan}
          </p>
          <div className="flex gap-4">
            {socials.instagram && <SocialLink icon={Instagram} href={socials.instagram} />}
          </div>
        </div>

        <div className="space-y-8">
          <h4 className="text-white font-black uppercase tracking-[0.2em] text-xs">Navegação</h4>
          <ul className="space-y-4 font-bold">
            {footer?.links?.map((link, index) => (
              <li key={index}>
                <Link to={link.url || '/'} className="hover:text-white transition-colors flex items-center gap-2 group">
                  <div
                    className="w-0 h-0.5 group-hover:w-4 transition-all"
                    style={{ backgroundColor: colors?.primary || '#006738' }}
                  ></div>
                  {link.label}
                </Link>
              </li>
            ))}
            {(!footer?.links || footer.links.length === 0) && (
              <li className="text-slate-600 text-sm italic">Nenhum link configurado</li>
            )}
          </ul>
        </div>

        <div className="space-y-8">
          <h4 className="text-white font-black uppercase tracking-[0.2em] text-xs">Contato</h4>
          <ul className="space-y-6 font-medium">
            <li className="flex items-start gap-4">
              <div className="p-2 bg-slate-900 rounded-lg text-slate-500">
                <Mail size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase mb-1">Email</div>
                <a href={`mailto:${contact.email}`} className="text-white hover:text-patriotic-yellow transition-colors">{contact.email}</a>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="p-2 bg-slate-900 rounded-lg text-slate-500">
                <Phone size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase mb-1">Telefone</div>
                <div className="text-white">{contact.phone}</div>
              </div>
            </li>

          </ul>
        </div>

        {footer.showTransparencyLink && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h4 className="text-white font-black uppercase tracking-[0.2em] text-xs">Transparência</h4>
            <div className="bg-white/5 p-8 rounded-[32px] border border-white/10 space-y-4">
              <p className="text-sm font-medium leading-relaxed">
                Acompanhe todos os nossos gastos e ações de forma clara e objetiva.
              </p>
              <button className="flex items-center gap-2 text-sm font-black text-white hover:gap-4 transition-all">
                Portal da Transparência
                <ArrowRight size={18} style={{ color: colors.primary }} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-20 mt-20 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-bold uppercase tracking-widest text-slate-600">
        <div>© {new Date().getFullYear()} {general.name} • {footer.copyrightText || 'Todos os direitos reservados'}</div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white transition-colors">Privacidade</a>
          <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
        </div>
      </div>
    </footer>
  )
}

export default React.memo(FooterComponent)
