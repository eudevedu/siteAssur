import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { settingsApi } from '../lib/api/settings'
import { pagesApi } from '../lib/api/pages'
import { siteConfig as fallbackConfig } from '../site/config'

const SettingsContext = createContext()

export function SettingsProvider({ children }) {
  // Inicializa com o que estiver no localStorage ou com o fallback padrão
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('site_settings')
    return saved ? JSON.parse(saved) : null
  })
  const [navPages, setNavPages] = useState(() => {
    const saved = localStorage.getItem('nav_pages')
    return saved ? JSON.parse(saved) : []
  })
  
  // O loading agora só é true na PRIMEIRA vez absoluta (se não houver nada no cache)
  const [loading, setLoading] = useState(!settings)
  const [error, setError] = useState(null)

  const loadSettings = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    
    try {
      const [data, pages] = await Promise.all([
        settingsApi.getAll(),
        pagesApi.getAll()
      ])
      
      const filteredPages = pages?.filter(p => p.status === 'published' && p.show_in_nav) || []
      setNavPages(filteredPages)
      localStorage.setItem('nav_pages', JSON.stringify(filteredPages))
      
      const mergedSettings = {
        general: {
          name: data.general?.name || fallbackConfig.name,
          shortName: data.general?.shortName || fallbackConfig.shortName,
          slogan: data.general?.slogan || fallbackConfig.slogan,
          description: data.general?.description || fallbackConfig.description,
          ...data.general
        },
        colors: {
          ...fallbackConfig.colors,
          ...data.colors
        },
        socials: {
          ...fallbackConfig.socials,
          ...data.socials
        },
        contact: {
          ...fallbackConfig.contact,
          ...data.contact
        },
        hero: data.hero || {},
        nav: data.nav || {},
        footer: data.footer || {},
        leadForm: data.leadForm || {},
        stats: data.stats || [],
        about: data.about || {}
      }
      
      setSettings(mergedSettings)
      localStorage.setItem('site_settings', JSON.stringify(mergedSettings))
    } catch (err) {
      console.error('Failed to load site settings:', err)
      setError(err)
      
      if (!settings) {
        setSettings({
          general: {
            name: fallbackConfig.name,
            shortName: fallbackConfig.shortName,
            slogan: fallbackConfig.slogan,
            description: fallbackConfig.description
          },
          colors: fallbackConfig.colors,
          socials: fallbackConfig.socials,
          contact: fallbackConfig.contact,
          hero: {},
          nav: {},
          footer: {},
          leadForm: {},
          stats: [],
          about: {}
        })
      }
    } finally {
      setLoading(false)
    }
  }, [settings])

  useEffect(() => {
    // Carrega em silêncio se já tivermos dados em cache
    loadSettings(!!settings)
  }, [loadSettings])

  useEffect(() => {
    if (settings?.colors) {
      const root = document.documentElement;
      const { colors } = settings;
      
      const primary = colors.primary || fallbackConfig.colors.primary;
      const secondary = colors.secondary || fallbackConfig.colors.secondary;
      const accent = colors.accent || fallbackConfig.colors.accent;

      root.style.setProperty('--color-primary', primary);
      root.style.setProperty('--color-secondary', secondary);
      root.style.setProperty('--color-accent', accent);
      
      root.style.setProperty('--color-primary-light', `${primary}E6`);
      root.style.setProperty('--color-primary-dark', `${primary}CC`);
      root.style.setProperty('--color-secondary-light', `${secondary}E6`);
      root.style.setProperty('--color-secondary-dark', `${secondary}CC`);
      root.style.setProperty('--color-accent-light', `${accent}E6`);
      root.style.setProperty('--color-accent-dark', `${accent}CC`);
    }
  }, [settings])

  const contextValue = useMemo(() => ({
    settings,
    navPages,
    loading,
    error,
    refreshSettings: () => loadSettings(false)
  }), [settings, navPages, loading, error, loadSettings])

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  )
}


export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
