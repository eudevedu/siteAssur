import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { 
  Users, 
  UserPlus, 
  Shield, 
  Key, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Mail,
  Settings as SettingsIcon,
  Search,
  X,
  Lock,
  User as UserIcon
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { logsApi } from '../../lib/api/logs'
import toast from 'react-hot-toast'
import ConfirmModal from '../components/ConfirmModal'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export default function Settings() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // New User Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'admin'
  })
  const [isCreating, setIsCreating] = useState(false)
  
  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      console.error('Erro ao buscar usuários:', err)
      toast.error('Não foi possível carregar a lista de usuários.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setIsCreating(true)
    const toastId = toast.loading('Criando usuário e enviando convite...')

    try {
      // Create a temporary client to avoid logging out the current admin
      const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false }
      })

      const { data, error: signUpError } = await tempClient.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            full_name: newUser.full_name
          }
        }
      })

      if (signUpError) throw signUpError

      // If successful, the trigger on the database should create the profile.
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: newUser.email,
            full_name: newUser.full_name,
            role: newUser.role,
            updated_at: new Date()
          })
        
        if (profileError) console.warn('Profile update error:', profileError)
        await logsApi.logAction('Criou novo administrador', 'user', data.user.id, { email: newUser.email, name: newUser.full_name })
      }

      toast.success('Usuário convidado com sucesso! Verifique o e-mail.', { id: toastId })
      setIsModalOpen(false)
      setNewUser({ email: '', password: '', full_name: '' })
      fetchUsers()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao criar usuário: ' + err.message, { id: toastId })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    
    const toastId = toast.loading('Removendo acesso completo...')
    try {
      // Calls the SQL function created to handle both AUTH and PUBLIC deletion
      const { error } = await supabase.rpc('delete_user_completely', { 
        user_id: userToDelete.id 
      })
      
      if (error) throw error
      
      await logsApi.logAction('Removeu usuário permanentemente', 'user', userToDelete.id, { email: userToDelete.email, name: userToDelete.full_name })

      setUsers(users.filter(u => u.id !== userToDelete.id))
      toast.success('Usuário removido permanentemente!', { id: toastId })
      setUserToDelete(null)
      setIsDeleteModalOpen(false)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao remover usuário: ' + err.message, { id: toastId })
    }
  }

  const handleDeleteClick = (user) => {
    setUserToDelete(user)
    setIsDeleteModalOpen(true)
  }

  const tabs = [
    { id: 'users', label: 'Gerenciar Acessos', icon: Users },
    { id: 'security', label: 'Segurança & CMS', icon: Shield },
  ]

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Se o logado não for superadmin, ele não vê os superadmins
    if (profile?.role !== 'superadmin' && user.role === 'superadmin') {
      return false;
    }
    
    return matchesSearch;
  })

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Configurações do CMS</h1>
          <p className="text-slate-500">Gerencie usuários administrativos e permissões do sistema.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-patriotic-green shadow-sm border border-slate-200' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    placeholder="Buscar usuários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-patriotic-green/20 focus:border-patriotic-green transition-all"
                  />
                </div>
                
                <button 
                  className="flex items-center gap-2 px-4 py-2 bg-patriotic-green text-white rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                  onClick={() => setIsModalOpen(true)}
                >
                  <UserPlus size={18} />
                  Novo Usuário
                </button>
              </div>

              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                      <th className="px-6 py-4">Usuário</th>
                      <th className="px-6 py-4">Nível de Acesso</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center">
                          <Loader2 className="animate-spin mx-auto text-patriotic-green mb-2" size={32} />
                          <p className="text-slate-500 font-medium">Buscando usuários...</p>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center text-slate-400">
                          Nenhum usuário encontrado.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold uppercase">
                                {u.full_name?.charAt(0) || <Users size={18} />}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{u.full_name || 'Usuário sem nome'}</div>
                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                  <Mail size={12} /> {u.email || 'Email não disponível'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                              u.role === 'superadmin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {u.role === 'superadmin' ? 'Super Admin' : 'Administrador'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {u.id === user?.id ? (
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                Você
                              </span>
                            ) : (
                              <button 
                                onClick={() => handleDeleteClick(u)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8">
              <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex gap-4">
                <SettingsIcon className="text-amber-500 shrink-0" size={24} />
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-900">Acesso Restrito</h4>
                  <p className="text-sm text-amber-700 leading-relaxed">
                    Esta seção é dedicada à administração técnica do CMS. 
                    As configurações visuais do site (cores, textos da home, contato) foram movidas para a aba <strong>Páginas &gt; Página Inicial</strong> para facilitar o gerenciamento de conteúdo.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button className="flex items-center gap-4 p-6 bg-white border border-slate-200 rounded-2xl hover:border-patriotic-green hover:shadow-md transition-all group text-left">
                  <div className="p-3 bg-slate-100 rounded-xl text-slate-600 group-hover:bg-patriotic-green/10 group-hover:text-patriotic-green transition-colors">
                    <Key size={24} />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">Alterar Minha Senha</h5>
                    <p className="text-xs text-slate-500">Redefina suas credenciais de acesso.</p>
                  </div>
                </button>

                <button 
                  onClick={() => navigate('/admin/logs')}
                  className="flex items-center gap-4 p-6 bg-white border border-slate-200 rounded-2xl hover:border-patriotic-green hover:shadow-md transition-all group text-left w-full"
                >
                  <div className="p-3 bg-slate-100 rounded-xl text-slate-600 group-hover:bg-patriotic-green/10 group-hover:text-patriotic-green transition-colors">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">Logs do Sistema</h5>
                    <p className="text-xs text-slate-500">Veja o histórico de alterações no CMS.</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <UserPlus size={24} className="text-patriotic-green" />
                Novo Usuário
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Nome Completo</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      required
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-patriotic-green/20 focus:border-patriotic-green transition-all"
                      placeholder="Ex: João Silva"
                      value={newUser.full_name}
                      onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email" 
                      required
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-patriotic-green/20 focus:border-patriotic-green transition-all"
                      placeholder="email@exemplo.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Senha Provisória</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password" 
                      required
                      minLength={6}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-patriotic-green/20 focus:border-patriotic-green transition-all"
                      placeholder="Mínimo 6 caracteres"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Nível de Acesso</label>
                  <select 
                    disabled={profile?.role !== 'superadmin'}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-patriotic-green/20 focus:border-patriotic-green transition-all font-bold appearance-none disabled:opacity-50"
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="admin">Administrador (Padrão)</option>
                    <option value="superadmin">Super Admin (Acesso Total)</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {profile?.role !== 'superadmin' 
                      ? 'Somente Super Admins podem atribuir privilégios superiores.' 
                      : (newUser.role === 'superadmin' ? 'Acesso total ao CMS.' : 'Acesso a conteúdos, exceto logs e gestão de usuários.')}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isCreating}
                  className="flex-2 px-8 py-3 bg-patriotic-green text-white rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCreating ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  Criar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteUser}
        title="Remover Acesso?"
        description={`Tem certeza que deseja remover o acesso administrativo de "${userToDelete?.full_name}"?`}
        confirmText="Remover Agora"
        cancelText="Manter Usuário"
        variant="danger"
      />
    </div>
  )
}
