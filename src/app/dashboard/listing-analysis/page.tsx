"use client";

import React, { useState, Suspense } from 'react'
import { Search, ShoppingBag, AlertCircle, ImageOff, ArrowLeft, TrendingUp, TrendingDown, Tag, X, Filter, BarChart2, DollarSign, Zap, ExternalLink, Copy, Check, Star, Heart, Calendar, Layers, ShieldCheck, ChevronDown } from 'lucide-react'
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
    listingAge: string
    revenue: string
    sales: number
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
    { id: 'n1',  niche: 'Minimalist Jewelry',     keyword: 'minimalist jewelry',      category: 'Jewelry',       avgPrice: '$28–$65',   listingAge: '3y 2m',  revenue: '$14.2k', sales: 340,  competition: 'High',      growth: 88,   search_volume: 61000, image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=400&q=80',  monthly_searches: generateMonthly(61000, 88)  },
    { id: 'n2',  niche: 'Printable Wall Art',      keyword: 'printable wall art',      category: 'Digital',       avgPrice: '$3–$12',    listingAge: '5y 1m',  revenue: '$6.8k',  sales: 920,  competition: 'High',      growth: -45,  search_volume: 28000, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',  monthly_searches: generateMonthly(28000, -45) },
    { id: 'n3',  niche: 'Digital Planners',        keyword: 'digital planner',         category: 'Digital',       avgPrice: '$5–$20',    listingAge: '1y 8m',  revenue: '$9.1k',  sales: 610,  competition: 'Medium',    growth: 210,  search_volume: 32000, image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&q=80',  monthly_searches: generateMonthly(32000, 210) },
    { id: 'n4',  niche: 'Soy Candles',             keyword: 'handmade soy candle',     category: 'Home Decor',    avgPrice: '$12–$35',   listingAge: '2y 5m',  revenue: '$11.5k', sales: 480,  competition: 'Medium',    growth: 55,   search_volume: 35000, image: 'https://images.unsplash.com/photo-1603905623639-cbe42eea3087?w=400&q=80',  monthly_searches: generateMonthly(35000, 55)  },
    { id: 'n5',  niche: 'Custom T-Shirts',         keyword: 'custom shirt',            category: 'Clothing',      avgPrice: '$25–$45',   listingAge: '4y 0m',  revenue: '$28.7k', sales: 890,  competition: 'Very High', growth: 22,   search_volume: 74000, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',  monthly_searches: generateMonthly(74000, 22)  },
    { id: 'n6',  niche: 'Macramé & Fiber Art',     keyword: 'macrame wall hanging',    category: 'Home Decor',    avgPrice: '$35–$120',  listingAge: '2y 11m', revenue: '$18.3k', sales: 210,  competition: 'Low',       growth: 92,   search_volume: 22000, image: 'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?w=400&q=80',  monthly_searches: generateMonthly(22000, 92)  },
    { id: 'n7',  niche: 'Personalized Gifts',      keyword: 'personalized gift',       category: 'Gifts',         avgPrice: '$20–$60',   listingAge: '6y 3m',  revenue: '$32.1k', sales: 1040, competition: 'High',      growth: 103,  search_volume: 57000, image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&q=80',  monthly_searches: generateMonthly(57000, 103) },
    { id: 'n8',  niche: 'Nursery Decor',           keyword: 'nursery decor',           category: 'Baby',          avgPrice: '$15–$50',   listingAge: '3y 7m',  revenue: '$13.9k', sales: 390,  competition: 'Medium',    growth: 119,  search_volume: 33000, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',  monthly_searches: generateMonthly(33000, 119) },
    { id: 'n9',  niche: 'Beaded Bracelets',        keyword: 'beaded bracelet set',     category: 'Jewelry',       avgPrice: '$10–$30',   listingAge: '1y 4m',  revenue: '$7.4k',  sales: 530,  competition: 'Medium',    growth: 174,  search_volume: 38000, image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&q=80',  monthly_searches: generateMonthly(38000, 174) },
    { id: 'n10', niche: 'Custom Pet Portraits',    keyword: 'custom pet portrait',     category: 'Art',           avgPrice: '$25–$80',   listingAge: '4y 9m',  revenue: '$22.6k', sales: 450,  competition: 'High',      growth: 145,  search_volume: 54000, image: 'https://images.unsplash.com/photo-1583511655826-05700442982a?w=400&q=80',  monthly_searches: generateMonthly(54000, 145) },
    { id: 'n11', niche: 'Sticker Packs',           keyword: 'sticker pack',            category: 'Stationery',    avgPrice: '$3–$8',     listingAge: '2y 1m',  revenue: '$4.2k',  sales: 780,  competition: 'High',      growth: 38,   search_volume: 74000, image: 'https://images.unsplash.com/photo-1574126154517-d1e0d89ef264?w=400&q=80',  monthly_searches: generateMonthly(74000, 38)  },
    { id: 'n12', niche: 'Boho Wedding Decor',      keyword: 'boho wedding decor',      category: 'Wedding',       avgPrice: '$15–$60',   listingAge: '5y 6m',  revenue: '$19.8k', sales: 560,  competition: 'Medium',    growth: 67,   search_volume: 41000, image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=80',  monthly_searches: generateMonthly(41000, 67)  },
    { id: 'n13', niche: 'Embroidery Hoop Art',     keyword: 'embroidery hoop art',     category: 'Art',           avgPrice: '$15–$45',   listingAge: '3y 0m',  revenue: '$8.7k',  sales: 290,  competition: 'Low',       growth: 131,  search_volume: 14000, image: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&q=80',  monthly_searches: generateMonthly(14000, 131) },
    { id: 'n14', niche: 'Resin Coaster Sets',      keyword: 'resin coaster set',       category: 'Home Decor',    avgPrice: '$20–$50',   listingAge: '1y 10m', revenue: '$10.3k', sales: 310,  competition: 'Low',       growth: 118,  search_volume: 21000, image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&q=80',  monthly_searches: generateMonthly(21000, 118) },
    { id: 'n15', niche: 'Crystal Healing Sets',    keyword: 'crystal healing set',     category: 'Wellness',      avgPrice: '$15–$45',   listingAge: '2y 3m',  revenue: '$12.1k', sales: 420,  competition: 'Medium',    growth: 143,  search_volume: 27000, image: 'https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?w=400&q=80',  monthly_searches: generateMonthly(27000, 143) },
    { id: 'n16', niche: 'Wax Seal Stamp Kits',     keyword: 'wax seal stamp kit',      category: 'Stationery',    avgPrice: '$12–$35',   listingAge: '0y 9m',  revenue: '$3.6k',  sales: 175,  competition: 'Low',       growth: 199,  search_volume: 14500, image: 'https://images.unsplash.com/photo-1585075928489-f58b6a5e9e8a?w=400&q=80',  monthly_searches: generateMonthly(14500, 199) },
    { id: 'n17', niche: 'Custom Dog Bandanas',     keyword: 'custom dog bandana',      category: 'Pet Supplies',  avgPrice: '$8–$20',    listingAge: '1y 6m',  revenue: '$5.9k',  sales: 490,  competition: 'Low',       growth: 189,  search_volume: 16000, image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80',  monthly_searches: generateMonthly(16000, 189) },
    { id: 'n18', niche: 'Affirmation Card Decks',  keyword: 'affirmation card deck',   category: 'Wellness',      avgPrice: '$12–$30',   listingAge: '0y 11m', revenue: '$4.4k',  sales: 230,  competition: 'Low',       growth: 221,  search_volume: 12000, image: 'https://images.unsplash.com/photo-1571019613914-85f342c6a11e?w=400&q=80',  monthly_searches: generateMonthly(12000, 221) },
    { id: 'n19', niche: 'Dried Flower Bouquets',   keyword: 'dried flower bouquet',    category: 'Home Decor',    avgPrice: '$18–$55',   listingAge: '4y 2m',  revenue: '$16.7k', sales: 510,  competition: 'Medium',    growth: 161,  search_volume: 31000, image: 'https://images.unsplash.com/photo-1490750967868-88df5691cc16?w=400&q=80',  monthly_searches: generateMonthly(31000, 161) },
    { id: 'n20', niche: 'Birth Flower Necklaces',  keyword: 'birth flower necklace',   category: 'Jewelry',       avgPrice: '$18–$48',   listingAge: '2y 7m',  revenue: '$17.4k', sales: 580,  competition: 'Medium',    growth: 193,  search_volume: 41000, image: 'https://images.unsplash.com/photo-1615812214207-34e3be6812df?w=400&q=80',  monthly_searches: generateMonthly(41000, 193) },
    { id: 'n21', niche: 'Clay Earrings',           keyword: 'clay earrings handmade',  category: 'Jewelry',       avgPrice: '$10–$28',   listingAge: '1y 3m',  revenue: '$6.2k',  sales: 360,  competition: 'Medium',    growth: 182,  search_volume: 24000, image: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=400&q=80',  monthly_searches: generateMonthly(24000, 182) },
    { id: 'n22', niche: 'Mushroom Art Prints',     keyword: 'mushroom art print',      category: 'Art',           avgPrice: '$4–$15',    listingAge: '0y 7m',  revenue: '$2.8k',  sales: 260,  competition: 'Low',       growth: 245,  search_volume: 11000, image: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=400&q=80',  monthly_searches: generateMonthly(11000, 245) },
    { id: 'n23', niche: 'Tarot Card Decks',        keyword: 'tarot card deck',         category: 'Wellness',      avgPrice: '$20–$55',   listingAge: '3y 5m',  revenue: '$15.3k', sales: 440,  competition: 'Medium',    growth: 158,  search_volume: 30000, image: 'https://images.unsplash.com/photo-1601024445121-e294ce1e3d4e?w=400&q=80',  monthly_searches: generateMonthly(30000, 158) },
    { id: 'n24', niche: 'Personalized Keychains',  keyword: 'personalized keychain',   category: 'Accessories',   avgPrice: '$8–$22',    listingAge: '2y 0m',  revenue: '$8.5k',  sales: 620,  competition: 'Medium',    growth: 98,   search_volume: 29000, image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400&q=80',  monthly_searches: generateMonthly(29000, 98)  },
    { id: 'n25', niche: 'Linen Tote Bags',         keyword: 'linen tote bag',          category: 'Accessories',   avgPrice: '$12–$30',   listingAge: '1y 9m',  revenue: '$7.1k',  sales: 380,  competition: 'Low',       growth: 153,  search_volume: 21000, image: 'https://images.unsplash.com/photo-1544816565-a62c5d3a0e35?w=400&q=80',  monthly_searches: generateMonthly(21000, 153) },
    { id: 'n26', niche: 'Terracotta Planters',     keyword: 'terracotta planter',      category: 'Home Decor',    avgPrice: '$15–$45',   listingAge: '5y 4m',  revenue: '$13.4k', sales: 470,  competition: 'Low',       growth: 138,  search_volume: 25000, image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&q=80',  monthly_searches: generateMonthly(25000, 138) },
    { id: 'n27', niche: 'Moon Phase Wall Decor',   keyword: 'moon phase wall decor',   category: 'Home Decor',    avgPrice: '$15–$40',   listingAge: '3y 8m',  revenue: '$11.8k', sales: 410,  competition: 'Medium',    growth: 144,  search_volume: 26500, image: 'https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=400&q=80',  monthly_searches: generateMonthly(26500, 144) },
    { id: 'n28', niche: 'Friendship Bracelet Kits',keyword: 'friendship bracelet kit', category: 'Accessories',   avgPrice: '$8–$22',    listingAge: '1y 1m',  revenue: '$5.3k',  sales: 350,  competition: 'Low',       growth: 217,  search_volume: 28500, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80',  monthly_searches: generateMonthly(28500, 217) },
    { id: 'n29', niche: 'Custom Star Maps',        keyword: 'custom star map',         category: 'Gifts',         avgPrice: '$15–$50',   listingAge: '4y 6m',  revenue: '$20.9k', sales: 630,  competition: 'Medium',    growth: 105,  search_volume: 37000, image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&q=80',  monthly_searches: generateMonthly(37000, 105) },
    { id: 'n30', niche: 'Gratitude Journals',      keyword: 'gratitude journal',       category: 'Stationery',    avgPrice: '$10–$28',   listingAge: '6y 0m',  revenue: '$18.6k', sales: 850,  competition: 'High',      growth: 73,   search_volume: 38000, image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&q=80',  monthly_searches: generateMonthly(38000, 73)  },
]

const ITEMS_PER_PAGE = 30

const competitionColor = (level: string) => {
    if (level === 'Low')       return 'text-emerald-700 bg-emerald-50 border-emerald-200'
    if (level === 'Medium')    return 'text-amber-700   bg-amber-50   border-amber-200'
    if (level === 'High')      return 'text-rose-700    bg-rose-50    border-rose-200'
    if (level === 'Very High') return 'text-purple-700  bg-purple-50  border-purple-200'
    return 'text-slate-600 bg-slate-50 border-slate-200'
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
            <div className="relative aspect-square bg-slate-100 overflow-hidden shrink-0">
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

            <div className="px-3 py-2.5 flex flex-col gap-1.5">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-800 text-sm leading-tight capitalize flex-1 min-w-0 truncate" title={item.niche}>
                        {item.niche}
                    </h3>
                    <div className="flex items-center gap-1 text-slate-400 whitespace-nowrap flex-shrink-0">
                        <Calendar className="h-3 w-3" />
                        <span className="text-xs font-semibold">{item.listingAge}</span>
                    </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-black text-teal-600">{item.revenue}</span>
                            <span className="text-[10px] text-slate-400 font-medium">revenue</span>
                        </div>
                        <span className="text-slate-200">·</span>
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-black text-slate-700">{item.sales.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-400 font-medium">sales</span>
            </div>
                                </div>
                    <div className="flex items-center gap-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Comp.</span>
                        <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap", competitionColor(item.competition))}>
                            {item.competition}
                                        </span>
                                    </div>
                                </div>
            </div>
        </div>
    )
}

function ListingAnalysisPageInner(): React.JSX.Element {
    const [categoryFilter, setCategoryFilter] = useState('All')
    const [performanceFilter, setPerformanceFilter] = useState<'top' | 'trending'>('top')
    const [ageFilter, setAgeFilter] = useState('All')
    const [productTypeFilter, setProductTypeFilter] = useState<'All' | 'Print on Demand' | 'Digital Download' | 'Handmade'>('All')
    const [competitionFilter, setCompetitionFilter] = useState<'All' | 'Low' | 'Medium' | 'High'>('All')
    const [productTypeOpen, setProductTypeOpen] = useState(false)
    const [competitionOpen, setCompetitionOpen] = useState(false)
    const [ageOpen, setAgeOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedNiche, setSelectedNiche] = useState<NicheData | null>(null)
    const [urlQuery, setUrlQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [apiError, setApiError] = useState<string | null>(null)
    const [copiedTags, setCopiedTags] = useState(false)
    const [copiedTag, setCopiedTag] = useState<string | null>(null)
    const [revenueRange, setRevenueRange] = useState<'1M' | '6M' | '1Y' | 'ALL'>('1Y')
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
            const convRateMap: Record<string, number> = { Low: 0.052, Medium: 0.038, High: 0.024, 'Very High': 0.016 }
            const convRateVal = convRateMap[item.competition] ?? 0.024
            const basePayload = {
                user_id: user.id,
                listing_title: item.niche,
                listing_url: `https://www.etsy.com/search?q=${encodeURIComponent(item.keyword)}`,
                price: 0,
                image_url: item.image,
                total_sales: item.sales,
            }
            let { data, error: err } = await supabase.from('saved_listings').insert({
                ...basePayload,
                revenue: item.revenue ?? null,
                competition: item.competition ?? null,
                conv_rate: `${(convRateVal * 100).toFixed(1)}%`,
            }).select('id').single()
            if (err) {
                // Fallback: try without new columns if migration hasn't run
                const { data: d2, error: err2 } = await supabase.from('saved_listings').insert(basePayload).select('id').single()
                data = d2; err = err2
            }
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

    const parseAgeYears = (age: string) => {
        const y = parseInt(age) || 0
        const m = parseInt(age.split('y')[1]) || 0
        return y + m / 12
    }

    const filtered = NICHES
        .filter(item => {
            if (categoryFilter !== 'All' && item.category !== categoryFilter) return false
            if (ageFilter !== 'All') {
                const years = parseAgeYears(item.listingAge)
                if (ageFilter === '< 1 year' && years >= 1) return false
                if (ageFilter === '1–2 years' && (years < 1 || years >= 3)) return false
                if (ageFilter === '3–5 years' && (years < 3 || years >= 5)) return false
                if (ageFilter === '5+ years' && years < 5) return false
            }
            if (productTypeFilter === 'Print on Demand' && item.category !== 'Apparel') return false
            if (productTypeFilter === 'Digital Download' && item.category !== 'Digital') return false
            if (productTypeFilter === 'Handmade' && (item.category === 'Digital' || item.category === 'Apparel')) return false
            if (competitionFilter !== 'All') {
                const isHigh = item.competition === 'High' || item.competition === 'Very High'
                if (competitionFilter === 'High' ? !isHigh : item.competition !== competitionFilter) return false
            }
            return true
        })
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
                <div className="rounded-2xl bg-teal-600 px-7 py-5 flex items-center gap-5 shadow-md shadow-teal-900/20">
                    {returnTo && (
                        <button className="flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors" onClick={() => router.push(returnTo)}>
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                    )}
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 flex-shrink-0">
                        <ShoppingBag className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Listing Analysis</h1>
                        <p className="text-sm text-white/75 mt-0.5">Explore top-performing niches or analyze a specific listing.</p>
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

                            {/* Product Type dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => { setProductTypeOpen(v => !v); setCompetitionOpen(false) }}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
                                        productTypeFilter !== 'All'
                                            ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-900/10"
                                            : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600"
                                    )}
                                >
                                    <Layers className="h-4 w-4" />
                                    Product Type{productTypeFilter !== 'All' ? `: ${productTypeFilter}` : ''}
                                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", productTypeOpen && "rotate-180")} />
                                </button>
                                {productTypeOpen && (
                                    <div className="absolute top-full left-0 mt-1.5 z-20 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-900/10 py-1 min-w-[180px]">
                                        {(['All', 'Print on Demand', 'Digital Download', 'Handmade'] as const).map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => { setProductTypeFilter(opt); setProductTypeOpen(false); setCurrentPage(1) }}
                                                className={cn(
                                                    "w-full text-left px-4 py-2 text-sm font-medium transition-colors",
                                                    productTypeFilter === opt
                                                        ? "text-teal-700 bg-teal-50 font-semibold"
                                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                                                )}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Competition dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => { setCompetitionOpen(v => !v); setProductTypeOpen(false) }}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
                                        competitionFilter !== 'All'
                                            ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-900/10"
                                            : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-600"
                                    )}
                                >
                                    <ShieldCheck className="h-4 w-4" />
                                    Competition{competitionFilter !== 'All' ? `: ${competitionFilter}` : ''}
                                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", competitionOpen && "rotate-180")} />
                                </button>
                                {competitionOpen && (
                                    <div className="absolute top-full left-0 mt-1.5 z-20 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-900/10 py-1 min-w-[160px]">
                                        {(['All', 'Low', 'Medium', 'High'] as const).map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => { setCompetitionFilter(opt); setCompetitionOpen(false); setCurrentPage(1) }}
                                                className={cn(
                                                    "w-full text-left px-4 py-2 text-sm font-medium transition-colors",
                                                    competitionFilter === opt
                                                        ? "text-emerald-700 bg-emerald-50 font-semibold"
                                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                                                )}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => { setAgeOpen(v => !v); setProductTypeOpen(false); setCompetitionOpen(false) }}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
                                        ageFilter !== 'All'
                                            ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-900/10"
                                            : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600"
                                    )}
                                >
                                    <Calendar className="h-4 w-4" />
                                    {ageFilter === 'All' ? 'Listing Age' : ageFilter}
                                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", ageOpen && "rotate-180")} />
                                </button>
                                {ageOpen && (
                                    <div className="absolute top-full left-0 mt-1.5 z-20 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-900/10 py-1 min-w-[160px]">
                                        {(['All', '< 1 year', '1–2 years', '3–5 years', '5+ years'] as const).map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => { setAgeFilter(opt); setAgeOpen(false); setCurrentPage(1) }}
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
                {selectedNiche && (() => {
                    const g = selectedNiche.growth
                    const sv = selectedNiche.search_volume
                    const months = selectedNiche.monthly_searches
                    const peakMonth = months.reduce((p, c) => c.searches > p.searches ? c : p)
                    const opportunityScore = Math.min(100, Math.round(
                        (g > 0 ? Math.min(g, 200) / 2 : 0) +
                        (['Low', 'Medium'].includes(selectedNiche.competition) ? 30 : 10) +
                        Math.min(sv / 1000, 20)
                    ))
                    const scoreBarColor = opportunityScore >= 70 ? 'from-emerald-400 to-teal-400'
                        : opportunityScore >= 40 ? 'from-amber-400 to-yellow-400'
                        : 'from-rose-400 to-pink-400'
                    const tags = generateTags(selectedNiche.keyword, selectedNiche.category)
                    // Deterministic mock age from id (6–48 months)
                    const idNum = parseInt(selectedNiche.id.replace(/\D/g, ''), 10) || 1
                    const ageMonths = 6 + (idNum * 7) % 43
                    const ageLabel = ageMonths >= 12
                        ? `${Math.floor(ageMonths / 12)}y ${ageMonths % 12 > 0 ? `${ageMonths % 12}m` : ''}`.trim()
                        : `${ageMonths}m`
                    // Mock revenue: derive avg price midpoint, estimate ~2% conversion, multiply by searches
                    const priceParts = selectedNiche.avgPrice.replace(/\$/g, '').split('–').map(Number)
                    const avgPriceMid = priceParts.length === 2 ? (priceParts[0] + priceParts[1]) / 2 : priceParts[0]
                    const convRate = { Low: 0.052, Medium: 0.038, High: 0.024, 'Very High': 0.016 }[selectedNiche.competition] ?? 0.024
                    const monthlyRevenue = Math.round(sv * convRate * avgPriceMid)
                    const revenueData = months.map(m => ({
                        month: m.month,
                        revenue: Math.round(m.searches * convRate * avgPriceMid),
                    }))
                    return (
                    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedNiche(null)}>
                        <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl shadow-slate-900/25 border border-slate-200/60 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-card max-h-[92vh] overflow-y-auto">

                            {/* ── Teal Banner Header ── */}
                            <div className="relative rounded-t-2xl bg-teal-600 px-6 pt-3 pb-4 text-white overflow-hidden">

                                <div className="relative flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        {/* Niche image or icon */}
                                        <div className="h-20 w-20 rounded-xl bg-white/20 border-2 border-white/30 overflow-hidden flex-shrink-0 shadow-md flex items-center justify-center">
                                            {selectedNiche.image ? (
                                                <img src={selectedNiche.image} alt={selectedNiche.niche} className="h-full w-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display='none' }} />
                                            ) : (
                                                <ShoppingBag className="h-6 w-6 text-white/80" />
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black tracking-normal capitalize leading-tight">{selectedNiche.niche}</h2>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">{selectedNiche.category}</span>
                                                <span className="text-sm text-white/80 font-semibold">{ageLabel} old</span>
                                            </div>
                                            {/* Listing Score — styled like Keyword Score */}
                                            <div className="flex items-center gap-2.5 mt-2.5">
                                                <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">Listing Score</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-28 h-2 bg-white/20 rounded-full overflow-hidden">
                                                        <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${opportunityScore}%` }} />
                                                    </div>
                                                    <span className="font-black text-white text-lg leading-none">{opportunityScore}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <a href={`https://www.etsy.com/search?q=${encodeURIComponent(selectedNiche.keyword)}`} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-sm font-semibold bg-white/20 hover:bg-white/30 border border-white/30 px-4 py-2 rounded-lg transition-colors">
                                            <ExternalLink className="h-4 w-4" /> Search Etsy
                                        </a>
                                        <button
                                            onClick={() => router.push(`/dashboard/listing-analysis/${encodeURIComponent(selectedNiche.niche)}`)}
                                            className="flex items-center gap-1.5 text-sm font-semibold bg-white text-teal-700 hover:bg-white/90 px-4 py-2 rounded-lg transition-colors shadow-sm">
                                            <TrendingUp className="h-4 w-4" /> Full Analysis
                                        </button>
                                        <button onClick={() => setSelectedNiche(null)} className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/70 hover:text-white">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* ── Body ── */}
                            <div className="p-5 space-y-5 bg-slate-50 rounded-b-2xl">

                                {/* Stat Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-stretch">
                                    <div className="rounded-xl border border-teal-200 bg-white p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">Revenue</span>
                                            <DollarSign className="h-4 w-4 text-teal-400 opacity-70" />
                                        </div>
                                        <p className="text-2xl font-black text-teal-900">
                                            {monthlyRevenue >= 1000000 ? `$${(monthlyRevenue/1000000).toFixed(1)}M` : monthlyRevenue >= 1000 ? `$${(monthlyRevenue/1000).toFixed(0)}k` : `$${monthlyRevenue}`}
                                        </p>
                                        <p className="text-xs text-teal-500 mt-0.5">est. monthly</p>
                                    </div>
                                    <div className={cn("rounded-xl border p-4 bg-white", g > 0 ? "border-emerald-200" : "border-rose-200")}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={cn("text-[10px] font-bold uppercase tracking-wider", g > 0 ? "text-emerald-600" : "text-rose-600")}>Growth</span>
                                            {g > 0 ? <TrendingUp className="h-4 w-4 text-emerald-400 opacity-70" /> : <TrendingDown className="h-4 w-4 text-rose-400 opacity-70" />}
                                        </div>
                                        <p className={cn("text-2xl font-black", g > 0 ? "text-emerald-800" : "text-rose-800")}>{g > 0 ? '+' : ''}{g}%</p>
                                        <p className={cn("text-xs mt-0.5 opacity-60", g > 0 ? "text-emerald-600" : "text-rose-600")}>over 12 months</p>
                                    </div>
                                    <div className={cn("rounded-xl border p-4 bg-white", competitionColor(selectedNiche.competition).replace(/bg-\S+/g, ''))}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Competition</span>
                                            <Tag className="h-4 w-4 opacity-40" />
                                        </div>
                                        <p className="text-xl font-black whitespace-nowrap">{selectedNiche.competition}</p>
                                        <p className="text-xs mt-0.5 opacity-60">seller density</p>
                                    </div>
                                    {(() => {
                                        const baseRate = { Low: 5.2, Medium: 3.8, High: 2.4, 'Very High': 1.6 }[selectedNiche.competition] ?? 2.4
                                        const cvr = (baseRate + Math.min(selectedNiche.growth, 150) * 0.008).toFixed(1)
                                        return (
                                        <div className="rounded-xl border border-violet-200 bg-white p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600">Conversion Rate</span>
                                                <TrendingUp className="h-4 w-4 text-violet-400 opacity-70" />
                                            </div>
                                            <p className="text-2xl font-black text-violet-900">{cvr}%</p>
                                            <p className="text-xs text-violet-500 mt-0.5 opacity-60">avg. estimate</p>
                                        </div>
                                        )
                                    })()}
                                </div>

                                {/* Revenue Chart */}
                                {(() => {
                                    // Build extended dataset for All Time (24 months = prev year + this year)
                                    const prevYearData = months.map(m => ({
                                        month: m.month + "'23",
                                        revenue: Math.round(m.searches * convRate * avgPriceMid * (1 - Math.min(g, 150) / 200)),
                                    }))
                                    const thisYearData = revenueData.map(d => ({ ...d, month: d.month + "'24" }))
                                    // 1M: last 4 weeks approximated from last month's revenue
                                    const lastRev = revenueData[revenueData.length - 1].revenue
                                    const oneMonthData = ['Wk 1','Wk 2','Wk 3','Wk 4'].map((wk, i) => ({
                                        month: wk,
                                        revenue: Math.round(lastRev / 4 * (0.85 + Math.sin(i * 1.4) * 0.15)),
                                    }))
                                    const chartData =
                                        revenueRange === '1M'  ? oneMonthData :
                                        revenueRange === '6M'  ? revenueData.slice(-6) :
                                        revenueRange === 'ALL' ? [...prevYearData, ...thisYearData] :
                                        revenueData
                                    const RANGES = [
                                        { key: '1M' as const, label: '1M' },
                                        { key: '6M' as const, label: '6M' },
                                        { key: '1Y' as const, label: '1Y' },
                                        { key: 'ALL' as const, label: 'All' },
                                    ]
                                    return (
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
                                        <div className="h-[200px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.18} />
                                                            <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`} width={42} />
                                                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)' }} formatter={(value: number) => [`$${value.toLocaleString()}`, 'Est. Revenue']} itemStyle={{ color: '#0f766e', fontWeight: 600 }} labelStyle={{ color: '#475569', fontWeight: 500 }} />
                                                    <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGradient)" dot={false} activeDot={{ r: 5, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    )
                                })()}

                                {/* Tags table */}
                                {(() => {
                                    const COMPS = ['Low', 'Medium', 'High', 'Very High'] as const
                                    const tagRows = tags.map((tag, i) => {
                                        // Seed deterministic values from tag string
                                        const seed = tag.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
                                        const baseVol = Math.round((sv * (0.05 + (seed % 40) / 100)))
                                        const comp = COMPS[(seed + i) % 4]
                                        const kwScore = Math.min(99, Math.max(20, Math.round(
                                            (selectedNiche.growth > 0 ? Math.min(selectedNiche.growth, 200) / 3 : 0) +
                                            (['Low', 'Medium'].includes(comp) ? 28 : 8) +
                                            Math.min(baseVol / 1200, 18) +
                                            (seed % 20)
                                        )))
                                        return { tag, volume: baseVol, comp, kwScore }
                                    })
                                    const compColor = (c: string) => {
                                        if (c === 'Low')       return 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                        if (c === 'Medium')    return 'text-amber-700   bg-amber-50   border-amber-200'
                                        if (c === 'High')      return 'text-rose-700    bg-rose-50    border-rose-200'
                                        return                         'text-purple-700  bg-purple-50  border-purple-200'
                                    }
                                    return (
                                    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="bg-teal-600 text-white text-xs font-bold uppercase tracking-wider">
                                                    <th className="px-4 py-3 w-[40%]">
                                                        <div className="flex items-center gap-2">
                                                            <Tag className="h-3.5 w-3.5 opacity-80" />
                                                            Tag
                                                            <button
                                                                onClick={() => { navigator.clipboard.writeText(tags.join(', ')); setCopiedTags(true); setTimeout(() => setCopiedTags(false), 2000) }}
                                                                className="flex items-center gap-1 text-[10px] font-semibold bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-md transition-colors normal-case tracking-normal"
                                                            >
                                                                {copiedTags ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy All</>}
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
                                                                    onClick={() => { navigator.clipboard.writeText(tag); setCopiedTag(tag); setTimeout(() => setCopiedTag(null), 1500) }}
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
                            </div>
                        </div>
                    )
                })()}

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

