import React, { useEffect, useState } from 'react'
import { postsApi } from '../../lib/api/posts'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Calendar, ArrowRight, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import { useSettings } from '../../context/SettingsContext'

export default function Blog() {
  const { settings } = useSettings()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const colors = settings?.colors || { primary: '#006738' }

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const data = await postsApi.getAll({ status: 'published' })
      setPosts(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
 
      <main className="pt-32 pb-20 max-w-7xl mx-auto px-4">
        <div className="mb-16 text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900">Notícias e <span style={{ color: colors.primary }}>Atualizações</span></h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Fique por dentro de todas as ações, projetos e novidades do nosso mandato.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-3xl h-96 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100"
              >
                <div className="aspect-video bg-slate-200 relative overflow-hidden">
                  {post.cover_image_url ? (
                    <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">AM</div>
                  )}
                </div>
                <div className="p-8 space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5 text-patriotic-green">
                      <Calendar size={12} />
                      {format(new Date(post.created_at), "dd MMM yyyy", { locale: ptBR })}
                    </div>
                    {(() => {
                      const author = Array.isArray(post.authors) ? post.authors[0] : post.authors;
                      if (!author?.name) return null;
                      return (
                        <div className="flex items-center gap-1.5">
                          <User size={12} />
                          {author.name}
                        </div>
                      );
                    })()}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 leading-tight group-hover:text-patriotic-green transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700 group-hover:gap-4 transition-all pt-2">
                    Continuar lendo
                    <ArrowRight size={16} className="text-patriotic-green" />
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
