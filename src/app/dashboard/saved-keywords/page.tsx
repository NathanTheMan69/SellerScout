'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, TrendingUp, Search, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DashboardLayout } from '@/components/DashboardLayout'
import { createClient } from '@/utils/supabase/client'
import { TableSkeleton } from '@/components/TableSkeleton'

interface SavedKeyword {
    id: string
    keyword: string
    search_volume: number
    competition: string
    created_at: string
}

export default function SavedKeywordsPage() {
    const [savedKeywords, setSavedKeywords] = useState<SavedKeyword[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        fetchSavedKeywords()
    }, [])

    const fetchSavedKeywords = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('saved_keywords')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            if (data) setSavedKeywords(data)
        } catch (error) {
            console.error('Error fetching saved keywords:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        setSavedKeywords(prev => prev.filter(k => k.id !== id))
        try {
            const { error } = await supabase.from('saved_keywords').delete().eq('id', id)
            if (error) throw error
        } catch (error) {
            console.error('Error deleting keyword:', error)
            fetchSavedKeywords()
        }
    }

    const handleKeywordClick = (keyword: string) => {
        router.push(`/dashboard/keyword-research?q=${encodeURIComponent(keyword)}`)
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-md shadow-teal-900/20">
                        <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Saved Keywords</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Manage your collection of potential product keywords.</p>
                    </div>
                </div>

                {loading ? (
                    <TableSkeleton />
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-teal-900/5">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b border-teal-200/60 bg-teal-500/80">
                                    <th className="w-10 pl-5 pr-2 py-4" />
                                    <th className="px-3 py-4 text-sm font-medium uppercase tracking-wider text-white">Keyword</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white">Search Vol</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white">Competition</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white">Saved On</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {savedKeywords.length > 0 ? (
                                    savedKeywords.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            onClick={() => handleKeywordClick(item.keyword)}
                                            className="group cursor-pointer transition-all duration-150 hover:bg-teal-50 hover:shadow-[inset_3px_0_0_0_#14b8a6]"
                                        >
                                            {/* Rank */}
                                            <td className="w-10 pl-5 pr-2 py-3.5 text-xs font-bold text-slate-300 group-hover:text-teal-500 transition-colors tabular-nums">
                                                {String(index + 1).padStart(2, '0')}
                                            </td>
                                            {/* Keyword */}
                                            <td className="px-3 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-7 w-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-100 transition-colors">
                                                        <Search className="h-3.5 w-3.5 text-teal-500" />
                                                    </div>
                                                    <span className="font-semibold text-slate-800 group-hover:text-teal-700 transition-all">
                                                        {item.keyword}
                                                    </span>
                                                    <ExternalLink className="h-3 w-3 text-slate-300 group-hover:text-teal-400 transition-colors opacity-0 group-hover:opacity-100" />
                                                </div>
                                            </td>
                                            {/* Search Volume */}
                                            <td className="px-5 py-3.5">
                                                <span className="font-bold text-teal-600 tabular-nums">
                                                    {item.search_volume?.toLocaleString() ?? '—'}
                                                </span>
                                                <span className="text-xs text-slate-400 ml-1">/mo</span>
                                            </td>
                                            {/* Competition */}
                                            <td className="px-5 py-3.5">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border",
                                                    item.competition === 'Low'       && "bg-emerald-50 text-emerald-700 border-emerald-200",
                                                    item.competition === 'Medium'    && "bg-amber-50 text-amber-700 border-amber-200",
                                                    item.competition === 'High'      && "bg-rose-50 text-rose-700 border-rose-200",
                                                    item.competition === 'Very High' && "bg-purple-50 text-purple-700 border-purple-200"
                                                )}>
                                                    <span className={cn("h-1.5 w-1.5 rounded-full",
                                                        item.competition === 'Low'       && "bg-emerald-500",
                                                        item.competition === 'Medium'    && "bg-amber-500",
                                                        item.competition === 'High'      && "bg-rose-500",
                                                        item.competition === 'Very High' && "bg-purple-500"
                                                    )} />
                                                    {item.competition ?? '—'}
                                                </span>
                                            </td>
                                            {/* Saved On */}
                                            <td className="px-5 py-3.5 text-slate-400 text-xs tabular-nums">
                                                {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            {/* Delete */}
                                            <td className="px-5 py-3.5 text-right">
                                                <button
                                                    onClick={(e) => handleDelete(e, item.id)}
                                                    className="p-1.5 rounded-full border border-transparent hover:border-rose-200 hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-colors"
                                                    title="Remove"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                                            No saved keywords yet. Go to <span className="font-semibold text-teal-600">Keyword Research</span> to save some!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
