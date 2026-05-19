import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Download, 
  Trash2, 
  Loader2, 
  MessageSquare,
  Calendar,
  Search,
  Filter
} from 'lucide-react'
import { formsApi } from '../../../lib/api/forms'
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

export default function SubmissionsList() {
  const { id } = useParams()
  const [form, setForm] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    setLoading(true)
    try {
      const forms = await formsApi.getAll()
      const currentForm = forms.find(f => f.id === id)
      setForm(currentForm)

      const subs = await formsApi.getSubmissions(id)
      setSubmissions(subs || [])
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (submissions.length === 0) return
    
    const headers = ['Data', ...form.fields.map(f => f.label)]
    const rows = submissions.map(sub => [
      format(new Date(sub.created_at), 'dd/MM/yyyy HH:mm'),
      ...form.fields.map(f => sub.data[f.id] || '')
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `submissions-${form.slug}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="animate-spin mx-auto text-patriotic-green mb-4" size={40} />
        <p className="text-slate-500 font-medium">Carregando respostas...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/admin/forms" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft size={24} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Respostas: {form?.title}</h1>
            <p className="text-slate-500">Acompanhe todos os dados coletados através deste formulário.</p>
          </div>
        </div>
        
        <button 
          onClick={exportToCSV}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
        >
          <Download size={20} />
          Exportar CSV
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 font-black text-slate-600 uppercase text-[10px] tracking-wider">Data do Envio</th>
                {form?.fields.map(field => (
                  <th key={field.id} className="px-6 py-4 font-black text-slate-600 uppercase text-[10px] tracking-wider">
                    {field.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={form?.fields.length + 1} className="px-6 py-20 text-center">
                    <MessageSquare size={40} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500 font-medium">Nenhuma resposta recebida ainda.</p>
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <Calendar size={14} className="text-slate-400" />
                        {format(new Date(sub.created_at), "dd/MM/yyyy HH:mm")}
                      </div>
                    </td>
                    {form.fields.map(field => (
                      <td key={field.id} className="px-6 py-4 text-sm text-slate-600">
                        {sub.data[field.id] || '-'}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
