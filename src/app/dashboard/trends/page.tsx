"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/Card"
import { DashboardLayout } from "@/components/DashboardLayout"
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Filter, X, ExternalLink, BarChart2, Tag, DollarSign, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/Button"
import { createClient } from "@/utils/supabase/client"
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
    ReferenceLine
} from "recharts"

interface TrendData {
    id: string
    keyword: string
    search_volume: number
    competition: string
    growth: number
    avg_price: string
    monthly_searches: { month: string, volume: number }[]
    category: string
    created_at: string
}

const ITEMS_PER_PAGE = 10

// Curated fallback dataset — always visible, merged with live Supabase data when available
const STATIC_TRENDS: TrendData[] = [
    { id: 's1',  keyword: 'digital planner 2025',        category: 'Digital',      search_volume: 32000, competition: 'Medium',    growth: 210,  avg_price: '$8–$22',   created_at: '', monthly_searches: [{ month:'Jan', volume:18000 },{ month:'Feb', volume:20000 },{ month:'Mar', volume:22000 },{ month:'Apr', volume:25000 },{ month:'May', volume:26000 },{ month:'Jun', volume:27000 },{ month:'Jul', volume:28000 },{ month:'Aug', volume:29000 },{ month:'Sep', volume:30000 },{ month:'Oct', volume:31000 },{ month:'Nov', volume:31500 },{ month:'Dec', volume:32000 }] },
    { id: 's2',  keyword: 'personalized leather gift',    category: 'Gifts',        search_volume: 45000, competition: 'High',       growth: 125,  avg_price: '$35–$90',  created_at: '', monthly_searches: [{ month:'Jan', volume:28000 },{ month:'Feb', volume:30000 },{ month:'Mar', volume:33000 },{ month:'Apr', volume:35000 },{ month:'May', volume:36000 },{ month:'Jun', volume:37000 },{ month:'Jul', volume:38000 },{ month:'Aug', volume:40000 },{ month:'Sep', volume:41000 },{ month:'Oct', volume:43000 },{ month:'Nov', volume:44000 },{ month:'Dec', volume:45000 }] },
    { id: 's3',  keyword: 'minimalist wall art',          category: 'Home Decor',   search_volume: 28000, competition: 'High',       growth: -45,  avg_price: '$3–$15',   created_at: '', monthly_searches: [{ month:'Jan', volume:42000 },{ month:'Feb', volume:40000 },{ month:'Mar', volume:38000 },{ month:'Apr', volume:36000 },{ month:'May', volume:34000 },{ month:'Jun', volume:33000 },{ month:'Jul', volume:32000 },{ month:'Aug', volume:31000 },{ month:'Sep', volume:30000 },{ month:'Oct', volume:29000 },{ month:'Nov', volume:28500 },{ month:'Dec', volume:28000 }] },
    { id: 's4',  keyword: 'custom name necklace',         category: 'Jewelry',      search_volume: 61000, competition: 'High',       growth: 88,   avg_price: '$20–$55',  created_at: '', monthly_searches: [{ month:'Jan', volume:40000 },{ month:'Feb', volume:43000 },{ month:'Mar', volume:46000 },{ month:'Apr', volume:49000 },{ month:'May', volume:51000 },{ month:'Jun', volume:53000 },{ month:'Jul', volume:55000 },{ month:'Aug', volume:57000 },{ month:'Sep', volume:58000 },{ month:'Oct', volume:59000 },{ month:'Nov', volume:60000 },{ month:'Dec', volume:61000 }] },
    { id: 's5',  keyword: 'beaded bracelet set',          category: 'Jewelry',      search_volume: 38000, competition: 'Medium',     growth: 174,  avg_price: '$12–$30',  created_at: '', monthly_searches: [{ month:'Jan', volume:14000 },{ month:'Feb', volume:17000 },{ month:'Mar', volume:20000 },{ month:'Apr', volume:22000 },{ month:'May', volume:25000 },{ month:'Jun', volume:27000 },{ month:'Jul', volume:29000 },{ month:'Aug', volume:31000 },{ month:'Sep', volume:33000 },{ month:'Oct', volume:35000 },{ month:'Nov', volume:36500 },{ month:'Dec', volume:38000 }] },
    { id: 's6',  keyword: 'macrame wall hanging',         category: 'Home Decor',   search_volume: 22000, competition: 'Low',        growth: 92,   avg_price: '$35–$120', created_at: '', monthly_searches: [{ month:'Jan', volume:11000 },{ month:'Feb', volume:12000 },{ month:'Mar', volume:13000 },{ month:'Apr', volume:14000 },{ month:'May', volume:15000 },{ month:'Jun', volume:16000 },{ month:'Jul', volume:17000 },{ month:'Aug', volume:18000 },{ month:'Sep', volume:19000 },{ month:'Oct', volume:20000 },{ month:'Nov', volume:21000 },{ month:'Dec', volume:22000 }] },
    { id: 's7',  keyword: 'custom pet portrait',          category: 'Art',          search_volume: 54000, competition: 'High',       growth: 145,  avg_price: '$25–$80',  created_at: '', monthly_searches: [{ month:'Jan', volume:30000 },{ month:'Feb', volume:33000 },{ month:'Mar', volume:36000 },{ month:'Apr', volume:38000 },{ month:'May', volume:40000 },{ month:'Jun', volume:42000 },{ month:'Jul', volume:44000 },{ month:'Aug', volume:46000 },{ month:'Sep', volume:48000 },{ month:'Oct', volume:50000 },{ month:'Nov', volume:52000 },{ month:'Dec', volume:54000 }] },
    { id: 's8',  keyword: 'printable budget planner',     category: 'Digital',      search_volume: 19000, competition: 'Low',        growth: 188,  avg_price: '$3–$10',   created_at: '', monthly_searches: [{ month:'Jan', volume:6000 },{ month:'Feb', volume:7500 },{ month:'Mar', volume:9000 },{ month:'Apr', volume:10500 },{ month:'May', volume:12000 },{ month:'Jun', volume:13000 },{ month:'Jul', volume:14000 },{ month:'Aug', volume:15000 },{ month:'Sep', volume:16000 },{ month:'Oct', volume:17000 },{ month:'Nov', volume:18000 },{ month:'Dec', volume:19000 }] },
    { id: 's9',  keyword: 'boho wedding decor',           category: 'Wedding',      search_volume: 41000, competition: 'Medium',     growth: 67,   avg_price: '$15–$60',  created_at: '', monthly_searches: [{ month:'Jan', volume:25000 },{ month:'Feb', volume:27000 },{ month:'Mar', volume:29000 },{ month:'Apr', volume:31000 },{ month:'May', volume:33000 },{ month:'Jun', volume:34000 },{ month:'Jul', volume:35000 },{ month:'Aug', volume:37000 },{ month:'Sep', volume:38000 },{ month:'Oct', volume:39000 },{ month:'Nov', volume:40000 },{ month:'Dec', volume:41000 }] },
    { id: 's10', keyword: 'handmade soy candle',          category: 'Home Decor',   search_volume: 35000, competition: 'Medium',     growth: 55,   avg_price: '$12–$35',  created_at: '', monthly_searches: [{ month:'Jan', volume:22000 },{ month:'Feb', volume:23000 },{ month:'Mar', volume:24000 },{ month:'Apr', volume:25000 },{ month:'May', volume:27000 },{ month:'Jun', volume:28000 },{ month:'Jul', volume:29000 },{ month:'Aug', volume:30000 },{ month:'Sep', volume:31000 },{ month:'Oct', volume:32000 },{ month:'Nov', volume:33500 },{ month:'Dec', volume:35000 }] },
    { id: 's11', keyword: 'personalized baby gift',       category: 'Gifts',        search_volume: 57000, competition: 'High',       growth: 103,  avg_price: '$20–$65',  created_at: '', monthly_searches: [{ month:'Jan', volume:35000 },{ month:'Feb', volume:37000 },{ month:'Mar', volume:39000 },{ month:'Apr', volume:41000 },{ month:'May', volume:43000 },{ month:'Jun', volume:45000 },{ month:'Jul', volume:47000 },{ month:'Aug', volume:49000 },{ month:'Sep', volume:51000 },{ month:'Oct', volume:53000 },{ month:'Nov', volume:55000 },{ month:'Dec', volume:57000 }] },
    { id: 's12', keyword: 'sticker pack',                 category: 'Stationery',   search_volume: 74000, competition: 'High',       growth: 38,   avg_price: '$3–$8',    created_at: '', monthly_searches: [{ month:'Jan', volume:53000 },{ month:'Feb', volume:55000 },{ month:'Mar', volume:57000 },{ month:'Apr', volume:59000 },{ month:'May', volume:61000 },{ month:'Jun', volume:63000 },{ month:'Jul', volume:65000 },{ month:'Aug', volume:67000 },{ month:'Sep', volume:69000 },{ month:'Oct', volume:70000 },{ month:'Nov', volume:72000 },{ month:'Dec', volume:74000 }] },
    { id: 's13', keyword: 'vintage style ring',           category: 'Jewelry',      search_volume: 26000, competition: 'Medium',     growth: 79,   avg_price: '$18–$55',  created_at: '', monthly_searches: [{ month:'Jan', volume:14000 },{ month:'Feb', volume:15000 },{ month:'Mar', volume:16000 },{ month:'Apr', volume:17000 },{ month:'May', volume:18000 },{ month:'Jun', volume:19000 },{ month:'Jul', volume:20000 },{ month:'Aug', volume:21500 },{ month:'Sep', volume:22500 },{ month:'Oct', volume:23500 },{ month:'Nov', volume:25000 },{ month:'Dec', volume:26000 }] },
    { id: 's14', keyword: 'nursery wall art printable',   category: 'Digital',      search_volume: 17000, competition: 'Low',        growth: 162,  avg_price: '$3–$10',   created_at: '', monthly_searches: [{ month:'Jan', volume:6500 },{ month:'Feb', volume:7500 },{ month:'Mar', volume:8500 },{ month:'Apr', volume:9500 },{ month:'May', volume:10500 },{ month:'Jun', volume:11500 },{ month:'Jul', volume:12500 },{ month:'Aug', volume:13500 },{ month:'Sep', volume:14500 },{ month:'Oct', volume:15500 },{ month:'Nov', volume:16000 },{ month:'Dec', volume:17000 }] },
    { id: 's15', keyword: 'chunky knit blanket',          category: 'Home Decor',   search_volume: 30000, competition: 'Medium',     growth: 44,   avg_price: '$45–$120', created_at: '', monthly_searches: [{ month:'Jan', volume:20000 },{ month:'Feb', volume:20500 },{ month:'Mar', volume:21000 },{ month:'Apr', volume:22000 },{ month:'May', volume:23000 },{ month:'Jun', volume:24000 },{ month:'Jul', volume:25000 },{ month:'Aug', volume:26000 },{ month:'Sep', volume:27000 },{ month:'Oct', volume:28000 },{ month:'Nov', volume:29000 },{ month:'Dec', volume:30000 }] },
    { id: 's16', keyword: 'custom wedding invitation',    category: 'Wedding',      search_volume: 48000, competition: 'High',       growth: 72,   avg_price: '$10–$40',  created_at: '', monthly_searches: [{ month:'Jan', volume:28000 },{ month:'Feb', volume:30000 },{ month:'Mar', volume:32000 },{ month:'Apr', volume:34000 },{ month:'May', volume:36000 },{ month:'Jun', volume:38000 },{ month:'Jul', volume:40000 },{ month:'Aug', volume:42000 },{ month:'Sep', volume:43000 },{ month:'Oct', volume:45000 },{ month:'Nov', volume:46500 },{ month:'Dec', volume:48000 }] },
    { id: 's17', keyword: 'embroidery hoop art',          category: 'Art',          search_volume: 14000, competition: 'Low',        growth: 131,  avg_price: '$15–$45',  created_at: '', monthly_searches: [{ month:'Jan', volume:5000 },{ month:'Feb', volume:6000 },{ month:'Mar', volume:7000 },{ month:'Apr', volume:7500 },{ month:'May', volume:8500 },{ month:'Jun', volume:9000 },{ month:'Jul', volume:10000 },{ month:'Aug', volume:11000 },{ month:'Sep', volume:12000 },{ month:'Oct', volume:12500 },{ month:'Nov', volume:13500 },{ month:'Dec', volume:14000 }] },
    { id: 's18', keyword: 'resin coaster set',            category: 'Home Decor',   search_volume: 21000, competition: 'Low',        growth: 118,  avg_price: '$20–$50',  created_at: '', monthly_searches: [{ month:'Jan', volume:9000 },{ month:'Feb', volume:10000 },{ month:'Mar', volume:11000 },{ month:'Apr', volume:12000 },{ month:'May', volume:13000 },{ month:'Jun', volume:14500 },{ month:'Jul', volume:15500 },{ month:'Aug', volume:16500 },{ month:'Sep', volume:17500 },{ month:'Oct', volume:18500 },{ month:'Nov', volume:19500 },{ month:'Dec', volume:21000 }] },
    { id: 's19', keyword: 'dad gifts from daughter',      category: 'Gifts',        search_volume: 39000, competition: 'Medium',     growth: 96,   avg_price: '$15–$50',  created_at: '', monthly_searches: [{ month:'Jan', volume:19000 },{ month:'Feb', volume:21000 },{ month:'Mar', volume:23000 },{ month:'Apr', volume:25000 },{ month:'May', volume:27000 },{ month:'Jun', volume:29000 },{ month:'Jul', volume:31000 },{ month:'Aug', volume:33000 },{ month:'Sep', volume:34000 },{ month:'Oct', volume:36000 },{ month:'Nov', volume:37500 },{ month:'Dec', volume:39000 }] },
    { id: 's20', keyword: 'planner sticker sheet',        category: 'Stationery',   search_volume: 52000, competition: 'High',       growth: 29,   avg_price: '$2–$6',    created_at: '', monthly_searches: [{ month:'Jan', volume:39000 },{ month:'Feb', volume:40000 },{ month:'Mar', volume:41500 },{ month:'Apr', volume:43000 },{ month:'May', volume:44500 },{ month:'Jun', volume:46000 },{ month:'Jul', volume:47500 },{ month:'Aug', volume:48500 },{ month:'Sep', volume:49500 },{ month:'Oct', volume:50000 },{ month:'Nov', volume:51000 },{ month:'Dec', volume:52000 }] },
    { id: 's21', keyword: 'crystal healing set',          category: 'Wellness',     search_volume: 27000, competition: 'Medium',     growth: 143,  avg_price: '$15–$45',  created_at: '', monthly_searches: [{ month:'Jan', volume:11000 },{ month:'Feb', volume:12500 },{ month:'Mar', volume:14000 },{ month:'Apr', volume:15500 },{ month:'May', volume:17000 },{ month:'Jun', volume:18000 },{ month:'Jul', volume:19500 },{ month:'Aug', volume:21000 },{ month:'Sep', volume:22000 },{ month:'Oct', volume:24000 },{ month:'Nov', volume:25500 },{ month:'Dec', volume:27000 }] },
    { id: 's22', keyword: 'pressed flower bookmark',      category: 'Stationery',   search_volume: 9500,  competition: 'Low',        growth: 207,  avg_price: '$5–$15',   created_at: '', monthly_searches: [{ month:'Jan', volume:3000 },{ month:'Feb', volume:3500 },{ month:'Mar', volume:4500 },{ month:'Apr', volume:5000 },{ month:'May', volume:5500 },{ month:'Jun', volume:6500 },{ month:'Jul', volume:7000 },{ month:'Aug', volume:7500 },{ month:'Sep', volume:8000 },{ month:'Oct', volume:8500 },{ month:'Nov', volume:9000 },{ month:'Dec', volume:9500 }] },
    { id: 's23', keyword: 'gold initial necklace',        category: 'Jewelry',      search_volume: 68000, competition: 'Very High',  growth: 15,   avg_price: '$18–$60',  created_at: '', monthly_searches: [{ month:'Jan', volume:59000 },{ month:'Feb', volume:60000 },{ month:'Mar', volume:61000 },{ month:'Apr', volume:62000 },{ month:'May', volume:63000 },{ month:'Jun', volume:64000 },{ month:'Jul', volume:64500 },{ month:'Aug', volume:65000 },{ month:'Sep', volume:66000 },{ month:'Oct', volume:67000 },{ month:'Nov', volume:67500 },{ month:'Dec', volume:68000 }] },
    { id: 's24', keyword: 'custom dog bandana',           category: 'Pet Supplies', search_volume: 16000, competition: 'Low',        growth: 189,  avg_price: '$8–$20',   created_at: '', monthly_searches: [{ month:'Jan', volume:5500 },{ month:'Feb', volume:6500 },{ month:'Mar', volume:7500 },{ month:'Apr', volume:8500 },{ month:'May', volume:9500 },{ month:'Jun', volume:10500 },{ month:'Jul', volume:11500 },{ month:'Aug', volume:12500 },{ month:'Sep', volume:13500 },{ month:'Oct', volume:14500 },{ month:'Nov', volume:15500 },{ month:'Dec', volume:16000 }] },
    { id: 's25', keyword: 'affirmation card deck',        category: 'Wellness',     search_volume: 12000, competition: 'Low',        growth: 221,  avg_price: '$12–$30',  created_at: '', monthly_searches: [{ month:'Jan', volume:3700 },{ month:'Feb', volume:4500 },{ month:'Mar', volume:5500 },{ month:'Apr', volume:6500 },{ month:'May', volume:7200 },{ month:'Jun', volume:8000 },{ month:'Jul', volume:8800 },{ month:'Aug', volume:9500 },{ month:'Sep', volume:10000 },{ month:'Oct', volume:10800 },{ month:'Nov', volume:11400 },{ month:'Dec', volume:12000 }] },
    { id: 's26', keyword: 'personalised mug',             category: 'Gifts',        search_volume: 83000, competition: 'Very High',  growth: -12,  avg_price: '$12–$25',  created_at: '', monthly_searches: [{ month:'Jan', volume:94000 },{ month:'Feb', volume:92000 },{ month:'Mar', volume:91000 },{ month:'Apr', volume:90000 },{ month:'May', volume:89000 },{ month:'Jun', volume:87000 },{ month:'Jul', volume:86000 },{ month:'Aug', volume:85000 },{ month:'Sep', volume:84500 },{ month:'Oct', volume:84000 },{ month:'Nov', volume:83500 },{ month:'Dec', volume:83000 }] },
    { id: 's27', keyword: 'crochet baby blanket',         category: 'Baby',         search_volume: 24000, competition: 'Medium',     growth: 61,   avg_price: '$25–$70',  created_at: '', monthly_searches: [{ month:'Jan', volume:14000 },{ month:'Feb', volume:15000 },{ month:'Mar', volume:16000 },{ month:'Apr', volume:17000 },{ month:'May', volume:18000 },{ month:'Jun', volume:19000 },{ month:'Jul', volume:20000 },{ month:'Aug', volume:21000 },{ month:'Sep', volume:22000 },{ month:'Oct', volume:22500 },{ month:'Nov', volume:23500 },{ month:'Dec', volume:24000 }] },
    { id: 's28', keyword: 'motivational poster',          category: 'Art',          search_volume: 31000, competition: 'High',       growth: 33,   avg_price: '$3–$12',   created_at: '', monthly_searches: [{ month:'Jan', volume:23000 },{ month:'Feb', volume:23500 },{ month:'Mar', volume:24500 },{ month:'Apr', volume:25000 },{ month:'May', volume:26000 },{ month:'Jun', volume:27000 },{ month:'Jul', volume:28000 },{ month:'Aug', volume:28500 },{ month:'Sep', volume:29500 },{ month:'Oct', volume:30000 },{ month:'Nov', volume:30500 },{ month:'Dec', volume:31000 }] },
    { id: 's29', keyword: 'handmade leather wallet',      category: 'Accessories',  search_volume: 18000, competition: 'Medium',     growth: 84,   avg_price: '$30–$80',  created_at: '', monthly_searches: [{ month:'Jan', volume:9000 },{ month:'Feb', volume:10000 },{ month:'Mar', volume:11000 },{ month:'Apr', volume:12000 },{ month:'May', volume:13000 },{ month:'Jun', volume:14000 },{ month:'Jul', volume:15000 },{ month:'Aug', volume:15500 },{ month:'Sep', volume:16000 },{ month:'Oct', volume:17000 },{ month:'Nov', volume:17500 },{ month:'Dec', volume:18000 }] },
    { id: 's30', keyword: 'self care gift basket',        category: 'Wellness',     search_volume: 43000, competition: 'Medium',     growth: 112,  avg_price: '$25–$75',  created_at: '', monthly_searches: [{ month:'Jan', volume:20000 },{ month:'Feb', volume:22000 },{ month:'Mar', volume:24000 },{ month:'Apr', volume:26000 },{ month:'May', volume:28000 },{ month:'Jun', volume:30000 },{ month:'Jul', volume:32000 },{ month:'Aug', volume:34000 },{ month:'Sep', volume:37000 },{ month:'Oct', volume:39000 },{ month:'Nov', volume:41000 },{ month:'Dec', volume:43000 }] },
]

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function generateMockMonthlyData(search_volume: number, growth: number) {
    const startVolume = growth >= 0
        ? search_volume / (1 + growth / 100)
        : search_volume / (1 + growth / 100)
    return MONTHS.map((month, i) => {
        const progress = i / 11
        const trend = startVolume + (search_volume - startVolume) * progress
        // add a small sine-wave wobble so it doesn't look perfectly linear
        const wobble = search_volume * 0.04 * Math.sin(i * 1.2)
        return { month, volume: Math.max(100, Math.round(trend + wobble)) }
    })
}

const competitionColor = (level: string) => {
    if (level === 'Low') return 'text-emerald-700 bg-emerald-100/60 border-emerald-200'
    if (level === 'Medium') return 'text-amber-700 bg-amber-100/60 border-amber-200'
    if (level === 'High') return 'text-rose-700 bg-rose-100/60 border-rose-200'
    return 'text-purple-700 bg-purple-100/60 border-purple-200'
}

export default function TrendsPage() {
    const [trends, setTrends] = useState<TrendData[]>(STATIC_TRENDS)
    const [loading, setLoading] = useState(true)
    const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null)
    const [selectedTrendData, setSelectedTrendData] = useState<TrendData | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [categoryFilter, setCategoryFilter] = useState("All")
    const [timeRangeFilter, setTimeRangeFilter] = useState("12m")

    const supabase = createClient()

    useEffect(() => { fetchTrends() }, [])

    const fetchTrends = async () => {
        try {
            const { data, error } = await supabase
                .from('trends')
                .select('*')
                .order('search_volume', { ascending: false })

            if (error) throw error

            if (data && data.length > 0) {
                const dbKeywords = new Set(data.map((d: any) => d.keyword))
                const merged = [...data, ...STATIC_TRENDS.filter(s => !dbKeywords.has(s.keyword))]
                setTrends(merged)
            }
        } catch (error) {
            console.error('Error fetching trends:', error)
        } finally {
            setLoading(false)
        }
    }

    const categories = ["All", ...Array.from(new Set(trends.map(t => t.category))).sort()]

    const filteredTrends = trends.filter(item =>
        categoryFilter === "All" || item.category === categoryFilter
    )

    const totalPages = Math.ceil(filteredTrends.length / ITEMS_PER_PAGE)
    const currentData = filteredTrends.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    const topGainer   = filteredTrends.length > 0 ? filteredTrends.reduce((p, c) => p.growth > c.growth ? p : c) : null
    const topLoser    = filteredTrends.length > 0 ? filteredTrends.reduce((p, c) => p.growth < c.growth ? p : c) : null
    const mostSearched = filteredTrends.length > 0 ? filteredTrends.reduce((p, c) => p.search_volume > c.search_volume ? p : c) : null

    return (
        <DashboardLayout>
            <div className="space-y-8">

                {/* Header */}
                <div className="relative pl-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full" />
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Market Trends</h1>
                        <p className="text-muted-foreground">Discover rising search terms and seasonal opportunities.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <select
                                value={categoryFilter}
                                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1) }}
                                className="h-10 pl-9 pr-4 rounded-lg border border-slate-200 bg-white/50 text-sm font-medium text-slate-600 focus:border-teal-500 outline-none appearance-none cursor-pointer min-w-[140px]"
                            >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <select
                            value={timeRangeFilter}
                            onChange={(e) => setTimeRangeFilter(e.target.value)}
                            className="h-10 px-4 rounded-lg border border-slate-200 bg-white/50 text-sm font-medium text-slate-600 focus:border-teal-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="12m">Last 12 Months</option>
                            <option value="30d">Last 30 Days</option>
                        </select>
                    </div>
                </div>

                {/* Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex-1 min-w-0 mr-4">
                                <p className="text-sm font-medium text-slate-500">Top Gainer</p>
                                <h3 className="text-xl font-bold text-slate-800 mt-1 truncate">{topGainer?.keyword || '-'}</h3>
                                <div className="flex items-center gap-1 text-green-600 text-sm mt-1 font-medium">
                                    <TrendingUp className="h-4 w-4" /><span>+{topGainer?.growth || 0}%</span>
                                </div>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                                <ArrowUpRight className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex-1 min-w-0 mr-4">
                                <p className="text-sm font-medium text-slate-500">Top Loser</p>
                                <h3 className="text-xl font-bold text-slate-800 mt-1 truncate">{topLoser?.keyword || '-'}</h3>
                                <div className="flex items-center gap-1 text-rose-600 text-sm mt-1 font-medium">
                                    <TrendingDown className="h-4 w-4" /><span>{topLoser?.growth || 0}%</span>
                                </div>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
                                <ArrowDownRight className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex-1 min-w-0 mr-4">
                                <p className="text-sm font-medium text-slate-500">Most Searched</p>
                                <h3 className="text-xl font-bold text-slate-800 mt-1 truncate">{mostSearched?.keyword || '-'}</h3>
                                <div className="flex items-center gap-1 text-blue-600 text-sm mt-1 font-medium">
                                    <Minus className="h-4 w-4" /><span>{mostSearched?.search_volume.toLocaleString()} searches</span>
                                </div>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Table */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-slate-800">Trending Now</h2>
                        <span className="text-sm text-slate-500">{filteredTrends.length} keywords</span>
                    </div>
                    <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-teal-50/50 text-slate-600">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Keyword</th>
                                            <th className="px-6 py-4 font-semibold">Category</th>
                                            <th className="px-6 py-4 font-semibold">Search Volume</th>
                                            <th className="px-6 py-4 font-semibold">Avg Price</th>
                                            <th className="px-6 py-4 font-semibold">Competition</th>
                                            <th className="px-6 py-4 font-semibold">Trend (7d)</th>
                                            <th className="px-6 py-4 font-semibold text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {loading ? (
                                            [...Array(10)].map((_, i) => (
                                                <tr key={i}>
                                                    {[...Array(7)].map((_, j) => (
                                                        <td key={j} className="px-6 py-4">
                                                            <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))
                                        ) : currentData.length > 0 ? (
                                            currentData.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="hover:bg-teal-50/40 transition-colors cursor-pointer select-none"
                                                    onClick={() => { setSelectedKeyword(item.keyword); setSelectedTrendData(item) }}
                                                >
                                                    <td className="px-6 py-4 font-medium text-slate-800 max-w-[200px] truncate" title={item.keyword}>{item.keyword}</td>
                                                    <td className="px-6 py-4 text-slate-500">{item.category}</td>
                                                    <td className="px-6 py-4 text-slate-600 font-medium">{item.search_volume.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-slate-600">{item.avg_price || '—'}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', competitionColor(item.competition))}>
                                                            {item.competition}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className={cn("flex items-center gap-1 font-semibold", item.growth > 0 ? "text-green-600" : "text-rose-600")}>
                                                            {item.growth > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                                            <span>{item.growth > 0 ? "+" : ""}{item.growth}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-teal-600 font-semibold text-xs uppercase tracking-wide">
                                                            View →
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">No trends found matching your filters.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {!loading && filteredTrends.length > ITEMS_PER_PAGE && (
                                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="text-slate-600 border-slate-200 hover:bg-white hover:text-teal-600">
                                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                                    </Button>
                                    <span className="text-sm font-medium text-slate-600">
                                        Page {currentPage} of {totalPages} &nbsp;·&nbsp; {filteredTrends.length} results
                                    </span>
                                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="text-slate-600 border-slate-200 hover:bg-white hover:text-teal-600">
                                        Next <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Trend Detail Modal */}
                {selectedTrendData && (
                    <div
                        className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => { setSelectedKeyword(null); setSelectedTrendData(null) }}
                    >
                        <div
                            className="modal-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200/80 bg-slate-50 shadow-2xl shadow-slate-900/20"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 bg-slate-50 sticky top-0 rounded-t-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                                        <BarChart2 className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-base capitalize">{selectedTrendData.keyword}</h3>
                                        <p className="text-xs text-slate-500">{selectedTrendData.category} · Trend analysis & search history</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setSelectedKeyword(null); setSelectedTrendData(null) }}
                                    className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                                >
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
                                        <p className="text-2xl font-bold text-slate-800">{selectedTrendData.search_volume.toLocaleString()}</p>
                                        <p className="text-xs text-teal-500 mt-0.5">monthly searches</p>
                                    </div>
                                    <div className={cn("rounded-xl border p-4", selectedTrendData.growth > 0 ? "bg-emerald-100/35 border-emerald-200" : "bg-rose-100/60 border-rose-200")}>
                                        <div className="flex items-center gap-1.5 mb-1">
                                            {selectedTrendData.growth > 0
                                                ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                                                : <TrendingDown className="h-3.5 w-3.5 text-rose-500" />}
                                            <p className={cn("text-xs font-semibold uppercase tracking-wider", selectedTrendData.growth > 0 ? "text-emerald-600" : "text-rose-600")}>Growth</p>
                                        </div>
                                        <p className={cn("text-2xl font-bold", selectedTrendData.growth > 0 ? "text-emerald-700" : "text-rose-700")}>
                                            {selectedTrendData.growth > 0 ? "+" : ""}{selectedTrendData.growth}%
                                        </p>
                                        <p className={cn("text-xs mt-0.5 opacity-60", selectedTrendData.growth > 0 ? "text-emerald-600" : "text-rose-600")}>over 12 months</p>
                                    </div>
                                    <div className={cn("rounded-xl border p-4", competitionColor(selectedTrendData.competition))}>
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Tag className="h-3.5 w-3.5" />
                                            <p className="text-xs font-semibold uppercase tracking-wider">Competition</p>
                                        </div>
                                        <p className="text-2xl font-bold">{selectedTrendData.competition}</p>
                                        <p className="text-xs mt-0.5 opacity-60">seller density</p>
                                    </div>
                                    <div className="bg-orange-100/60 rounded-xl border border-orange-200 p-4">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <DollarSign className="h-3.5 w-3.5 text-orange-500" />
                                            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Avg Price</p>
                                        </div>
                                        <p className="text-2xl font-bold text-slate-800">{selectedTrendData.avg_price || '—'}</p>
                                        <p className="text-xs text-orange-400 mt-0.5">typical range</p>
                                    </div>
                                </div>

                                {/* Chart */}
                                {(() => {
                                    const chartData = (selectedTrendData.monthly_searches ?? []).length > 0
                                        ? selectedTrendData.monthly_searches!
                                        : generateMockMonthlyData(selectedTrendData.search_volume, selectedTrendData.growth)
                                    const isMock = (selectedTrendData.monthly_searches ?? []).length === 0
                                    return (
                                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-semibold text-slate-700">12-Month Search Volume</p>
                                        {isMock && <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Estimated</span>}
                                    </div>
                                    <div className="h-[220px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                                                            <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={36} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)' }}
                                                        formatter={(value: number) => [value.toLocaleString(), 'Search Volume']}
                                                        itemStyle={{ color: '#0f766e', fontWeight: 600 }}
                                                        labelStyle={{ color: '#475569', fontWeight: 500 }}
                                                    />
                                                    <Area type="monotone" dataKey="volume" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#trendGradient)" dot={false} activeDot={{ r: 5, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                    </div>
                                </div>
                                    )
                                })()}

                                {/* Insights row */}
                                {(() => {
                                    const months = (selectedTrendData.monthly_searches ?? []).length > 0
                                        ? selectedTrendData.monthly_searches!
                                        : generateMockMonthlyData(selectedTrendData.search_volume, selectedTrendData.growth)
                                    const peakMonth = months.length > 0 ? months.reduce((p, c) => p.volume > c.volume ? p : c) : null
                                    const opportunityScore = Math.min(100, Math.round(
                                        (selectedTrendData.growth > 0 ? Math.min(selectedTrendData.growth, 200) / 2 : 0) +
                                        (['Low', 'Medium'].includes(selectedTrendData.competition) ? 30 : 10) +
                                        Math.min(selectedTrendData.search_volume / 1000, 20)
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
                                                    <p className="text-2xl font-bold text-slate-800">{peakMonth?.month ?? '—'}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">{peakMonth ? peakMonth.volume.toLocaleString() + ' searches' : 'No data'}</p>
                                                </div>
                                            </div>
                                            <div className="rounded-xl border border-violet-300 bg-violet-100/90 p-4 flex items-start gap-3">
                                                <Tag className="h-5 w-5 mt-0.5 text-violet-500 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-0.5">Category</p>
                                                    <p className="text-xl font-bold text-slate-800">{selectedTrendData.category}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">Niche segment</p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })()}

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                    <p className="text-xs text-slate-400">Data reflects estimated Etsy market trends</p>
                                    <a
                                        href={`https://www.etsy.com/search?q=${encodeURIComponent(selectedTrendData.keyword)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline transition-colors"
                                    >
                                        View on Etsy <ExternalLink className="h-3 w-3" />
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
