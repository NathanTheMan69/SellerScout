"use client";

import { useState, useEffect } from 'react'
import { Search, Heart, ShoppingBag, Tag, ExternalLink, Trash2, Star, Calendar, TrendingUp, ImageOff, Store } from 'lucide-react'
import { Card, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'
import { DashboardLayout } from '@/components/DashboardLayout'
import { createClient } from '@/utils/supabase/client'
import { Modal } from '@/components/Modal'
import type { ShopReport } from '@/lib/shop-analyzer'

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

interface ListingCardProps {
    item: {
        listing_id: number;
        title: string;
        price: string;
        num_favorers: number;
        image_url: string | null;
    }
}

function ListingCard({ item }: ListingCardProps) {
    const [imageError, setImageError] = useState(false)

    return (
        <div className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all">
            <div className="aspect-square bg-slate-100 relative overflow-hidden">
                {item.image_url && !imageError ? (
                    <img
                        src={item.image_url}
                        alt={item.title}
                        className="h-full w-full object-cover aspect-square group-hover:scale-105 transition-transform duration-500"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center gap-2">
                        {imageError ? (
                            <>
                                <ImageOff className="w-8 h-8 text-slate-400" />
                                <span className="text-xs text-slate-500 font-medium">Preview unavailable</span>
                            </>
                        ) : (
                            <ShoppingBag className="h-8 w-8 text-slate-300" />
                        )}
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Heart className="h-3 w-3 fill-white" /> {item.num_favorers}
                </div>
            </div>
            <div className="p-3">
                <h5 className="font-medium text-slate-800 line-clamp-1 mb-1" title={item.title}>{item.title}</h5>
                <p className="text-teal-600 font-bold">{item.price}</p>
            </div>
        </div>
    )
}

export default function ShopsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<typeof MOCK_SEARCH_RESULTS>([])
    const [savedShops, setSavedShops] = useState<SavedShop[]>([])
    const [hasSearched, setHasSearched] = useState(false)
    const [loading, setLoading] = useState(true)

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLoadingDetails, setIsLoadingDetails] = useState(false)
    const [shopDetails, setShopDetails] = useState<ShopReport | null>(null)
    const [copiedTag, setCopiedTag] = useState<string | null>(null)
    const [logoError, setLogoError] = useState(false)

    const handleCopyTag = (tag: string) => {
        navigator.clipboard.writeText(tag)
        setCopiedTag(tag)
        setTimeout(() => setCopiedTag(null), 2000)
    }

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

    const handleTrack = async (e: React.MouseEvent, shop: typeof MOCK_SEARCH_RESULTS[0]) => {
        e.stopPropagation() // Prevent modal open
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

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation() // Prevent modal open
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

    const handleShopClick = async (shopName: string) => {
        setIsModalOpen(true)
        setIsLoadingDetails(true)
        setShopDetails(null)
        setLogoError(false)

        try {
            const response = await fetch(`/api/test-analyzer?shop=${encodeURIComponent(shopName)}`)
            if (!response.ok) throw new Error('Failed to fetch details')
            const data = await response.json()
            setShopDetails(data)
        } catch (error) {
            console.error("Error fetching shop details:", error)
        } finally {
            setIsLoadingDetails(false)
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="relative pl-4">
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full" />
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
                                    <Card
                                        key={shop.id}
                                        className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                                        onClick={() => handleShopClick(shop.name)}
                                    >
                                        <CardContent className="p-6 space-y-6">
                                            <div className="flex justify-between items-start">
                                                <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-xl border-2 border-white shadow-sm">
                                                    {shop.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <button
                                                    onClick={(e) => handleTrack(e, shop)}
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
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTrack(e, shop);
                                                }}
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
                                                <tr
                                                    key={shop.id}
                                                    className="hover:bg-teal-50/30 transition-colors cursor-pointer"
                                                    onClick={() => handleShopClick(shop.shop_name)}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
                                                                {shop.shop_name.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <div className="font-medium text-slate-800">{shop.shop_name}</div>
                                                            {shop.shop_url && (
                                                                <a
                                                                    href={shop.shop_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-slate-400 hover:text-teal-600"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
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
                                                            onClick={(e) => handleDelete(e, shop.id)}
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

            {/* Shop Details Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Shop Analysis"
                className="max-w-4xl"
            >
                {isLoadingDetails ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                        <p className="text-slate-500">Analyzing shop strategy...</p>
                    </div>
                ) : shopDetails ? (
                    <div className="space-y-8">
                        {/* Shop Header */}

                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-6">
                                <div className="h-24 w-24 rounded-xl bg-slate-100 border-2 border-slate-200 overflow-hidden flex-shrink-0">
                                    {shopDetails.details.icon_url_fullxfull && !logoError ? (
                                        <img
                                            src={shopDetails.details.icon_url_fullxfull}
                                            alt={shopDetails.details.shop_name}
                                            className="h-full w-full object-cover"
                                            onError={() => setLogoError(true)}
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-slate-400 bg-slate-50">
                                            <Store className="h-8 w-8" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-slate-800">{shopDetails.details.shop_name}</h3>
                                    <p className="text-slate-600">{shopDetails.details.title}</p>
                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                            <span className="font-medium text-slate-700">{shopDetails.details.review_average?.toFixed(1) || 'N/A'}</span>
                                            <span>({shopDetails.details.review_count?.toLocaleString() || 0} reviews)</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>Est. {new Date(shopDetails.details.creation_tsz * 1000).getFullYear()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <a
                                href={shopDetails.details.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
                                    <ExternalLink className="h-4 w-4" />
                                    View on Etsy
                                </Button>
                            </a>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100">
                                <div className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">Avg Price</div>
                                <div className="text-2xl font-bold text-slate-800">${shopDetails.metrics.average_price.toFixed(2)}</div>
                            </div>
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Active Listings</div>
                                <div className="text-2xl font-bold text-slate-800">{shopDetails.metrics.total_active_listings.toLocaleString()}</div>
                            </div>
                            <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                                <div className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">Total Sales</div>
                                <div className="text-2xl font-bold text-slate-800">{shopDetails.details.transaction_sold_count.toLocaleString()}</div>
                            </div>
                            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                                <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Shop Age</div>
                                <div className="text-2xl font-bold text-slate-800">{Math.floor(shopDetails.metrics.shop_age_months / 12)}y {shopDetails.metrics.shop_age_months % 12}m</div>
                            </div>
                        </div>

                        {/* Top Tags */}
                        <div>
                            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Top Performing Tags</h4>
                            <div className="flex flex-wrap gap-2">
                                {shopDetails.metrics.top_tags.map((tag, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleCopyTag(tag.tag)}
                                        className="group px-3 py-1 bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 rounded-full text-sm font-medium border border-slate-200 hover:border-teal-200 transition-all cursor-pointer flex items-center gap-2"
                                        title="Click to copy"
                                    >
                                        {copiedTag === tag.tag ? (
                                            <span className="text-teal-600 font-bold">Copied!</span>
                                        ) : (
                                            <>
                                                #{tag.tag} <span className="text-slate-400 group-hover:text-teal-400 ml-1 text-xs">({tag.count})</span>
                                            </>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Bestsellers */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="h-5 w-5 text-teal-600" />
                                <h4 className="text-lg font-bold text-slate-800">Most Popular Listings</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {shopDetails.bestsellers.map((item) => (
                                    <ListingCard key={item.listing_id} item={item} />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 text-slate-500">
                        Failed to load shop details.
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    )
}
