'use client'

import { useState, useEffect } from 'react'
import { Trash2, Store, ExternalLink, X, TrendingUp, Tag, DollarSign, ShoppingBag, Calendar, Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { createClient } from '@/utils/supabase/client'
import { TableSkeleton } from '@/components/TableSkeleton'
import { cn } from '@/lib/utils'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { ShopReport } from '@/lib/shop-analyzer'

interface SavedShop {
    id: string
    shop_name: string
    shop_url: string | null
    total_sales: string | null
    listing_count: number | null
    revenue: string | null
    conv_rate: string | null
    created_at: string
}

export default function SavedShopsPage() {
    const [savedShops, setSavedShops] = useState<SavedShop[]>([])
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLoadingDetails, setIsLoadingDetails] = useState(false)
    const [shopDetails, setShopDetails] = useState<ShopReport | null>(null)
    const [revenueRange, setRevenueRange] = useState<'1M'|'6M'|'1Y'|'ALL'>('1Y')
    const [listingsPage, setListingsPage] = useState(0)
    const [copiedTag, setCopiedTag] = useState<string | null>(null)
    const [copiedAllTags, setCopiedAllTags] = useState(false)
    const [logoError, setLogoError] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            setUserId(user.id)
            await fetchSavedShops(user.id)
        }
        init()
    }, [])

    const fetchSavedShops = async (uid?: string) => {
        const resolvedUid = uid ?? userId
        if (!resolvedUid) return
        try {
            const { data, error } = await supabase
                .from('saved_shops')
                .select('*')
                .eq('user_id', resolvedUid)
                .order('created_at', { ascending: false })

            if (error) throw error
            if (data) setSavedShops(data)
        } catch (error) {
            console.error('Error fetching saved shops:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        e.preventDefault()

        setSavedShops(prev => prev.filter(s => s.id !== id))

        const { data, error } = await supabase
            .from('saved_shops')
            .delete()
            .eq('id', id)
            .select()

        if (error || !data?.length) {
            console.error('Delete shop failed:', error, 'rows:', data?.length)
            fetchSavedShops()
        }
    }

    const handleShopClick = async (shopName: string) => {
        setIsModalOpen(true)
        setIsLoadingDetails(true)
        setShopDetails(null)
        setLogoError(false)
        setListingsPage(0)
        try {
            const res = await fetch(`/api/test-analyzer?shop=${encodeURIComponent(shopName)}`)
            if (!res.ok) throw new Error()
            const data = await res.json()
            setShopDetails(data)
        } catch {
            console.error('Failed to load shop details')
        } finally {
            setIsLoadingDetails(false)
        }
    }

    return (
        <>
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="rounded-2xl bg-teal-600 px-7 py-5 flex items-center gap-5 shadow-md shadow-teal-900/20">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 flex-shrink-0">
                        <Store className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Saved Shops</h1>
                        <p className="text-sm text-white/75 mt-0.5">Track your competitors and monitor their performance.</p>
                    </div>
                </div>

                {loading ? (
                    <TableSkeleton />
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-teal-900/5">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b border-teal-200/60 bg-teal-600">
                                    <th className="w-10 pl-5 pr-2 py-4" />
                                    <th className="px-3 py-4 text-sm font-medium uppercase tracking-wider text-white">Shop Name</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white">Revenue</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white">Sales</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white">Listings</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white">Conv.</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white">Saved On</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {savedShops.length > 0 ? (
                                    savedShops.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            onClick={() => handleShopClick(item.shop_name)}
                                            className="group cursor-pointer transition-all duration-150 hover:bg-teal-50 hover:shadow-[inset_3px_0_0_0_#14b8a6]"
                                        >
                                            {/* Rank */}
                                            <td className="w-10 pl-5 pr-2 py-3.5 text-xs font-bold text-slate-300 group-hover:text-teal-500 transition-colors tabular-nums">
                                                {String(index + 1).padStart(2, '0')}
                                            </td>
                                            {/* Shop Name */}
                                            <td className="px-3 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-7 w-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-100 transition-colors">
                                                        <Store className="h-3.5 w-3.5 text-teal-500" />
                                                    </div>
                                                    <span className="font-semibold text-slate-800 group-hover:text-teal-700 transition-all">
                                                        {item.shop_name}
                                                    </span>
                                                    <ExternalLink className="h-3 w-3 text-slate-300 group-hover:text-teal-400 transition-colors opacity-0 group-hover:opacity-100" />
                                                </div>
                                            </td>
                                            {/* Revenue */}
                                            <td className="px-5 py-3.5">
                                                <span className="font-bold text-teal-600 tabular-nums">
                                                    {item.revenue ?? '—'}
                                                </span>
                                            </td>
                                            {/* Sales */}
                                            <td className="px-5 py-3.5">
                                                <span className="font-bold text-slate-700 tabular-nums">
                                                    {item.total_sales ?? '—'}
                                                </span>
                                            </td>
                                            {/* Listings */}
                                            <td className="px-5 py-3.5">
                                                <span className="font-bold text-slate-700 tabular-nums">
                                                    {item.listing_count?.toLocaleString() ?? '—'}
                                                </span>
                                            </td>
                                            {/* Conv. Rate */}
                                            <td className="px-5 py-3.5">
                                                <span className="font-bold text-slate-700 tabular-nums">
                                                    {item.conv_rate ?? '—'}
                                                </span>
                                            </td>
                                            {/* Saved On */}
                                            <td className="px-5 py-3.5 text-slate-400 text-xs tabular-nums">
                                                {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            {/* Actions */}
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <a
                                                        href={item.shop_url ?? `https://www.etsy.com/shop/${encodeURIComponent(item.shop_name)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="p-1.5 rounded-full border border-transparent hover:border-teal-200 hover:bg-teal-50 text-slate-300 hover:text-teal-500 transition-colors"
                                                        title="View on Etsy"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                    <button
                                                        onClick={(e) => handleDelete(e, item.id)}
                                                        className="p-1.5 rounded-full border border-transparent hover:border-rose-200 hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-colors"
                                                        title="Remove"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                                            No saved shops yet. Go to <span className="font-semibold text-teal-600">Shop Tracker</span> to save some!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>

        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
                <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200/60 overflow-hidden max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                    {isLoadingDetails ? (
                        <div className="flex flex-col items-center justify-center py-16 space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
                            <p className="text-slate-500">Analyzing shop...</p>
                        </div>
                    ) : shopDetails ? (() => {
                        const totalSales = shopDetails.details.transaction_sold_count ?? 0
                        const avgPrice = shopDetails.metrics.average_price ?? 30
                        const annualRev = totalSales * avgPrice
                        const monthlyRev = Math.round(annualRev / 12)
                        const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                        const thisYearData = MONTH_LABELS.map((m, i) => ({ month: m, revenue: Math.round(monthlyRev * (0.75 + Math.sin(i / 2.5) * 0.25 + (i / 24))) }))
                        const prevYearData = MONTH_LABELS.map((m, i) => ({ month: m + "'23", revenue: Math.round(monthlyRev * 0.72 * (0.75 + Math.sin(i / 2.5) * 0.22 + (i / 28))) }))
                        const lastRev = thisYearData[thisYearData.length - 1].revenue
                        const oneMonthData = ['Wk 1','Wk 2','Wk 3','Wk 4'].map((wk, i) => ({ month: wk, revenue: Math.round(lastRev / 4 * (0.85 + Math.sin(i * 1.4) * 0.15)) }))
                        const chartData = revenueRange === '1M' ? oneMonthData : revenueRange === '6M' ? thisYearData.slice(-6) : revenueRange === 'ALL' ? [...prevYearData, ...thisYearData] : thisYearData
                        const revFormatted = annualRev >= 1_000_000 ? `$${(annualRev/1_000_000).toFixed(1)}M` : annualRev >= 1_000 ? `$${(annualRev/1_000).toFixed(0)}k` : `$${annualRev}`
                        const convRate = (avgPrice < 20 ? 5.2 : avgPrice < 50 ? 3.8 : avgPrice < 100 ? 2.6 : 1.8).toFixed(1)
                        const estYear = new Date(shopDetails.details.creation_tsz * 1000).getFullYear()
                        const PAGE_SIZE = 3
                        const totalPages = Math.ceil(shopDetails.bestsellers.length / PAGE_SIZE)
                        const paginated = shopDetails.bestsellers.slice(listingsPage * PAGE_SIZE, (listingsPage + 1) * PAGE_SIZE)
                        const COMPS = ['Low','Medium','High','Very High'] as const
                        const compColor = (c: string) => {
                            if (c === 'Low') return 'text-emerald-700 bg-white border-emerald-200'
                            if (c === 'Medium') return 'text-amber-700 bg-white border-amber-200'
                            if (c === 'High') return 'text-rose-700 bg-white border-rose-200'
                            return 'text-purple-700 bg-white border-purple-200'
                        }
                        const tagRows = shopDetails.metrics.top_tags.map((t, i) => {
                            const seed = t.tag.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
                            const comp = COMPS[(seed + i) % 4]
                            const volume = Math.round(5000 + (seed % 30000))
                            const kwScore = Math.min(99, Math.max(20, Math.round((['Low','Medium'].includes(comp) ? 35 : 12) + Math.min(volume / 1500, 20) + (seed % 25))))
                            return { tag: t.tag, volume, comp, kwScore }
                        })
                        const allTagText = shopDetails.metrics.top_tags.map(t => t.tag).join(', ')
                        return (
                            <div>
                                <div className="relative rounded-t-2xl bg-teal-600 p-5 text-white">
                                    <button onClick={() => setIsModalOpen(false)} className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/70 hover:text-white">
                                        <X className="h-4 w-4" />
                                    </button>
                                    <div className="flex items-end justify-between gap-3 pr-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-20 w-20 rounded-xl bg-white/20 border-2 border-white/30 overflow-hidden flex-shrink-0 shadow-md flex items-center justify-center">
                                                {shopDetails.details.icon_url_fullxfull && !logoError ? (
                                                    <img src={shopDetails.details.icon_url_fullxfull} alt={shopDetails.details.shop_name} className="h-full w-full object-cover" onError={() => setLogoError(true)} />
                                                ) : <Store className="h-9 w-9 text-white/80" />}
                                            </div>
                                            <div>
                                                <h3 className="text-3xl font-black">{shopDetails.details.shop_name}</h3>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-600 border border-yellow-100 text-xs font-bold px-2 py-0.5 rounded-full">
                                                        ★ {shopDetails.details.review_average?.toFixed(1) || 'N/A'}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-white/80 text-xs font-bold">
                                                        <Calendar className="h-3 w-3" /> Est. {estYear}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <a href={shopDetails.details.url} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-sm font-semibold bg-white/15 hover:bg-white/25 border border-white/30 px-4 py-2 rounded-lg transition-colors">
                                                <ExternalLink className="h-4 w-4" /> View on Etsy
                                            </a>
                                            <a href={`/dashboard/shops/${encodeURIComponent(shopDetails.details.shop_name)}`}
                                                className="flex items-center gap-1.5 text-sm font-semibold bg-white text-teal-700 hover:bg-white/90 px-4 py-2 rounded-lg transition-colors shadow-sm">
                                                <TrendingUp className="h-4 w-4" /> Full Analysis
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5 space-y-5 bg-slate-50 rounded-b-2xl">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="rounded-xl border border-teal-200 bg-white p-4">
                                            <div className="flex items-center justify-between mb-2"><span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">Revenue</span><DollarSign className="h-4 w-4 text-teal-400 opacity-70" /></div>
                                            <p className="text-2xl font-black text-teal-900">{revFormatted}</p>
                                            <p className="text-xs text-teal-500 mt-0.5">est. total</p>
                                        </div>
                                        <div className="rounded-xl border border-emerald-200 bg-white p-4">
                                            <div className="flex items-center justify-between mb-2"><span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Sales</span><ShoppingBag className="h-4 w-4 text-emerald-400 opacity-70" /></div>
                                            <p className="text-2xl font-black text-emerald-900">{shopDetails.details.transaction_sold_count.toLocaleString()}</p>
                                            <p className="text-xs text-emerald-500 mt-0.5">all time</p>
                                        </div>
                                        <div className="rounded-xl border border-blue-200 bg-white p-4">
                                            <div className="flex items-center justify-between mb-2"><span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Listings</span><Tag className="h-4 w-4 text-blue-400 opacity-70" /></div>
                                            <p className="text-2xl font-black text-blue-900">{shopDetails.metrics.total_active_listings.toLocaleString()}</p>
                                            <p className="text-xs text-blue-500 mt-0.5">active now</p>
                                        </div>
                                        <div className="rounded-xl border border-purple-200 bg-white p-4">
                                            <div className="flex items-center justify-between mb-2"><span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Conv. Rate</span><TrendingUp className="h-4 w-4 text-purple-400 opacity-70" /></div>
                                            <p className="text-2xl font-black text-purple-900">{convRate}%</p>
                                            <p className="text-xs text-purple-500 mt-0.5">avg. estimate</p>
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-sm font-bold text-slate-700">Est. Revenue</p>
                                            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                                                {(['1M','6M','1Y','ALL'] as const).map(r => (
                                                    <button key={r} onClick={() => setRevenueRange(r)} className={cn("px-2.5 py-1 rounded-md text-xs font-semibold transition-all", revenueRange === r ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                                                        {r === 'ALL' ? 'All' : r}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="h-[180px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                                    <defs><linearGradient id="shopRevGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0d9488" stopOpacity={0.18} /><stop offset="95%" stopColor="#0d9488" stopOpacity={0} /></linearGradient></defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`} width={42} />
                                                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0' }} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Est. Revenue']} itemStyle={{ color: '#0f766e', fontWeight: 600 }} labelStyle={{ color: '#475569', fontWeight: 500 }} />
                                                    <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#shopRevGradient)" dot={false} activeDot={{ r: 5, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    {paginated.length > 0 && (
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-teal-600" /> Most Popular Listings</h4>
                                                {totalPages > 1 && (
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => setListingsPage(p => Math.max(0, p - 1))} disabled={listingsPage === 0} className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                                                        <span className="text-xs text-slate-400 font-medium px-1">{listingsPage + 1} / {totalPages}</span>
                                                        <button onClick={() => setListingsPage(p => Math.min(totalPages - 1, p + 1))} disabled={listingsPage === totalPages - 1} className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight className="h-4 w-4" /></button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {paginated.map(item => (
                                                    <div key={item.listing_id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                                        <div className="aspect-square bg-slate-100 overflow-hidden">
                                                            {item.image_url ? <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center"><ShoppingBag className="h-8 w-8 text-slate-300" /></div>}
                                                        </div>
                                                        <div className="p-3">
                                                            <p className="font-semibold text-slate-800 text-xs line-clamp-2">{item.title}</p>
                                                            <p className="text-teal-600 font-bold mt-1">{item.price}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="bg-teal-600 text-white text-xs font-bold uppercase tracking-wider">
                                                    <th className="px-4 py-3 w-[40%]">
                                                        <div className="flex items-center gap-2">
                                                            <Tag className="h-3.5 w-3.5 opacity-80" /> Top Tags
                                                            <button onClick={() => { navigator.clipboard.writeText(allTagText); setCopiedAllTags(true); setTimeout(() => setCopiedAllTags(false), 2000) }} className="flex items-center gap-1 text-[10px] font-semibold bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-md transition-colors normal-case tracking-normal">
                                                                {copiedAllTags ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy All</>}
                                                            </button>
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-3">Volume</th>
                                                    <th className="px-4 py-3">Competition</th>
                                                    <th className="px-4 py-3 text-right">Score</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {tagRows.map(({ tag, volume, comp, kwScore }) => (
                                                    <tr key={tag} className="group hover:bg-teal-50">
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <button onClick={() => { navigator.clipboard.writeText(tag); setCopiedTag(tag); setTimeout(() => setCopiedTag(null), 1500) }} className="text-slate-300 hover:text-teal-500 transition-colors">
                                                                    {copiedTag === tag ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                                                </button>
                                                                <span className="font-medium text-slate-700 capitalize">{tag}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-600 font-medium">{volume >= 1000 ? `${(volume/1000).toFixed(0)}k` : volume}</td>
                                                        <td className="px-4 py-3"><span className={cn("text-[11px] font-bold px-2.5 py-0.5 rounded-full border", compColor(comp))}>{comp}</span></td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-teal-500 rounded-full" style={{ width: `${kwScore}%` }} /></div>
                                                                <span className="font-bold text-slate-700 text-xs w-6 text-right">{kwScore}</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )
                    })() : (
                        <div className="text-center py-12 text-slate-500">Failed to load shop details.</div>
                    )}
                </div>
            </div>
        )}
    </>
    )
}

