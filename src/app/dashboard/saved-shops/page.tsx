'use client'

import { useState, useEffect } from 'react'
import { Trash2, Store } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/Card'
import { cn } from '@/lib/utils'
import { DashboardLayout } from '@/components/DashboardLayout'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
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

            if (data) {
                setSavedShops(data)
            }
        } catch (error) {
            console.error('Error fetching saved shops:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        // Optimistic update
        setSavedShops(prev => prev.filter(s => s.id !== id))

        try {
            const { error } = await supabase
                .from('saved_shops')
                .delete()
                .eq('id', id)

            if (error) throw error
        } catch (error) {
            console.error('Error deleting shop:', error)
            alert('Failed to delete shop. Please try again.')
            fetchSavedShops() // Revert on error
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="relative pl-4">
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full" />
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Saved Shops</h1>
                    <p className="text-muted-foreground">Track your competitors and monitor their performance.</p>
                </div>

                {/* Results Table */}
                {/* Results Table */}
                {loading ? (
                    <TableSkeleton />
                ) : (
                    <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5 overflow-hidden">
                        <CardHeader>
                            <CardTitle>Tracked Competitors</CardTitle>
                            <CardDescription>You are tracking {savedShops.length} shops.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-teal-50/50 text-slate-600">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Shop Name</th>
                                            <th className="px-6 py-4 font-semibold">Total Sales</th>
                                            <th className="px-6 py-4 font-semibold">Listing Count</th>
                                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {savedShops.length > 0 ? (
                                            savedShops.map((item) => (
                                                <tr key={item.id} className="hover:bg-teal-50/30 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                                                        <Store className="h-4 w-4 text-teal-500" />
                                                        {item.shop_name}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">{item.total_sales?.toLocaleString() || '-'}</td>
                                                    <td className="px-6 py-4 text-slate-600">{item.listing_count?.toLocaleString() || '-'}</td>
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
                                                    No saved shops yet. <Link href="/dashboard/shops" className="text-teal-600 hover:underline font-medium">Go to Shop Tracker</Link> to add some!
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
