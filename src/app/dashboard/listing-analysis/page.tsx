"use client";

import React, { useState, useEffect } from 'react'
import { Search, ShoppingBag, Heart, AlertCircle, ImageOff, ArrowLeft, TrendingUp, Tag } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'
import { DashboardLayout } from '@/components/DashboardLayout'
import { cn } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/components/Toast'

const MOCK_LISTING_RESULTS = [
    { id: 'l1', title: 'Handmade Silver Ring', price: 45.00, views: 120, favorites: 450, revenue: 1200, image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=400&q=80' },
    { id: 'l2', title: 'Vintage Gold Necklace', price: 120.00, views: 85, favorites: 320, revenue: 2400, image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&w=400&q=80' },
    { id: 'l3', title: 'Boho Gemstone Earrings', price: 35.00, views: 200, favorites: 600, revenue: 1500, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80' },
]

interface SavedListing {
    id: string
    listing_title: string
    listing_url: string
    price: number
    image_url: string
    total_sales: number
    created_at: string
}

interface ListingAnalysisCardProps {
    item: any;
    onClick: (item: any) => void;
    onTrack: (e: React.MouseEvent, item: any) => void;
    isSaved: boolean;
}

function ListingAnalysisCard({ item, onClick, onTrack, isSaved }: ListingAnalysisCardProps) {
    const [imageError, setImageError] = useState(false);
    const title = item.listing_title || item.title;
    const price = item.price;
    const image = item.image_url || item.image;
    const isPlaceholder = image?.includes('placehold.co');

    return (
        <Card
            className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group relative"
            onClick={() => onClick(item)}
        >
            <CardContent className="p-0">
                <div className="h-48 bg-slate-200 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                        {image && !imageError && !isPlaceholder ? (
                            <img
                                src={image}
                                alt={title}
                                className="h-full w-full object-cover"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="w-full h-48 bg-slate-100 flex flex-col items-center justify-center gap-2">
                                {imageError || isPlaceholder ? (
                                    <>
                                        <ImageOff className="w-8 h-8 text-slate-400" />
                                        <span className="text-xs text-slate-500 font-medium">Preview unavailable</span>
                                    </>
                                ) : (
                                    <ShoppingBag className="h-12 w-12 opacity-20" />
                                )}
                            </div>
                        )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <p className="text-white font-bold truncate">{title}</p>
                        <p className="text-teal-200 font-medium">${price?.toFixed(2)}</p>
                    </div>
                    <button
                        onClick={(e) => onTrack(e, item)}
                        className={cn(
                            "absolute top-3 right-3 p-2 rounded-full shadow-sm transition-all duration-200 z-10",
                            isSaved
                                ? "bg-white text-rose-500 hover:bg-rose-50"
                                : "bg-white/80 text-slate-400 hover:bg-white hover:text-rose-500"
                        )}
                    >
                        <Heart className={cn("h-5 w-5", isSaved && "fill-rose-500")} />
                    </button>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-xs text-slate-400 uppercase font-bold">Views</p>
                        <p className="font-semibold text-slate-700">{item.views || '-'}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-slate-400 uppercase font-bold">Revenue</p>
                        <p className="font-semibold text-teal-600">{typeof item.revenue === 'number' ? `$${item.revenue}` : (item.revenue || '-')}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

const TOP_LISTING_NICHES = [
    { icon: '💍', niche: 'Minimalist Jewelry',   keyword: 'minimalist jewelry',    avgPrice: '$28–$65',  competition: 'High',      trend: '↑ Rising'  },
    { icon: '🖼️', niche: 'Printable Wall Art',   keyword: 'printable wall art',    avgPrice: '$3–$12',   competition: 'High',      trend: '↑ Rising'  },
    { icon: '📓', niche: 'Digital Planners',      keyword: 'digital planner',       avgPrice: '$5–$20',   competition: 'Medium',    trend: '↑ Rising'  },
    { icon: '🕯️', niche: 'Soy Candles',           keyword: 'handmade soy candle',   avgPrice: '$12–$35',  competition: 'Medium',    trend: '→ Stable'  },
    { icon: '👕', niche: 'Custom T-Shirts',       keyword: 'custom shirt',          avgPrice: '$25–$45',  competition: 'Very High', trend: '→ Stable'  },
    { icon: '🌿', niche: 'Macramé & Fiber Art',   keyword: 'macrame wall hanging',  avgPrice: '$35–$120', competition: 'Low',       trend: '↑ Rising'  },
    { icon: '🎁', niche: 'Personalized Gifts',    keyword: 'personalized gift',     avgPrice: '$20–$60',  competition: 'High',      trend: '↑ Rising'  },
    { icon: '🧸', niche: 'Nursery Decor',         keyword: 'nursery decor',         avgPrice: '$15–$50',  competition: 'Medium',    trend: '↑ Rising'  },
    { icon: '📿', niche: 'Beaded Bracelets',      keyword: 'beaded bracelet',       avgPrice: '$10–$30',  competition: 'Medium',    trend: '↑ Rising'  },
]

function TopListingsGrid({ onSearch }: { onSearch: (term: string) => void }) {
    const competitionColor = (level: string) => {
        if (level === 'Low') return 'text-emerald-600 bg-emerald-50 border-emerald-100'
        if (level === 'Medium') return 'text-amber-600 bg-amber-50 border-amber-100'
        return 'text-rose-600 bg-rose-50 border-rose-100'
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                <h2 className="text-xl font-semibold text-slate-800">Top Performing Listing Niches</h2>
                <span className="text-xs bg-teal-50 text-teal-600 border border-teal-100 px-2 py-0.5 rounded-full font-medium">Click to analyze</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {TOP_LISTING_NICHES.map((niche) => (
                    <Card
                        key={niche.niche}
                        className="border-white/50 bg-white/70 backdrop-blur-md shadow-md shadow-teal-900/5 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
                        onClick={() => onSearch(niche.keyword)}
                    >
                        <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-100 flex items-center justify-center text-2xl border border-teal-100 flex-shrink-0">
                                    {niche.icon}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-slate-800 group-hover:text-teal-600 transition-colors">{niche.niche}</h3>
                                    <p className="text-xs text-slate-400 mb-3 font-mono">{niche.keyword}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                                            {niche.avgPrice}
                                        </span>
                                        <span className={cn('text-xs border px-2 py-0.5 rounded-full font-medium', competitionColor(niche.competition))}>
                                            {niche.competition} competition
                                        </span>
                                        <span className="text-xs bg-teal-50 border border-teal-100 text-teal-600 px-2 py-0.5 rounded-full font-medium">
                                            {niche.trend}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1">
                                <Tag className="h-3 w-3 text-teal-600" />
                                <span className="text-xs font-medium text-teal-600 group-hover:underline">Search this niche</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default function ListingAnalysisPage(): React.JSX.Element {
    const [listingSearchQuery, setListingSearchQuery] = useState('')
    const [listingSearchResults, setListingSearchResults] = useState<any[]>([])
    const [hasListingSearched, setHasListingSearched] = useState(false)
    const [savedListings, setSavedListings] = useState<SavedListing[]>([])
    const [recentListings, setRecentListings] = useState<SavedListing[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [apiError, setApiError] = useState<string | null>(null)
    const { success, error: toastError } = useToast()
    const supabase = createClient()
    const searchParams = useSearchParams()
    const router = useRouter()
    const returnTo = searchParams.get('returnTo')

    useEffect(() => {
        fetchSavedListings()
        const query = searchParams.get('query')
        if (query) { setListingSearchQuery(query); executeSearch(query) }
    }, [])

    const fetchSavedListings = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { data, error } = await supabase.from('saved_listings').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
            if (error) throw error
            if (data) { setSavedListings(data); setRecentListings(data.slice(0, 5)) }
        } catch { }
    }

    const executeSearch = async (query: string) => {
        if (!query.trim()) return
        setIsLoading(true); setApiError(null); setHasListingSearched(true); setListingSearchResults([])
        try {
            const response = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) })
            if (!response.ok) throw new Error(`API Error: ${response.status}`)
            const result = await response.json()
            if (result.type === 'listing') {
                router.push(`/dashboard/listing-analysis/report?query=${encodeURIComponent(result.data.title)}&returnTo=/dashboard/listing-analysis`)
                return
            } else if (result.type === 'search') {
                setListingSearchResults(result.data.results.map((item: any) => ({
                    id: item.listing_id, title: item.title,
                    price: item.price ? item.price.amount / item.price.divisor : 0,
                    views: item.views || 0, favorites: item.num_favorers || 0, revenue: 'N/A',
                    image: item.images?.[0]?.url_570xN ?? null,
                })))
            }
        } catch {
            setApiError('API Key Pending - Showing Demo Data')
            if (query.includes('etsy.com') || query.startsWith('http')) {
                router.push(`/dashboard/listing-analysis/report?query=${encodeURIComponent(query)}&returnTo=/dashboard/listing-analysis`)
            } else {
                setListingSearchResults(MOCK_LISTING_RESULTS)
            }
        } finally { setIsLoading(false) }
    }

    const handleListingSearch = (e: React.FormEvent) => { e.preventDefault(); executeSearch(listingSearchQuery) }
    const handleChipSearch = (term: string) => { setListingSearchQuery(term); executeSearch(term) }

    const handleTrackItem = async (e: React.MouseEvent, item: any) => {
        e.stopPropagation()
        const title = item.listing_title || item.title
        const price = item.price
        const image = item.image_url || item.image
        const isSaved = savedListings.some(l => l.listing_title === title)

        if (isSaved) {
            const savedListing = savedListings.find(l => l.listing_title === title)
            if (!savedListing) return
            setSavedListings(prev => prev.filter(l => l.id !== savedListing.id))
            setRecentListings(prev => prev.filter(l => l.id !== savedListing.id))
            success('Listing removed', `"${title}" removed from saved listings.`)
            try { await supabase.from('saved_listings').delete().eq('id', savedListing.id) } catch { toastError('Failed to remove listing', 'Please try again.') }
        } else {
            const newListing: SavedListing = { id: 'temp-' + Date.now(), listing_title: title, listing_url: listingSearchQuery.includes('http') ? listingSearchQuery : '', price, image_url: image, total_sales: 0, created_at: new Date().toISOString() }
            setSavedListings(prev => [newListing, ...prev])
            setRecentListings(prev => [newListing, ...prev].slice(0, 5))
            success('Listing saved! 🎉', `"${title}" added to your saved listings.`)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            try {
                const { data, error } = await supabase.from('saved_listings').insert({ user_id: user.id, listing_title: title, listing_url: listingSearchQuery.includes('http') ? listingSearchQuery : '', price, image_url: image, total_sales: 0 }).select().single()
                if (error) throw error
                if (data) { setSavedListings(prev => prev.map(l => l.id === newListing.id ? data : l)); setRecentListings(prev => prev.map(l => l.id === newListing.id ? data : l)) }
            } catch { toastError('Failed to save listing', 'Please try again.'); setSavedListings(prev => prev.filter(l => l.id !== newListing.id)); setRecentListings(prev => prev.filter(l => l.id !== newListing.id)) }
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    {returnTo && (
                        <Button variant="ghost" className="mb-6 rounded-full bg-white border border-slate-200 text-slate-700 shadow-sm hover:border-teal-500 hover:text-teal-600 gap-2 px-4" onClick={() => router.push(returnTo)}>
                            <ArrowLeft className="h-4 w-4" /> Back to Shop Analysis
                        </Button>
                    )}
                    <div className="relative pl-4">
                        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full" />
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Listing Analysis</h1>
                        <p className="text-muted-foreground">Analyze specific listings or find top performers.</p>
                    </div>
                </div>

                <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                    <CardContent className="p-8">
                        <form onSubmit={handleListingSearch} className="relative flex items-center">
                            <Search className="absolute left-4 h-6 w-6 text-teal-600" />
                            <input
                                type="text"
                                placeholder="Paste Etsy URL or Search Keywords..."
                                className="h-14 w-full rounded-xl border-2 border-teal-100 bg-white/50 pl-14 pr-4 text-lg text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition-all"
                                value={listingSearchQuery}
                                onChange={(e) => { setListingSearchQuery(e.target.value); if (!e.target.value) { setHasListingSearched(false) } }}
                            />
                            <Button type="submit" disabled={isLoading} className="absolute right-2 h-10 bg-teal-600 hover:bg-teal-700 text-white px-6 rounded-lg disabled:opacity-50">
                                {isLoading ? 'Analyzing...' : 'Analyze'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {apiError && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3 text-amber-800">
                        <AlertCircle className="h-5 w-5" />
                        <p className="font-medium">{apiError}</p>
                    </div>
                )}

                {hasListingSearched ? (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">Top Results for "{listingSearchQuery}"</h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                {listingSearchResults.map((item) => {
                                    const isSaved = savedListings.some(l => l.listing_title === item.title)
                                    return (
                                        <ListingAnalysisCard
                                            key={item.id}
                                            item={item}
                                            onClick={() => router.push(`/dashboard/listing-analysis/report?query=${encodeURIComponent(item.title)}&returnTo=/dashboard/listing-analysis`)}
                                            onTrack={handleTrackItem}
                                            isSaved={isSaved}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    recentListings.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">Recently Tracked Listings</h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                {recentListings.map((item) => (
                                    <ListingAnalysisCard
                                        key={item.id}
                                        item={item}
                                        onClick={() => router.push(`/dashboard/listing-analysis/report?query=${encodeURIComponent(item.listing_title)}&returnTo=/dashboard/listing-analysis`)}
                                        onTrack={handleTrackItem}
                                        isSaved={true}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                )}

                <TopListingsGrid onSearch={handleChipSearch} />
            </div>
        </DashboardLayout>
    )
}
