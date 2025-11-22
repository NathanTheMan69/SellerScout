"use client";

import { useState, useEffect } from 'react'
import { ExternalLink, Trash2, ShoppingBag, Tag } from 'lucide-react'
import { Card, CardContent } from '@/components/Card'
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
    created_at: string
}

export default function SavedListingsPage() {
    const [savedListings, setSavedListings] = useState<SavedListing[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchSavedListings()
    }, [])

    const fetchSavedListings = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('saved_listings')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error

            if (data) {
                setSavedListings(data)
            }
        } catch (error) {
            console.error('Error fetching saved listings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        setSavedListings(prev => prev.filter(l => l.id !== id))

        try {
            const { error } = await supabase
                .from('saved_listings')
                .delete()
                .eq('id', id)

            if (error) throw error
        } catch (error) {
            console.error('Error deleting listing:', error)
            alert('Failed to delete listing.')
            fetchSavedListings()
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="relative pl-4">
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full" />
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Saved Listings</h1>
                    <p className="text-muted-foreground">Track performance of specific listings over time.</p>
                </div>

                {/* Saved Listings List */}
                {/* Saved Listings List */}
                {loading ? (
                    <TableSkeleton />
                ) : (
                    <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-teal-50/50 text-slate-600">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Listing</th>
                                            <th className="px-6 py-4 font-semibold">Price</th>
                                            <th className="px-6 py-4 font-semibold">Est. Sales</th>
                                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {savedListings.length > 0 ? (
                                            savedListings.map((listing) => (
                                                <tr key={listing.id} className="hover:bg-teal-50/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-12 w-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                                                                {listing.image_url ? (
                                                                    <img src={listing.image_url} alt={listing.listing_title} className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center text-slate-400">
                                                                        <ShoppingBag className="h-5 w-5 opacity-50" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="font-medium text-slate-800 truncate max-w-[200px] md:max-w-md" title={listing.listing_title}>
                                                                    {listing.listing_title}
                                                                </div>
                                                                {listing.listing_url && (
                                                                    <a href={listing.listing_url} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1 mt-0.5">
                                                                        View on Etsy <ExternalLink className="h-3 w-3" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 font-medium">
                                                        ${listing.price?.toFixed(2) || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        <div className="flex items-center gap-2">
                                                            <Tag className="h-4 w-4 text-slate-400" />
                                                            {listing.total_sales?.toLocaleString() || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleDelete(listing.id)}
                                                            className="p-2 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-full transition-colors"
                                                            title="Stop tracking"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                                    No saved listings yet. Use the Listing Analysis tool to find some!
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
