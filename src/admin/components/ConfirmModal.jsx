import React from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Tem certeza?', 
  description = 'Esta ação não pode ser desfeita.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger' // 'danger' or 'primary'
}) {
  if (!isOpen) return null

  const variantStyles = {
    danger: {
      button: 'bg-red-600 hover:bg-red-700 shadow-red-200',
      icon: 'bg-red-50 text-red-600',
      iconInner: <AlertTriangle size={24} />
    },
    primary: {
      button: 'bg-patriotic-green hover:bg-patriotic-green-dark shadow-patriotic-green/20',
      icon: 'bg-patriotic-green/10 text-patriotic-green',
      iconInner: <AlertTriangle size={24} />
    }
  }

  const style = variantStyles[variant] || variantStyles.danger

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl shadow-slate-900/20 overflow-hidden animate-scale-up">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
        >
          <X size={20} />
        </button>

        <div className="p-8 pt-10">
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 ${style.icon}`}>
              {style.iconInner}
            </div>

            {/* Text Content */}
            <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight">
              {title}
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed mb-8">
              {description}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <button
                onClick={onClose}
                className="w-full sm:flex-1 py-4 px-6 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm()
                  onClose()
                }}
                className={`w-full sm:flex-1 py-4 px-6 text-white rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${style.button}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
