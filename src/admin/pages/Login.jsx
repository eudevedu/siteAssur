import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LogIn, Lock, Mail, AlertCircle } from 'lucide-react'
import { logsApi } from '../../lib/api/logs'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await login(email, password)
      if (error) throw error
      
      await logsApi.logAction('Realizou login no sistema', 'user', null, { email })
      
      navigate('/admin')
    } catch (err) {
      setError('Credenciais inválidas. Verifique seu e-mail e senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-patriotic-green to-patriotic-yellow"></div>
        
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-patriotic-green/10 rounded-2xl flex items-center justify-center text-patriotic-green mb-6">
            <LogIn size={32} />
          </div>
          <h2 className="text-3xl font-display font-black text-slate-900">Acesso Restrito</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Entre com suas credenciais para gerenciar o portal
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="email"
                required
                className="input-field pl-12 h-14 bg-slate-50 border-none focus:bg-white"
                placeholder="E-mail de acesso"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="password"
                required
                className="input-field pl-12 h-14 bg-slate-50 border-none focus:bg-white"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary h-14 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:shadow-patriotic-green/30 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar no Painel'}
          </button>
          
        </form>
      </div>
    </div>
  )
}
