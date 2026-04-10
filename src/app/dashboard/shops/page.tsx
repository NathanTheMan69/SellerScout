"use client";
import { useToast } from '@/components/Toast'

import { useState, useEffect } from 'react'
import { Search, Heart, ShoppingBag, Tag, ExternalLink, Trash2, Star, Calendar, TrendingUp, ImageOff, Store, X, Filter } from 'lucide-react'
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

// Curated list of top-performing Etsy shops
const TOP_ETSY_SHOPS = [
    { name: 'CaitlynMinimalist', category: 'Jewelry',           sales: '2.1M+', listings: 1800, revenue: '$71.4M+', convRate: '6.8%' },
    { name: 'ModParty',          category: 'Party Supplies',     sales: '1.9M+', listings: 2400, revenue: '$28.5M+', convRate: '5.2%' },
    { name: 'TreetopStudio',     category: 'Wall Art',           sales: '1.4M+', listings: 920,  revenue: '$19.6M+', convRate: '4.9%' },
    { name: 'Paperfairies',      category: 'Party Printables',   sales: '1.2M+', listings: 650,  revenue: '$10.8M+', convRate: '7.1%' },
    { name: 'LittleHighbury',    category: 'Nursery Decor',      sales: '980K+', listings: 430,  revenue: '$24.5M+', convRate: '5.5%' },
    { name: 'MagicFlairDesigns', category: 'Digital Downloads',  sales: '870K+', listings: 1100, revenue: '$8.7M+',  convRate: '8.2%' },
    { name: 'PlannerKate1',      category: 'Planner Stickers',   sales: '820K+', listings: 2100, revenue: '$7.4M+',  convRate: '6.4%' },
    { name: 'ThePaperWallFlower',category: 'Prints & Posters',   sales: '760K+', listings: 380,  revenue: '$13.7M+', convRate: '4.7%' },
    { name: 'DesignAtelierArt',  category: 'Digital Art',        sales: '710K+', listings: 560,  revenue: '$6.4M+',  convRate: '5.9%' },
]

// Trending shops — fast-growing sellers
const TRENDING_SHOPS = [
    { name: 'AuraRingCo',        category: 'Jewelry',            growth: '+340%', listings: 210,  revenue: '$1.2M+',  convRate: '7.4%' },
    { name: 'PixelBloomPrints',  category: 'Wall Art',           growth: '+290%', listings: 480,  revenue: '$890K+',  convRate: '6.1%' },
    { name: 'KnotAndThread',     category: 'Macrame & Textile',  growth: '+255%', listings: 145,  revenue: '$650K+',  convRate: '5.8%' },
    { name: 'SoftClayStudio',    category: 'Clay Jewelry',       growth: '+220%', listings: 320,  revenue: '$540K+',  convRate: '6.9%' },
    { name: 'GlowWickCo',        category: 'Candles',            growth: '+195%', listings: 95,   revenue: '$420K+',  convRate: '5.3%' },
    { name: 'PressedPetalArts',  category: 'Botanical Art',      growth: '+180%', listings: 170,  revenue: '$380K+',  convRate: '4.8%' },
    { name: 'MiniatureWorldShop',category: 'Miniatures',         growth: '+165%', listings: 530,  revenue: '$310K+',  convRate: '5.6%' },
    { name: 'InkDropLettering',  category: 'Stationery',         growth: '+152%', listings: 260,  revenue: '$275K+',  convRate: '6.2%' },
    { name: 'CozyKnitHouse',     category: 'Knitting & Crochet', growth: '+140%', listings: 190,  revenue: '$230K+',  convRate: '5.1%' },
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

function ShopsGrid({ filter, categoryFilter, onShopClick }: { filter: 'top' | 'trending'; categoryFilter: string; onShopClick: (name: string) => void }) {
    const isTop = filter === 'top'
    const shops = (isTop ? TOP_ETSY_SHOPS : TRENDING_SHOPS).filter(s =>
        categoryFilter === 'All' || s.category === categoryFilter
    )

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shops.map((shop) => {
                const topShop = shop as typeof TOP_ETSY_SHOPS[0]
                const trendShop = shop as typeof TRENDING_SHOPS[0]
                return (
                    <Card
                        key={shop.name}
                        className="border-white/50 bg-white/70 backdrop-blur-md shadow-md shadow-teal-900/5 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer overflow-hidden"
                        onClick={() => onShopClick(shop.name)}
                    >
                        <CardContent className="p-4">
                            <div className="flex gap-4">
                                {/* Avatar */}
                                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-teal-900/20">
                                        {shop.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    {!isTop && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                                            <TrendingUp className="h-2.5 w-2.5" />{trendShop.growth}
                                        </span>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 space-y-3">
                                    {/* Name + category */}
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-base group-hover:text-teal-600 transition-colors truncate">{shop.name}</h3>
                                        <p className="text-xs text-slate-500">{shop.category}</p>
                                    </div>

                                    {/* Stats grid */}
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        {isTop ? (
                                            <div className="bg-teal-50/60 border border-teal-100 rounded-xl px-3 py-2">
                                                <p className="text-teal-600 font-medium mb-0.5">Sales</p>
                                                <p className="font-bold text-slate-800 text-sm">{topShop.sales}</p>
                                            </div>
                                        ) : (
                                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                                                <p className="text-emerald-600 font-medium mb-0.5">Growth</p>
                                                <p className="font-bold text-emerald-700 text-sm">{trendShop.growth}</p>
                                            </div>
                                        )}
                                        <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                                            <p className="text-slate-500 font-medium mb-0.5">Listings</p>
                                            <p className="font-bold text-slate-800 text-sm">{shop.listings.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-orange-50/60 border border-orange-100 rounded-xl px-3 py-2">
                                            <p className="text-orange-600 font-medium mb-0.5">Revenue</p>
                                            <p className="font-bold text-slate-800 text-sm">{shop.revenue}</p>
                                        </div>
                                        <div className="bg-blue-50/60 border border-blue-100 rounded-xl px-3 py-2">
                                            <p className="text-blue-600 font-medium mb-0.5">Conv. Rate</p>
                                            <p className="font-bold text-slate-800 text-sm">{shop.convRate}</p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}

export default function ShopsPage() {
    const [shopFilter, setShopFilter] = useState<'top' | 'trending'>('top')
    const [categoryFilter, setCategoryFilter] = useState('All')
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

    const { success, error: toastError } = useToast()
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

    const executeSearch = (term: string) => {
        setHasSearched(true)
        if (!term.trim()) {
            setSearchResults([])
            return
        }
        setSearchResults(MOCK_SEARCH_RESULTS)
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        executeSearch(searchQuery)
    }

    const handleChipSearch = (term: string) => {
        setSearchQuery(term)
        executeSearch(term)
    }

    const handleTrack = async (e: React.MouseEvent, shop: typeof MOCK_SEARCH_RESULTS[0]) => {
        e.stopPropagation() // Prevent modal open
        const savedShop = savedShops.find(s => s.shop_name === shop.name)

        if (savedShop) {
            // Un-track (Remove)
            setSavedShops(prev => prev.filter(s => s.shop_name !== shop.name))
            success('Shop removed', `${shop.name} has been removed from your watchlist.`)

            try {
                const { error } = await supabase
                    .from('saved_shops')
                    .delete()
                    .eq('id', savedShop.id)

                if (error) throw error
            } catch (error) {
                console.error('Error removing shop:', error)
                toastError('Failed to remove shop', 'Please try again.')
                setSavedShops(prev => [...prev, savedShop]) // Revert
            }
        } else {
            // Track (Add)
            success('Shop tracked! 🎉', `${shop.name} has been added to your watchlist.`)
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
                toastError('Failed to track shop', 'Please try again.')
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
            success('Shop deleted')
        } catch (error) {
            console.error('Error deleting shop:', error)
            toastError('Failed to delete shop', 'Please try again.')
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
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-md shadow-teal-900/20">
                            <Store className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Shop Tracker</h1>
                            <p className="text-sm text-slate-500 mt-0.5">Search for competitors and track their performance.</p>
                        </div>
                    </div>
                </div>

                {/* Search Section */}
                <form onSubmit={handleSearch} className="relative flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Enter Shop Name (e.g., 'UrbanCrafts')..."
                            className="h-14 w-full pl-12 pr-5 rounded-xl border border-slate-200 bg-white text-lg font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <Button
                        type="submit"
                        className="h-14 min-w-[120px] bg-teal-600 hover:bg-teal-700 text-white px-8 rounded-xl text-base font-semibold shadow-sm"
                    >
                        Search
                    </Button>
                </form>

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

                {/* Tracked Shops — only shown if user has any */}
                {!loading && savedShops.length > 0 && (
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
                                            {savedShops.map((shop) => (
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
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Discover Shops — always visible */}
                <div className="space-y-4">
                    {/* Filter tabs */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShopFilter('top')}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
                                    shopFilter === 'top'
                                        ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-900/10"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600"
                                )}
                            >
                                <Star className="h-4 w-4" /> Top Performing
                            </button>
                            <button
                                onClick={() => setShopFilter('trending')}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
                                    shopFilter === 'trending'
                                        ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-900/10"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600"
                                )}
                            >
                                <TrendingUp className="h-4 w-4" /> Trending
                            </button>
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="h-9 pl-9 pr-7 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 focus:border-teal-500 outline-none appearance-none cursor-pointer shadow-sm hover:border-teal-300 transition-colors"
                            >
                                {['All', ...Array.from(new Set([...TOP_ETSY_SHOPS, ...TRENDING_SHOPS].map(s => s.category))).sort()].map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <ShopsGrid filter={shopFilter} categoryFilter={categoryFilter} onShopClick={handleShopClick} />
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
                            <div className="bg-teal-100/35 p-4 rounded-xl border border-teal-200">
                                <div className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">Avg Price</div>
                                <div className="text-2xl font-bold text-slate-800">${shopDetails.metrics.average_price.toFixed(2)}</div>
                            </div>
                            <div className="bg-blue-100/60 p-4 rounded-xl border border-blue-200">
                                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Active Listings</div>
                                <div className="text-2xl font-bold text-slate-800">{shopDetails.metrics.total_active_listings.toLocaleString()}</div>
                            </div>
                            <div className="bg-purple-100/60 p-4 rounded-xl border border-purple-200">
                                <div className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">Total Sales</div>
                                <div className="text-2xl font-bold text-slate-800">{shopDetails.details.transaction_sold_count.toLocaleString()}</div>
                            </div>
                            <div className="bg-orange-100/60 p-4 rounded-xl border border-orange-200">
                                <div className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">Shop Age</div>
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
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-teal-600" />
                                    <h4 className="text-lg font-bold text-slate-800">Most Popular Listings</h4>
                                </div>
                                <a
                                    href={`/dashboard/shops/${encodeURIComponent(shopDetails.details.shop_name)}`}
                                    className="text-sm font-medium bg-white border border-slate-200 text-slate-700 shadow-sm px-4 py-1.5 rounded-full hover:border-teal-500 hover:text-teal-600 flex items-center gap-2 transition-all"
                                >
                                    View Full Report <ExternalLink className="h-3 w-3" />
                                </a>
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
