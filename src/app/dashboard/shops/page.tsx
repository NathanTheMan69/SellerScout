"use client";
import { useToast } from '@/components/Toast'

import { useState, useEffect } from 'react'
import { Search, Heart, ShoppingBag, Tag, ExternalLink, Trash2, Star, Calendar, TrendingUp, ImageOff, Store, X, Filter, ChevronDown, ChevronLeft, ChevronRight, DollarSign, Copy, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'
import { DashboardLayout } from '@/components/DashboardLayout'
import { createClient } from '@/utils/supabase/client'
import { Modal } from '@/components/Modal'
import type { ShopReport } from '@/lib/shop-analyzer'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Mock Data for Search Results
const MOCK_SEARCH_RESULTS = [
    { id: 'shop_1', name: 'UrbanCrafts', url: 'https://etsy.com/shop/UrbanCrafts', sales: 12500, listings: 142 },
    { id: 'shop_2', name: 'BohoDreams', url: 'https://etsy.com/shop/BohoDreams', sales: 8200, listings: 85 },
    { id: 'shop_3', name: 'VintageVibes', url: 'https://etsy.com/shop/VintageVibes', sales: 22000, listings: 310 },
]

// Curated list of top-performing Etsy shops
const TOP_ETSY_SHOPS = [
    { name: 'CaitlynMinimalist', category: 'Jewelry',           sales: '2.1M+', listings: 1800, revenue: '$71.4M+', convRate: '6.8%', estYear: 2011, rating: 4.9 },
    { name: 'ModParty',          category: 'Party Supplies',     sales: '1.9M+', listings: 2400, revenue: '$28.5M+', convRate: '5.2%', estYear: 2013, rating: 4.8 },
    { name: 'TreetopStudio',     category: 'Wall Art',           sales: '1.4M+', listings: 920,  revenue: '$19.6M+', convRate: '4.9%', estYear: 2015, rating: 4.7 },
    { name: 'Paperfairies',      category: 'Party Printables',   sales: '1.2M+', listings: 650,  revenue: '$10.8M+', convRate: '7.1%', estYear: 2012, rating: 4.9 },
    { name: 'LittleHighbury',    category: 'Nursery Decor',      sales: '980K+', listings: 430,  revenue: '$24.5M+', convRate: '5.5%', estYear: 2016, rating: 4.8 },
    { name: 'MagicFlairDesigns', category: 'Digital Downloads',  sales: '870K+', listings: 1100, revenue: '$8.7M+',  convRate: '8.2%', estYear: 2019, rating: 4.6 },
    { name: 'PlannerKate1',      category: 'Planner Stickers',   sales: '820K+', listings: 2100, revenue: '$7.4M+',  convRate: '6.4%', estYear: 2014, rating: 4.8 },
    { name: 'ThePaperWallFlower',category: 'Prints & Posters',   sales: '760K+', listings: 380,  revenue: '$13.7M+', convRate: '4.7%', estYear: 2017, rating: 4.7 },
    { name: 'DesignAtelierArt',  category: 'Digital Art',        sales: '710K+', listings: 560,  revenue: '$6.4M+',  convRate: '5.9%', estYear: 2018, rating: 4.5 },
]

// Trending shops — fast-growing sellers
const TRENDING_SHOPS = [
    { name: 'AuraRingCo',        category: 'Jewelry',            growth: '+340%', listings: 210,  revenue: '$1.2M+',  convRate: '7.4%', estYear: 2022, rating: 4.7 },
    { name: 'PixelBloomPrints',  category: 'Wall Art',           growth: '+290%', listings: 480,  revenue: '$890K+',  convRate: '6.1%', estYear: 2021, rating: 4.6 },
    { name: 'KnotAndThread',     category: 'Macrame & Textile',  growth: '+255%', listings: 145,  revenue: '$650K+',  convRate: '5.8%', estYear: 2023, rating: 4.8 },
    { name: 'SoftClayStudio',    category: 'Clay Jewelry',       growth: '+220%', listings: 320,  revenue: '$540K+',  convRate: '6.9%', estYear: 2022, rating: 4.9 },
    { name: 'GlowWickCo',        category: 'Candles',            growth: '+195%', listings: 95,   revenue: '$420K+',  convRate: '5.3%', estYear: 2020, rating: 4.7 },
    { name: 'PressedPetalArts',  category: 'Botanical Art',      growth: '+180%', listings: 170,  revenue: '$380K+',  convRate: '4.8%', estYear: 2021, rating: 4.5 },
    { name: 'MiniatureWorldShop',category: 'Miniatures',         growth: '+165%', listings: 530,  revenue: '$310K+',  convRate: '5.6%', estYear: 2019, rating: 4.6 },
    { name: 'InkDropLettering',  category: 'Stationery',         growth: '+152%', listings: 260,  revenue: '$275K+',  convRate: '6.2%', estYear: 2023, rating: 4.8 },
    { name: 'CozyKnitHouse',     category: 'Knitting & Crochet', growth: '+140%', listings: 190,  revenue: '$230K+',  convRate: '5.1%', estYear: 2020, rating: 4.7 },
]

interface SavedShop {
    id: string
    shop_name: string
    shop_url: string
    total_sales: string | null
    listing_count: number | null
    revenue: string | null
    conv_rate: string | null
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

function ShopsGrid({ filter, categoryFilter, ageFilter, onShopClick, savedShops, onTrack }: {
    filter: 'top' | 'trending'
    categoryFilter: string
    ageFilter: string
    onShopClick: (name: string) => void
    savedShops: SavedShop[]
    onTrack: (e: React.MouseEvent, shop: { id: string; name: string; url: string; sales: string | number; listings: number; revenue?: string; convRate?: string }) => void
}) {
    const isTop = filter === 'top'
    const currentYear = new Date().getFullYear()
    const shops = (isTop ? TOP_ETSY_SHOPS : TRENDING_SHOPS).filter(s => {
        if (categoryFilter !== 'All' && s.category !== categoryFilter) return false
        if (ageFilter !== 'All') {
            const age = currentYear - s.estYear
            if (ageFilter === '< 2 years' && age >= 2) return false
            if (ageFilter === '2–5 years' && (age < 2 || age >= 5)) return false
            if (ageFilter === '5–10 years' && (age < 5 || age >= 10)) return false
            if (ageFilter === '10+ years' && age < 10) return false
        }
        return true
    })

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shops.map((shop) => {
                const topShop = shop as typeof TOP_ETSY_SHOPS[0]
                const trendShop = shop as typeof TRENDING_SHOPS[0]
                const isSaved = savedShops.some(s => s.shop_name === shop.name)
                return (
                    <Card
                        key={shop.name}
                        className="border-white/50 bg-white/70 backdrop-blur-md shadow-md shadow-teal-900/5 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer overflow-hidden"
                        onClick={() => onShopClick(shop.name)}
                    >
                        <CardContent className="p-3">
                            <div className="flex gap-3">
                                {/* Avatar */}
                                <div className="flex-shrink-0 w-[88px] h-[88px] rounded-2xl bg-teal-500 flex flex-col items-center justify-center text-white font-bold text-2xl shadow-lg shadow-teal-900/20">
                                    {shop.name.substring(0, 2).toUpperCase()}
                                    {!isTop && (
                                        <span className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-white/80 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                            <TrendingUp className="h-2 w-2" />{trendShop.growth}
                                        </span>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    {/* Name + category */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <h3 className="font-bold text-slate-800 text-sm group-hover:text-teal-600 transition-colors truncate">{shop.name}</h3>
                                                <span className="flex-shrink-0 flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full">
                                                    ★ {shop.rating}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500">{shop.category} · Est. {shop.estYear}</p>
                                        </div>
                                        <button
                                            onClick={(e) => onTrack(e, { id: shop.name, name: shop.name, url: `https://etsy.com/shop/${shop.name}`, sales: topShop.sales ?? trendShop.growth ?? '', listings: shop.listings, revenue: shop.revenue, convRate: shop.convRate })}
                                            className={cn(
                                                "flex-shrink-0 p-1.5 rounded-full transition-all duration-200",
                                                isSaved
                                                    ? "bg-rose-50 text-rose-500 hover:bg-slate-50 hover:text-slate-400"
                                                    : "bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                                            )}
                                        >
                                            <Heart className={cn("h-4 w-4", isSaved && "fill-rose-500")} />
                                        </button>
                                    </div>

                                    {/* Stats row */}
                                    <div className="grid grid-cols-4 gap-1.5 text-xs">
                                        <div className="bg-teal-50 border border-teal-200 rounded-lg px-2 py-1.5">
                                            <p className="text-teal-700 font-medium text-[10px]">Revenue</p>
                                            <p className="font-bold text-teal-900 text-xs">{shop.revenue}</p>
                                        </div>
                                        {isTop ? (
                                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1.5">
                                                <p className="text-emerald-700 font-medium text-[10px]">Sales</p>
                                                <p className="font-bold text-emerald-900 text-xs">{topShop.sales}</p>
                                            </div>
                                        ) : (
                                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1.5">
                                                <p className="text-emerald-700 font-medium text-[10px]">Growth</p>
                                                <p className="font-bold text-emerald-900 text-xs">{trendShop.growth}</p>
                                            </div>
                                        )}
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg px-2 py-1.5">
                                            <p className="text-blue-700 font-medium text-[10px]">Listings</p>
                                            <p className="font-bold text-blue-900 text-xs">{shop.listings.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-purple-50 border border-purple-200 rounded-lg px-2 py-1.5">
                                            <p className="text-purple-700 font-medium text-[10px]">Conv.</p>
                                            <p className="font-bold text-purple-900 text-xs">{shop.convRate}</p>
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
    const [categoryOpen, setCategoryOpen] = useState(false)
    const [ageFilter, setAgeFilter] = useState('All')
    const [ageOpen, setAgeOpen] = useState(false)
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
    const [copiedAllTags, setCopiedAllTags] = useState(false)
    const [logoError, setLogoError] = useState(false)
    const [revenueRange, setRevenueRange] = useState<'1M' | '6M' | '1Y' | 'ALL'>('1Y')
    const [listingsPage, setListingsPage] = useState(0)

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

    const handleTrack = async (e: React.MouseEvent, shop: { id: string; name: string; url: string; sales: string | number; listings: number; revenue?: string; convRate?: string }) => {
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
                total_sales: String(shop.sales ?? ''),
                listing_count: shop.listings,
                revenue: shop.revenue ?? null,
                conv_rate: shop.convRate ?? null,
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
                        total_sales: String(shop.sales ?? ''),
                        listing_count: shop.listings,
                        revenue: shop.revenue ?? null,
                        conv_rate: shop.convRate ?? null,
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
        setListingsPage(0)

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
                <div className="rounded-2xl bg-teal-600 px-7 py-5 flex items-center gap-5 shadow-md shadow-teal-900/20">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 flex-shrink-0">
                        <Store className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Shop Tracker</h1>
                        <p className="text-sm text-white/75 mt-0.5">Search for competitors and track their performance.</p>
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
                                                <div className="h-16 w-16 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-xl border-2 border-white shadow-sm">
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

                            {/* Category dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => { setCategoryOpen(v => !v); setAgeOpen(false) }}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
                                        categoryFilter !== 'All'
                                            ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-900/10"
                                            : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600"
                                    )}
                                >
                                    <Filter className="h-4 w-4" />
                                    {categoryFilter === 'All' ? 'Category' : categoryFilter}
                                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", categoryOpen && "rotate-180")} />
                                </button>
                                {categoryOpen && (
                                    <div className="absolute top-full left-0 mt-1.5 z-20 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-900/10 py-1 min-w-[180px]">
                                        {['All', ...Array.from(new Set([...TOP_ETSY_SHOPS, ...TRENDING_SHOPS].map(s => s.category))).sort()].map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => { setCategoryFilter(opt); setCategoryOpen(false) }}
                                                className={cn(
                                                    "w-full text-left px-4 py-2 text-sm font-medium transition-colors",
                                                    categoryFilter === opt
                                                        ? "text-teal-700 bg-teal-50 font-semibold"
                                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                                                )}
                                            >
                                                {opt === 'All' ? 'All Categories' : opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => { setAgeOpen(v => !v); setCategoryOpen(false) }}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
                                        ageFilter !== 'All'
                                            ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-900/10"
                                            : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600"
                                    )}
                                >
                                    <Calendar className="h-4 w-4" />
                                    {ageFilter === 'All' ? 'Shop Age' : ageFilter}
                                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", ageOpen && "rotate-180")} />
                                </button>
                                {ageOpen && (
                                    <div className="absolute top-full left-0 mt-1.5 z-20 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-900/10 py-1 min-w-[160px]">
                                        {(['All', '< 2 years', '2–5 years', '5–10 years', '10+ years'] as const).map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => { setAgeFilter(opt); setAgeOpen(false) }}
                                                className={cn(
                                                    "w-full text-left px-4 py-2 text-sm font-medium transition-colors",
                                                    ageFilter === opt
                                                        ? "text-teal-700 bg-teal-50 font-semibold"
                                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                                                )}
                                            >
                                                {opt === 'All' ? 'Any Age' : opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <ShopsGrid filter={shopFilter} categoryFilter={categoryFilter} ageFilter={ageFilter} onShopClick={handleShopClick} savedShops={savedShops} onTrack={handleTrack} />
                </div>
            </div>

            {/* Shop Details Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                className="max-w-3xl max-h-[92vh] overflow-y-auto p-0"
            >
                {isLoadingDetails ? (
                    <div className="flex flex-col items-center justify-center py-16 space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                        <p className="text-slate-500">Analyzing shop strategy...</p>
                    </div>
                ) : shopDetails ? (() => {
                    // ── Revenue chart data ──────────────────────────────────────
                    const totalSales = shopDetails.details.transaction_sold_count ?? 0
                    const avgPrice   = shopDetails.metrics.average_price ?? 30
                    const annualRev  = totalSales * avgPrice
                    const monthlyRev = Math.round(annualRev / 12)
                    const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                    const thisYearData = MONTH_LABELS.map((m, i) => ({
                        month: m,
                        revenue: Math.round(monthlyRev * (0.75 + Math.sin(i / 2.5) * 0.25 + (i / 24))),
                    }))
                    const prevYearData = MONTH_LABELS.map((m, i) => ({
                        month: m + "'23",
                        revenue: Math.round(monthlyRev * 0.72 * (0.75 + Math.sin(i / 2.5) * 0.22 + (i / 28))),
                    }))
                    const lastRev = thisYearData[thisYearData.length - 1].revenue
                    const oneMonthData = ['Wk 1','Wk 2','Wk 3','Wk 4'].map((wk, i) => ({
                        month: wk,
                        revenue: Math.round(lastRev / 4 * (0.85 + Math.sin(i * 1.4) * 0.15)),
                    }))
                    const chartData =
                        revenueRange === '1M'  ? oneMonthData :
                        revenueRange === '6M'  ? thisYearData.slice(-6) :
                        revenueRange === 'ALL' ? [...prevYearData, ...thisYearData] :
                        thisYearData
                    const RANGES = [
                        { key: '1M' as const, label: '1M' },
                        { key: '6M' as const, label: '6M' },
                        { key: '1Y' as const, label: '1Y' },
                        { key: 'ALL' as const, label: 'All' },
                    ]
                    const shopAge = shopDetails.metrics.shop_age_months
                    const estYear = new Date(shopDetails.details.creation_tsz * 1000).getFullYear()

                    return (
                        <div>
                            {/* ── Teal Header ── */}
                            <div className="relative rounded-t-2xl bg-teal-600 p-5 text-white">
                                {/* X button — top right */}
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/70 hover:text-white"
                                >
                                    <X className="h-4 w-4" />
                                </button>

                                {/* Shop info + action buttons */}
                                <div className="flex items-end justify-between gap-3 pr-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-20 w-20 rounded-xl bg-white/20 border-2 border-white/30 overflow-hidden flex-shrink-0 shadow-md flex items-center justify-center">
                                            {shopDetails.details.icon_url_fullxfull && !logoError ? (
                                                <img
                                                    src={shopDetails.details.icon_url_fullxfull}
                                                    alt={shopDetails.details.shop_name}
                                                    className="h-full w-full object-cover"
                                                    onError={() => setLogoError(true)}
                                                />
                                            ) : (
                                                <Store className="h-9 w-9 text-white/80" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black leading-tight">{shopDetails.details.shop_name}</h3>
                                            {shopDetails.details.title && (
                                                <span className="inline-flex items-center mt-1 bg-teal-700/50 border border-teal-600/40 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                                    {shopDetails.details.title}
                                                </span>
                                            )}
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-600 border border-yellow-100 text-xs font-bold px-2 py-0.5 rounded-full">
                                                    ★ {shopDetails.details.review_average?.toFixed(1) || 'N/A'}
                                                    <span className="font-normal text-yellow-500">({shopDetails.details.review_count?.toLocaleString() || 0})</span>
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-white/80 text-xs font-bold">
                                                    <Calendar className="h-3 w-3" /> Est. {estYear}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <a href={shopDetails.details.url} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-sm font-semibold bg-white/15 hover:bg-white/25 border border-white/30 px-4 py-2 rounded-lg transition-colors">
                                            <ExternalLink className="h-4 w-4" /> View on Etsy
                                        </a>
                                        <a href={`/dashboard/shops/${encodeURIComponent(shopDetails.details.shop_name)}`}
                                            className="flex items-center gap-1.5 text-sm font-semibold bg-white text-teal-700 hover:bg-white/90 px-4 py-2 rounded-lg transition-colors shadow-sm">
                                            <TrendingUp className="h-4 w-4" /> Full Analysis
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* ── Body ── */}
                            <div className="p-5 space-y-5 bg-slate-50 rounded-b-2xl">

                                {/* Stat Cards */}
                                {(() => {
                                    const revFormatted = annualRev >= 1_000_000
                                        ? `$${(annualRev / 1_000_000).toFixed(1)}M`
                                        : annualRev >= 1_000
                                        ? `$${(annualRev / 1_000).toFixed(0)}k`
                                        : `$${annualRev}`
                                    const convRate = (avgPrice < 20 ? 5.2 : avgPrice < 50 ? 3.8 : avgPrice < 100 ? 2.6 : 1.8).toFixed(1)
                                    return (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-stretch">
                                        <div className="rounded-xl border border-teal-200 bg-white p-4 flex flex-col justify-center">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">Revenue</span>
                                                <DollarSign className="h-4 w-4 text-teal-400 opacity-70" />
                                            </div>
                                            <p className="text-2xl font-black text-teal-900">{revFormatted}</p>
                                            <p className="text-xs text-teal-500 mt-0.5">est. total</p>
                                        </div>
                                        <div className="rounded-xl border border-emerald-200 bg-white p-4 flex flex-col justify-center">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Sales</span>
                                                <ShoppingBag className="h-4 w-4 text-emerald-400 opacity-70" />
                                            </div>
                                            <p className="text-2xl font-black text-emerald-900">{shopDetails.details.transaction_sold_count.toLocaleString()}</p>
                                            <p className="text-xs text-emerald-500 mt-0.5">all time</p>
                                        </div>
                                        <div className="rounded-xl border border-blue-200 bg-white p-4 flex flex-col justify-center">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Listings</span>
                                                <Tag className="h-4 w-4 text-blue-400 opacity-70" />
                                            </div>
                                            <p className="text-2xl font-black text-blue-900">{shopDetails.metrics.total_active_listings.toLocaleString()}</p>
                                            <p className="text-xs text-blue-500 mt-0.5">active now</p>
                                        </div>
                                        <div className="rounded-xl border border-purple-200 bg-white p-4 flex flex-col justify-center">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Conv. Rate</span>
                                                <TrendingUp className="h-4 w-4 text-purple-400 opacity-70" />
                                            </div>
                                            <p className="text-2xl font-black text-purple-900">{convRate}%</p>
                                            <p className="text-xs text-purple-500 mt-0.5">avg. estimate</p>
                                        </div>
                                    </div>
                                    )
                                })()}

                                {/* Revenue Chart */}
                                <div className="rounded-xl border border-slate-200 bg-white p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-bold text-slate-700">Est. Revenue</p>
                                        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                                            {RANGES.map(r => (
                                                <button
                                                    key={r.key}
                                                    onClick={() => setRevenueRange(r.key)}
                                                    className={cn(
                                                        "px-2.5 py-1 rounded-md text-xs font-semibold transition-all",
                                                        revenueRange === r.key
                                                            ? "bg-white text-teal-700 shadow-sm"
                                                            : "text-slate-500 hover:text-slate-700"
                                                    )}
                                                >
                                                    {r.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="h-[180px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="shopRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.18} />
                                                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`} width={42} />
                                                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)' }} formatter={(value: number) => [`$${value.toLocaleString()}`, 'Est. Revenue']} itemStyle={{ color: '#0f766e', fontWeight: 600 }} labelStyle={{ color: '#475569', fontWeight: 500 }} />
                                                <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#shopRevenueGradient)" dot={false} activeDot={{ r: 5, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Most Popular Listings */}
                                {(() => {
                                    const PAGE_SIZE = 3
                                    const totalPages = Math.ceil(shopDetails.bestsellers.length / PAGE_SIZE)
                                    const paginated = shopDetails.bestsellers.slice(listingsPage * PAGE_SIZE, (listingsPage + 1) * PAGE_SIZE)
                                    return (
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4 text-teal-600" /> Most Popular Listings
                                            </h4>
                                            {totalPages > 1 && (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => setListingsPage(p => Math.max(0, p - 1))}
                                                        disabled={listingsPage === 0}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        <ChevronLeft className="h-4 w-4" />
                                                    </button>
                                                    <span className="text-xs text-slate-400 font-medium px-1">
                                                        {listingsPage + 1} / {totalPages}
                                                    </span>
                                                    <button
                                                        onClick={() => setListingsPage(p => Math.min(totalPages - 1, p + 1))}
                                                        disabled={listingsPage === totalPages - 1}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        <ChevronRight className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {paginated.map((item) => (
                                                <ListingCard key={item.listing_id} item={item} />
                                            ))}
                                        </div>
                                    </div>
                                    )
                                })()}

                                {/* Top Tags */}
                                {(() => {
                                    const COMPS = ['Low', 'Medium', 'High', 'Very High'] as const
                                    const compColor = (c: string) => {
                                        if (c === 'Low')       return 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                        if (c === 'Medium')    return 'text-amber-700   bg-amber-50   border-amber-200'
                                        if (c === 'High')      return 'text-rose-700    bg-rose-50    border-rose-200'
                                        return                         'text-purple-700  bg-purple-50  border-purple-200'
                                    }
                                    const tagRows = shopDetails.metrics.top_tags.map((t, i) => {
                                        const seed = t.tag.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
                                        const comp = COMPS[(seed + i) % 4]
                                        const volume = Math.round(5000 + (seed % 30000))
                                        const kwScore = Math.min(99, Math.max(20, Math.round(
                                            (['Low', 'Medium'].includes(comp) ? 35 : 12) +
                                            Math.min(volume / 1500, 20) +
                                            (seed % 25)
                                        )))
                                        return { tag: t.tag, count: t.count, volume, comp, kwScore }
                                    })
                                    const allTagText = shopDetails.metrics.top_tags.map(t => t.tag).join(', ')
                                    return (
                                    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="bg-teal-600 text-white text-xs font-bold uppercase tracking-wider">
                                                    <th className="px-4 py-3 w-[40%]">
                                                        <div className="flex items-center gap-2">
                                                            <Tag className="h-3.5 w-3.5 opacity-80" />
                                                            Top Performing Tags
                                                            <button
                                                                onClick={() => { navigator.clipboard.writeText(allTagText); setCopiedAllTags(true); setTimeout(() => setCopiedAllTags(false), 2000) }}
                                                                className="flex items-center gap-1 text-[10px] font-semibold bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-md transition-colors normal-case tracking-normal"
                                                            >
                                                                {copiedAllTags ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy All</>}
                                                            </button>
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-3 w-[20%]">Volume</th>
                                                    <th className="px-4 py-3 w-[22%]">Competition</th>
                                                    <th className="px-4 py-3 w-[18%] text-right">Keyword Score</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {tagRows.map(({ tag, volume, comp, kwScore }) => (
                                                    <tr key={tag} className="group hover:bg-teal-50 hover:outline hover:outline-2 hover:outline-teal-500 hover:-outline-offset-1 hover:shadow-[inset_2px_0_0_#0d9488,inset_-2px_0_0_#0d9488]">
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => handleCopyTag(tag)}
                                                                    className="text-slate-300 hover:text-teal-500 transition-colors flex-shrink-0"
                                                                    title={`Copy "${tag}"`}
                                                                >
                                                                    {copiedTag === tag ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                                                </button>
                                                                <span className="font-medium text-slate-700 capitalize">{tag}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-600 font-medium">
                                                            {volume >= 1000 ? `${(volume / 1000).toFixed(0)}k` : volume.toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={cn("text-[11px] font-bold px-2.5 py-0.5 rounded-full border", compColor(comp))}>{comp}</span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${kwScore}%` }} />
                                                                </div>
                                                                <span className="font-bold text-slate-700 text-xs w-6 text-right">{kwScore}</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    )
                                })()}
                            </div>
                        </div>
                    )
                })() : (
                    <div className="text-center py-12 text-slate-500">
                        Failed to load shop details.
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    )
}

