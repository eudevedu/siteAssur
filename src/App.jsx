import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { Toaster } from 'react-hot-toast'

// Site Pages (Lazy)
const Home = lazy(() => import('./site/pages/Home'))
const Blog = lazy(() => import('./site/pages/Blog'))
const Post = lazy(() => import('./site/pages/Post'))
const Portfolio = lazy(() => import('./site/pages/Portfolio'))
const ProjectDetail = lazy(() => import('./site/pages/ProjectDetail'))
const DynamicPage = lazy(() => import('./site/pages/DynamicPage'))
const LeadPage = lazy(() => import('./site/pages/LeadPage'))
const FormPage = lazy(() => import('./site/pages/FormPage'))
const About = lazy(() => import('./site/pages/About'))

// Admin Pages (Lazy)
const AdminLayout = lazy(() => import('./admin/AdminLayout'))
const Login = lazy(() => import('./admin/pages/Login'))
const ResetPassword = lazy(() => import('./admin/pages/ResetPassword'))
const Dashboard = lazy(() => import('./admin/pages/Dashboard'))
const PostsList = lazy(() => import('./admin/pages/posts/PostsList'))
const PostEditor = lazy(() => import('./admin/pages/posts/PostEditor'))
const ProjectsList = lazy(() => import('./admin/pages/projects/ProjectsList'))
const ProjectEditor = lazy(() => import('./admin/pages/projects/ProjectEditor'))
const PagesList = lazy(() => import('./admin/pages/pages/PagesList'))
const PageEditor = lazy(() => import('./admin/pages/pages/PageEditor'))
const HomeEditor = lazy(() => import('./admin/pages/pages/HomeEditor'))
const AboutEditor = lazy(() => import('./admin/pages/pages/AboutEditor'))
const MediaLibrary = lazy(() => import('./admin/pages/media/MediaLibrary'))
const Settings = lazy(() => import('./admin/pages/Settings'))
const DesignSettings = lazy(() => import('./admin/pages/DesignSettings'))
const FooterSettings = lazy(() => import('./admin/pages/FooterSettings'))
const Leads = lazy(() => import('./admin/pages/Leads'))
const CategoriesList = lazy(() => import('./admin/pages/posts/CategoriesList'))
const AuthorsList = lazy(() => import('./admin/pages/authors/AuthorsList'))
const FormsList = lazy(() => import('./admin/pages/forms/FormsList'))
const FormEditor = lazy(() => import('./admin/pages/forms/FormEditor'))
const SubmissionsList = lazy(() => import('./admin/pages/forms/SubmissionsList'))
const SystemLogs = lazy(() => import('./admin/pages/SystemLogs'))

// Loading Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-patriotic-green border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium animate-pulse">Carregando...</p>
    </div>
  </div>
)

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '16px',
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
              fontSize: '14px',
              fontWeight: '600',
              padding: '16px 24px',
            },
            success: {
              iconTheme: {
                primary: '#006738',
                secondary: '#ffffff',
              },
            },
          }}
        />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<Post />} />
              <Route path="/sobre" element={<About />} />
              <Route path="/projetos" element={<Portfolio />} />
              <Route path="/projetos/:slug" element={<ProjectDetail />} />
              <Route path="/p/:slug" element={<DynamicPage />} />
              <Route path="/participar" element={<LeadPage />} />
              <Route path="/f/:slug" element={<FormPage />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin/reset-password" element={<ResetPassword />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="posts" element={<PostsList />} />
                <Route path="posts/new" element={<PostEditor />} />
                <Route path="posts/edit/:id" element={<PostEditor />} />

                <Route path="projects" element={<ProjectsList />} />
                <Route path="projects/new" element={<ProjectEditor />} />
                <Route path="projects/edit/:id" element={<ProjectEditor />} />

                <Route path="pages" element={<PagesList />} />
                <Route path="pages/home" element={<HomeEditor />} />
                <Route path="pages/about" element={<AboutEditor />} />
                <Route path="pages/new" element={<PageEditor />} />
                <Route path="pages/edit/:id" element={<PageEditor />} />

                <Route path="media" element={<MediaLibrary />} />
                <Route path="leads" element={<Leads />} />
                <Route path="categories" element={<CategoriesList />} />
                <Route path="authors" element={<AuthorsList />} />
                <Route path="forms" element={<FormsList />} />
                <Route path="forms/new" element={<FormEditor />} />
                <Route path="forms/edit/:id" element={<FormEditor />} />
                <Route path="forms/submissions/:id" element={<SubmissionsList />} />
                <Route path="settings" element={<Settings />} />
                <Route path="design" element={<DesignSettings />} />
                <Route path="footer" element={<FooterSettings />} />
                <Route path="logs" element={<SystemLogs />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  )
}
