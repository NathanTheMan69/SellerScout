'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
    id: string
    message: string
    type: ToastType
    description?: string
}

interface ToastContextValue {
    toast: (message: string, opts?: { type?: ToastType; description?: string }) => void
    success: (message: string, description?: string) => void
    error:   (message: string, description?: string) => void
    info:    (message: string, description?: string) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
    return ctx
}

// ─── Individual Toast item ────────────────────────────────────────────────────

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => setVisible(true))
        const timer = setTimeout(() => {
            setVisible(false)
            setTimeout(() => onRemove(toast.id), 300)
        }, 3500)
        return () => clearTimeout(timer)
    }, [toast.id, onRemove])

    const styles = {
        success: { bg: 'bg-white border-emerald-200', icon: CheckCircle, iconColor: 'text-emerald-500', bar: 'bg-emerald-500' },
        error:   { bg: 'bg-white border-rose-200',    icon: XCircle,     iconColor: 'text-rose-500',    bar: 'bg-rose-500'    },
        info:    { bg: 'bg-white border-teal-200',     icon: Info,        iconColor: 'text-teal-500',    bar: 'bg-teal-500'    },
    }[toast.type]

    const Icon = styles.icon

    return (
        <div
            className={cn(
                'relative flex items-start gap-3 rounded-xl border shadow-xl shadow-slate-900/10 px-4 py-3.5 min-w-[280px] max-w-sm overflow-hidden transition-all duration-300',
                styles.bg,
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
        >
            {/* Coloured left bar */}
            <div className={cn('absolute left-0 top-0 h-full w-1 rounded-l-xl', styles.bar)} />

            <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', styles.iconColor)} />

            <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm leading-snug">{toast.message}</p>
                {toast.description && (
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{toast.description}</p>
                )}
            </div>

            <button
                onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300) }}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors mt-0.5"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    )
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = useCallback((message: string, opts?: { type?: ToastType; description?: string }) => {
        const id = Math.random().toString(36).slice(2)
        setToasts(prev => [...prev, { id, message, type: opts?.type ?? 'success', description: opts?.description }])
    }, [])

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const ctx: ToastContextValue = {
        toast:   (msg, opts) => addToast(msg, opts),
        success: (msg, desc) => addToast(msg, { type: 'success', description: desc }),
        error:   (msg, desc) => addToast(msg, { type: 'error',   description: desc }),
        info:    (msg, desc) => addToast(msg, { type: 'info',    description: desc }),
    }

    return (
        <ToastContext.Provider value={ctx}>
            {children}
            {/* Toast portal — fixed bottom-right */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto">
                        <ToastItem toast={t} onRemove={removeToast} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}
