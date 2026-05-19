import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { logsApi } from '../../lib/api/logs'
import { Lock, CheckCircle2, AlertCircle, Loader2, Key } from 'lucide-react'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if we are in a password recovery flow
    // Supabase automatically handles the session from the email link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // If no session, it means the link might be expired or invalid
        // But we allow them to stay on the page to see if they can update
      }
    }
    checkSession()
  }, [])

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error
      
      await logsApi.logAction('Atualizou própria senha', 'user', null)

      setSuccess(true)
      setTimeout(() => {
        navigate('/admin/login')
      }, 3000)
    } catch (err) {
      console.error(err)
      setError('Erro ao atualizar senha: ' + err.message)
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
            <Key size={32} />
          </div>
          <h2 className="text-3xl font-display font-black text-slate-900">
            {success ? 'Senha Atualizada!' : 'Definir Nova Senha'}
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            {success 
              ? 'Sua nova senha foi salva com sucesso. Redirecionando...' 
              : 'Escolha uma senha forte para o seu primeiro acesso.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm animate-shake">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {success ? (
          <div className="py-10 flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 size={48} />
            </div>
            <p className="text-slate-500 font-medium">Tudo pronto! Você já pode entrar no painel.</p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleUpdatePassword}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nova Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="input-field pl-12 h-14 bg-slate-50 border-none focus:bg-white"
                    placeholder="Pelo menos 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="password"
                    required
                    className="input-field pl-12 h-14 bg-slate-50 border-none focus:bg-white"
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary h-14 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:shadow-patriotic-green/30 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
              SALVAR E ENTRAR NO PAINEL
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
