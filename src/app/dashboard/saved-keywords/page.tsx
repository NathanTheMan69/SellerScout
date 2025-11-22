'use client'

import { useState, useEffect } from 'react'
import { Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/Card'
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

            if (data) {
                setSavedKeywords(data)
            }
        } catch (error) {
            console.error('Error fetching saved keywords:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        // Optimistic update
        setSavedKeywords(prev => prev.filter(k => k.id !== id))

        try {
            const { error } = await supabase
                .from('saved_keywords')
                .delete()
                .eq('id', id)

            if (error) throw error
        } catch (error) {
            console.error('Error deleting keyword:', error)
            alert('Failed to delete keyword. Please try again.')
            fetchSavedKeywords() // Revert on error
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="relative pl-4">
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full" />
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Saved Keywords</h1>
                    <p className="text-muted-foreground">Manage your collection of potential product keywords.</p>
                </div>

                {/* Results Table */}
                {/* Results Table */}
                {loading ? (
                    <TableSkeleton />
                ) : (
                    <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5 overflow-hidden">
                        <CardHeader>
                            <CardTitle>Your Library</CardTitle>
                            <CardDescription>You have {savedKeywords.length} saved keywords.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-teal-50/50 text-slate-600">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Keyword</th>
                                            <th className="px-6 py-4 font-semibold">Search Volume</th>
                                            <th className="px-6 py-4 font-semibold">Competition</th>
                                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {savedKeywords.length > 0 ? (
                                            savedKeywords.map((item) => (
                                                <tr key={item.id} className="hover:bg-teal-50/30 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-slate-800">{item.keyword}</td>
                                                    <td className="px-6 py-4 text-slate-600">{item.search_volume?.toLocaleString() || '-'}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={cn(
                                                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                            item.competition === 'Low' && "bg-emerald-100 text-emerald-800",
                                                            item.competition === 'Medium' && "bg-yellow-100 text-yellow-800",
                                                            (item.competition === 'High' || item.competition === 'Very High') && "bg-rose-100 text-rose-800"
                                                        )}>
                                                            {item.competition || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="p-2 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-full transition-colors"
                                                            title="Remove from saved"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                                    No saved keywords yet. Go to Keyword Research to add some!
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    )
}
