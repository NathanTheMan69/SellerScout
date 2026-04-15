'use client'

import { useState, useEffect } from 'react'
import { Trash2, ShoppingBag, ExternalLink, ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DashboardLayout } from '@/components/DashboardLayout'
import { createClient } from '@/utils/supabase/client'
import { TableSkeleton } from '@/components/TableSkeleton'

interface SavedListing {
    id: string
    listing_title: string
    listing_url: string
    price: number
    image_url: string
    total_sales: number
    revenue: string | null
    competition: string | null
    conv_rate: string | null
    created_at: string
}

function Thumbnail({ url, alt }: { url: string | null; alt: string }) {
    const [error, setError] = useState(false)
    if (!url || error) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-slate-50">
                <ImageOff className="h-4 w-4 text-slate-300" />
            </div>
        )
    }
    return <img src={url} alt={alt} className="h-full w-full object-cover" onError={() => setError(true)} />
}

export default function SavedListingsPage() {
    const [savedListings, setSavedListings] = useState<SavedListing[]>([])
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            setUserId(user.id)
            await fetchSavedListings(user.id)
        }
        init()
    }, [])

    const fetchSavedListings = async (uid?: string) => {
        const resolvedUid = uid ?? userId
        if (!resolvedUid) return
        try {
            const { data, error } = await supabase
                .from('saved_listings')
                .select('*')
                .eq('user_id', resolvedUid)
                .order('created_at', { ascending: false })

            if (error) throw error
            if (data) setSavedListings(data)
        } catch (error) {
            console.error('Error fetching saved listings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        e.preventDefault()

        setSavedListings(prev => prev.filter(l => l.id !== id))

        const { data, error } = await supabase
            .from('saved_listings')
            .delete()
            .eq('id', id)
            .select()

        if (error || !data?.length) {
            console.error('Delete listing failed:', error, 'rows:', data?.length)
            fetchSavedListings()
        }
    }

    const handleListingClick = (url: string) => {
        if (url) window.open(url, '_blank', 'noopener,noreferrer')
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-md shadow-teal-900/20">
                        <ShoppingBag className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Saved Listings</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Track performance of specific listings over time.</p>
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
                                    <th className="px-3 py-4 text-sm font-medium uppercase tracking-wider text-white">Listing</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white">Revenue</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white">Sales</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white">Competition</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white">Conv.</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white">Saved On</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {savedListings.length > 0 ? (
                                    savedListings.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            onClick={() => handleListingClick(item.listing_url)}
                                            className="group cursor-pointer transition-all duration-150 hover:bg-teal-50 hover:shadow-[inset_3px_0_0_0_#14b8a6]"
                                        >
                                            {/* Rank */}
                                            <td className="w-10 pl-5 pr-2 py-3.5 text-xs font-bold text-slate-300 group-hover:text-teal-500 transition-colors tabular-nums">
                                                {String(index + 1).padStart(2, '0')}
                                            </td>
                                            {/* Listing */}
                                            <td className="px-3 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 group-hover:border-teal-200 transition-colors">
                                                        <Thumbnail url={item.image_url} alt={item.listing_title} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="font-semibold text-slate-800 group-hover:text-teal-700 transition-all line-clamp-1 max-w-xs md:max-w-md block">
                                                            {item.listing_title}
                                                        </span>
                                                    </div>
                                                    <ExternalLink className="h-3 w-3 text-slate-300 group-hover:text-teal-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0" />
                                                </div>
                                            </td>
                                            {/* Revenue */}
                                            <td className="px-5 py-3.5">
                                                <span className="font-bold text-teal-600 tabular-nums">
                                                    {item.revenue ?? '—'}
                                                </span>
                                            </td>
                                            {/* Sales */}
                                            <td className="px-5 py-3.5">
                                                <span className="font-bold text-slate-700 tabular-nums">
                                                    {item.total_sales?.toLocaleString() ?? '—'}
                                                </span>
                                            </td>
                                            {/* Competition */}
                                            <td className="px-5 py-3.5">
                                                {item.competition ? (
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
                                                        {item.competition}
                                                    </span>
                                                ) : <span className="text-slate-400 text-sm">—</span>}
                                            </td>
                                            {/* Conv. */}
                                            <td className="px-5 py-3.5">
                                                <span className="font-semibold text-slate-700 tabular-nums text-sm">
                                                    {item.conv_rate ?? '—'}
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
                                        <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                                            No saved listings yet. Go to <span className="font-semibold text-teal-600">Listing Analysis</span> to save some!
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
