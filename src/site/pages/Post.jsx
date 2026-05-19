import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { postsApi } from '../../lib/api/posts'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { Calendar, ChevronLeft, Share2, Facebook, Twitter, Linkedin, User } from 'lucide-react'
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

export default function Post() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPost()
  }, [slug])

  const fetchPost = async () => {
    try {
      const data = await postsApi.getBySlug(slug)
      setPost(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  if (!post) return <div className="min-h-screen flex items-center justify-center">Post não encontrado.</div>

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title={post.meta_title || post.title} 
        description={post.meta_description || post.excerpt}
        image={post.cover_image_url}
        article={true}
      />
      <Header />
      
      <main className="pt-32 pb-20">
        <article className="max-w-4xl mx-auto px-4 space-y-12">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-patriotic-green transition-colors">
            <ChevronLeft size={16} />
            Voltar para o Blog
          </Link>

          <header className="space-y-6">
            <div className="flex items-center gap-4 text-sm font-bold text-patriotic-green uppercase tracking-widest">
              <span className="px-3 py-1 bg-patriotic-green/10 rounded-full">{post.categories?.name || 'Geral'}</span>
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar size={16} />
                {format(new Date(post.created_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-extrabold text-slate-900 leading-tight">
              {post.title}
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed italic border-l-4 border-patriotic-yellow pl-6">
              {post.excerpt}
            </p>
          </header>

          {post.cover_image_url && (
            <div className="rounded-3xl overflow-hidden shadow-2xl aspect-video bg-slate-100">
              <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div 
            className="prose prose-xl prose-slate max-w-none prose-headings:font-display prose-headings:font-black prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-patriotic-green space-y-6"
            style={{ fontSize: '1.125rem', lineHeight: '1.8' }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <footer className="pt-12 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-patriotic-green font-bold uppercase overflow-hidden border border-slate-200">
                 {(() => {
                   const author = Array.isArray(post.authors) ? post.authors[0] : post.authors;
                   if (author?.avatar_url) return <img src={author.avatar_url} alt={author.name} className="w-full h-full object-cover" />;
                   return author?.name?.charAt(0) || <User size={24} />;
                 })()}
               </div>
               <div>
                  <div className="font-bold text-slate-800">
                    {(() => {
                      const author = Array.isArray(post.authors) ? post.authors[0] : post.authors;
                      return author?.name || 'Equipe Zé Lopes';
                    })()}
                  </div>
                  <div className="text-sm text-slate-500">Autor da Notícia</div>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Share2 size={16} />
                Compartilhar
              </span>
              <div className="flex gap-2">
                {[Facebook, Twitter, Linkedin].map((Icon, i) => (
                  <button key={i} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-patriotic-green hover:text-white transition-all">
                    <Icon size={20} />
                  </button>
                ))}
              </div>
            </div>
          </footer>
        </article>
      </main>

      <Footer />
    </div>
  )
}
