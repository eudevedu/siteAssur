import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { Lock, Mail, UserPlus, AlertCircle, CheckCircle } from 'lucide-react'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await signUp(email, password)
      if (error) throw error
      setSuccess(true)
      // Redirect after some time
      setTimeout(() => navigate('/admin/login'), 5000)
    } catch (err) {
      setError(err.message)
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
            <UserPlus size={32} />
          </div>
          <h2 className="text-3xl font-display font-black text-slate-900">Criar Conta</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Cadastre-se para gerenciar o portal
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm animate-shake">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-8 rounded-2xl flex flex-col items-center gap-4 text-center">
            <CheckCircle size={48} className="animate-bounce" />
            <div className="space-y-2">
              <h3 className="font-bold text-lg">Cadastro realizado!</h3>
              <p className="text-sm">
                Verifique sua caixa de entrada para confirmar o e-mail (se ativado no Supabase).
                <br />Redirecionando para o login em instantes...
              </p>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  required
                  className="input-field pl-12 h-14 bg-slate-50 border-none focus:bg-white"
                  placeholder="Seu e-mail"
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
              {loading ? 'Processando...' : 'Cadastrar agora'}
            </button>
            
            <p className="text-center text-sm text-slate-500">
              Já tem uma conta?{' '}
              <Link to="/admin/login" className="text-patriotic-green font-bold hover:underline">
                Fazer Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
