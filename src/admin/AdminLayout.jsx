import React, { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import './admin.css'

export default function AdminLayout() {
  const { user, loading } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-patriotic-green"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  const sidebarWidth = isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'

  return (
    <div className="min-h-screen admin-bg-pattern">
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <div className={`transition-all duration-300 ${isMobileMenuOpen ? sidebarWidth : sidebarWidth}`}>
        <Topbar 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
          isSidebarCollapsed={isSidebarCollapsed} 
        />
        <main className="p-4 md:p-8 mt-16 max-w-7xl mx-auto min-h-[calc(100vh-64px)] animate-slide-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
