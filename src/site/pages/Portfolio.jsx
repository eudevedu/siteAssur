import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { projectsApi } from '../../lib/api/projects'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Briefcase, ArrowRight, ExternalLink } from 'lucide-react'
import SEO from '../components/SEO'
import { useSettings } from '../../context/SettingsContext'

export default function Portfolio() {
  const { settings } = useSettings()
  const [projects, setProjects] = useState(() => {
    const saved = sessionStorage.getItem('list_projects')
    return saved ? JSON.parse(saved) : []
  })
  const [loading, setLoading] = useState(() => {
    return !sessionStorage.getItem('list_projects')
  })

  const colors = settings?.colors || { primary: '#006738' }

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const data = await projectsApi.getAll({ status: 'published' })
      setProjects(data || [])
      sessionStorage.setItem('list_projects', JSON.stringify(data || []))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const renderListTitle = () => {
    const title = settings?.projects?.listTitle || "Nosso Trabalho"
    const lastSpaceIndex = title.lastIndexOf(' ')
    if (lastSpaceIndex === -1) {
      return <span style={{ color: colors.primary }}>{title}</span>
    }
    const mainText = title.substring(0, lastSpaceIndex)
    const highlightText = title.substring(lastSpaceIndex + 1)
    return (
      <span>
        {mainText} <span style={{ color: colors.primary }}>{highlightText}</span>
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO 
        title={settings?.projects?.listTitle || "Meu Trabalho"} 
        description={settings?.projects?.listDescription || "Conheça os projetos e ações que estão transformando nossa região."} 
      />
      <Header />
      
      <main className="pt-32 pb-20 max-w-7xl mx-auto px-4">
        <div className="mb-16 text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-display font-black text-slate-900">
            {renderListTitle()}
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            {settings?.projects?.listDescription || "Projetos, obras e conquistas que estão transformando a realidade de nossa região."}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-[40px] h-80 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project) => (
              <Link 
                key={project.id} 
                to={`/projetos/${project.slug}`}
                className="group bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col md:flex-row h-full"
              >
                <div className="md:w-2/5 aspect-video md:aspect-auto bg-slate-200 relative overflow-hidden">
                  {project.cover_image_url ? (
                    <img src={project.cover_image_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100"><Briefcase size={40} /></div>
                  )}
                  {project.featured && (
                    <div className="absolute top-4 left-4 bg-patriotic-yellow text-patriotic-green font-black px-3 py-1 rounded-full text-[10px] uppercase tracking-widest shadow-lg">
                      Destaque
                    </div>
                  )}
                </div>
                <div className="p-8 md:w-3/5 space-y-4 flex flex-col justify-center">
                  <div className="text-[10px] font-black text-patriotic-green uppercase tracking-[0.2em] px-2 py-1 bg-patriotic-green/5 w-fit rounded">
                    {project.categories?.name || 'Projeto'}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 leading-tight group-hover:text-patriotic-green transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-3">
                    {project.description}
                  </p>
                  <div className="flex items-center gap-2 font-black text-[11px] uppercase tracking-widest text-patriotic-green group-hover:gap-4 transition-all pt-2">
                    Ver detalhes do projeto <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
