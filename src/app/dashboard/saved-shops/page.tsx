'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Store, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DashboardLayout } from '@/components/DashboardLayout'
import { createClient } from '@/utils/supabase/client'
import { TableSkeleton } from '@/components/TableSkeleton'

interface SavedShop {
    id: string
    shop_name: string
    total_sales: number | null
    listing_count: number | null
    created_at: string
}

export default function SavedShopsPage() {
    const [savedShops, setSavedShops] = useState<SavedShop[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        fetchSavedShops()
    }, [])

    const fetchSavedShops = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('saved_shops')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            if (data) setSavedShops(data)
        } catch (error) {
            console.error('Error fetching saved shops:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        setSavedShops(prev => prev.filter(s => s.id !== id))
        try {
            const { error } = await supabase.from('saved_shops').delete().eq('id', id)
            if (error) throw error
        } catch (error) {
            console.error('Error deleting shop:', error)
            fetchSavedShops()
        }
    }

    const handleShopClick = (shopName: string) => {
        router.push(`/dashboard/shops?q=${encodeURIComponent(shopName)}`)
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-md shadow-teal-900/20">
                        <Store className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Saved Shops</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Track your competitors and monitor their performance.</p>
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
                                    <th className="px-3 py-4 text-sm font-medium uppercase tracking-wider text-white">Shop Name</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white">Total Sales</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white">Listings</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white">Saved On</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {savedShops.length > 0 ? (
                                    savedShops.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            onClick={() => handleShopClick(item.shop_name)}
                                            className="group cursor-pointer transition-all duration-150 hover:bg-teal-50 hover:shadow-[inset_3px_0_0_0_#14b8a6]"
                                        >
                                            {/* Rank */}
                                            <td className="w-10 pl-5 pr-2 py-3.5 text-xs font-bold text-slate-300 group-hover:text-teal-500 transition-colors tabular-nums">
                                                {String(index + 1).padStart(2, '0')}
                                            </td>
                                            {/* Shop Name */}
                                            <td className="px-3 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-7 w-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-100 transition-colors">
                                                        <Store className="h-3.5 w-3.5 text-teal-500" />
                                                    </div>
                                                    <span className="font-semibold text-slate-800 group-hover:text-teal-700 transition-all">
                                                        {item.shop_name}
                                                    </span>
                                                    <ExternalLink className="h-3 w-3 text-slate-300 group-hover:text-teal-400 transition-colors opacity-0 group-hover:opacity-100" />
                                                </div>
                                            </td>
                                            {/* Total Sales */}
                                            <td className="px-5 py-3.5">
                                                <span className="font-bold text-teal-600 tabular-nums">
                                                    {item.total_sales?.toLocaleString() ?? '—'}
                                                </span>
                                                {item.total_sales && <span className="text-xs text-slate-400 ml-1">sales</span>}
                                            </td>
                                            {/* Listing Count */}
                                            <td className="px-5 py-3.5">
                                                <span className="font-bold text-slate-700 tabular-nums">
                                                    {item.listing_count?.toLocaleString() ?? '—'}
                                                </span>
                                                {item.listing_count && <span className="text-xs text-slate-400 ml-1">listings</span>}
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
                                            No saved shops yet. Go to <span className="font-semibold text-teal-600">Shop Tracker</span> to save some!
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
