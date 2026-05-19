import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { projectsApi } from '../../lib/api/projects'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { ArrowLeft, Calendar, Tag, ExternalLink, Briefcase, ChevronRight, Share2 } from 'lucide-react'
import SEO from '../components/SEO'

export default function ProjectDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [relatedProjects, setRelatedProjects] = useState([])

  useEffect(() => {
    fetchProject()
  }, [slug])

  const fetchProject = async () => {
    setLoading(true)
    try {
      // Find project by slug
      const allProjects = await projectsApi.getAll({ status: 'published' })
      const currentProject = allProjects.find(p => p.slug === slug)
      
      if (!currentProject) {
        navigate('/projetos')
        return
      }

      setProject(currentProject)
      setRelatedProjects(allProjects.filter(p => p.id !== currentProject.id).slice(0, 3))
    } catch (err) {
      console.error(err)
      navigate('/projetos')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-patriotic-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title={project.meta_title || project.title} 
        description={project.meta_description || project.description}
        image={project.cover_image_url}
      />
      <Header />

      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <Link 
            to="/projetos"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-patriotic-green font-bold text-sm uppercase tracking-widest transition-all mb-8 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Voltar para projetos
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 bg-patriotic-green/10 text-patriotic-green rounded-full text-xs font-black uppercase tracking-widest">
                  {project.categories?.name || 'Projeto'}
                </span>
                <span className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                  <Calendar size={14} /> {new Date(project.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-display font-black text-slate-900 leading-[1.1]">
                {project.title}
              </h1>
              <p className="text-xl text-slate-500 leading-relaxed max-w-xl">
                {project.description}
              </p>
              
              {project.url && (
                <div className="pt-4">
                  <a 
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-patriotic-green text-white rounded-2xl font-black shadow-xl shadow-patriotic-green/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    VISITAR SITE DO PROJETO <ExternalLink size={20} />
                  </a>
                </div>
              )}
            </div>

            <div className="aspect-[4/3] rounded-[48px] overflow-hidden shadow-2xl border-8 border-slate-50">
              {project.cover_image_url ? (
                <img src={project.cover_image_url} alt={project.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                  <Briefcase size={100} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-4xl mx-auto px-6 py-20">
          <article className="prose prose-slate prose-lg max-w-none 
            prose-headings:font-display prose-headings:font-black prose-headings:text-slate-900
            prose-p:text-slate-600 prose-p:leading-[1.8]
            prose-strong:text-patriotic-green prose-a:text-patriotic-green prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-[32px] prose-img:shadow-xl prose-blockquote:border-patriotic-green prose-blockquote:bg-slate-50 prose-blockquote:py-2 prose-blockquote:rounded-r-2xl">
            {project.content ? (
              <div dangerouslySetInnerHTML={{ __html: project.content }} />
            ) : (
              <p className="italic text-slate-400">Nenhum detalhe adicional disponível para este projeto.</p>
            )}
          </article>

          {/* Action Footer */}
          <div className="mt-20 p-12 bg-slate-900 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
            <div className="relative z-10 text-center md:text-left">
              <h3 className="text-3xl font-display font-black mb-2">Gostou deste trabalho?</h3>
              <p className="text-white/60">Ajude a divulgar nossas conquistas para mais pessoas.</p>
            </div>
            <button 
              onClick={() => {
                navigator.share({
                  title: project.title,
                  text: project.description,
                  url: window.location.href
                }).catch(() => alert('Link copiado para a área de transferência!'))
              }}
              className="relative z-10 flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              COMPARTILHAR <Share2 size={20} />
            </button>
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
              <Briefcase size={200} />
            </div>
          </div>
        </div>

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <div className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-100">
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-3xl font-display font-black text-slate-900">Outros Projetos</h3>
              <Link to="/projetos" className="text-patriotic-green font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
                Ver todos <ChevronRight size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProjects.map(p => (
                <Link key={p.id} to={`/projetos/${p.slug}`} className="group space-y-4">
                  <div className="aspect-video rounded-3xl overflow-hidden shadow-md">
                    {p.cover_image_url ? (
                      <img src={p.cover_image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                        <Briefcase size={40} />
                      </div>
                    )}
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 group-hover:text-patriotic-green transition-colors line-clamp-2">
                    {p.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
