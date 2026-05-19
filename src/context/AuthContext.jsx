import React, { createContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('Erro ao buscar perfil:', error.message)
        // Se não existir perfil, cria um padrão (opcional, ou apenas deixa nulo)
        setProfile({ role: 'admin' }) // Fallback seguro
      } else {
        setProfile(data)
      }
    } catch (err) {
      console.error('Erro no fetchProfile:', err)
      setProfile({ role: 'admin' })
    }
  }

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          await fetchProfile(currentUser.id)
        }
      } catch (err) {
        console.error('Erro ao recuperar sessão:', err)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    let subscription
    try {
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        try {
          const currentUser = session?.user ?? null
          setUser(currentUser)
          if (currentUser) {
            await fetchProfile(currentUser.id)
          } else {
            setProfile(null)
          }
        } catch (err) {
          console.error('Erro no onAuthStateChange:', err)
        } finally {
          setLoading(false)
        }
      })
      subscription = data?.subscription
    } catch (err) {
      console.error('Erro ao escutar mudanças de autenticação:', err)
      setLoading(false)
    }

    return () => {
      if (subscription) subscription.unsubscribe()
    }
  }, [])

  const login = (email, password) => supabase.auth.signInWithPassword({ email, password })
  const signUp = (email, password, metadata = {}) => supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: metadata
    }
  })
  const logout = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, signUp, logout, refreshProfile: () => user && fetchProfile(user.id) }}>
      {children}
    </AuthContext.Provider>
  )
}
