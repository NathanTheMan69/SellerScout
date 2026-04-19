'use client'

import { useState, useEffect } from 'react'
import { Trash2, ShoppingBag, ExternalLink, ImageOff, X, TrendingUp, TrendingDown, Tag, DollarSign, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DashboardLayout } from '@/components/DashboardLayout'
import { createClient } from '@/utils/supabase/client'
import { TableSkeleton } from '@/components/TableSkeleton'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface SavedListing {
    id: string
    listing_title: string
    listing_url: string
    price: number
    image_url: string
    total_sales: number
    revenue: string | null
    competition: string | null
    conv_rate: string | null
    created_at: string
}

function Thumbnail({ url, alt }: { url: string | null; alt: string }) {
    const [error, setError] = useState(false)
    if (!url || error) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-slate-50">
                <ImageOff className="h-4 w-4 text-slate-300" />
            </div>
        )
    }
    return <img src={url} alt={alt} className="h-full w-full object-cover" onError={() => setError(true)} />
}

export default function SavedListingsPage() {
    const [savedListings, setSavedListings] = useState<SavedListing[]>([])
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)
    const [selectedListing, setSelectedListing] = useState<SavedListing | null>(null)
    const [revenueRange, setRevenueRange] = useState<'1M'|'6M'|'1Y'|'ALL'>('1Y')
    const [copiedTag, setCopiedTag] = useState<string | null>(null)
    const [copiedAll, setCopiedAll] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            setUserId(user.id)
            await fetchSavedListings(user.id)
        }
        init()
    }, [])

    const fetchSavedListings = async (uid?: string) => {
        const resolvedUid = uid ?? userId
        if (!resolvedUid) return
        try {
            const { data, error } = await supabase
                .from('saved_listings')
                .select('*')
                .eq('user_id', resolvedUid)
                .order('created_at', { ascending: false })

            if (error) throw error
            if (data) setSavedListings(data)
        } catch (error) {
            console.error('Error fetching saved listings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        e.preventDefault()

        setSavedListings(prev => prev.filter(l => l.id !== id))

        const { data, error } = await supabase
            .from('saved_listings')
            .delete()
            .eq('id', id)
            .select()

        if (error || !data?.length) {
            console.error('Delete listing failed:', error, 'rows:', data?.length)
            fetchSavedListings()
        }
    }

    const handleListingClick = (item: SavedListing) => {
        setSelectedListing(item)
        setRevenueRange('1Y')
    }

    return (
        <>
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="rounded-2xl bg-teal-600 px-7 py-5 flex items-center gap-5 shadow-md shadow-teal-900/20">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 flex-shrink-0">
                        <ShoppingBag className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Saved Listings</h1>
                        <p className="text-sm text-white/75 mt-0.5">Track performance of specific listings over time.</p>
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
                                    <th className="px-3 py-4 text-sm font-medium uppercase tracking-wider text-white">Listing</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white">Revenue</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white">Sales</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white">Competition</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white">Conv.</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white">Saved On</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {savedListings.length > 0 ? (
                                    savedListings.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            onClick={() => handleListingClick(item)}
                                            className="group cursor-pointer transition-all duration-150 hover:bg-teal-50 hover:shadow-[inset_3px_0_0_0_#14b8a6]"
                                        >
                                            {/* Rank */}
                                            <td className="w-10 pl-5 pr-2 py-3.5 text-xs font-bold text-slate-300 group-hover:text-teal-500 transition-colors tabular-nums">
                                                {String(index + 1).padStart(2, '0')}
                                            </td>
                                            {/* Listing */}
                                            <td className="px-3 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 group-hover:border-teal-200 transition-colors">
                                                        <Thumbnail url={item.image_url} alt={item.listing_title} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="font-semibold text-slate-800 group-hover:text-teal-700 transition-all line-clamp-1 max-w-xs md:max-w-md block">
                                                            {item.listing_title}
                                                        </span>
                                                    </div>
                                                    <ExternalLink className="h-3 w-3 text-slate-300 group-hover:text-teal-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0" />
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
                                                    {item.total_sales?.toLocaleString() ?? '—'}
                                                </span>
                                            </td>
                                            {/* Competition */}
                                            <td className="px-5 py-3.5">
                                                {item.competition ? (
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border",
                                                        item.competition === 'Low'       && "bg-white text-emerald-700 border-emerald-200",
                                                        item.competition === 'Medium'    && "bg-white text-amber-700 border-amber-200",
                                                        item.competition === 'High'      && "bg-white text-rose-700 border-rose-200",
                                                        item.competition === 'Very High' && "bg-white text-purple-700 border-purple-200"
                                                    )}>
                                                        <span className={cn("h-1.5 w-1.5 rounded-full",
                                                            item.competition === 'Low'       && "bg-emerald-500",
                                                            item.competition === 'Medium'    && "bg-amber-500",
                                                            item.competition === 'High'      && "bg-rose-500",
                                                            item.competition === 'Very High' && "bg-purple-500"
                                                        )} />
                                                        {item.competition}
                                                    </span>
                                                ) : <span className="text-slate-400 text-sm">—</span>}
                                            </td>
                                            {/* Conv. */}
                                            <td className="px-5 py-3.5">
                                                <span className="font-semibold text-slate-700 tabular-nums text-sm">
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
                                                    {item.listing_url && (
                                                        <a
                                                            href={item.listing_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="p-1.5 rounded-full border border-transparent hover:border-teal-200 hover:bg-teal-50 text-slate-300 hover:text-teal-500 transition-colors"
                                                            title="View on Etsy"
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                        </a>
                                                    )}
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
                                            No saved listings yet. Go to <span className="font-semibold text-teal-600">Listing Analysis</span> to save some!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>

        {selectedListing && (() => {
            const competition = selectedListing.competition ?? 'Medium'
            const growth = 55
            const sv = (selectedListing.total_sales ?? 100) * 10
            const avgPrice = selectedListing.price ?? 25
            const convRate = { Low: 0.052, Medium: 0.038, High: 0.024, 'Very High': 0.016 }[competition] ?? 0.038
            const monthlyRevenue = Math.round(sv * convRate * avgPrice)
            const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
            const revenueData = MONTHS.map((month, i) => ({ month, revenue: Math.round(monthlyRevenue * (0.75 + Math.sin(i / 2.5) * 0.25 + (i / 24))) }))
            const prevYearData = revenueData.map((d, i) => ({ month: d.month + "'23", revenue: Math.round(d.revenue * 0.72) }))
            const thisYearData = revenueData.map(d => ({ ...d, month: d.month + "'24" }))
            const lastRev = revenueData[revenueData.length - 1].revenue
            const oneMonthData = ['Wk 1','Wk 2','Wk 3','Wk 4'].map((wk, i) => ({ month: wk, revenue: Math.round(lastRev / 4 * (0.85 + Math.sin(i * 1.4) * 0.15)) }))
            const chartData = revenueRange === '1M' ? oneMonthData : revenueRange === '6M' ? revenueData.slice(-6) : revenueRange === 'ALL' ? [...prevYearData, ...thisYearData] : revenueData
            const opportunityScore = Math.min(100, Math.round((growth > 0 ? Math.min(growth, 200) / 2 : 0) + (['Low','Medium'].includes(competition) ? 30 : 10) + Math.min(sv / 1000, 20)))
            const compColor = (c: string) => {
                if (c === 'Low') return 'text-emerald-700 bg-white border-emerald-200'
                if (c === 'Medium') return 'text-amber-700 bg-white border-amber-200'
                if (c === 'High') return 'text-rose-700 bg-white border-rose-200'
                return 'text-purple-700 bg-white border-purple-200'
            }
            const words = selectedListing.listing_title.toLowerCase().split(' ').filter(w => w.length > 2).slice(0, 5)
            const tags = [...new Set([...words, 'handmade', 'gift', 'etsy'])].slice(0, 8)
            const COMPS = ['Low','Medium','High','Very High'] as const
            const tagRows = tags.map((tag, i) => {
                const seed = tag.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
                const comp = COMPS[(seed + i) % 4]
                const vol = Math.round(sv * (0.05 + (seed % 38) / 100))
                const score = Math.min(99, Math.max(18, Math.round((['Low','Medium'].includes(comp) ? 28 : 8) + Math.min(vol / 1200, 18) + (seed % 20))))
                return { tag, vol, comp, score }
            })
            return (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedListing(null)}>
                    <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200/60 overflow-hidden max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="relative rounded-t-2xl bg-teal-600 px-6 pt-3 pb-4 text-white">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-20 w-20 rounded-xl bg-white/20 border-2 border-white/30 overflow-hidden flex-shrink-0 shadow-md">
                                        {selectedListing.image_url ? <img src={selectedListing.image_url} alt={selectedListing.listing_title} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center"><ShoppingBag className="h-8 w-8 text-white/80" /></div>}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black leading-tight max-w-sm">{selectedListing.listing_title}</h2>
                                        <div className="flex items-center gap-2.5 mt-2.5">
                                            <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">Listing Score</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-28 h-2 bg-white/20 rounded-full overflow-hidden">
                                                    <div className="h-full bg-white rounded-full" style={{ width: `${opportunityScore}%` }} />
                                                </div>
                                                <span className="font-black text-white text-lg leading-none">{opportunityScore}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {selectedListing.listing_url && (
                                        <a href={selectedListing.listing_url} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-sm font-semibold bg-white/20 hover:bg-white/30 border border-white/30 px-4 py-2 rounded-lg transition-colors">
                                            <ExternalLink className="h-4 w-4" /> View on Etsy
                                        </a>
                                    )}
                                    <button onClick={() => setSelectedListing(null)} className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/70 hover:text-white">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 space-y-5 bg-slate-50 rounded-b-2xl">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="rounded-xl border border-teal-200 bg-white p-4">
                                    <div className="flex items-center justify-between mb-2"><span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">Revenue</span><DollarSign className="h-4 w-4 text-teal-400 opacity-70" /></div>
                                    <p className="text-2xl font-black text-teal-900">{selectedListing.revenue ?? (monthlyRevenue >= 1000 ? `$${(monthlyRevenue/1000).toFixed(0)}k` : `$${monthlyRevenue}`)}</p>
                                    <p className="text-xs text-teal-500 mt-0.5">est. monthly</p>
                                </div>
                                <div className="rounded-xl border border-emerald-200 bg-white p-4">
                                    <div className="flex items-center justify-between mb-2"><span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Sales</span><ShoppingBag className="h-4 w-4 text-emerald-400 opacity-70" /></div>
                                    <p className="text-2xl font-black text-emerald-900">{selectedListing.total_sales?.toLocaleString() ?? '—'}</p>
                                    <p className="text-xs text-emerald-500 mt-0.5">all time</p>
                                </div>
                                <div className={cn("rounded-xl border p-4 bg-white", compColor(competition).replace(/bg-\S+/g, ''))}>
                                    <div className="flex items-center justify-between mb-2"><span className="text-[10px] font-bold uppercase tracking-wider">Competition</span><Tag className="h-4 w-4 opacity-40" /></div>
                                    <p className="text-xl font-black">{competition}</p>
                                    <p className="text-xs mt-0.5 opacity-60">seller density</p>
                                </div>
                                <div className="rounded-xl border border-violet-200 bg-white p-4">
                                    <div className="flex items-center justify-between mb-2"><span className="text-[10px] font-bold uppercase tracking-wider text-violet-600">Conv. Rate</span><TrendingUp className="h-4 w-4 text-violet-400 opacity-70" /></div>
                                    <p className="text-2xl font-black text-violet-900">{selectedListing.conv_rate ?? `${(convRate * 100).toFixed(1)}%`}</p>
                                    <p className="text-xs text-violet-500 mt-0.5 opacity-60">avg. estimate</p>
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
                                            <defs><linearGradient id="listingRevGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0d9488" stopOpacity={0.18} /><stop offset="95%" stopColor="#0d9488" stopOpacity={0} /></linearGradient></defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`} width={42} />
                                            <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0' }} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Est. Revenue']} itemStyle={{ color: '#0f766e', fontWeight: 600 }} labelStyle={{ color: '#475569', fontWeight: 500 }} />
                                            <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#listingRevGradient)" dot={false} activeDot={{ r: 5, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-teal-600 text-white text-xs font-bold uppercase tracking-wider">
                                            <th className="px-4 py-3 w-[40%]">
                                                <div className="flex items-center gap-2">
                                                    <Tag className="h-3.5 w-3.5 opacity-80" /> Tags
                                                    <button onClick={() => { navigator.clipboard.writeText(tags.join(', ')); setCopiedAll(true); setTimeout(() => setCopiedAll(false), 1500) }} className="flex items-center gap-1 text-[10px] font-semibold bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-md transition-colors normal-case tracking-normal">
                                                        {copiedAll ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy All</>}
                                                    </button>
                                                </div>
                                            </th>
                                            <th className="px-4 py-3">Volume</th>
                                            <th className="px-4 py-3">Competition</th>
                                            <th className="px-4 py-3 text-right">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {tagRows.map(({ tag, vol, comp, score }) => (
                                            <tr key={tag} className="group hover:bg-teal-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => { navigator.clipboard.writeText(tag); setCopiedTag(tag); setTimeout(() => setCopiedTag(null), 1500) }} className="text-slate-300 hover:text-teal-500 transition-colors">
                                                            {copiedTag === tag ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                                        </button>
                                                        <span className="font-medium text-slate-700 capitalize">{tag}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 font-medium">{vol >= 1000 ? `${(vol/1000).toFixed(0)}k` : vol}</td>
                                                <td className="px-4 py-3"><span className={cn("text-[11px] font-bold px-2.5 py-0.5 rounded-full border", compColor(comp))}>{comp}</span></td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-teal-500 rounded-full" style={{ width: `${score}%` }} /></div>
                                                        <span className="font-bold text-slate-700 text-xs w-6 text-right">{score}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )
        })()}
    </>
    )
}

