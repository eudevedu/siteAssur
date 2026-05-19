import React from 'react'
import { Edit, Trash2, Eye } from 'lucide-react'

export default function DataTable({ 
  columns, 
  data, 
  onEdit, 
  onDelete, 
  onView,
  loading 
}) {
  if (loading) {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
        Carregando dados...
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
        Nenhum registro encontrado.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto bg-white rounded-2xl border border-slate-100 shadow-sm">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                {col.label}
              </th>
            ))}
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 text-sm text-slate-700">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              <td className="px-6 py-4 text-right space-x-2">
                {onView && (
                  <button onClick={() => onView(row)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <Eye size={18} />
                  </button>
                )}
                {onEdit && (
                  <button onClick={() => onEdit(row)} className="p-2 text-blue-400 hover:text-blue-600 transition-colors">
                    <Edit size={18} />
                  </button>
                )}
                {onDelete && (
                  <button onClick={() => onDelete(row)} className="p-2 text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 size={18} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
