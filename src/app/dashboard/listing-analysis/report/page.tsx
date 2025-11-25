"use client";

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Lock, Copy, Clipboard, Star, TrendingUp, Snowflake, TreePine, ExternalLink, ImageOff, Zap, Sparkles } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { DashboardLayout } from '@/components/DashboardLayout'
import { cn } from '@/lib/utils'

// Mock Data for the Report
const MOCK_REPORT_DATA = {
    id: 'l_report_1',
    title: 'Custom Engraved Leather Wallet',
    price: 55.00,
    views: 350,
    favorites: 1200,
    revenue: 4500,
    orders: 145,
    age_months: 14,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
    tags: ['Leather', 'Gift for Him', 'Custom', 'Wallet', 'Personalized', 'Mens Wallet', 'Anniversary Gift'],
    sales_trend: [
        { month: 'Jan', sales: 45 },
        { month: 'Feb', sales: 52 },
        { month: 'Mar', sales: 48 },
        { month: 'Apr', sales: 60 },
        { month: 'May', sales: 75 },
        { month: 'Jun', sales: 85 },
        { month: 'Jul', sales: 80 },
        { month: 'Aug', sales: 95 },
        { month: 'Sep', sales: 110 },
        { month: 'Oct', sales: 105 },
        { month: 'Nov', sales: 130 },
        { month: 'Dec', sales: 145 },
    ],
    reviews: [
        { id: 'r1', user: 'Sarah M.', date: '2 days ago', rating: 5, comment: 'Absolutely love this wallet! The engraving is perfect.' },
        { id: 'r2', user: 'John D.', date: '1 week ago', rating: 5, comment: 'Great quality leather, smells amazing. Fast shipping too.' },
        { id: 'r3', user: 'Emily R.', date: '2 weeks ago', rating: 4, comment: 'Nice wallet, but smaller than I expected. Still a great gift.' },
        { id: 'r4', user: 'Michael B.', date: '3 weeks ago', rating: 5, comment: 'Best purchase I made on Etsy this year. Highly recommend!' },
        { id: 'r5', user: 'Jessica T.', date: '1 month ago', rating: 5, comment: 'My husband loved it. Thank you so much!' },
    ]
}

export default function IntelligenceReportPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const query = searchParams.get('query')
    const returnTo = searchParams.get('returnTo')

    const [data, setData] = useState<any>(null)
    const [copiedTag, setCopiedTag] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Simulate API fetch
        setIsLoading(true)
        setTimeout(() => {
            // In a real app, we'd fetch based on 'query'
            // For now, we just use the mock data but maybe override title if query exists
            const reportData = { ...MOCK_REPORT_DATA }
            if (query && !query.includes('http')) {
                reportData.title = query
            }
            setData(reportData)
            setIsLoading(false)
        }, 800)
    }, [query])

    const handleCopyTag = (tag: string) => {
        navigator.clipboard.writeText(tag)
        setCopiedTag(tag)
        setTimeout(() => setCopiedTag(null), 2000)
    }

    const handleCopyAllTags = () => {
        if (!data?.tags) return
        const allTags = data.tags.join(', ')
        navigator.clipboard.writeText(allTags)
        setCopiedTag('__ALL__')
        setTimeout(() => setCopiedTag(null), 2000)
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
            </DashboardLayout>
        )
    }

    if (!data) return null

    // Intelligence Logic
    const isTrending = data.reviews.some((r: any) => r.date.includes('day') || r.date.includes('week'))
    const isEvergreen = data.age_months > 12 && isTrending
    const isCold = !isTrending

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-6xl mx-auto">
                {/* Navigation Header */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        className="rounded-full bg-white border border-slate-200 text-slate-700 shadow-sm hover:border-teal-500 hover:text-teal-600 gap-2 px-4"
                        onClick={() => returnTo ? router.push(returnTo) : router.back()}
                    >
                        <ArrowLeft className="h-4 w-4" /> {returnTo ? 'Back to Shop Analysis' : 'Back'}
                    </Button>
                    <div className="text-sm text-slate-400 font-medium">
                        Report ID: {data.id}
                    </div>
                </div>

                {/* Section A: Product Header (Full Width) */}
                <Card className="border-white/50 bg-white/80 backdrop-blur-md shadow-xl shadow-teal-900/10 overflow-hidden">
                    <div className="grid md:grid-cols-4 gap-0">
                        {/* Image Section */}
                        <div className="bg-slate-100 relative h-64 md:h-auto col-span-1">
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-200">
                                <img
                                    src={data.image}
                                    alt={data.title}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="col-span-3 p-8 space-y-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">Active Listing</span>
                                    <span className="text-slate-400 text-sm">{data.age_months} Months Old</span>
                                </div>
                                <h1 className="text-3xl font-bold text-slate-800">{data.title}</h1>
                                <p className="text-4xl font-light text-teal-600 mt-2">${data.price.toFixed(2)}</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-xs font-bold text-teal-600 uppercase tracking-wider">
                                        Est. Revenue <Lock className="h-3 w-3" />
                                    </div>
                                    <p className="text-2xl font-bold text-teal-600 blur-sm select-none">
                                        ${data.revenue}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-xs font-bold text-teal-600 uppercase tracking-wider">
                                        Orders <Lock className="h-3 w-3" />
                                    </div>
                                    <p className="text-2xl font-bold text-teal-600 blur-sm select-none">
                                        {data.orders}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Favorites</p>
                                    <p className="text-2xl font-bold text-slate-800">{data.favorites}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Views</p>
                                    <p className="text-2xl font-bold text-slate-800">{data.views}</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tags</p>
                                    <button
                                        onClick={handleCopyAllTags}
                                        className="flex items-center gap-2 bg-white border border-slate-200 rounded-full shadow-sm px-3 py-1 transition-colors hover:border-teal-500 hover:text-teal-600 text-xs font-medium text-slate-600"
                                    >
                                        {copiedTag === '__ALL__' ? (
                                            <span className="font-bold text-teal-600">All tags copied!</span>
                                        ) : (
                                            <>
                                                <Clipboard className="h-3 w-3" /> Copy All
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {data.tags?.map((tag: string) => (
                                        <button
                                            key={tag}
                                            onClick={() => handleCopyTag(tag)}
                                            className="px-3 py-1 bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 rounded-full text-sm font-medium transition-all cursor-pointer border border-transparent hover:border-teal-200"
                                            title="Click to copy"
                                        >
                                            {copiedTag === tag ? (
                                                <span className="text-teal-600 font-bold">Copied!</span>
                                            ) : (
                                                tag
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Section B: Sales & Review Velocity Graph */}
                    <Card className="lg:col-span-2 border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-teal-500" />
                                Estimated Sales Trend
                            </CardTitle>
                            <p className="text-sm text-slate-500">Based on review velocity over the last 12 months</p>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.sales_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="month"
                                            stroke="#94a3b8"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#94a3b8"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `${value}`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                            }}
                                            itemStyle={{ color: '#0f766e' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="sales"
                                            stroke="#0d9488"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorSales)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section C: Scout Intelligence */}
                    <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-white shadow-lg shadow-teal-50 h-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-teal-600" />
                                <CardTitle className="text-lg font-bold text-teal-700 uppercase tracking-wide">Scout Analysis</CardTitle>
                            </div>
                            <div className="flex gap-2">
                                {isTrending && (
                                    <div className="group relative">
                                        <div className="p-1.5 bg-amber-100 text-amber-600 rounded-full cursor-help">
                                            <Zap className="h-4 w-4" />
                                        </div>
                                        <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                            Trending: Recent high review velocity
                                        </div>
                                    </div>
                                )}
                                {isEvergreen && (
                                    <div className="group relative">
                                        <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-full cursor-help">
                                            <TreePine className="h-4 w-4" />
                                        </div>
                                        <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                            Evergreen: Consistent sales for &gt;1 year
                                        </div>
                                    </div>
                                )}
                                {isCold && (
                                    <div className="group relative">
                                        <div className="p-1.5 bg-slate-100 text-slate-500 rounded-full cursor-help">
                                            <Snowflake className="h-4 w-4" />
                                        </div>
                                        <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                            Cold: Low recent activity
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="font-mono text-sm text-slate-700 leading-relaxed">
                                {isTrending ? (
                                    "This listing is currently outperforming 95% of the category. The high review velocity suggests a viral trigger, likely driven by the specific keyword combination of \"Gift for Him\" and \"Custom Wallet\" which has low competition but high search volume."
                                ) : isEvergreen ? (
                                    "A textbook example of a long-term winner. While daily views have stabilized, the conversion rate remains high due to strong social proof (1,200 favorites). Recommendation: Do not alter the primary photo."
                                ) : (
                                    "This listing is currently experiencing lower than average engagement. Consider refreshing the primary image or updating keywords to target lower competition niches."
                                )}
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-teal-600 uppercase tracking-wider">Key Opportunities</h4>
                                <div className="flex flex-wrap gap-2">
                                    {data.tags?.some((t: string) => t.toLowerCase().includes('custom') || t.toLowerCase().includes('personalized')) && (
                                        <div className="px-3 py-1.5 bg-teal-50 text-teal-700 text-xs font-medium rounded-lg border border-teal-100">
                                            ✨ Add 'Rush Order' option
                                        </div>
                                    )}
                                    {data.price < 50 && data.favorites > 100 && (
                                        <div className="px-3 py-1.5 bg-teal-50 text-teal-700 text-xs font-medium rounded-lg border border-teal-100">
                                            📈 Test price increase (+15%)
                                        </div>
                                    )}
                                    {data.tags?.some((t: string) => t.toLowerCase().includes('leather')) && (
                                        <div className="px-3 py-1.5 bg-teal-50 text-teal-700 text-xs font-medium rounded-lg border border-teal-100">
                                            👜 Expand to 'Leather Goods'
                                        </div>
                                    )}
                                    {isTrending && data.age_months > 6 && (
                                        <div className="px-3 py-1.5 bg-teal-50 text-teal-700 text-xs font-medium rounded-lg border border-teal-100">
                                            📸 Refresh lifestyle photos
                                        </div>
                                    )}
                                    <div className="px-3 py-1.5 bg-teal-50 text-teal-700 text-xs font-medium rounded-lg border border-teal-100">
                                        🔍 Monitor competitor pricing
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Section D: Recent Reviews Log */}
                <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-800">Recent Reviews Log</CardTitle>
                        <p className="text-sm text-slate-500">Verification data for estimated sales figures</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.reviews.map((review: any) => (
                                <div key={review.id} className="flex flex-col sm:flex-row gap-4 p-4 bg-white/50 rounded-xl border border-slate-100 hover:border-teal-100 transition-colors">
                                    <div className="flex items-center gap-1 sm:w-32 shrink-0">
                                        <div className="flex text-amber-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={cn("h-4 w-4", i < review.rating ? "fill-current" : "text-slate-200")}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-slate-700 font-medium">{review.comment}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <span className="font-semibold text-slate-500">{review.user}</span>
                                            <span>•</span>
                                            <span>{review.date}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
