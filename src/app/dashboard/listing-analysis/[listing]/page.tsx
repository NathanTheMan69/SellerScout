'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/components/Toast'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Button } from '@/components/Button'
import {
    XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, Area, AreaChart,
} from 'recharts'
import {
    Search, Copy, TrendingUp, TrendingDown,
    Tag, ExternalLink,
    ArrowLeft, ChevronLeft, ChevronRight, Check,
    ImageOff, Star, Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Data ─────────────────────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function generateMonthly(volume: number, growth: number) {
    const start = volume / (1 + growth / 100)
    return MONTHS.map((month, i) => {
        const progress = i / 11
        const trend = start + (volume - start) * progress
        return { month, searches: Math.max(100, Math.round(trend + volume * 0.04 * Math.sin(i * 1.2))) }
    })
}

const NICHES = [
    { id: 'n1',  niche: 'Minimalist Jewelry',       keyword: 'minimalist jewelry',      category: 'Jewelry',       avgPrice: '$28–$65',   competition: 'High',      growth: 88,   search_volume: 61000, image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=800&q=80',  monthly_searches: generateMonthly(61000, 88)  },
    { id: 'n2',  niche: 'Printable Wall Art',        keyword: 'printable wall art',      category: 'Digital',       avgPrice: '$3–$12',    competition: 'High',      growth: -45,  search_volume: 28000, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',  monthly_searches: generateMonthly(28000, -45) },
    { id: 'n3',  niche: 'Digital Planners',          keyword: 'digital planner',         category: 'Digital',       avgPrice: '$5–$20',    competition: 'Medium',    growth: 210,  search_volume: 32000, image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80',  monthly_searches: generateMonthly(32000, 210) },
    { id: 'n4',  niche: 'Soy Candles',               keyword: 'handmade soy candle',     category: 'Home Decor',    avgPrice: '$12–$35',   competition: 'Medium',    growth: 55,   search_volume: 35000, image: 'https://images.unsplash.com/photo-1603905623639-cbe42eea3087?w=800&q=80',  monthly_searches: generateMonthly(35000, 55)  },
    { id: 'n5',  niche: 'Custom T-Shirts',           keyword: 'custom shirt',            category: 'Clothing',      avgPrice: '$25–$45',   competition: 'Very High', growth: 22,   search_volume: 74000, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',  monthly_searches: generateMonthly(74000, 22)  },
    { id: 'n6',  niche: 'Macramé & Fiber Art',       keyword: 'macrame wall hanging',    category: 'Home Decor',    avgPrice: '$35–$120',  competition: 'Low',       growth: 92,   search_volume: 22000, image: 'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?w=800&q=80',  monthly_searches: generateMonthly(22000, 92)  },
    { id: 'n7',  niche: 'Personalized Gifts',        keyword: 'personalized gift',       category: 'Gifts',         avgPrice: '$20–$60',   competition: 'High',      growth: 103,  search_volume: 57000, image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80',  monthly_searches: generateMonthly(57000, 103) },
    { id: 'n8',  niche: 'Nursery Decor',             keyword: 'nursery decor',           category: 'Baby',          avgPrice: '$15–$50',   competition: 'Medium',    growth: 119,  search_volume: 33000, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',  monthly_searches: generateMonthly(33000, 119) },
    { id: 'n9',  niche: 'Beaded Bracelets',          keyword: 'beaded bracelet set',     category: 'Jewelry',       avgPrice: '$10–$30',   competition: 'Medium',    growth: 174,  search_volume: 38000, image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80',  monthly_searches: generateMonthly(38000, 174) },
    { id: 'n10', niche: 'Custom Pet Portraits',      keyword: 'custom pet portrait',     category: 'Art',           avgPrice: '$25–$80',   competition: 'High',      growth: 145,  search_volume: 54000, image: 'https://images.unsplash.com/photo-1583511655826-05700442982a?w=800&q=80',  monthly_searches: generateMonthly(54000, 145) },
    { id: 'n11', niche: 'Sticker Packs',             keyword: 'sticker pack',            category: 'Stationery',    avgPrice: '$3–$8',     competition: 'High',      growth: 38,   search_volume: 74000, image: 'https://images.unsplash.com/photo-1574126154517-d1e0d89ef264?w=800&q=80',  monthly_searches: generateMonthly(74000, 38)  },
    { id: 'n12', niche: 'Boho Wedding Decor',        keyword: 'boho wedding decor',      category: 'Wedding',       avgPrice: '$15–$60',   competition: 'Medium',    growth: 67,   search_volume: 41000, image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80',  monthly_searches: generateMonthly(41000, 67)  },
    { id: 'n13', niche: 'Embroidery Hoop Art',       keyword: 'embroidery hoop art',     category: 'Art',           avgPrice: '$15–$45',   competition: 'Low',       growth: 131,  search_volume: 14000, image: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800&q=80',  monthly_searches: generateMonthly(14000, 131) },
    { id: 'n14', niche: 'Resin Coaster Sets',        keyword: 'resin coaster set',       category: 'Home Decor',    avgPrice: '$20–$50',   competition: 'Low',       growth: 118,  search_volume: 21000, image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=800&q=80',  monthly_searches: generateMonthly(21000, 118) },
    { id: 'n15', niche: 'Crystal Healing Sets',      keyword: 'crystal healing set',     category: 'Wellness',      avgPrice: '$15–$45',   competition: 'Medium',    growth: 143,  search_volume: 27000, image: 'https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?w=800&q=80',  monthly_searches: generateMonthly(27000, 143) },
    { id: 'n16', niche: 'Wax Seal Stamp Kits',       keyword: 'wax seal stamp kit',      category: 'Stationery',    avgPrice: '$12–$35',   competition: 'Low',       growth: 199,  search_volume: 14500, image: 'https://images.unsplash.com/photo-1585075928489-f58b6a5e9e8a?w=800&q=80',  monthly_searches: generateMonthly(14500, 199) },
    { id: 'n17', niche: 'Custom Dog Bandanas',       keyword: 'custom dog bandana',      category: 'Pet Supplies',  avgPrice: '$8–$20',    competition: 'Low',       growth: 189,  search_volume: 16000, image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',  monthly_searches: generateMonthly(16000, 189) },
    { id: 'n18', niche: 'Affirmation Card Decks',    keyword: 'affirmation card deck',   category: 'Wellness',      avgPrice: '$12–$30',   competition: 'Low',       growth: 221,  search_volume: 12000, image: 'https://images.unsplash.com/photo-1571019613914-85f342c6a11e?w=800&q=80',  monthly_searches: generateMonthly(12000, 221) },
    { id: 'n19', niche: 'Dried Flower Bouquets',     keyword: 'dried flower bouquet',    category: 'Home Decor',    avgPrice: '$18–$55',   competition: 'Medium',    growth: 161,  search_volume: 31000, image: 'https://images.unsplash.com/photo-1490750967868-88df5691cc16?w=800&q=80',  monthly_searches: generateMonthly(31000, 161) },
    { id: 'n20', niche: 'Birth Flower Necklaces',    keyword: 'birth flower necklace',   category: 'Jewelry',       avgPrice: '$18–$48',   competition: 'Medium',    growth: 193,  search_volume: 41000, image: 'https://images.unsplash.com/photo-1615812214207-34e3be6812df?w=800&q=80',  monthly_searches: generateMonthly(41000, 193) },
    { id: 'n21', niche: 'Clay Earrings',             keyword: 'clay earrings handmade',  category: 'Jewelry',       avgPrice: '$10–$28',   competition: 'Medium',    growth: 182,  search_volume: 24000, image: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=800&q=80',  monthly_searches: generateMonthly(24000, 182) },
    { id: 'n22', niche: 'Mushroom Art Prints',       keyword: 'mushroom art print',      category: 'Art',           avgPrice: '$4–$15',    competition: 'Low',       growth: 245,  search_volume: 11000, image: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800&q=80',  monthly_searches: generateMonthly(11000, 245) },
    { id: 'n23', niche: 'Tarot Card Decks',          keyword: 'tarot card deck',         category: 'Wellness',      avgPrice: '$20–$55',   competition: 'Medium',    growth: 158,  search_volume: 30000, image: 'https://images.unsplash.com/photo-1601024445121-e294ce1e3d4e?w=800&q=80',  monthly_searches: generateMonthly(30000, 158) },
    { id: 'n24', niche: 'Personalized Keychains',    keyword: 'personalized keychain',   category: 'Accessories',   avgPrice: '$8–$22',    competition: 'Medium',    growth: 98,   search_volume: 29000, image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800&q=80',  monthly_searches: generateMonthly(29000, 98)  },
    { id: 'n25', niche: 'Linen Tote Bags',           keyword: 'linen tote bag',          category: 'Accessories',   avgPrice: '$12–$30',   competition: 'Low',       growth: 153,  search_volume: 21000, image: 'https://images.unsplash.com/photo-1544816565-a62c5d3a0e35?w=800&q=80',  monthly_searches: generateMonthly(21000, 153) },
    { id: 'n26', niche: 'Terracotta Planters',       keyword: 'terracotta planter',      category: 'Home Decor',    avgPrice: '$15–$45',   competition: 'Low',       growth: 138,  search_volume: 25000, image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80',  monthly_searches: generateMonthly(25000, 138) },
    { id: 'n27', niche: 'Moon Phase Wall Decor',     keyword: 'moon phase wall decor',   category: 'Home Decor',    avgPrice: '$15–$40',   competition: 'Medium',    growth: 144,  search_volume: 26500, image: 'https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=800&q=80',  monthly_searches: generateMonthly(26500, 144) },
    { id: 'n28', niche: 'Friendship Bracelet Kits',  keyword: 'friendship bracelet kit', category: 'Accessories',   avgPrice: '$8–$22',    competition: 'Low',       growth: 217,  search_volume: 28500, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',  monthly_searches: generateMonthly(28500, 217) },
    { id: 'n29', niche: 'Custom Star Maps',          keyword: 'custom star map',         category: 'Gifts',         avgPrice: '$15–$50',   competition: 'Medium',    growth: 105,  search_volume: 37000, image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80',  monthly_searches: generateMonthly(37000, 105) },
    { id: 'n30', niche: 'Gratitude Journals',        keyword: 'gratitude journal',       category: 'Stationery',    avgPrice: '$10–$28',   competition: 'High',      growth: 73,   search_volume: 38000, image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80',  monthly_searches: generateMonthly(38000, 73)  },
]


const compColor = (c: string) => {
    if (c === 'Low')       return 'text-emerald-700 bg-emerald-50 border-emerald-200'
    if (c === 'Medium')    return 'text-amber-700   bg-amber-50   border-amber-200'
    if (c === 'High')      return 'text-rose-700    bg-rose-50    border-rose-200'
    if (c === 'Very High') return 'text-purple-700  bg-purple-50  border-purple-200'
    return 'text-slate-600 bg-slate-50 border-slate-200'
}

const compColorWhite = (c: string) => {
    if (c === 'Low')       return 'text-emerald-700 bg-white border-emerald-200'
    if (c === 'Medium')    return 'text-amber-700   bg-white border-amber-200'
    if (c === 'High')      return 'text-rose-700    bg-white border-rose-200'
    if (c === 'Very High') return 'text-purple-700  bg-white border-purple-200'
    return 'text-slate-600 bg-white border-slate-200'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ListingDetailPage() {
    const params = useParams()
    const router = useRouter()
    const decoded = decodeURIComponent((params?.listing as string) || '').replace(/\+/g, ' ')
    const niche = NICHES.find(n => n.niche.toLowerCase() === decoded.toLowerCase()) ?? NICHES[0]

    // ── Derived stats ──
    const seed = niche.id.charCodeAt(1)
    const compFactor = { Low: 0.048, Medium: 0.032, High: 0.022, 'Very High': 0.012 }[niche.competition] ?? 0.022
    const baseRevMonth = Math.round(niche.search_volume * compFactor * 28)
    const totalOrders  = Math.round(niche.search_volume * compFactor * 8)
    const convRate     = { Low: 5.2, Medium: 3.8, High: 2.4, 'Very High': 1.6 }[niche.competition] ?? 2.4
    const reviews      = 120 + (seed % 1800)
    const ageMonths    = 12 + (seed % 36)
    const ageLabel     = ageMonths >= 12 ? `${Math.floor(ageMonths / 12)}y ${ageMonths % 12}m old` : `${ageMonths}m old`
    const [avgLo, avgHi] = niche.avgPrice.replace(/\$/g, '').split('–').map(Number)

    // ── Listing image carousel ──
    const listingImages = [
        niche.image,
        ...NICHES.filter(n => n.id !== niche.id).slice(seed % 6, (seed % 6) + 3).map(n => n.image),
    ].slice(0, 4)
    const [imgIdx, setImgIdx] = useState(0)
    const prevImg = () => setImgIdx(i => (i - 1 + listingImages.length) % listingImages.length)
    const nextImg = () => setImgIdx(i => (i + 1) % listingImages.length)

    const listingScore = Math.min(99, Math.max(20, Math.round(
        (niche.growth > 0 ? Math.min(niche.growth, 200) / 5 : 0) +
        ({ Low: 35, Medium: 25, High: 12, 'Very High': 5 }[niche.competition] ?? 12) +
        Math.min(niche.search_volume / 2500, 20)
    )))

    // Sub-scores derived from seed

    // ── Shop mock data ──
    const shopNames = ['CozyCreations', 'ArtisanNook', 'CraftedWithLove', 'TheHappyMaker', 'BrightThreads', 'WildBloomCo', 'PinewoodStudio', 'SilkAndSage', 'GoldenHourCo', 'ThePaperWren', 'BlueJayDesigns', 'MapleCraft', 'SunriseGoods', 'TerraWorkshop', 'MossyOakCo', 'IndigoMade']
    const shopName    = shopNames[seed % shopNames.length]
    const shopInitial = shopName[0]
    const shopSales   = totalOrders * (3 + (seed % 8))
    const shopListings = 12 + (seed % 88)
    const shopReviews  = reviews * (2 + (seed % 5))
    const shopAge     = 24 + (seed % 60)
    const shopEstYear  = new Date().getFullYear() - Math.floor(shopAge / 12)
    const shopRating   = (4.2 + (seed % 8) / 10).toFixed(1)
    const shopBg      = 'bg-teal-400'

    // ── Revenue chart ──
    const [revRange, setRevRange] = useState<'1M'|'6M'|'1Y'|'ALL'>('1Y')
    const monthlyRev = MONTHS.map((month, i) => {
        const progress = i / 11
        const trend = baseRevMonth * (1 - niche.growth/200) + baseRevMonth * (niche.growth/200) * 2 * progress
        return { month, revenue: Math.max(100, Math.round(trend + trend * 0.06 * Math.sin(i * 1.3))) }
    })
    const prevYearRev = monthlyRev.map(d => ({ month: d.month + "'23", revenue: Math.round(d.revenue * 0.72) }))
    const thisYearRev = monthlyRev.map(d => ({ ...d, month: d.month + "'24" }))
    const lastRev = monthlyRev[11].revenue
    const oneMonthRev = ['Wk 1','Wk 2','Wk 3','Wk 4'].map((wk, i) => ({
        month: wk, revenue: Math.round(lastRev / 4 * (0.88 + Math.sin(i * 1.4) * 0.12))
    }))
    const revData = revRange === '1M' ? oneMonthRev : revRange === '6M' ? monthlyRev.slice(-6) : revRange === 'ALL' ? [...prevYearRev, ...thisYearRev] : monthlyRev

    // ── Pricing distribution ──
    // ── Tags ──
    const COMPS = ['Low','Medium','High','Very High'] as const
    const tags = [niche.keyword, ...niche.keyword.split(' '), 'handmade', 'gift', 'etsy', 'custom', 'personalized', niche.category.toLowerCase()]
        .filter((v, i, a) => a.indexOf(v) === i && v.length > 2).slice(0, 10)
        .map((tag, i) => {
            const s = tag.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
            const vol  = Math.round(niche.search_volume * (0.05 + (s % 40) / 100))
            const comp = COMPS[(s + i) % 4]
            const score = Math.min(99, Math.max(18, Math.round(
                (niche.growth > 0 ? Math.min(niche.growth, 200) / 5 : 0) +
                (['Low','Medium'].includes(comp) ? 28 : 8) +
                Math.min(vol / 1200, 18) + (s % 18)
            )))
            const trend = Math.round((-60 + (s * 3 + i * 17) % 180) * 10) / 10
            return { tag, vol, comp, score, trend }
        })

    const [copiedTag, setCopiedTag] = useState<string|null>(null)
    const [copiedAll, setCopiedAll] = useState(false)

    // ── Save ──
    const supabase = createClient()
    const { success } = useToast()

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-in fade-in duration-500">

                {/* ── Back nav ── */}
                <div className="flex items-center -mt-7">
                    <Button variant="ghost" className="pl-0 text-slate-500 hover:text-teal-600 gap-2" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" /> Back to Listing Analysis
                    </Button>
                </div>

                {/* ── Hero: Image + Details + Chart ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-5 items-stretch">

                    {/* Left: square image carousel — width drives the square size */}
                    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm aspect-square relative self-start group/carousel">
                        {/* Fallback icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <ImageOff className="h-12 w-12 text-slate-300" />
                        </div>

                        {/* Images */}
                        {listingImages.map((src, i) => (
                            <img key={i} src={src} alt={`${niche.niche} ${i + 1}`}
                                className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-300", i === imgIdx ? "opacity-100" : "opacity-0")}
                                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                        ))}

                        {/* Arrow buttons */}
                        <button onClick={prevImg}
                            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 backdrop-blur-sm">
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button onClick={nextImg}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 backdrop-blur-sm">
                            <ChevronRight className="h-4 w-4" />
                        </button>

                        {/* Dots — float just above the info bar */}
                        <div className="absolute bottom-[18px] left-0 right-0 flex items-center justify-center z-10">
                            <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
                                {listingImages.map((_, i) => (
                                    <button key={i} onClick={() => setImgIdx(i)}
                                        className={cn("rounded-full transition-all duration-200", i === imgIdx ? "w-4 h-2 bg-white shadow-sm" : "w-2 h-2 bg-white/40 hover:bg-white/70")} />
                                ))}
                            </div>
                        </div>

                        {/* Bottom info bar */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 via-black/50 to-transparent px-4 pt-10 pb-3 flex items-end justify-between">
                            <div>
                                    <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-0.5">Listing Price</p>
                                    <p className="text-lg font-black text-white">{niche.avgPrice}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-0.5">Product Type</p>
                                    <p className="text-lg font-black text-white">{niche.category}</p>
                                </div>
                        </div>
                    </div>

                    {/* Right: info — sized to match the 400px square */}
                    <div className="flex flex-col gap-3">

                        {/* Teal title header */}
                        <div className="rounded-2xl bg-teal-500/80 px-5 py-4 text-white shadow-lg shadow-teal-900/15">
                            <div className="flex items-start justify-between gap-3 mb-1.5">
                                <h1 className="text-2xl font-black tracking-tight capitalize text-white leading-snug">{niche.niche}</h1>
                                <a href={`https://www.etsy.com/search?q=${encodeURIComponent(niche.keyword)}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                                    <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-white/20 border border-white/30 px-3 py-1.5 rounded-lg hover:bg-white/30 transition-colors whitespace-nowrap">
                                        <ExternalLink className="h-3 w-3" /> View on Etsy
                                    </button>
                                </a>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap mb-2.5">
                                <span className="text-xs font-semibold bg-black/25 text-white/90 px-2.5 py-0.5 rounded-full">{niche.category}</span>
                                <span className="text-white/70 text-sm">{ageLabel}</span>
                                {niche.growth > 100 && (
                                    <span className="text-xs font-bold bg-amber-400/30 text-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-amber-300 text-amber-300" /> High Growth
                                    </span>
                                )}
                                {niche.competition === 'Low' && (
                                    <span className="text-xs font-bold bg-emerald-400/30 text-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        <Zap className="h-3 w-3" /> Low Competition
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2.5">
                                <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">Listing Score</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-28 h-2 bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-white rounded-full" style={{ width: `${listingScore}%` }} />
                                    </div>
                                    <span className="font-black text-white text-base leading-none">{listingScore}</span>
                                </div>
                            </div>
                        </div>

                        {/* Key stats row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1 items-stretch content-stretch">
                            <div className="bg-white border border-teal-200 text-teal-900 rounded-xl p-4 shadow-sm flex flex-col justify-center">
                                <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Revenue</p>
                                <p className="text-2xl font-black">
                                    {baseRevMonth >= 1000 ? `$${(baseRevMonth/1000).toFixed(0)}k` : `$${baseRevMonth}`}
                                </p>
                                <p className="text-xs opacity-60 mt-0.5">est. per month</p>
                            </div>
                            <div className="bg-white border border-sky-200 text-sky-900 rounded-xl p-4 shadow-sm flex flex-col justify-center">
                                <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Sales</p>
                                <p className="text-2xl font-black">{totalOrders.toLocaleString()}</p>
                                <p className={cn("text-xs font-semibold mt-0.5 flex items-center gap-0.5", niche.growth >= 0 ? "text-emerald-600" : "text-rose-500")}>
                                    {niche.growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                    {niche.growth >= 0 ? '+' : ''}{niche.growth}%
                                </p>
                            </div>
                            <div className="bg-white border border-violet-200 text-violet-900 rounded-xl p-4 shadow-sm flex flex-col justify-center">
                                <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Conversion</p>
                                <p className="text-2xl font-black">{convRate}%</p>
                                <p className="text-xs opacity-60 mt-0.5">avg rate</p>
                            </div>
                            <div className={cn("rounded-xl p-4 border shadow-sm flex flex-col justify-center", compColorWhite(niche.competition))}>
                                <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Competition</p>
                                <p className="text-2xl font-black whitespace-nowrap">{niche.competition}</p>
                                <p className="text-xs mt-0.5 opacity-60">{niche.avgPrice} avg</p>
                            </div>
                        </div>

                        {/* Second row of stat cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1 items-stretch content-stretch">
                            <div className="bg-white border border-teal-200 text-teal-900 rounded-xl p-4 shadow-sm flex flex-col justify-center">
                                <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Monthly Revenue</p>
                                <p className="text-2xl font-black">
                                    {baseRevMonth >= 1000 ? `$${(baseRevMonth/1000).toFixed(0)}k` : `$${baseRevMonth}`}
                                </p>
                                <p className="text-xs opacity-60 mt-0.5">est. per month</p>
                            </div>
                            <div className="bg-white border border-sky-200 text-sky-900 rounded-xl p-4 shadow-sm flex flex-col justify-center">
                                <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Monthly Sales</p>
                                <p className="text-2xl font-black">{Math.round(totalOrders / 12).toLocaleString()}</p>
                                <p className="text-xs opacity-60 mt-0.5">units / month</p>
                            </div>
                            <div className={cn("rounded-xl p-4 border shadow-sm flex flex-col justify-center", niche.growth >= 0 ? "bg-white border-emerald-200 text-emerald-900" : "bg-white border-rose-200 text-rose-900")}>
                                <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Growth</p>
                                <p className="text-2xl font-black flex items-center gap-1">
                                    {niche.growth >= 0 ? <TrendingUp className="h-5 w-5 text-emerald-500" /> : <TrendingDown className="h-5 w-5 text-rose-500" />}
                                    {niche.growth >= 0 ? '+' : ''}{niche.growth}%
                                </p>
                                <p className="text-xs mt-0.5 opacity-60">over 12 months</p>
                            </div>
                            <div className="bg-white border border-amber-200 text-amber-900 rounded-xl p-4 shadow-sm flex flex-col justify-center">
                                <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Reviews</p>
                                <p className="text-2xl font-black">{reviews.toLocaleString()}</p>
                                <p className="text-xs opacity-60 mt-0.5">total reviews</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Shop Owner + Revenue Chart ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-5">

                    {/* Shop owner card */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col gap-4">

                        {/* Teal header */}
                        <div className="rounded-t-2xl bg-teal-500/80 px-5 py-4 text-white flex items-center gap-4">
                            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-white text-2xl font-black flex-shrink-0 shadow-lg border-2 border-white/30", shopBg)}>
                                {shopInitial}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-lg font-black text-white truncate leading-tight">{shopName}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-600 border border-yellow-100 text-xs font-bold px-2 py-0.5 rounded-full">★ {shopRating}</span>
                                    <span className="text-white/40">·</span>
                                    <span className="text-xs text-white/70">Est. {shopEstYear}</span>
                                </div>
                            </div>
                            <a href={`https://www.etsy.com/shop/${shopName}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                                <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-white/20 border border-white/30 px-3 py-1.5 rounded-lg hover:bg-white/30 transition-colors">
                                    <ExternalLink className="h-3 w-3" /> Visit
                                </button>
                            </a>
                        </div>

                        <div className="px-5 grid grid-cols-4 gap-3">
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                                <p className="text-lg font-black text-slate-800">{shopSales * 30 >= 1000 ? `$${((shopSales * 30)/1000).toFixed(0)}k` : `$${shopSales * 30}`}</p>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Revenue</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                                <p className="text-lg font-black text-slate-800">{shopSales >= 1000 ? `${(shopSales/1000).toFixed(0)}k` : shopSales}</p>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Sales</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                                <p className="text-lg font-black text-slate-800">{shopListings}</p>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Listings</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                                <p className="text-lg font-black text-slate-800">{shopReviews >= 1000 ? `${(shopReviews/1000).toFixed(1)}k` : shopReviews}</p>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Reviews</p>
                            </div>
                        </div>

                        <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-2.5">
                            {[
                                { label: 'Avg. price', value: niche.avgPrice },
                                { label: 'Niche', value: niche.category },
                                { label: 'Competition', value: niche.competition },
                                { label: 'Avg. response time', value: '< 24 hours' },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400 font-medium">{label}</span>
                                    <span className="font-bold text-slate-700">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Revenue chart */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-bold text-slate-700">Est. Revenue</p>
                            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                                {(['1M','6M','1Y','ALL'] as const).map(r => (
                                    <button key={r} onClick={() => setRevRange(r)}
                                        className={cn("px-2.5 py-1 rounded-md text-xs font-semibold transition-all",
                                            revRange === r ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                        )}>
                                        {r === 'ALL' ? 'All' : r}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 min-h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revData} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="heroRevGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={6} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} width={40} />
                                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                                        formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />
                                    <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#heroRevGrad)" dot={false} activeDot={{ r: 5, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>


                {/* ── Related Keywords & Tags ── */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-teal-500/80 text-white text-xs font-bold uppercase tracking-wider">
                                <th className="px-4 py-3 w-[28%]">
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-3.5 w-3.5 opacity-80" /> Tags
                                        <button onClick={() => { navigator.clipboard.writeText(tags.map(t => t.tag).join(', ')); setCopiedAll(true); setTimeout(() => setCopiedAll(false), 1500) }}
                                            className="flex items-center gap-1 text-[10px] font-semibold bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-md transition-colors normal-case tracking-normal">
                                            {copiedAll ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy All</>}
                                        </button>
                                    </div>
                                </th>
                                <th className="px-4 py-3 w-[18%]">Volume</th>
                                <th className="px-4 py-3 w-[18%]">Competition</th>
                                <th className="px-4 py-3 w-[18%]">Trend</th>
                                <th className="px-4 py-3 w-[18%] text-right">Keyword Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tags.map(({ tag, vol, comp, score, trend }) => (
                                <tr key={tag} className="group hover:bg-teal-50 hover:outline hover:outline-2 hover:outline-teal-500 hover:-outline-offset-1 hover:shadow-[inset_2px_0_0_#0d9488,inset_-2px_0_0_#0d9488]">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => { navigator.clipboard.writeText(tag); setCopiedTag(tag); setTimeout(() => setCopiedTag(null), 1500) }}
                                                className="text-slate-300 hover:text-teal-500 transition-colors flex-shrink-0">
                                                {copiedTag === tag ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                            </button>
                                            <span className="font-medium text-slate-700 capitalize">{tag}</span>
                                            <button onClick={() => router.push(`/dashboard/keyword-research/${encodeURIComponent(tag)}`)}
                                                className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors opacity-0 group-hover:opacity-100" title="Analyse keyword">
                                                <Search className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 font-medium">{vol >= 1000 ? `${(vol/1000).toFixed(0)}k` : vol}</td>
                                    <td className="px-4 py-3">
                                        <span className={cn("text-[11px] font-bold px-2.5 py-0.5 rounded-full border", compColor(comp))}>{comp}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={cn("inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full", trend >= 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200")}>
                                            <TrendingUp className={cn("h-3 w-3", trend < 0 && "rotate-180")} />
                                            {trend >= 0 ? '+' : ''}{trend}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-teal-500 rounded-full" style={{ width: `${score}%` }} />
                                            </div>
                                            <span className="font-bold text-slate-700 text-xs w-6 text-right">{score}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </DashboardLayout>
    )
}
