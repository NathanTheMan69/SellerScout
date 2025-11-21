"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { DashboardLayout } from "@/components/DashboardLayout"
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal } from "@/components/Modal"
import { Button } from "@/components/Button"
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

// Mock Data for Chart
const CHART_DATA = [
    { month: "Jan", volume: 2400 },
    { month: "Feb", volume: 1398 },
    { month: "Mar", volume: 9800 },
    { month: "Apr", volume: 3908 },
    { month: "May", volume: 4800 },
    { month: "Jun", volume: 3800 },
    { month: "Jul", volume: 4300 },
    { month: "Aug", volume: 7800 },
    { month: "Sep", volume: 8900 },
    { month: "Oct", volume: 11200 },
    { month: "Nov", volume: 14500 },
    { month: "Dec", volume: 18900 },
]

// Mock Data for Trending List (50+ items)
const TRENDING_KEYWORDS = [
    { id: 1, keyword: "personalized leather gift", volume: 45000, trend: 125, status: "up" },
    { id: 2, keyword: "minimalist wall art", volume: 28000, trend: 45, status: "up" },
    { id: 3, keyword: "vintage denim jacket", volume: 12000, trend: -15, status: "down" },
    { id: 4, keyword: "handmade ceramic mug", volume: 18500, trend: 8, status: "up" },
    { id: 5, keyword: "digital planner 2025", volume: 32000, trend: 210, status: "up" },
    { id: 6, keyword: "chunky knit blanket", volume: 8900, trend: -5, status: "down" },
    { id: 7, keyword: "custom pet portrait", volume: 15600, trend: 32, status: "up" },
    { id: 8, keyword: "gold hoop earrings", volume: 22000, trend: 15, status: "up" },
    { id: 9, keyword: "printable wedding planner", volume: 14500, trend: 60, status: "up" },
    { id: 10, keyword: "soy wax candle", volume: 19800, trend: 12, status: "up" },
    { id: 11, keyword: "linen dress", volume: 25400, trend: -8, status: "down" },
    { id: 12, keyword: "wooden baby toys", volume: 11200, trend: 25, status: "up" },
    { id: 13, keyword: "macrame plant hanger", volume: 9500, trend: -2, status: "down" },
    { id: 14, keyword: "crystal necklace", volume: 31000, trend: 18, status: "up" },
    { id: 15, keyword: "personalized doormat", volume: 16700, trend: 40, status: "up" },
    { id: 16, keyword: "bridesmaid proposal box", volume: 21000, trend: 55, status: "up" },
    { id: 17, keyword: "retro sunglasses", volume: 8400, trend: -12, status: "down" },
    { id: 18, keyword: "leather tote bag", volume: 13500, trend: 5, status: "up" },
    { id: 19, keyword: "abstract printable art", volume: 10200, trend: 22, status: "up" },
    { id: 20, keyword: "crochet pattern", volume: 29000, trend: 35, status: "up" },
    { id: 21, keyword: "wedding favors", volume: 42000, trend: 80, status: "up" },
    { id: 22, keyword: "custom neon sign", volume: 17800, trend: 10, status: "up" },
    { id: 23, keyword: "beaded bracelet", volume: 15200, trend: -5, status: "down" },
    { id: 24, keyword: "velvet throw pillow", volume: 7600, trend: 15, status: "up" },
    { id: 25, keyword: "dried flower bouquet", volume: 12400, trend: 28, status: "up" },
    { id: 26, keyword: "mushroom lamp", volume: 6500, trend: -20, status: "down" },
    { id: 27, keyword: "personalized cutting board", volume: 19500, trend: 45, status: "up" },
    { id: 28, keyword: "silver ring set", volume: 14800, trend: 8, status: "up" },
    { id: 29, keyword: "embroidery kit", volume: 11500, trend: 30, status: "up" },
    { id: 30, keyword: "wicker storage basket", volume: 9800, trend: 12, status: "up" },
    { id: 31, keyword: "silk scarf", volume: 8200, trend: -3, status: "down" },
    { id: 32, keyword: "ceramic vase", volume: 13100, trend: 18, status: "up" },
    { id: 33, keyword: "leather wallet", volume: 20500, trend: 6, status: "up" },
    { id: 34, keyword: "baby shower gift", volume: 35000, trend: 50, status: "up" },
    { id: 35, keyword: "dog collar", volume: 16200, trend: 10, status: "up" },
    { id: 36, keyword: "planner stickers", volume: 24000, trend: 25, status: "up" },
    { id: 37, keyword: "wall hanging", volume: 10800, trend: -8, status: "down" },
    { id: 38, keyword: "scented soap", volume: 7900, trend: 15, status: "up" },
    { id: 39, keyword: "custom t-shirt", volume: 48000, trend: 65, status: "up" },
    { id: 40, keyword: "digital invitation", volume: 22500, trend: 90, status: "up" },
    { id: 41, keyword: "wooden puzzle", volume: 11800, trend: 20, status: "up" },
    { id: 42, keyword: "gold necklace", volume: 27000, trend: 12, status: "up" },
    { id: 43, keyword: "canvas tote bag", volume: 14200, trend: 35, status: "up" },
    { id: 44, keyword: "hair clips", volume: 18500, trend: 40, status: "up" },
    { id: 45, keyword: "bath bombs", volume: 15600, trend: 5, status: "up" },
    { id: 46, keyword: "phone case", volume: 38000, trend: 15, status: "up" },
    { id: 47, keyword: "laptop sticker", volume: 21500, trend: 28, status: "up" },
    { id: 48, keyword: "keychain", volume: 12900, trend: 10, status: "up" },
    { id: 49, keyword: "poster print", volume: 9400, trend: -5, status: "down" },
    { id: 50, keyword: "desk organizer", volume: 16800, trend: 45, status: "up" },
    { id: 51, keyword: "yoga mat strap", volume: 5200, trend: 12, status: "up" },
    { id: 52, keyword: "travel journal", volume: 8700, trend: 30, status: "up" },
]

const ITEMS_PER_PAGE = 10

export default function TrendsPage() {
    const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)

    const totalPages = Math.ceil(TRENDING_KEYWORDS.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const currentData = TRENDING_KEYWORDS.slice(startIndex, endIndex)

    const handleAnalyze = (keyword: string) => {
        setSelectedKeyword(keyword)
    }

    const handleCloseModal = () => {
        setSelectedKeyword(null)
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
                <div className="relative">
                    <div className="absolute -left-4 top-0 h-full w-1 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full" />
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Market Trends</h1>
                    <p className="text-muted-foreground">Discover rising search terms and seasonal opportunities.</p>
                </div>

                {/* Top Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Top Gainer</p>
                                <h3 className="text-xl font-bold text-slate-800 mt-1">Digital Planner</h3>
                                <div className="flex items-center gap-1 text-green-600 text-sm mt-1 font-medium">
                                    <TrendingUp className="h-4 w-4" />
                                    <span>+210%</span>
                                </div>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <ArrowUpRight className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Top Loser</p>
                                <h3 className="text-xl font-bold text-slate-800 mt-1">Fidget Spinners</h3>
                                <div className="flex items-center gap-1 text-rose-600 text-sm mt-1 font-medium">
                                    <TrendingDown className="h-4 w-4" />
                                    <span>-45%</span>
                                </div>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                                <ArrowDownRight className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Most Searched</p>
                                <h3 className="text-xl font-bold text-slate-800 mt-1">Gift Ideas</h3>
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

                {/* Trending Table */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-slate-800">Trending Now</h2>
                    <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm table-fixed">
                                    <thead className="bg-teal-50/50 text-slate-600">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold w-[40%]">Keyword</th>
                                            <th className="px-6 py-4 font-semibold w-[20%]">Search Volume</th>
                                            <th className="px-6 py-4 font-semibold w-[20%]">Trend (7d)</th>
                                            <th className="px-6 py-4 font-semibold text-right w-[10%]">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {currentData.map((item) => (
                                            <tr key={item.id} className="hover:bg-teal-50/30 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-800 truncate">{item.keyword}</td>
                                                <td className="px-6 py-4 text-slate-600">{item.volume.toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <div className={cn(
                                                        "flex items-center gap-1 font-medium",
                                                        item.status === "up" ? "text-green-600" : "text-rose-600"
                                                    )}>
                                                        {item.status === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                                        <span>{item.trend > 0 ? "+" : ""}{item.trend}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleAnalyze(item.keyword)}
                                                        className="text-teal-600 hover:text-teal-700 font-medium text-xs uppercase tracking-wide"
                                                    >
                                                        Analyze
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Footer */}
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
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={CHART_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                                    tickFormatter={(value) => `${value / 1000}k`}
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
                    </div>
                </Modal>
            </div>
        </DashboardLayout>
    )
}
