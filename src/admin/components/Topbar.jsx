import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { User, Bell, Globe, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Topbar({ onMenuClick, isSidebarCollapsed }) {
  const { user } = useAuth()

  return (
    <header className={`h-16 admin-glass flex items-center justify-between px-4 md:px-8 fixed top-0 right-0 left-0 ${isSidebarCollapsed ? 'lg:left-20' : 'lg:left-64'} z-40 transition-all duration-300`}>
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-slate-100 rounded-lg lg:hidden text-slate-600"
        >
          <Menu size={24} />
        </button>
      </div>
      
      <div className="flex items-center gap-2 md:gap-6">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 hover:text-patriotic-green transition-colors bg-slate-100/50 px-3 md:px-4 py-2 rounded-lg border border-slate-200"
        >
          <Globe size={14} className="hidden xs:block" />
          Ver Site
        </Link>

        <button className="relative text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full hidden xs:block">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200 hidden xs:block"></div>
        
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-slate-800">{user?.email?.split('@')[0]}</div>
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Conta Ativa</div>
          </div>
          <div className="w-10 h-10 bg-patriotic-green rounded-xl flex items-center justify-center text-white shadow-lg shadow-patriotic-green/20 overflow-hidden">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  )
}
