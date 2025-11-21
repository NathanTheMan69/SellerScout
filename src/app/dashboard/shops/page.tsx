"use client";

import { useState, useEffect } from 'react'
import { Search, Heart, ShoppingBag, Tag, ExternalLink, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'
import { DashboardLayout } from '@/components/DashboardLayout'
import { createClient } from '@/utils/supabase/client'

// Mock Data for Search Results
const MOCK_SEARCH_RESULTS = [
    { id: 'shop_1', name: 'UrbanCrafts', url: 'https://etsy.com/shop/UrbanCrafts', sales: 12500, listings: 142 },
    { id: 'shop_2', name: 'BohoDreams', url: 'https://etsy.com/shop/BohoDreams', sales: 8200, listings: 85 },
    { id: 'shop_3', name: 'VintageVibes', url: 'https://etsy.com/shop/VintageVibes', sales: 22000, listings: 310 },
]

interface SavedShop {
    id: string
    shop_name: string
    shop_url: string
    total_sales: number
    listing_count: number
    created_at: string
}

export default function ShopsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<typeof MOCK_SEARCH_RESULTS>([])
    const [savedShops, setSavedShops] = useState<SavedShop[]>([])
    const [hasSearched, setHasSearched] = useState(false)
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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setHasSearched(true)
        if (!searchQuery.trim()) {
            setSearchResults([])
            return
        }
        setSearchResults(MOCK_SEARCH_RESULTS)
    }

    const handleTrack = async (shop: typeof MOCK_SEARCH_RESULTS[0]) => {
        const savedShop = savedShops.find(s => s.shop_name === shop.name)

        if (savedShop) {
            // Un-track (Remove)
            setSavedShops(prev => prev.filter(s => s.shop_name !== shop.name))

            try {
                const { error } = await supabase
                    .from('saved_shops')
                    .delete()
                    .eq('id', savedShop.id)

                if (error) throw error
            } catch (error) {
                console.error('Error removing shop:', error)
                alert('Failed to remove shop.')
                setSavedShops(prev => [...prev, savedShop]) // Revert
            }
        } else {
            // Track (Add)
            const newShop: SavedShop = {
                id: 'temp-' + Date.now(),
                shop_name: shop.name,
                shop_url: shop.url,
                total_sales: shop.sales,
                listing_count: shop.listings,
                created_at: new Date().toISOString()
            }
            setSavedShops(prev => [newShop, ...prev])

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            try {
                const { data, error } = await supabase
                    .from('saved_shops')
                    .insert({
                        user_id: user.id,
                        shop_name: shop.name,
                        shop_url: shop.url,
                        total_sales: shop.sales,
                        listing_count: shop.listings
                    })
                    .select()
                    .single()

                if (error) throw error

                // Update with real ID
                if (data) {
                    setSavedShops(prev => prev.map(s => s.id === newShop.id ? data : s))
                }
            } catch (error) {
                console.error('Error saving shop:', error)
                alert('Failed to track shop. Please try again.')
                setSavedShops(prev => prev.filter(s => s.id !== newShop.id))
            }
        }
    }

    const handleDelete = async (id: string) => {
        setSavedShops(prev => prev.filter(s => s.id !== id))

        try {
            const { error } = await supabase
                .from('saved_shops')
                .delete()
                .eq('id', id)

            if (error) throw error
        } catch (error) {
            console.error('Error deleting shop:', error)
            alert('Failed to delete shop.')
            fetchSavedShops()
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="relative">
                    <div className="absolute -left-4 top-0 h-full w-1 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full" />
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Shop Tracker</h1>
                    <p className="text-muted-foreground">Search for competitors and track their performance.</p>
                </div>

                {/* Search Section */}
                <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                    <CardContent className="p-8">
                        <form onSubmit={handleSearch} className="relative flex items-center">
                            <Search className="absolute left-4 h-6 w-6 text-teal-600" />
                            <input
                                type="text"
                                placeholder="Enter Shop Name (e.g., 'UrbanCrafts')..."
                                className="h-14 w-full rounded-xl border-2 border-teal-100 bg-white/50 pl-14 pr-4 text-lg text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Button
                                type="submit"
                                className="absolute right-2 h-10 bg-teal-600 hover:bg-teal-700 text-white px-6 rounded-lg"
                            >
                                Search
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Search Results */}
                {hasSearched && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-slate-800">Search Results</h2>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {searchResults.map((shop) => {
                                const isSaved = savedShops.some(s => s.shop_name === shop.name)
                                return (
                                    <Card key={shop.id} className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5 hover:shadow-xl transition-all duration-300 group">
                                        <CardContent className="p-6 space-y-6">
                                            <div className="flex justify-between items-start">
                                                <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-xl border-2 border-white shadow-sm">
                                                    {shop.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <button
                                                    onClick={() => handleTrack(shop)}
                                                    className={cn(
                                                        "p-2 rounded-full transition-all duration-200",
                                                        isSaved
                                                            ? "bg-rose-50 text-rose-500 hover:bg-slate-50 hover:text-slate-400"
                                                            : "bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                                                    )}
                                                >
                                                    <Heart className={cn("h-5 w-5", isSaved && "fill-rose-500")} />
                                                </button>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-bold text-slate-800 group-hover:text-teal-600 transition-colors">{shop.name}</h3>
                                                <p className="text-sm text-slate-500">Etsy Shop</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                                                        <ShoppingBag className="h-3 w-3" /> Sales
                                                    </div>
                                                    <p className="text-lg font-bold text-slate-800">{shop.sales.toLocaleString()}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                                                        <Tag className="h-3 w-3" /> Listings
                                                    </div>
                                                    <p className="text-lg font-bold text-slate-800">{shop.listings.toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={() => handleTrack(shop)}
                                                className={cn(
                                                    "w-full",
                                                    isSaved ? "bg-teal-50 text-teal-600 hover:bg-teal-50" : "bg-teal-600 hover:bg-teal-700 text-white"
                                                )}
                                            >
                                                {isSaved ? 'Tracked' : 'Track Shop'}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Saved Shops List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-slate-800">Your Tracked Shops</h2>
                    <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-teal-50/50 text-slate-600">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Shop Name</th>
                                            <th className="px-6 py-4 font-semibold">Total Sales</th>
                                            <th className="px-6 py-4 font-semibold">Listings</th>
                                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">Loading...</td>
                                            </tr>
                                        ) : savedShops.length > 0 ? (
                                            savedShops.map((shop) => (
                                                <tr key={shop.id} className="hover:bg-teal-50/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
                                                                {shop.shop_name.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <div className="font-medium text-slate-800">{shop.shop_name}</div>
                                                            {shop.shop_url && (
                                                                <a href={shop.shop_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-teal-600">
                                                                    <ExternalLink className="h-3 w-3" />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        <div className="flex items-center gap-2">
                                                            <ShoppingBag className="h-4 w-4 text-slate-400" />
                                                            {shop.total_sales?.toLocaleString() || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        <div className="flex items-center gap-2">
                                                            <Tag className="h-4 w-4 text-slate-400" />
                                                            {shop.listing_count?.toLocaleString() || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleDelete(shop.id)}
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
                                                    No tracked shops yet. Use the search above to find some!
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
