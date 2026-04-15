'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/components/Toast'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, Area, AreaChart } from 'recharts'
import {
    Search, Download, Copy, Heart, TrendingUp, TrendingDown, Minus,
    DollarSign, Eye, ShoppingBag, Store, Tag, Star, ExternalLink,
    ArrowLeft, ChevronDown, ChevronUp, ChevronLeft, Check, Zap, BarChart2
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_SIMILAR = [
    { id: 1,  keyword: 'sarcastic shirt',      views: 5021,  listings: 4321,  sales: 3682,   price: 18.76, recommendation: 90 },
    { id: 2,  keyword: 'funny shirt',           views: 8214,  listings: 12431, sales: 14755,  price: 23.23, recommendation: 85 },
    { id: 3,  keyword: 'introvert shirt',       views: 3241,  listings: 2141,  sales: 3734,   price: 22.63, recommendation: 75 },
    { id: 4,  keyword: 'gift for her',          views: 24151, listings: 85112, sales: 129497, price: 76.39, recommendation: 60 },
    { id: 5,  keyword: 'introvert gift',        views: 6512,  listings: 8412,  sales: 8013,   price: 20.65, recommendation: 80 },
    { id: 6,  keyword: 'digital download',      views: 18412, listings: 41241, sales: 25023,  price: 5.76,  recommendation: 55 },
    { id: 7,  keyword: 'humor shirt',           views: 4212,  listings: 5214,  sales: 3331,   price: 18.29, recommendation: 82 },
    { id: 8,  keyword: 'gift for friend',       views: 16514, listings: 35124, sales: 37678,  price: 30.22, recommendation: 65 },
    { id: 9,  keyword: 'novelty tee',           views: 7832,  listings: 9201,  sales: 6120,   price: 19.99, recommendation: 77 },
    { id: 10, keyword: 'graphic tee men',       views: 11200, listings: 22400, sales: 18990,  price: 21.50, recommendation: 68 },
    { id: 11, keyword: 'cute cat shirt',        views: 9341,  listings: 7823,  sales: 5412,   price: 17.50, recommendation: 83 },
    { id: 12, keyword: 'vintage band tee',      views: 14200, listings: 31000, sales: 22100,  price: 24.99, recommendation: 71 },
    { id: 13, keyword: 'plant mom shirt',       views: 6021,  listings: 6310,  sales: 4820,   price: 19.00, recommendation: 78 },
    { id: 14, keyword: 'dog dad gift',          views: 8800,  listings: 14200, sales: 9900,   price: 22.00, recommendation: 66 },
    { id: 15, keyword: 'retro sunset tee',      views: 5500,  listings: 8900,  sales: 4100,   price: 20.00, recommendation: 74 },
    { id: 16, keyword: 'teacher appreciation', views: 19800, listings: 52000, sales: 38000,  price: 18.50, recommendation: 58 },
    { id: 17, keyword: 'camping lover shirt',   views: 4300,  listings: 5100,  sales: 3200,   price: 21.00, recommendation: 79 },
    { id: 18, keyword: 'bookworm gift',         views: 7100,  listings: 9800,  sales: 6700,   price: 16.99, recommendation: 81 },
    { id: 19, keyword: 'hiking tee',            views: 5900,  listings: 7200,  sales: 4500,   price: 23.00, recommendation: 76 },
    { id: 20, keyword: 'coffee lover shirt',    views: 13400, listings: 28500, sales: 20300,  price: 19.50, recommendation: 63 },
]

const MOCK_LISTINGS = [
    { id: 1,  title: 'Personalized Dog Shirt, Custom Dog Shirt with Name, Pet Lover Gift',         price: 8.00,  orders: 1542, favorites: 820,  age_months: 25, est_revenue: 12336, trend: 47.8,  img: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=100&q=80' },
    { id: 2,  title: 'Embroidered Poke Character Sweatshirt, Anime Shirt, Gamer Gift',             price: 13.00, orders: 2134, favorites: 1240, age_months: 21, est_revenue: 27742, trend: 76.5,  img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&q=80' },
    { id: 3,  title: 'Custom Comfort Colors Shirt, Vintage Washed Tee, Unisex Gift',               price: 21.00, orders: 842,  favorites: 510,  age_months: 4,  est_revenue: 17682, trend: 94.8,  img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=100&q=80' },
    { id: 4,  title: 'Funny Introvert Shirt, Antisocial Club Tee, Sarcastic Gift for Her',         price: 18.00, orders: 3201, favorites: 1780, age_months: 32, est_revenue: 57618, trend: -42.4, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&q=80' },
    { id: 5,  title: 'Plant Mom Graphic Tee, Botanical Shirt, Gardening Lover Gift',               price: 19.50, orders: 1780, favorites: 920,  age_months: 15, est_revenue: 34710, trend: 57.5,  img: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=100&q=80' },
    { id: 6,  title: 'Retro Sunset Vintage T-Shirt, 70s Style Beach Tee, Summer Gift',             price: 22.00, orders: 965,  favorites: 430,  age_months: 23, est_revenue: 21230, trend: 55.0,  img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=100&q=80' },
    { id: 7,  title: 'Coffee First Then Things Shirt, Funny Morning Tee, Caffeine Lover',          price: 17.00, orders: 2450, favorites: 1100, age_months: 26, est_revenue: 41650, trend: 105.0, img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=100&q=80' },
    { id: 8,  title: "Dog Dad Best Fur Dad Shirt, Personalized Pet Gift, Father's Day Tee",        price: 20.00, orders: 1120, favorites: 640,  age_months: 12, est_revenue: 22400, trend: -37.9, img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&q=80' },
    { id: 9,  title: 'Bookworm Reading Club Shirt, Book Lover Gift, Library Tee',                  price: 16.99, orders: 890,  favorites: 390,  age_months: 17, est_revenue: 15121, trend: 64.6,  img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=100&q=80' },
    { id: 10, title: 'Camping Hiking Adventure Shirt, Mountain Explorer Tee, Outdoors Gift',       price: 21.00, orders: 1340, favorites: 710,  age_months: 22, est_revenue: 28140, trend: 99.6,  img: 'https://images.unsplash.com/photo-1527856263669-12c3a0af2aa6?w=100&q=80' },
    { id: 11, title: 'Teacher Appreciation Shirt, Best Teacher Ever Tee, School Gift',             price: 18.50, orders: 2870, favorites: 1450, age_months: 31, est_revenue: 53095, trend: 48.7,  img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=100&q=80' },
    { id: 12, title: 'Yoga Flow Mindfulness Tee, Namaste Shirt, Meditation Lover Gift',            price: 24.00, orders: 710,  favorites: 320,  age_months: 13, est_revenue: 17040, trend: -36.7, img: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=100&q=80' },
    { id: 13, title: 'Cat Mom Fur Mama Shirt, Funny Kitten Tee, Cat Lover Gift',                   price: 17.50, orders: 1960, favorites: 980,  age_months: 18, est_revenue: 34300, trend: 62.2,  img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&q=80' },
    { id: 14, title: 'Astrology Zodiac Signs Tee, Celestial Moon Shirt, Spiritual Gift',           price: 19.00, orders: 1205, favorites: 560,  age_months: 20, est_revenue: 22895, trend: 108.4, img: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=100&q=80' },
    { id: 15, title: 'Halloween Pumpkin Witch Shirt, Spooky Season Tee, Fall Gift',                price: 15.00, orders: 3100, favorites: 1650, age_months: 19, est_revenue: 46500, trend: 83.1,  img: 'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=100&q=80' },
    { id: 16, title: 'Music Festival Concert Tee, Vintage Band Shirt, Music Lover Gift',           price: 25.00, orders: 880,  favorites: 400,  age_months: 16, est_revenue: 22000, trend: -29.5, img: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=100&q=80' },
    { id: 17, title: 'Running Marathon Training Shirt, Athlete Tee, Fitness Gift',                 price: 22.00, orders: 640,  favorites: 290,  age_months: 14, est_revenue: 14080, trend: 71.3,  img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=100&q=80' },
    { id: 18, title: "Best Mom Ever Floral Tee, Mother's Day Gift Shirt, Mama Tee",                price: 19.00, orders: 2680, favorites: 1320, age_months: 25, est_revenue: 50920, trend: 118.6, img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=100&q=80' },
    { id: 19, title: 'Pizza Lover Foodie Shirt, Funny Italian Tee, Food Gift for Him',             price: 16.00, orders: 1450, favorites: 680,  age_months: 15, est_revenue: 23200, trend: -33.2, img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&q=80' },
    { id: 20, title: 'Beach Summer Vibes Tee, Tropical Shirt, Vacation Gift for Her',              price: 20.00, orders: 1890, favorites: 940,  age_months: 23, est_revenue: 37800, trend: 89.4,  img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&q=80' },
]

const PRICING_DATA = [
    { range: '$0–10',   count: 45  },
    { range: '$10–25',  count: 120 },
    { range: '$25–50',  count: 85  },
    { range: '$50–100', count: 32  },
    { range: '$100+',   count: 16  },
]

const VOLUME_TREND = [
    { month: 'Jan', searches: 9800  },
    { month: 'Feb', searches: 10200 },
    { month: 'Mar', searches: 10800 },
    { month: 'Apr', searches: 11200 },
    { month: 'May', searches: 10600 },
    { month: 'Jun', searches: 11800 },
    { month: 'Jul', searches: 12100 },
    { month: 'Aug', searches: 11500 },
    { month: 'Sep', searches: 12000 },
    { month: 'Oct', searches: 12300 },
    { month: 'Nov', searches: 12100 },
    { month: 'Dec', searches: 12500 },
]

const ROWS_PER_PAGE = 10

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({
    label, value, sub, icon, color,
}: {
    label: string; value: string; sub?: string; icon: React.ReactNode; color: string;
}) => (
    <div className={cn('rounded-2xl border p-5 flex flex-col gap-3', color)}>
        <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</span>
            <div className="opacity-60">{icon}</div>
        </div>
        <div>
            <div className="text-3xl font-black tracking-tight">{value}</div>
            {sub && <div className="text-xs mt-0.5 opacity-60 font-medium">{sub}</div>}
        </div>
    </div>
)

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function KeywordAnalyzerPage() {
    const params = useParams()
    const router = useRouter()
    const rawQuery = params?.query as string || 'Unknown'
    const decodedQuery = decodeURIComponent(rawQuery).replace(/\+/g, ' ')

    const searchScore = 78

    const [similarPage, setSimilarPage] = useState(1)
    const totalSimilarPages = Math.ceil(MOCK_SIMILAR.length / ROWS_PER_PAGE)
    const pagedSimilar = MOCK_SIMILAR.slice((similarPage - 1) * ROWS_PER_PAGE, similarPage * ROWS_PER_PAGE)

    const [listingsPage, setListingsPage] = useState(1)
    const totalListingPages = Math.ceil(MOCK_LISTINGS.length / ROWS_PER_PAGE)
    const pagedListings = MOCK_LISTINGS.slice((listingsPage - 1) * ROWS_PER_PAGE, listingsPage * ROWS_PER_PAGE)

    const [listingSearch, setListingSearch] = useState('')
    const filteredListings = MOCK_LISTINGS.filter(l =>
        l.title.toLowerCase().includes(listingSearch.toLowerCase())
    )
    const pagedFiltered = filteredListings.slice((listingsPage - 1) * ROWS_PER_PAGE, listingsPage * ROWS_PER_PAGE)
    const totalFilteredPages = Math.ceil(filteredListings.length / ROWS_PER_PAGE)

    const [copiedTag, setCopiedTag] = useState<string | null>(null)

    const supabase = createClient()
    const { success, error } = useToast()
    const [savedIds, setSavedIds] = useState<Set<number>>(new Set())
    const [savedDbIds, setSavedDbIds] = useState<Record<number, string>>({})

    useEffect(() => {
        const fetchSaved = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { data } = await supabase.from('saved_listings').select('id, listing_title').eq('user_id', user.id)
            if (data) {
                const titles = new Set(data.map((d: { listing_title: string }) => d.listing_title))
                const dbMap: Record<number, string> = {}
                MOCK_LISTINGS.forEach(l => {
                    const match = data.find((d: { listing_title: string; id: string }) => d.listing_title === l.title)
                    if (match) dbMap[l.id] = match.id
                })
                setSavedIds(new Set(MOCK_LISTINGS.filter(l => titles.has(l.title)).map(l => l.id)))
                setSavedDbIds(dbMap)
            }
        }
        fetchSaved()
    }, [])

    const handleSaveListing = useCallback(async (e: React.MouseEvent, item: typeof MOCK_LISTINGS[0]) => {
        e.stopPropagation()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        if (savedIds.has(item.id)) {
            const dbId = savedDbIds[item.id]
            setSavedIds(prev => { const s = new Set(prev); s.delete(item.id); return s })
            const { error: err } = await supabase.from('saved_listings').delete().eq('id', dbId)
            if (err) { setSavedIds(prev => new Set(prev).add(item.id)); error('Failed to remove listing') }
            else success('Listing removed', item.title)
        } else {
            setSavedIds(prev => new Set(prev).add(item.id))
            const { data, error: err } = await supabase.from('saved_listings').insert({
                user_id: user.id,
                listing_title: item.title,
                listing_url: `https://www.etsy.com/search?q=${encodeURIComponent(item.title)}`,
                price: item.price,
                image_url: item.img,
                total_sales: item.orders,
            }).select('id').single()
            if (err) { setSavedIds(prev => { const s = new Set(prev); s.delete(item.id); return s }); error('Failed to save listing') }
            else { success('Listing saved!', item.title); if (data) setSavedDbIds(prev => ({ ...prev, [item.id]: data.id })) }
        }
    }, [savedIds, savedDbIds])

    const [listingSortField, setListingSortField] = useState<'price' | 'trend' | 'age_months' | 'est_revenue' | 'orders' | null>(null)
    const [listingSortOrder, setListingSortOrder] = useState<'asc' | 'desc'>('desc')

    const handleListingSort = (field: 'price' | 'trend' | 'age_months' | 'est_revenue' | 'orders') => {
        if (listingSortField === field) setListingSortOrder(o => o === 'asc' ? 'desc' : 'asc')
        else { setListingSortField(field); setListingSortOrder('desc') }
        setListingsPage(1)
    }

    const sortedListings = [...filteredListings].sort((a, b) => {
        if (!listingSortField) return 0
        const av = a[listingSortField] as number, bv = b[listingSortField] as number
        return listingSortOrder === 'asc' ? av - bv : bv - av
    })
    const pagedSorted = sortedListings.slice((listingsPage - 1) * ROWS_PER_PAGE, listingsPage * ROWS_PER_PAGE)
    const totalSortedPages = Math.ceil(sortedListings.length / ROWS_PER_PAGE)

    const SortIcon = ({ field }: { field: 'price' | 'trend' | 'age_months' | 'est_revenue' | 'orders' }) => {
        if (listingSortField !== field) return <div className="w-4 h-4 opacity-30"><ChevronDown className="w-4 h-4" /></div>
        return listingSortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
    }

    const relatedTags = ['custom shirt', 'funny tee', 'gift idea', 'unisex shirt', 'graphic tee', 'novelty gift', 'handmade', 'etsy find']

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-in fade-in duration-500">

                {/* ── Back Nav ── */}
                <div className="flex items-center -mt-7">
                    <Button variant="ghost" className="pl-0 text-slate-500 hover:text-teal-600 gap-2" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" /> Back to Keyword Research
                    </Button>
                </div>

                {/* ── Keyword Banner ── */}
                <div className="rounded-2xl bg-teal-500/80 p-6 text-white shadow-xl shadow-teal-900/20">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        {/* Icon + name */}
                        <div className="h-16 w-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center flex-shrink-0 shadow-lg">
                            <Search className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-4xl font-black tracking-tight lowercase">{decodedQuery}</h1>
                                <a
                                    href={`https://www.etsy.com/search?q=${encodeURIComponent(decodedQuery)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 gap-2 h-8 text-sm">
                                        <ExternalLink className="h-3.5 w-3.5" /> Search on Etsy
                                    </Button>
                                </a>
                            </div>
                            <div className="flex flex-wrap items-center gap-6 mt-3 text-sm text-white/80">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-white/80 text-sm font-semibold uppercase tracking-wider">Keyword Score</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-32 h-2.5 bg-white/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-white rounded-full" style={{ width: `${searchScore}%` }} />
                                        </div>
                                        <span className="font-black text-white text-xl leading-none">{searchScore}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Right: inline search */}
                        <div className="relative flex-shrink-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                defaultValue={decodedQuery}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') router.push(`/dashboard/keyword-research/${encodeURIComponent(e.currentTarget.value)}`)
                                }}
                                className="pl-9 pr-12 py-2 w-56 bg-white border-0 rounded-xl font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                                placeholder="Search another keyword…"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-400">↵</div>
                        </div>
                    </div>
                </div>

                {/* ── Stats Grid ── */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                    <StatCard label="Search Volume"      value="12,500"   sub="monthly searches"   icon={<BarChart2 className="h-5 w-5" />}    color="bg-white border-teal-200 text-teal-900" />
                    <div className="rounded-2xl border bg-white border-emerald-200 text-emerald-900 p-5 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider opacity-70">Growth</span>
                            <div className="opacity-60"><TrendingUp className="h-5 w-5" /></div>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-2 text-3xl font-black tracking-tight">
                                <TrendingUp className="h-7 w-7 text-emerald-500" />
                                +60%
                            </div>
                            <div className="text-xs mt-0.5 opacity-60 font-medium">over 12 months</div>
                        </div>
                    </div>
                    <StatCard label="Total Views"        value="84,142"   sub="across all results" icon={<Eye className="h-5 w-5" />}          color="bg-white border-violet-200 text-violet-900" />
                    <div className="rounded-2xl border bg-white border-orange-200 text-orange-900 p-5 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider opacity-70">Competition</span>
                            <div className="opacity-60"><Store className="h-5 w-5" /></div>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-2 text-3xl font-black tracking-tight">
                                High
                                <span className="text-lg font-bold opacity-60">43,212</span>
                            </div>
                            <div className="text-xs mt-0.5 opacity-60 font-medium">seller density</div>
                        </div>
                    </div>
                    <StatCard label="Total Sales"        value="24,541"   sub="all time"           icon={<ShoppingBag className="h-5 w-5" />}  color="bg-white border-emerald-200 text-emerald-900" />
                    <StatCard label="Total Revenue"      value="$482k"    sub="estimated"          icon={<DollarSign className="h-5 w-5" />}   color="bg-white border-rose-200 text-rose-900" />
                </div>

                {/* ── Charts Row ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Search Volume Trend */}
                    <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-5">
                                <TrendingUp className="h-5 w-5 text-teal-600" />
                                <h3 className="text-base font-bold text-slate-800">12-Month Search Volume</h3>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={VOLUME_TREND} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="month" stroke="#334155" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#334155" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={36} />
                                    <Tooltip
                                        contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                                        formatter={(v: number) => [v.toLocaleString(), 'Searches']}
                                    />
                                    <Area type="monotone" dataKey="searches" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#volGradient)" dot={false} activeDot={{ r: 5, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Pricing Breakdown */}
                    <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-5">
                                <DollarSign className="h-5 w-5 text-teal-600" />
                                <h3 className="text-base font-bold text-slate-800">Pricing Breakdown</h3>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={PRICING_DATA} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dy={8} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} width={32} />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                                    />
                                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                        {PRICING_DATA.map((_, i) => (
                                            <Cell key={i} fill={i === 1 ? '#0d9488' : '#cbd5e1'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Top Listings Table ── */}
                <div>
                    {/* Search bar */}
                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search listings…"
                            value={listingSearch}
                            onChange={(e) => { setListingSearch(e.target.value); setListingsPage(1) }}
                            className="h-14 w-full pl-12 pr-4 rounded-xl border border-slate-200 bg-white text-base font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm"
                        />
                    </div>

                    <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-teal-500/80 text-white text-xs font-bold uppercase tracking-wider">
                                            <th className="w-10 pl-5 pr-2 py-4"></th>
                                            <th className="px-4 py-4 w-[28%]">Product</th>
                                            <th className="w-[12%] px-4 py-4 cursor-pointer hover:bg-teal-600/30 transition-colors" onClick={() => handleListingSort('trend')}>
                                                <div className="flex items-center gap-1">Trend <SortIcon field="trend" /></div>
                                            </th>
                                            <th className="w-[12%] px-4 py-4 cursor-pointer hover:bg-teal-600/30 transition-colors" onClick={() => handleListingSort('est_revenue')}>
                                                <div className="flex items-center gap-1">Revenue <SortIcon field="est_revenue" /></div>
                                            </th>
                                            <th className="w-[13%] px-4 py-4 cursor-pointer hover:bg-teal-600/30 transition-colors" onClick={() => handleListingSort('orders')}>
                                                <div className="flex items-center gap-1">Conversion <SortIcon field="orders" /></div>
                                            </th>
                                            <th className="w-[10%] px-4 py-4 cursor-pointer hover:bg-teal-600/30 transition-colors" onClick={() => handleListingSort('price')}>
                                                <div className="flex items-center gap-1">Price <SortIcon field="price" /></div>
                                            </th>
                                            <th className="w-[8%] px-4 py-4 cursor-pointer hover:bg-teal-600/30 transition-colors" onClick={() => handleListingSort('age_months')}>
                                                <div className="flex items-center gap-1">Age <SortIcon field="age_months" /></div>
                                            </th>
                                            <th className="px-4 py-4 text-right">Etsy</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pagedSorted.map((item, index) => {
                                            const globalIndex = (listingsPage - 1) * ROWS_PER_PAGE + index
                                            return (
                                                <tr key={item.id} className="group hover:bg-teal-50 hover:outline hover:outline-2 hover:outline-teal-500 hover:-outline-offset-1 hover:shadow-[inset_2px_0_0_#0d9488,inset_-2px_0_0_#0d9488]">
                                                    <td className="pl-5 pr-2 py-3.5">
                                                        <button
                                                            onClick={(e) => handleSaveListing(e, item)}
                                                            className={cn("transition-colors", savedIds.has(item.id) ? "text-rose-500" : "text-slate-300 hover:text-rose-500")}
                                                        >
                                                            <Heart className={cn("h-5 w-5", savedIds.has(item.id) && "fill-rose-500")} />
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 group-hover:border-teal-300 transition-colors">
                                                                <img src={item.img} alt="listing" className="h-full w-full object-cover" />
                                                            </div>
                                                            <span className="font-medium text-slate-800 group-hover:text-teal-700 line-clamp-1 transition-colors" title={item.title}>{item.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <div className={cn(
                                                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold",
                                                            item.trend >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                                        )}>
                                                            <TrendingUp className={cn("h-3 w-3", item.trend < 0 && "rotate-180")} />
                                                            {item.trend >= 0 ? '+' : ''}{item.trend}%
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <span className="text-sm font-semibold text-slate-700 tabular-nums">${(item.est_revenue / 1000).toFixed(1)}k</span>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <span className="text-sm font-semibold text-slate-700 tabular-nums">
                                                            {((item.orders / (item.favorites * 4)) * 100).toFixed(1)}%
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <span className="text-sm font-semibold text-slate-700 tabular-nums">${item.price.toFixed(2)}</span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-slate-400 text-xs tabular-nums">
                                                        {item.age_months} mo.
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right">
                                                        <a
                                                            href={`https://www.etsy.com/search?q=${encodeURIComponent(item.title)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline transition-colors"
                                                        >
                                                            View <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                        {pagedSorted.length === 0 && (
                                            <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400">No listings match your search.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {/* Listings pagination */}
                            <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between bg-slate-50/30">
                                <span className="text-xs text-slate-400">
                                    Showing {(listingsPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(listingsPage * ROWS_PER_PAGE, sortedListings.length)} of {sortedListings.length}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setListingsPage(p => Math.max(1, p - 1))} disabled={listingsPage === 1} className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    {Array.from({ length: totalSortedPages }, (_, i) => i + 1).map(p => (
                                        <button key={p} onClick={() => setListingsPage(p)} className={cn('px-2.5 py-1 rounded-lg text-xs font-bold transition-colors', listingsPage === p ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:bg-teal-50 hover:text-teal-600')}>
                                            {p}
                                        </button>
                                    ))}
                                    <button onClick={() => setListingsPage(p => Math.min(totalSortedPages, p + 1))} disabled={listingsPage === totalSortedPages} className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                        <ChevronLeft className="h-4 w-4 rotate-180" />
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Similar Keywords Table ── */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold text-slate-800">Similar Keywords</h2>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="bg-white shadow-sm border-slate-200 hover:bg-slate-50 text-slate-600">
                                <Download className="h-4 w-4 mr-2" /> Export to CSV
                            </Button>
                            <Button variant="outline" size="sm" className="bg-white shadow-sm border-slate-200 hover:bg-slate-50 text-slate-600">
                                <Copy className="h-4 w-4 mr-2" /> Copy all
                            </Button>
                        </div>
                    </div>

                    <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-teal-500/80 text-white text-xs font-bold uppercase tracking-wider">
                                            <th className="px-5 py-4 w-[35%]">Keyword</th>
                                            <th className="px-4 py-4">Views</th>
                                            <th className="px-4 py-4">Listings</th>
                                            <th className="px-4 py-4">Sales</th>
                                            <th className="px-4 py-4">Avg Price</th>
                                            <th className="px-4 py-4 w-44">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pagedSimilar.map((item) => (
                                            <tr key={item.id} className="group hover:bg-teal-50 hover:outline hover:outline-2 hover:outline-teal-500 hover:-outline-offset-1 hover:shadow-[inset_2px_0_0_#0d9488,inset_-2px_0_0_#0d9488]">
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-sm whitespace-nowrap text-xs group-hover:border-teal-300 transition-colors">
                                                            {item.keyword}
                                                        </span>
                                                        <button
                                                            className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                                            onClick={() => router.push(`/dashboard/keyword-research/${encodeURIComponent(item.keyword)}`)}
                                                            title="Analyze keyword"
                                                        >
                                                            <Search className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5 text-sm font-semibold text-slate-700">{item.views.toLocaleString()}</td>
                                                <td className="px-4 py-3.5 text-sm font-semibold text-slate-700">{item.listings.toLocaleString()}</td>
                                                <td className="px-4 py-3.5 text-sm font-semibold text-slate-700">{item.sales.toLocaleString()}</td>
                                                <td className="px-4 py-3.5 text-sm font-semibold text-slate-700">${item.price.toFixed(2)}</td>
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                            <div
                                                                className={cn('h-full rounded-full', item.recommendation > 70 ? 'bg-teal-500' : item.recommendation > 50 ? 'bg-amber-400' : 'bg-rose-500')}
                                                                style={{ width: `${item.recommendation}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-500 w-7 text-right">{item.recommendation}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Similar keywords pagination */}
                            <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between bg-slate-50/30">
                                <span className="text-xs text-slate-400">
                                    Showing {(similarPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(similarPage * ROWS_PER_PAGE, MOCK_SIMILAR.length)} of {MOCK_SIMILAR.length}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setSimilarPage(p => Math.max(1, p - 1))} disabled={similarPage === 1} className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    {Array.from({ length: totalSimilarPages }, (_, i) => i + 1).map(p => (
                                        <button key={p} onClick={() => setSimilarPage(p)} className={cn('px-2.5 py-1 rounded-lg text-xs font-bold transition-colors', similarPage === p ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:bg-teal-50 hover:text-teal-600')}>
                                            {p}
                                        </button>
                                    ))}
                                    <button onClick={() => setSimilarPage(p => Math.min(totalSimilarPages, p + 1))} disabled={similarPage === totalSimilarPages} className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                        <ChevronLeft className="h-4 w-4 rotate-180" />
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>


            </div>
        </DashboardLayout>
    )
}
