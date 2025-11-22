"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/Card"
import { DashboardLayout } from "@/components/DashboardLayout"
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal } from "@/components/Modal"
import { Button } from "@/components/Button"
import { createClient } from "@/utils/supabase/client"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from "recharts"

interface TrendData {
    id: string
    keyword: string
    search_volume: number
    competition: string
    growth: number
    monthly_searches: { month: string, volume: number }[]
    category: string
    created_at: string
}

const ITEMS_PER_PAGE = 10

export default function TrendsPage() {
    const [trends, setTrends] = useState<TrendData[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null)
    const [selectedTrendData, setSelectedTrendData] = useState<TrendData | null>(null)
    const [currentPage, setCurrentPage] = useState(1)

    // Filters
    const [categoryFilter, setCategoryFilter] = useState("All")
    const [timeRangeFilter, setTimeRangeFilter] = useState("12m") // 12m, 30d (mock filter for chart)

    const supabase = createClient()

    useEffect(() => {
        fetchTrends()
    }, [])

    const fetchTrends = async () => {
        try {
            const { data, error } = await supabase
                .from('trends')
                .select('*')
                .order('search_volume', { ascending: false })

            if (error) throw error

            if (data) {
                setTrends(data)
            }
        } catch (error) {
            console.error('Error fetching trends:', error)
        } finally {
            setLoading(false)
        }
    }

    // Derived Data
    const categories = ["All", ...Array.from(new Set(trends.map(t => t.category))).sort()]

    const filteredTrends = trends.filter(item => {
        if (categoryFilter !== "All" && item.category !== categoryFilter) return false
        return true
    })

    const totalPages = Math.ceil(filteredTrends.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const currentData = filteredTrends.slice(startIndex, endIndex)

    // Stats Calculation (based on filtered data)
    const topGainer = filteredTrends.length > 0 ? filteredTrends.reduce((prev, current) => (prev.growth > current.growth) ? prev : current) : null
    const topLoser = filteredTrends.length > 0 ? filteredTrends.reduce((prev, current) => (prev.growth < current.growth) ? prev : current) : null
    const mostSearched = filteredTrends.length > 0 ? filteredTrends.reduce((prev, current) => (prev.search_volume > current.search_volume) ? prev : current) : null

    const handleAnalyze = (item: TrendData) => {
        setSelectedKeyword(item.keyword)
        setSelectedTrendData(item)
    }

    const handleCloseModal = () => {
        setSelectedKeyword(null)
        setSelectedTrendData(null)
    }

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1)
        }
    }

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

                    {/* Filters */}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <select
                                value={categoryFilter}
                                onChange={(e) => {
                                    setCategoryFilter(e.target.value)
                                    setCurrentPage(1) // Reset to page 1 on filter change
                                }}
                                className="h-10 pl-9 pr-4 rounded-lg border border-slate-200 bg-white/50 text-sm font-medium text-slate-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none appearance-none cursor-pointer min-w-[140px]"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <select
                            value={timeRangeFilter}
                            onChange={(e) => setTimeRangeFilter(e.target.value)}
                            className="h-10 px-4 rounded-lg border border-slate-200 bg-white/50 text-sm font-medium text-slate-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none appearance-none cursor-pointer"
                        >
                            <option value="12m">Last 12 Months</option>
                            <option value="30d">Last 30 Days</option>
                        </select>
                    </div>
                </div>

                {/* Top Stats Grid */}
                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex-1 min-w-0 mr-4">
                                    <p className="text-sm font-medium text-slate-500">Top Gainer</p>
                                    <h3 className="text-xl font-bold text-slate-800 mt-1 truncate" title={topGainer?.keyword}>{topGainer?.keyword || '-'}</h3>
                                    <div className="flex items-center gap-1 text-green-600 text-sm mt-1 font-medium">
                                        <TrendingUp className="h-4 w-4" />
                                        <span>+{topGainer?.growth || 0}%</span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <ArrowUpRight className="h-6 w-6" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex-1 min-w-0 mr-4">
                                    <p className="text-sm font-medium text-slate-500">Top Loser</p>
                                    <h3 className="text-xl font-bold text-slate-800 mt-1 truncate" title={topLoser?.keyword}>{topLoser?.keyword || '-'}</h3>
                                    <div className="flex items-center gap-1 text-rose-600 text-sm mt-1 font-medium">
                                        <TrendingDown className="h-4 w-4" />
                                        <span>{topLoser?.growth || 0}%</span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                                    <ArrowDownRight className="h-6 w-6" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex-1 min-w-0 mr-4">
                                    <p className="text-sm font-medium text-slate-500">Most Searched</p>
                                    <h3 className="text-xl font-bold text-slate-800 mt-1 truncate" title={mostSearched?.keyword}>{mostSearched?.keyword || '-'}</h3>
                                    <div className="flex items-center gap-1 text-slate-600 text-sm mt-1 font-medium">
                                        <Minus className="h-4 w-4" />
                                        <span>Stable</span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <TrendingUp className="h-6 w-6" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Trending Table */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-slate-800">Trending Now</h2>
                    <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm table-fixed">
                                    <thead className="bg-teal-50/50 text-slate-600">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold w-[35%]">Keyword</th>
                                            <th className="px-6 py-4 font-semibold w-[15%]">Category</th>
                                            <th className="px-6 py-4 font-semibold w-[20%]">Search Volume</th>
                                            <th className="px-6 py-4 font-semibold w-[20%]">Trend (7d)</th>
                                            <th className="px-6 py-4 font-semibold text-right w-[10%]">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                                    Loading trends...
                                                </td>
                                            </tr>
                                        ) : currentData.length > 0 ? (
                                            currentData.map((item) => (
                                                <tr key={item.id} className="hover:bg-teal-50/30 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-slate-800 truncate" title={item.keyword}>{item.keyword}</td>
                                                    <td className="px-6 py-4 text-slate-500 truncate">{item.category}</td>
                                                    <td className="px-6 py-4 text-slate-600">{item.search_volume.toLocaleString()}</td>
                                                    <td className="px-6 py-4">
                                                        <div className={cn(
                                                            "flex items-center gap-1 font-medium",
                                                            item.growth > 0 ? "text-green-600" : "text-rose-600"
                                                        )}>
                                                            {item.growth > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                                            <span>{item.growth > 0 ? "+" : ""}{item.growth}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleAnalyze(item)}
                                                            className="text-teal-600 hover:text-teal-700 font-medium text-xs uppercase tracking-wide"
                                                        >
                                                            Analyze
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                                    No trends found matching your filters.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Footer */}
                            {!loading && filteredTrends.length > 0 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handlePreviousPage}
                                        disabled={currentPage === 1}
                                        className="text-slate-600 border-slate-200 hover:bg-white hover:text-teal-600"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Previous
                                    </Button>
                                    <span className="text-sm font-medium text-slate-600">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className="text-slate-600 border-slate-200 hover:bg-white hover:text-teal-600"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Analysis Modal */}
                <Modal
                    isOpen={!!selectedKeyword}
                    onClose={handleCloseModal}
                    title={`Trend Analysis: ${selectedKeyword}`}
                    className="max-w-4xl"
                >
                    <div className="h-[400px] w-full">
                        {selectedTrendData && (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={selectedTrendData.monthly_searches} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                        itemStyle={{ color: '#0f766e' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="volume"
                                        stroke="#0d9488"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorVolume)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Modal>
            </div>
        </DashboardLayout>
    )
}
