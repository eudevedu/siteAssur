import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Image, 
  Settings, 
  LogOut, 
  Layers,
  Users,
  ChevronRight,
  Tag,
  ClipboardList,
  User,
  History,
  Layout,
  Palette,
  X,
  ChevronLeft,
  ChevronsRight,
  UserCheck
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Users, label: 'Leads', path: '/admin/leads' },
  { icon: FileText, label: 'Posts', path: '/admin/posts' },
  { icon: Tag, label: 'Categorias', path: '/admin/categories' },
  { icon: User, label: 'Autores', path: '/admin/authors' },
  { icon: Briefcase, label: 'Projetos', path: '/admin/projects' },
  { icon: ClipboardList, label: 'Formulários', path: '/admin/forms' },
  { icon: Layers, label: 'Páginas', path: '/admin/pages' },
  { icon: Palette, label: 'Identidade Visual', path: '/admin/design' },
  { icon: Layout, label: 'Menu & Rodapé', path: '/admin/footer' },
  { icon: Image, label: 'Mídia', path: '/admin/media' },
  { icon: History, label: 'Logs do Sistema', path: '/admin/logs', superOnly: true },
  { icon: Settings, label: 'Configurações', path: '/admin/settings' },
]

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }) {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-300"
          onClick={onClose}
        ></div>
      )}

      <aside className={`
        ${isCollapsed ? 'lg:w-20' : 'w-64'} admin-sidebar-gradient text-slate-400 flex flex-col h-screen fixed left-0 top-0 z-[70] shadow-2xl transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <h1 className="text-xl font-display font-black text-white flex items-center gap-3 animate-in fade-in duration-500">
              <div className="w-10 h-10 border-4 border-patriotic-green rounded-xl shadow-lg shadow-patriotic-green/30 flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-sm rotate-45"></div>
              </div>
              <span className="truncate">CMS <span className= "text-patriotic-green">ADMIN</span></span>
            </h1>
          )}

          {isCollapsed && (
             <div className="w-10 h-10 border-4 border-patriotic-green rounded-xl shadow-lg shadow-patriotic-green/30 flex items-center justify-center animate-in zoom-in duration-500">
              <div className="w-5 h-5 bg-white rounded-sm rotate-45"></div>
            </div>
          )}

          <div className="flex gap-2">
            <button 
              onClick={onToggleCollapse}
              className="p-2 hover:bg-white/10 rounded-lg hidden lg:flex text-slate-400 transition-colors"
              title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
            >
              {isCollapsed ? <ChevronsRight size={20} /> : <ChevronLeft size={20} />}
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg lg:hidden text-slate-400"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
          <div className={`text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 px-3 ${isCollapsed ? 'text-center' : ''}`}>
            {isCollapsed ? '...' : 'Menu Principal'}
          </div>
          {navItems.filter(item => !item.superOnly || (profile?.role === 'superadmin')).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              onClick={() => {
                if (window.innerWidth < 1024) onClose()
              }}
              title={isCollapsed ? item.label : ''}
              className={({ isActive }) => `
                flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-3.5 rounded-xl transition-all duration-300 group
                ${isActive 
                  ? 'bg-white/10 text-white shadow-lg nav-item-active' 
                  : 'hover:bg-white/5 hover:text-slate-200'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} w-full`}>
                    <item.icon 
                      size={isCollapsed ? 22 : 18} 
                      className={isActive ? 'text-patriotic-green' : 'text-slate-500 group-hover:text-slate-300'} 
                    />
                    {!isCollapsed && <span className="font-semibold text-sm truncate animate-in fade-in slide-in-from-left-2 duration-300">{item.label}</span>}
                  </div>
                  {!isCollapsed && <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-4px] group-hover:translate-x-0" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className={`bg-white/5 rounded-2xl ${isCollapsed ? 'p-2' : 'p-4'} border border-white/5 transition-all`}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} ${isCollapsed ? '' : 'mb-4'}`}>
              <div className="w-10 h-10 shrink-0 rounded-full bg-patriotic-green/20 border border-patriotic-green/30 flex items-center justify-center text-patriotic-green font-bold">
                {user?.email?.[0].toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0 animate-in fade-in duration-300">
                  <div className="text-sm font-bold text-white truncate">{profile?.full_name || user?.email?.split('@')[0]}</div>
                  <div className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">
                    {profile?.role === 'superadmin' ? 'Super Admin' : 'Administrador'}
                  </div>
                </div>
              )}
            </div>
            
            {!isCollapsed ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-bold animate-in fade-in duration-300"
              >
                <LogOut size={14} />
                Sair
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full mt-2 flex items-center justify-center p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                title="Sair do Painel"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
