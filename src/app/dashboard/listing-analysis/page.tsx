"use client";

import React, { useState, Suspense } from 'react'
import { Search, ShoppingBag, AlertCircle, ImageOff, ArrowLeft, TrendingUp, TrendingDown, Tag, X, Filter, BarChart2, DollarSign, Zap, ExternalLink, Copy, Check, Star, Heart } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/components/Toast'
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts"

interface NicheData {
    id: string
    niche: string
    keyword: string
    category: string
    avgPrice: string
    competition: string
    growth: number
    search_volume: number
    image: string
    monthly_searches: { month: string; searches: number }[]
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function generateMonthly(volume: number, growth: number) {
    const start = volume / (1 + growth / 100)
    return MONTHS.map((month, i) => {
        const progress = i / 11
        const trend = start + (volume - start) * progress
        const wobble = volume * 0.04 * Math.sin(i * 1.2)
        return { month, searches: Math.max(100, Math.round(trend + wobble)) }
    })
}

const NICHES: NicheData[] = [
    { id: 'n1',  niche: 'Minimalist Jewelry',     keyword: 'minimalist jewelry',      category: 'Jewelry',       avgPrice: '$28–$65',   competition: 'High',      growth: 88,   search_volume: 61000, image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=400&q=80',  monthly_searches: generateMonthly(61000, 88)  },
    { id: 'n2',  niche: 'Printable Wall Art',      keyword: 'printable wall art',      category: 'Digital',       avgPrice: '$3–$12',    competition: 'High',      growth: -45,  search_volume: 28000, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',  monthly_searches: generateMonthly(28000, -45) },
    { id: 'n3',  niche: 'Digital Planners',        keyword: 'digital planner',         category: 'Digital',       avgPrice: '$5–$20',    competition: 'Medium',    growth: 210,  search_volume: 32000, image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&q=80',  monthly_searches: generateMonthly(32000, 210) },
    { id: 'n4',  niche: 'Soy Candles',             keyword: 'handmade soy candle',     category: 'Home Decor',    avgPrice: '$12–$35',   competition: 'Medium',    growth: 55,   search_volume: 35000, image: 'https://images.unsplash.com/photo-1603905623639-cbe42eea3087?w=400&q=80',  monthly_searches: generateMonthly(35000, 55)  },
    { id: 'n5',  niche: 'Custom T-Shirts',         keyword: 'custom shirt',            category: 'Clothing',      avgPrice: '$25–$45',   competition: 'Very High', growth: 22,   search_volume: 74000, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',  monthly_searches: generateMonthly(74000, 22)  },
    { id: 'n6',  niche: 'Macramé & Fiber Art',     keyword: 'macrame wall hanging',    category: 'Home Decor',    avgPrice: '$35–$120',  competition: 'Low',       growth: 92,   search_volume: 22000, image: 'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?w=400&q=80',  monthly_searches: generateMonthly(22000, 92)  },
    { id: 'n7',  niche: 'Personalized Gifts',      keyword: 'personalized gift',       category: 'Gifts',         avgPrice: '$20–$60',   competition: 'High',      growth: 103,  search_volume: 57000, image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&q=80',  monthly_searches: generateMonthly(57000, 103) },
    { id: 'n8',  niche: 'Nursery Decor',           keyword: 'nursery decor',           category: 'Baby',          avgPrice: '$15–$50',   competition: 'Medium',    growth: 119,  search_volume: 33000, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',  monthly_searches: generateMonthly(33000, 119) },
    { id: 'n9',  niche: 'Beaded Bracelets',        keyword: 'beaded bracelet set',     category: 'Jewelry',       avgPrice: '$10–$30',   competition: 'Medium',    growth: 174,  search_volume: 38000, image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&q=80',  monthly_searches: generateMonthly(38000, 174) },
    { id: 'n10', niche: 'Custom Pet Portraits',    keyword: 'custom pet portrait',     category: 'Art',           avgPrice: '$25–$80',   competition: 'High',      growth: 145,  search_volume: 54000, image: 'https://images.unsplash.com/photo-1583511655826-05700442982a?w=400&q=80',  monthly_searches: generateMonthly(54000, 145) },
    { id: 'n11', niche: 'Sticker Packs',           keyword: 'sticker pack',            category: 'Stationery',    avgPrice: '$3–$8',     competition: 'High',      growth: 38,   search_volume: 74000, image: 'https://images.unsplash.com/photo-1574126154517-d1e0d89ef264?w=400&q=80',  monthly_searches: generateMonthly(74000, 38)  },
    { id: 'n12', niche: 'Boho Wedding Decor',      keyword: 'boho wedding decor',      category: 'Wedding',       avgPrice: '$15–$60',   competition: 'Medium',    growth: 67,   search_volume: 41000, image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=80',  monthly_searches: generateMonthly(41000, 67)  },
    { id: 'n13', niche: 'Embroidery Hoop Art',     keyword: 'embroidery hoop art',     category: 'Art',           avgPrice: '$15–$45',   competition: 'Low',       growth: 131,  search_volume: 14000, image: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&q=80',  monthly_searches: generateMonthly(14000, 131) },
    { id: 'n14', niche: 'Resin Coaster Sets',      keyword: 'resin coaster set',       category: 'Home Decor',    avgPrice: '$20–$50',   competition: 'Low',       growth: 118,  search_volume: 21000, image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&q=80',  monthly_searches: generateMonthly(21000, 118) },
    { id: 'n15', niche: 'Crystal Healing Sets',    keyword: 'crystal healing set',     category: 'Wellness',      avgPrice: '$15–$45',   competition: 'Medium',    growth: 143,  search_volume: 27000, image: 'https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?w=400&q=80',  monthly_searches: generateMonthly(27000, 143) },
    { id: 'n16', niche: 'Wax Seal Stamp Kits',     keyword: 'wax seal stamp kit',      category: 'Stationery',    avgPrice: '$12–$35',   competition: 'Low',       growth: 199,  search_volume: 14500, image: 'https://images.unsplash.com/photo-1585075928489-f58b6a5e9e8a?w=400&q=80',  monthly_searches: generateMonthly(14500, 199) },
    { id: 'n17', niche: 'Custom Dog Bandanas',     keyword: 'custom dog bandana',      category: 'Pet Supplies',  avgPrice: '$8–$20',    competition: 'Low',       growth: 189,  search_volume: 16000, image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80',  monthly_searches: generateMonthly(16000, 189) },
    { id: 'n18', niche: 'Affirmation Card Decks',  keyword: 'affirmation card deck',   category: 'Wellness',      avgPrice: '$12–$30',   competition: 'Low',       growth: 221,  search_volume: 12000, image: 'https://images.unsplash.com/photo-1571019613914-85f342c6a11e?w=400&q=80',  monthly_searches: generateMonthly(12000, 221) },
    { id: 'n19', niche: 'Dried Flower Bouquets',   keyword: 'dried flower bouquet',    category: 'Home Decor',    avgPrice: '$18–$55',   competition: 'Medium',    growth: 161,  search_volume: 31000, image: 'https://images.unsplash.com/photo-1490750967868-88df5691cc16?w=400&q=80',  monthly_searches: generateMonthly(31000, 161) },
    { id: 'n20', niche: 'Birth Flower Necklaces',  keyword: 'birth flower necklace',   category: 'Jewelry',       avgPrice: '$18–$48',   competition: 'Medium',    growth: 193,  search_volume: 41000, image: 'https://images.unsplash.com/photo-1615812214207-34e3be6812df?w=400&q=80',  monthly_searches: generateMonthly(41000, 193) },
    { id: 'n21', niche: 'Clay Earrings',           keyword: 'clay earrings handmade',  category: 'Jewelry',       avgPrice: '$10–$28',   competition: 'Medium',    growth: 182,  search_volume: 24000, image: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=400&q=80',  monthly_searches: generateMonthly(24000, 182) },
    { id: 'n22', niche: 'Mushroom Art Prints',     keyword: 'mushroom art print',      category: 'Art',           avgPrice: '$4–$15',    competition: 'Low',       growth: 245,  search_volume: 11000, image: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=400&q=80',  monthly_searches: generateMonthly(11000, 245) },
    { id: 'n23', niche: 'Tarot Card Decks',        keyword: 'tarot card deck',         category: 'Wellness',      avgPrice: '$20–$55',   competition: 'Medium',    growth: 158,  search_volume: 30000, image: 'https://images.unsplash.com/photo-1601024445121-e294ce1e3d4e?w=400&q=80',  monthly_searches: generateMonthly(30000, 158) },
    { id: 'n24', niche: 'Personalized Keychains',  keyword: 'personalized keychain',   category: 'Accessories',   avgPrice: '$8–$22',    competition: 'Medium',    growth: 98,   search_volume: 29000, image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400&q=80',  monthly_searches: generateMonthly(29000, 98)  },
    { id: 'n25', niche: 'Linen Tote Bags',         keyword: 'linen tote bag',          category: 'Accessories',   avgPrice: '$12–$30',   competition: 'Low',       growth: 153,  search_volume: 21000, image: 'https://images.unsplash.com/photo-1544816565-a62c5d3a0e35?w=400&q=80',  monthly_searches: generateMonthly(21000, 153) },
    { id: 'n26', niche: 'Terracotta Planters',     keyword: 'terracotta planter',      category: 'Home Decor',    avgPrice: '$15–$45',   competition: 'Low',       growth: 138,  search_volume: 25000, image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&q=80',  monthly_searches: generateMonthly(25000, 138) },
    { id: 'n27', niche: 'Moon Phase Wall Decor',   keyword: 'moon phase wall decor',   category: 'Home Decor',    avgPrice: '$15–$40',   competition: 'Medium',    growth: 144,  search_volume: 26500, image: 'https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=400&q=80',  monthly_searches: generateMonthly(26500, 144) },
    { id: 'n28', niche: 'Friendship Bracelet Kits',keyword: 'friendship bracelet kit', category: 'Accessories',   avgPrice: '$8–$22',    competition: 'Low',       growth: 217,  search_volume: 28500, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80',  monthly_searches: generateMonthly(28500, 217) },
    { id: 'n29', niche: 'Custom Star Maps',        keyword: 'custom star map',         category: 'Gifts',         avgPrice: '$15–$50',   competition: 'Medium',    growth: 105,  search_volume: 37000, image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&q=80',  monthly_searches: generateMonthly(37000, 105) },
    { id: 'n30', niche: 'Gratitude Journals',      keyword: 'gratitude journal',       category: 'Stationery',    avgPrice: '$10–$28',   competition: 'High',      growth: 73,   search_volume: 38000, image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&q=80',  monthly_searches: generateMonthly(38000, 73)  },
]

const ITEMS_PER_PAGE = 30

const competitionColor = (level: string) => {
    if (level === 'Low') return 'text-emerald-700 bg-emerald-100/60 border-emerald-200'
    if (level === 'Medium') return 'text-amber-700 bg-amber-100/60 border-amber-200'
    if (level === 'High') return 'text-rose-700 bg-rose-100/60 border-rose-200'
    return 'text-purple-700 bg-purple-100/60 border-purple-200'
}

function generateTags(keyword: string, category: string) {
    const words = keyword.split(' ').map(w => w.toLowerCase().replace(/[^a-z0-9]/g, ''))
    return [
        keyword.toLowerCase().replace(/\s+/g, ''),
        ...words.filter(w => w.length > 2),
        category.toLowerCase().replace(/\s+/g, ''),
        'handmade', 'gift idea', 'etsy shop'
    ].filter((v, i, a) => a.indexOf(v) === i && v.length > 0).slice(0, 8)
}

function NicheCard({ item, onClick, isSaved, onSave }: { item: NicheData; onClick: () => void; isSaved: boolean; onSave: (e: React.MouseEvent) => void }) {
    const [imgError, setImgError] = useState(false)
    const isRising = item.growth > 0

    return (
        <div
            onClick={onClick}
            className="group cursor-pointer rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-teal-300 hover:shadow-md hover:shadow-teal-900/10 overflow-hidden flex flex-col"
        >
            <div className="relative h-36 bg-slate-100 overflow-hidden shrink-0">
                {item.image && !imgError ? (
                    <img src={item.image} alt={item.niche} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" onError={() => setImgError(true)} />
                ) : (
                    <div className="h-full w-full flex items-center justify-center">
                        <ImageOff className="h-8 w-8 text-slate-300" />
                    </div>
                )}
                <div className={cn(
                    "absolute top-2 left-2 flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full backdrop-blur-md",
                    isRising ? "bg-emerald-600/80 text-white" : "bg-rose-600/80 text-white"
                )}>
                    {isRising ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {isRising ? "+" : ""}{item.growth}%
                </div>
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.category}
                </div>
                <button
                    onClick={onSave}
                    className={cn(
                        "absolute bottom-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all duration-200",
                        isSaved
                            ? "bg-rose-500/90 text-white"
                            : "bg-black/40 text-white/70 hover:bg-rose-500/90 hover:text-white"
                    )}
                >
                    <Heart className={cn("h-3.5 w-3.5", isSaved && "fill-white")} />
                </button>
            </div>

            <div className="p-4 flex flex-col gap-2 flex-1">
                <h3 className="font-bold text-slate-800 text-sm leading-tight capitalize" title={item.niche}>
                    {item.niche}
                </h3>
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-teal-600">{item.search_volume.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 font-medium">searches/mo</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-auto pt-2 border-t border-slate-100">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Comp.</span>
                        <span className={cn("text-[9px] font-bold w-fit px-1.5 py-0.5 rounded border", competitionColor(item.competition))}>
                            {item.competition}
                        </span>
                    </div>
                    <div className="flex flex-col gap-0.5 items-end text-right">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Avg Price</span>
                        <span className="text-xs font-bold text-slate-700">{item.avgPrice}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ListingAnalysisPageInner(): React.JSX.Element {
    const [categoryFilter, setCategoryFilter] = useState('All')
    const [performanceFilter, setPerformanceFilter] = useState<'top' | 'trending'>('top')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedNiche, setSelectedNiche] = useState<NicheData | null>(null)
    const [urlQuery, setUrlQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [apiError, setApiError] = useState<string | null>(null)
    const [copiedTags, setCopiedTags] = useState(false)
    const [savedNicheIds, setSavedNicheIds] = useState<Set<string>>(new Set())
    const [savedNicheDbIds, setSavedNicheDbIds] = useState<Record<string, string>>({})
    const router = useRouter()
    const searchParams = useSearchParams()
    const returnTo = searchParams.get('returnTo')
    const supabase = createClient()
    const { success, error } = useToast()

    React.useEffect(() => {
        const fetchSaved = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { data } = await supabase
                .from('saved_listings')
                .select('id, listing_title')
                .eq('user_id', user.id)
            if (data) {
                const ids = new Set(data.map((d: { listing_title: string }) => d.listing_title))
                const dbMap: Record<string, string> = {}
                data.forEach((d: { id: string; listing_title: string }) => { dbMap[d.listing_title] = d.id })
                setSavedNicheIds(ids)
                setSavedNicheDbIds(dbMap)
            }
        }
        fetchSaved()
    }, [])

    const handleSaveNiche = async (e: React.MouseEvent, item: NicheData) => {
        e.stopPropagation()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        if (savedNicheIds.has(item.niche)) {
            const dbId = savedNicheDbIds[item.niche]
            setSavedNicheIds(prev => { const s = new Set(prev); s.delete(item.niche); return s })
            const { error: err } = await supabase.from('saved_listings').delete().eq('id', dbId)
            if (err) {
                setSavedNicheIds(prev => new Set(prev).add(item.niche))
                error('Failed to remove listing')
            } else {
                success('Listing removed', item.niche)
            }
        } else {
            setSavedNicheIds(prev => new Set(prev).add(item.niche))
            const { data, error: err } = await supabase.from('saved_listings').insert({
                user_id: user.id,
                listing_title: item.niche,
                listing_url: `https://www.etsy.com/search?q=${encodeURIComponent(item.keyword)}`,
                price: 0,
                image_url: item.image,
                total_sales: item.search_volume,
            }).select('id').single()
            if (err) {
                setSavedNicheIds(prev => { const s = new Set(prev); s.delete(item.niche); return s })
                error('Failed to save listing')
            } else {
                success('Listing saved!', item.niche)
                if (data) setSavedNicheDbIds(prev => ({ ...prev, [item.niche]: data.id }))
            }
        }
    }

    const categories = ['All', ...Array.from(new Set(NICHES.map(n => n.category))).sort()]

    const filtered = NICHES
        .filter(item => categoryFilter === 'All' || item.category === categoryFilter)
        .sort((a, b) => performanceFilter === 'top'
            ? b.search_volume - a.search_volume
            : b.growth - a.growth
        )

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const currentData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    const handleUrlSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!urlQuery.trim()) return
        setIsLoading(true); setApiError(null)
        try {
            const response = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: urlQuery }) })
            if (!response.ok) throw new Error()
            const result = await response.json()
            if (result.type === 'listing') {
                router.push(`/dashboard/listing-analysis/report?query=${encodeURIComponent(result.data.title)}&returnTo=/dashboard/listing-analysis`)
                return
            }
        } catch {
            setApiError('API Key Pending — showing demo data')
            if (urlQuery.includes('etsy.com') || urlQuery.startsWith('http')) {
                router.push(`/dashboard/listing-analysis/report?query=${encodeURIComponent(urlQuery)}&returnTo=/dashboard/listing-analysis`)
            }
        } finally { setIsLoading(false) }
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">

                {/* Header */}
                <div className="flex items-center gap-4">
                    {returnTo && (
                        <button className="mr-2 flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 transition-colors" onClick={() => router.push(returnTo)}>
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                    )}
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-md shadow-teal-900/20">
                        <ShoppingBag className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Listing Analysis</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Explore top-performing niches or analyze a specific listing.</p>
                    </div>
                </div>

                {/* URL / Listing Search */}
                <form onSubmit={handleUrlSearch} className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Paste an Etsy listing URL to analyze it..."
                            className="h-14 w-full pl-12 pr-5 rounded-xl border border-slate-200 bg-white text-lg font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm"
                            value={urlQuery}
                            onChange={(e) => { setUrlQuery(e.target.value); setApiError(null) }}
                        />
                        {urlQuery && (
                            <button type="button" onClick={() => setUrlQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <Button type="submit" disabled={isLoading} className="h-14 min-w-[120px] bg-teal-600 hover:bg-teal-700 text-white px-8 rounded-xl text-base font-semibold shadow-sm disabled:opacity-50">
                        {isLoading ? 'Analyzing...' : 'Analyze'}
                    </Button>
                </form>

                {apiError && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3 text-amber-800">
                        <AlertCircle className="h-5 w-5" /><p className="font-medium">{apiError}</p>
                    </div>
                )}


                {/* Card Grid */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => { setPerformanceFilter('top'); setCurrentPage(1) }}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
                                    performanceFilter === 'top'
                                        ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-900/10"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600"
                                )}
                            >
                                <Star className="h-4 w-4" /> Top Performing
                            </button>
                            <button
                                onClick={() => { setPerformanceFilter('trending'); setCurrentPage(1) }}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
                                    performanceFilter === 'trending'
                                        ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-900/10"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600"
                                )}
                            >
                                <TrendingUp className="h-4 w-4" /> Trending
                            </button>

                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1) }}
                                    className="h-9 pl-9 pr-7 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 focus:border-teal-500 outline-none appearance-none cursor-pointer shadow-sm hover:border-teal-300 transition-colors"
                                >
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {currentData.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {currentData.map((item) => (
                                <NicheCard key={item.id} item={item} onClick={() => setSelectedNiche(item)} isSaved={savedNicheIds.has(item.niche)} onSave={(e) => handleSaveNiche(e, item)} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-16 text-center">
                            <p className="text-slate-500 font-medium">No niches found matching your filters.</p>
                        </div>
                    )}

                    {filtered.length > ITEMS_PER_PAGE && (
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">‹</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button key={page} onClick={() => setCurrentPage(page)} className={cn("px-3 py-1 rounded-lg text-sm font-semibold transition-colors", currentPage === page ? "bg-teal-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-200 hover:text-slate-700")}>
                                    Page {page}
                                </button>
                            ))}
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">›</button>
                        </div>
                    )}
                </div>

                {/* Niche Detail Modal */}
                {selectedNiche && (
                    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedNiche(null)}>
                        <div className="modal-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200/80 bg-slate-50 shadow-2xl shadow-slate-900/20" onClick={(e) => e.stopPropagation()}>

                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 bg-slate-50 sticky top-0 rounded-t-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                                        <ShoppingBag className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-base capitalize">{selectedNiche.niche}</h3>
                                        <p className="text-xs text-slate-500">{selectedNiche.category} · Niche analysis & search history</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedNiche(null)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Stat Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="bg-teal-100/35 rounded-xl border border-teal-200 p-4">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <BarChart2 className="h-3.5 w-3.5 text-teal-500" />
                                            <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider">Search Volume</p>
                                        </div>
                                        <p className="text-2xl font-bold text-slate-800">{selectedNiche.search_volume.toLocaleString()}</p>
                                        <p className="text-xs text-teal-500 mt-0.5">monthly searches</p>
                                    </div>
                                    {(() => { const g = selectedNiche.growth; return (
                                        <div className={cn("rounded-xl border p-4", g > 0 ? "bg-emerald-100/35 border-emerald-200" : "bg-rose-100/60 border-rose-200")}>
                                            <div className="flex items-center gap-1.5 mb-1">
                                                {g > 0 ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> : <TrendingDown className="h-3.5 w-3.5 text-rose-500" />}
                                                <p className={cn("text-xs font-semibold uppercase tracking-wider", g > 0 ? "text-emerald-600" : "text-rose-600")}>Growth</p>
                                            </div>
                                            <p className={cn("text-2xl font-bold", g > 0 ? "text-emerald-700" : "text-rose-700")}>{g > 0 ? "+" : ""}{g}%</p>
                                            <p className={cn("text-xs mt-0.5 opacity-60", g > 0 ? "text-emerald-600" : "text-rose-600")}>over 12 months</p>
                                        </div>
                                    )})()}
                                    <div className={cn("rounded-xl border p-4", competitionColor(selectedNiche.competition))}>
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Tag className="h-3.5 w-3.5" />
                                            <p className="text-xs font-semibold uppercase tracking-wider">Competition</p>
                                        </div>
                                        <p className="text-2xl font-bold">{selectedNiche.competition}</p>
                                        <p className="text-xs mt-0.5 opacity-60">seller density</p>
                                    </div>
                                    <div className="bg-orange-100/60 rounded-xl border border-orange-200 p-4">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <DollarSign className="h-3.5 w-3.5 text-orange-500" />
                                            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Avg Price</p>
                                        </div>
                                        <p className="text-2xl font-bold text-slate-800">{selectedNiche.avgPrice}</p>
                                        <p className="text-xs text-orange-400 mt-0.5">typical range</p>
                                    </div>
                                </div>

                                {/* Chart */}
                                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                                    <p className="text-sm font-semibold text-slate-700 mb-4">12-Month Search Volume</p>
                                    <div className="h-[220px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={selectedNiche.monthly_searches} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="nicheGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={36} />
                                                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)' }} formatter={(value: number) => [value.toLocaleString(), 'Search Volume']} itemStyle={{ color: '#0f766e', fontWeight: 600 }} labelStyle={{ color: '#475569', fontWeight: 500 }} />
                                                <Area type="monotone" dataKey="searches" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#nicheGradient)" dot={false} activeDot={{ r: 5, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Insights */}
                                {(() => {
                                    const months = selectedNiche.monthly_searches
                                    const peakMonth = months.reduce((p, c) => c.searches > p.searches ? c : p)
                                    const g = selectedNiche.growth
                                    const sv = selectedNiche.search_volume
                                    const opportunityScore = Math.min(100, Math.round(
                                        (g > 0 ? Math.min(g, 200) / 2 : 0) +
                                        (['Low', 'Medium'].includes(selectedNiche.competition) ? 30 : 10) +
                                        Math.min(sv / 1000, 20)
                                    ))
                                    const scoreColor = opportunityScore >= 70 ? 'text-emerald-700 bg-emerald-100/35 border-emerald-200'
                                        : opportunityScore >= 40 ? 'text-amber-700 bg-amber-100/60 border-amber-200'
                                        : 'text-rose-700 bg-rose-100/60 border-rose-200'
                                    return (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div className={cn("rounded-xl border p-4 flex items-start gap-3", scoreColor)}>
                                                <Zap className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wider mb-0.5">Opportunity Score</p>
                                                    <p className="text-2xl font-bold">{opportunityScore}<span className="text-sm font-medium opacity-60">/100</span></p>
                                                    <p className="text-xs mt-0.5 opacity-70">{opportunityScore >= 70 ? 'Strong potential' : opportunityScore >= 40 ? 'Moderate potential' : 'Competitive space'}</p>
                                                </div>
                                            </div>
                                            <div className="rounded-xl border border-blue-200 bg-blue-100/60 p-4 flex items-start gap-3">
                                                <TrendingUp className="h-5 w-5 mt-0.5 text-blue-500 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-0.5">Peak Month</p>
                                                    <p className="text-2xl font-bold text-slate-800">{peakMonth.month}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">{peakMonth.searches.toLocaleString()} searches</p>
                                                </div>
                                            </div>
                                            <div className="rounded-xl border border-violet-300 bg-violet-100/90 p-4 flex items-start gap-3">
                                                <Tag className="h-5 w-5 mt-0.5 text-violet-500 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-0.5">Category</p>
                                                    <p className="text-xl font-bold text-slate-800">{selectedNiche.category}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">Niche segment</p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })()}

                                {/* Tags */}
                                {(() => {
                                    const tags = generateTags(selectedNiche.keyword, selectedNiche.category)
                                    return (
                                        <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                                    <Tag className="h-4 w-4 text-slate-400" /> Popular Tags
                                                </p>
                                                <button
                                                    onClick={() => { navigator.clipboard.writeText(tags.join(', ')); setCopiedTags(true); setTimeout(() => setCopiedTags(false), 2000) }}
                                                    className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors bg-white border border-slate-200 hover:border-slate-300 shadow-sm px-2.5 py-1.5 rounded-md"
                                                >
                                                    {copiedTags ? <><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy Tags</>}
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {tags.map(tag => (
                                                    <span key={tag} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded-md">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })()}

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                    <p className="text-xs text-slate-400">Data reflects estimated Etsy market trends</p>
                                    <a href={`https://www.etsy.com/search?q=${encodeURIComponent(selectedNiche.keyword)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline transition-colors">
                                        Search on Etsy <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    )
}

export default function ListingAnalysisPage() {
    return (
        <Suspense>
            <ListingAnalysisPageInner />
        </Suspense>
    )
}
