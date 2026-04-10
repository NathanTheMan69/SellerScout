'use client'

import { useState } from 'react'

import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Search, Download, Copy, Star, Heart, Crown, Hash, TrendingUp, DollarSign, ChevronLeft, Map, BarChart3, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    { id: 1, title: 'Personalized Dog Shirt, Custom Dog Shirt with Name...', price: 8.00, sales: 1542, gross: 12336, age: 'Mar 4, 2023', img: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=100&q=80' },
    { id: 2, title: 'Embroidered Poke Character Sweatshirt, Anime Shirt...', price: 13.00, sales: 2134, gross: 27742, age: 'Jul 29, 2023', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&q=80' },
    { id: 3, title: 'Custom Comfort Colors Shirt, Vintage Washed...', price: 21.00, sales: 842, gross: 17682, age: 'Dec 11, 2024', img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=100&q=80' },
]

const PRICING_DATA = [
    { range: '0-10$', count: 45 },
    { range: '10-25$', count: 120 },
    { range: '25-50$', count: 85 },
    { range: '50-100$', count: 32 },
    { range: '100-250$', count: 12 },
    { range: '250+', count: 4 },
]

const ROWS_PER_PAGE = 10

export default function SearchTermAnalyzer() {
    const params = useParams()
    const router = useRouter()
    const rawQuery = params?.query as string || 'Unknown'
    const decodedQuery = decodeURIComponent(rawQuery).replace(/\+/g, ' ')

    const searchScore = 78

    // Similar keywords pagination
    const totalPages = Math.ceil(MOCK_SIMILAR.length / ROWS_PER_PAGE)
    const [similarPage, setSimilarPage] = useState(1)
    const pagedSimilar = MOCK_SIMILAR.slice((similarPage - 1) * ROWS_PER_PAGE, similarPage * ROWS_PER_PAGE)

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header Sub-Navigation */}
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <button onClick={() => router.push('/dashboard')} className="hover:text-teal-600 transition-colors">Dashboard</button>
                    <ChevronLeft className="h-4 w-4 rotate-180" />
                    <button onClick={() => router.push('/dashboard/keyword-research')} className="hover:text-teal-600 transition-colors">Keyword Research</button>
                    <ChevronLeft className="h-4 w-4 rotate-180" />
                    <span className="text-slate-800">Analyzer</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-6">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-800 lowercase">{decodedQuery}</h1>
                        <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                            <div className="flex flex-col mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">Keyword Score</span>
                                <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden relative shadow-inner">
                                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: `${searchScore}%` }} />
                                </div>
                            </div>
                            <span className="text-2xl font-black text-emerald-600 leading-none">{searchScore}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input 
                                type="text"
                                defaultValue={decodedQuery}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter') router.push(`/dashboard/keyword-research/${encodeURIComponent(e.currentTarget.value)}`)
                                }}
                                className="pl-9 pr-12 py-2 w-64 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-400">↵</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
                    
                    {/* LEFT COLUMN: Metrics & Charts */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Macro Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <Card className="bg-white/90 backdrop-blur shadow-sm border-slate-200/60 p-4">
                                <div className="flex flex-col items-center text-center">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Search Volume</span>
                                    <span className="text-xl font-black text-slate-800">12,500</span>
                                </div>
                            </Card>
                            <Card className="bg-white/90 backdrop-blur shadow-sm border-slate-200/60 p-4">
                                <div className="flex flex-col items-center text-center">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Competing Listings</span>
                                    <span className="text-xl font-black text-slate-800">43,212</span>
                                </div>
                            </Card>
                            <Card className="bg-white/90 backdrop-blur shadow-sm border-slate-200/60 p-4">
                                <div className="flex flex-col items-center text-center">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Views</span>
                                    <span className="text-xl font-black text-slate-800">84,142</span>
                                </div>
                            </Card>
                            <Card className="bg-white/90 backdrop-blur shadow-sm border-slate-200/60 p-4">
                                <div className="flex flex-col items-center text-center">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Competing Shops</span>
                                    <span className="text-xl font-black text-slate-800">163</span>
                                </div>
                            </Card>
                            <Card className="bg-white/90 backdrop-blur shadow-sm border-slate-200/60 p-4">
                                <div className="flex flex-col items-center text-center">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Sales</span>
                                    <span className="text-xl font-black text-slate-800">24,541</span>
                                </div>
                            </Card>
                            <Card className="bg-white/90 backdrop-blur shadow-sm border-slate-200/60 p-4">
                                <div className="flex flex-col items-center text-center">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Revenue</span>
                                    <span className="text-xl font-black text-slate-800">$482,231</span>
                                </div>
                            </Card>
                        </div>


                        {/* Pricing Breakdown */}
                        <div>
                            <h3 className="font-bold text-slate-800 mb-4 px-1">Pricing Breakdown</h3>
                            <Card className="bg-white/90 backdrop-blur shadow-sm border-slate-200/60 p-4">
                                <div className="h-48 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={PRICING_DATA} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                            <Tooltip 
                                                cursor={{ fill: '#f1f5f9' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} dy={10} />
                                            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                                {PRICING_DATA.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={index === 1 ? '#0d9488' : '#cbd5e1'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>

                        {/* Full Details */}
                        <div>
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h3 className="font-bold text-slate-800">Full Details</h3>
                                <ChevronLeft className="h-5 w-5 rotate-90 text-slate-400 cursor-pointer hover:text-slate-600" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                                    <span className="text-sm font-semibold text-slate-600">Character Count</span>
                                    <span className="font-bold text-slate-800">{decodedQuery.length}</span>
                                </div>
                                <div className="flex items-center justify-between bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                                    <span className="text-sm font-semibold text-slate-600">Total Favourites</span>
                                    <span className="font-bold text-slate-800">71,080</span>
                                </div>
                                <div className="flex items-center justify-between bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                                    <span className="text-sm font-semibold text-slate-600">Average Price</span>
                                    <span className="font-bold text-slate-800">20</span>
                                </div>
                                <div className="flex items-center justify-between bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                                    <span className="text-sm font-semibold text-slate-600">Average Listing Age</span>
                                    <span className="font-bold text-slate-800">9.7 mo</span>
                                </div>
                                <div className="flex items-center justify-between bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                                    <span className="text-sm font-semibold text-slate-600">Average Listing Views</span>
                                    <span className="font-bold text-slate-800">5,788</span>
                                </div>
                                <div className="flex items-center justify-between bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                                    <span className="text-sm font-semibold text-slate-600">Average Listing Favourites</span>
                                    <span className="font-bold text-slate-800">355</span>
                                </div>
                                <div className="flex items-center justify-between bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                                    <span className="text-sm font-semibold text-slate-600">Percentage Of Digital</span>
                                    <span className="font-bold text-slate-800">24%</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Tables */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Similar Keywords Table */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-800">Similar Keywords</h2>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="bg-white shadow-sm border-slate-200 hover:bg-slate-50 text-slate-600">
                                        <Download className="h-4 w-4 mr-2" /> Export to CSV
                                    </Button>
                                    <Button variant="outline" size="sm" className="bg-white shadow-sm border-slate-200 hover:bg-slate-50 text-slate-600">
                                        <Copy className="h-4 w-4 mr-2" /> Copy all
                                    </Button>
                                </div>
                            </div>

                            <Card className="bg-white shadow-md border-slate-200 overflow-hidden rounded-2xl">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs uppercase bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-4">Keywords</th>
                                                <th className="px-6 py-4 text-center">Views</th>
                                                <th className="px-6 py-4 text-center">Listings</th>
                                                <th className="px-6 py-4 text-center">Sales</th>
                                                <th className="px-6 py-4 text-center">Avg Price</th>
                                                <th className="px-6 py-4 w-48">Score</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {pagedSimilar.map((item) => (
                                                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap cursor-pointer hover:border-teal-300">
                                                                {item.keyword}
                                                            </div>
                                                            <button 
                                                                className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                                                                onClick={() => router.push(`/dashboard/keyword-research/${encodeURIComponent(item.keyword)}`)}
                                                            >
                                                                <Search className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-bold text-slate-700">{item.views.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-slate-700">{item.listings.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-slate-700">{item.sales.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-slate-700">${item.price.toFixed(2)}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                                            <div 
                                                                className={cn("h-full rounded-full", item.recommendation > 70 ? "bg-teal-500" : item.recommendation > 50 ? "bg-amber-400" : "bg-rose-500")}
                                                                style={{ width: `${item.recommendation}%` }}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Pagination Footer */}
                                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => setSimilarPage(p => Math.max(1, p - 1))}
                                        disabled={similarPage === 1}
                                        className="p-1.5 rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setSimilarPage(page)}
                                            className={cn(
                                                "px-3 py-1 rounded-lg text-sm font-semibold transition-colors",
                                                similarPage === page
                                                    ? "bg-teal-600 text-white shadow-sm"
                                                    : "text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                                            )}
                                        >
                                            Page {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setSimilarPage(p => Math.min(totalPages, p + 1))}
                                        disabled={similarPage === totalPages}
                                        className="p-1.5 rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="h-4 w-4 rotate-180" />
                                    </button>
                                </div>
                            </Card>
                        </div>

                        {/* Top Listings Table */}
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-800">Top Listings</h2>
                                <Button variant="outline" size="sm" className="bg-white shadow-sm border-slate-200 hover:bg-slate-50 text-slate-600">
                                    <Download className="h-4 w-4 mr-2" /> Export to CSV
                                </Button>
                            </div>

                            <Card className="bg-white shadow-md border-slate-200 overflow-hidden rounded-2xl">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs uppercase bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-4 w-10"></th>
                                                <th className="px-6 py-4">Listing Title</th>
                                                <th className="px-6 py-4 text-center">Price</th>
                                                <th className="px-6 py-4 text-center">Total Sales</th>
                                                <th className="px-6 py-4 text-center">Gross Sales</th>
                                                <th className="px-6 py-4 text-right">Age</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {MOCK_LISTINGS.map((item) => (
                                                <tr key={item.id} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                                    <td className="px-6 py-4">
                                                        <button className="text-slate-300 hover:text-rose-500 transition-colors"><Heart className="h-4 w-4" /></button>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative h-10 w-10 shrink-0">
                                                                <img src={item.img} alt="listing" className="h-10 w-10 border border-slate-200 rounded object-cover shadow-sm group-hover:border-teal-300 transition-colors" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-slate-700 max-w-[250px] md:max-w-[320px] truncate group-hover:text-teal-700 transition-colors" title={item.title}>{item.title}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-bold text-slate-700">${item.price.toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-slate-700">{item.sales.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-slate-700">${item.gross.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-right font-medium text-slate-500 whitespace-nowrap">{item.age}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                        
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
