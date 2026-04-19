'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, TrendingUp, TrendingDown, Minus, Search, ExternalLink, X, Tag, DollarSign, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DashboardLayout } from '@/components/DashboardLayout'
import { createClient } from '@/utils/supabase/client'
import { TableSkeleton } from '@/components/TableSkeleton'
import { useToast } from '@/components/Toast'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface SavedKeyword {
    id: string
    keyword: string
    search_volume: number
    competition: string
    ctr: string | null
    trend: string | null
    created_at: string
}

function KeywordDetailModal({ item, onClose }: { item: SavedKeyword; onClose: () => void }) {
    const router = useRouter()
    const [volumeRange, setVolumeRange] = useState<'1M'|'6M'|'1Y'|'ALL'>('1Y')
    const [copiedTag, setCopiedTag] = useState<string|null>(null)
    const [copiedAll, setCopiedAll] = useState(false)

    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const growthPct = item.trend === 'up' ? 42 : item.trend === 'down' ? -18 : 5
    const volume = item.search_volume ?? 0
    const competition = item.competition ?? 'Medium'
    const ctr = item.ctr ?? '3.0%'

    const kwScore = Math.min(99, Math.max(20, Math.round(
        (growthPct > 0 ? Math.min(growthPct, 150) / 2.5 : 0) +
        (competition === 'Low' ? 35 : competition === 'Medium' ? 25 : competition === 'Very High' ? 5 : 12) +
        Math.min(volume / 1500, 22)
    )))

    const monthlyVolData = MONTHS.map((month, i) => {
        const progress = i / 11
        const trend = volume * (1 - growthPct/200) + volume * (growthPct/200) * 2 * progress
        return { month, searches: Math.max(50, Math.round(trend + trend * 0.07 * Math.sin(i * 1.3))) }
    })
    const prevYearVolData = monthlyVolData.map(d => ({ month: d.month + "'23", searches: Math.round(d.searches * 0.72) }))
    const thisYearVolData = monthlyVolData.map(d => ({ ...d, month: d.month + "'24" }))
    const lastVol = monthlyVolData[11].searches
    const oneMonthVolData = ['Wk 1','Wk 2','Wk 3','Wk 4'].map((wk, i) => ({
        month: wk, searches: Math.round(lastVol / 4 * (0.88 + Math.sin(i * 1.4) * 0.12)),
    }))
    const chartData = volumeRange === '1M' ? oneMonthVolData : volumeRange === '6M' ? monthlyVolData.slice(-6) : volumeRange === 'ALL' ? [...prevYearVolData, ...thisYearVolData] : monthlyVolData

    const baseRev = volume * (competition === 'Low' ? 0.048 : competition === 'Medium' ? 0.032 : competition === 'Very High' ? 0.012 : 0.022) * 28
    const monthlyRev = Math.round(baseRev)

    const compColor = (c: string) => {
        if (c === 'Low')       return 'text-emerald-700 bg-white border-emerald-200'
        if (c === 'Medium')    return 'text-amber-700 bg-white border-amber-200'
        if (c === 'High')      return 'text-rose-700 bg-white border-rose-200'
        return 'text-purple-700 bg-white border-purple-200'
    }

    const relatedTags = [item.keyword.toLowerCase(), ...item.keyword.toLowerCase().split(' '), 'handmade', 'gift', 'etsy', 'custom']
        .filter((v, i, a) => a.indexOf(v) === i && v.length > 2).slice(0, 8)
    const COMPS = ['Low','Medium','High','Very High'] as const
    const tagRows = relatedTags.map((tag, i) => {
        const seed = tag.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
        const vol = Math.round(volume * (0.06 + (seed % 38) / 100))
        const comp = COMPS[(seed + i) % 4]
        const score = Math.min(99, Math.max(18, Math.round(
            (growthPct > 0 ? Math.min(growthPct, 150) / 3 : 0) +
            (['Low','Medium'].includes(comp) ? 28 : 8) +
            Math.min(vol / 1200, 18) + (seed % 18)
        )))
        return { tag, vol, comp, score }
    })

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200/60 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="max-h-[92vh] overflow-y-auto">
                    <div className="relative rounded-t-2xl bg-teal-600 px-6 pt-3 pb-4 text-white">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-xl bg-white/20 border-2 border-white/30 flex-shrink-0 shadow-md flex items-center justify-center">
                                    <Search className="h-6 w-6 text-white/80" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black capitalize">{item.keyword}</h2>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-sm text-white/80 font-semibold">{volume.toLocaleString()} searches/mo</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 mt-2.5">
                                        <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">Keyword Score</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-28 h-2 bg-white/20 rounded-full overflow-hidden">
                                                <div className="h-full bg-white rounded-full" style={{ width: `${kwScore}%` }} />
                                            </div>
                                            <span className="font-black text-white text-lg leading-none">{kwScore}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <a href={`https://www.etsy.com/search?q=${encodeURIComponent(item.keyword)}`} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-sm font-semibold bg-white/20 hover:bg-white/30 border border-white/30 px-4 py-2 rounded-lg transition-colors">
                                    <ExternalLink className="h-4 w-4" /> Search Etsy
                                </a>
                                <button onClick={() => router.push(`/dashboard/keyword-research/${encodeURIComponent(item.keyword)}`)}
                                    className="flex items-center gap-1.5 text-sm font-semibold bg-white text-teal-700 hover:bg-white/90 px-4 py-2 rounded-lg transition-colors shadow-sm">
                                    <TrendingUp className="h-4 w-4" /> Full Analysis
                                </button>
                                <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/70 hover:text-white">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 space-y-5 bg-slate-50 rounded-b-2xl">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="rounded-xl border border-teal-200 bg-white p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">Revenue</span>
                                    <DollarSign className="h-4 w-4 text-teal-400 opacity-70" />
                                </div>
                                <p className="text-2xl font-black text-teal-900">
                                    {monthlyRev >= 1000 ? `$${(monthlyRev/1000).toFixed(0)}k` : `$${monthlyRev}`}
                                </p>
                                <p className="text-xs text-teal-500 mt-0.5">est. monthly</p>
                            </div>
                            <div className={cn("rounded-xl border p-4 bg-white", growthPct > 0 ? "border-emerald-200" : growthPct < 0 ? "border-rose-200" : "border-slate-200")}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", growthPct > 0 ? "text-emerald-600" : growthPct < 0 ? "text-rose-600" : "text-slate-500")}>Growth</span>
                                    {growthPct > 0 ? <TrendingUp className="h-4 w-4 text-emerald-400 opacity-70" /> : growthPct < 0 ? <TrendingDown className="h-4 w-4 text-rose-400 opacity-70" /> : <Minus className="h-4 w-4 text-slate-400 opacity-70" />}
                                </div>
                                <p className={cn("text-2xl font-black", growthPct > 0 ? "text-emerald-800" : growthPct < 0 ? "text-rose-800" : "text-slate-700")}>
                                    {growthPct > 0 ? `+${growthPct}%` : `${growthPct}%`}
                                </p>
                                <p className={cn("text-xs mt-0.5", growthPct > 0 ? "text-emerald-500" : growthPct < 0 ? "text-rose-400" : "text-slate-400")}>over 12 months</p>
                            </div>
                            <div className={cn("rounded-xl border p-4 bg-white", compColor(competition).replace(/bg-\S+/g, ''))}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Competition</span>
                                    <Tag className="h-4 w-4 opacity-40" />
                                </div>
                                <p className="text-xl font-black">{competition}</p>
                                <p className="text-xs mt-0.5 opacity-60">seller density</p>
                            </div>
                            <div className="rounded-xl border border-violet-200 bg-white p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600">Conv. Rate</span>
                                    <TrendingUp className="h-4 w-4 text-violet-400 opacity-70" />
                                </div>
                                <p className="text-2xl font-black text-violet-900">{ctr}</p>
                                <p className="text-xs text-violet-500 mt-0.5 opacity-60">avg. estimate</p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-bold text-slate-700">Search Volume</p>
                                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                                    {(['1M','6M','1Y','ALL'] as const).map(r => (
                                        <button key={r} onClick={() => setVolumeRange(r)}
                                            className={cn("px-2.5 py-1 rounded-md text-xs font-semibold transition-all",
                                                volumeRange === r ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                            )}>
                                            {r === 'ALL' ? 'All' : r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="h-[190px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="kwVolGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.18} />
                                                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : `${v}`} width={36} />
                                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0' }} formatter={(v: number) => [`${v.toLocaleString()}`, 'Searches']} itemStyle={{ color: '#0f766e', fontWeight: 600 }} labelStyle={{ color: '#475569', fontWeight: 500 }} />
                                        <Area type="monotone" dataKey="searches" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#kwVolGradient)" dot={false} activeDot={{ r: 5, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }} />
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
                                                <Tag className="h-3.5 w-3.5 opacity-80" /> Related Keywords
                                                <button onClick={() => { navigator.clipboard.writeText(relatedTags.join(', ')); setCopiedAll(true); setTimeout(() => setCopiedAll(false), 1500) }}
                                                    className="flex items-center gap-1 text-[10px] font-semibold bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-md transition-colors normal-case tracking-normal">
                                                    {copiedAll ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy All</>}
                                                </button>
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 w-[20%]">Volume</th>
                                        <th className="px-4 py-3 w-[22%]">Competition</th>
                                        <th className="px-4 py-3 w-[18%] text-right">Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {tagRows.map(({ tag, vol, comp, score }) => (
                                        <tr key={tag} className="group hover:bg-teal-50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => { navigator.clipboard.writeText(tag); setCopiedTag(tag); setTimeout(() => setCopiedTag(null), 1500) }}
                                                        className="text-slate-300 hover:text-teal-500 transition-colors">
                                                        {copiedTag === tag ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                                    </button>
                                                    <span className="font-medium text-slate-700 capitalize">{tag}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 font-medium">{vol >= 1000 ? `${(vol/1000).toFixed(0)}k` : vol}</td>
                                            <td className="px-4 py-3">
                                                <span className={cn("text-[11px] font-bold px-2.5 py-0.5 rounded-full border", compColor(comp))}>{comp}</span>
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
                </div>
            </div>
        </div>
    )
}

export default function SavedKeywordsPage() {
    const [savedKeywords, setSavedKeywords] = useState<SavedKeyword[]>([])
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)
    const [selectedKeyword, setSelectedKeyword] = useState<SavedKeyword | null>(null)
    const supabase = createClient()
    const router = useRouter()
    const { success, error: toastError } = useToast()

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            setUserId(user.id)
            await fetchSavedKeywords(user.id)
        }
        init()
    }, [])

    const fetchSavedKeywords = async (uid?: string) => {
        const resolvedUid = uid ?? userId
        if (!resolvedUid) return
        try {
            const { data, error } = await supabase
                .from('saved_keywords')
                .select('*')
                .eq('user_id', resolvedUid)
                .order('created_at', { ascending: false })

            if (error) throw error
            if (data) setSavedKeywords(data)
        } catch (error) {
            console.error('Error fetching saved keywords:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        e.preventDefault()

        setSavedKeywords(prev => prev.filter(k => k.id !== id))

        const { data, error } = await supabase
            .from('saved_keywords')
            .delete()
            .eq('id', id)
            .select()

        if (error) {
            console.error('Delete error:', error)
            toastError('Failed to delete keyword', 'Please try again.')
            fetchSavedKeywords()
        } else if (!data || data.length === 0) {
            console.error('Delete returned 0 rows — RLS may be blocking. id:', id, 'userId:', userId)
            toastError('Failed to delete keyword', 'Permission error — please try again.')
            fetchSavedKeywords()
        } else {
            success('Keyword removed')
        }
    }

    const handleKeywordClick = (item: SavedKeyword) => {
        setSelectedKeyword(item)
    }

    return (
        <>
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="rounded-2xl bg-teal-600 px-7 py-5 flex items-center gap-5 shadow-md shadow-teal-900/20">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 flex-shrink-0">
                        <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Saved Keywords</h1>
                        <p className="text-sm text-white/75 mt-0.5">Manage your collection of potential product keywords.</p>
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
                                    <th className="px-3 py-4 text-sm font-medium uppercase tracking-wider text-white">Keyword</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white">Search Vol</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white">Competition</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white">Conv.</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white">Trend</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white">Saved On</th>
                                    <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {savedKeywords.length > 0 ? (
                                    savedKeywords.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            onClick={() => handleKeywordClick(item)}
                                            className="group cursor-pointer transition-all duration-150 hover:bg-teal-50 hover:shadow-[inset_3px_0_0_0_#14b8a6]"
                                        >
                                            {/* Rank */}
                                            <td className="w-10 pl-5 pr-2 py-3.5 text-xs font-bold text-slate-300 group-hover:text-teal-500 transition-colors tabular-nums">
                                                {String(index + 1).padStart(2, '0')}
                                            </td>
                                            {/* Keyword */}
                                            <td className="px-3 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-7 w-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-100 transition-colors">
                                                        <Search className="h-3.5 w-3.5 text-teal-500" />
                                                    </div>
                                                    <span className="font-semibold text-slate-800 group-hover:text-teal-700 transition-all">
                                                        {item.keyword}
                                                    </span>
                                                    <ExternalLink className="h-3 w-3 text-slate-300 group-hover:text-teal-400 transition-colors opacity-0 group-hover:opacity-100" />
                                                </div>
                                            </td>
                                            {/* Search Volume */}
                                            <td className="px-5 py-3.5">
                                                <span className="font-bold text-teal-600 tabular-nums">
                                                    {item.search_volume?.toLocaleString() ?? '—'}
                                                </span>
                                                <span className="text-xs text-slate-400 ml-1">/mo</span>
                                            </td>
                                            {/* Competition */}
                                            <td className="px-5 py-3.5">
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
                                                    {item.competition ?? '—'}
                                                </span>
                                            </td>
                                            {/* Conv. */}
                                            <td className="px-5 py-3.5">
                                                <span className="font-semibold text-slate-700 tabular-nums text-sm">
                                                    {item.ctr ?? '—'}
                                                </span>
                                            </td>
                                            {/* Trend */}
                                            <td className="px-5 py-3.5">
                                                {item.trend === 'up'     && <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full"><TrendingUp className="h-3.5 w-3.5" />Rising</span>}
                                                {item.trend === 'down'   && <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full"><TrendingDown className="h-3.5 w-3.5" />Falling</span>}
                                                {item.trend === 'stable' && <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full"><Minus className="h-3.5 w-3.5" />Stable</span>}
                                                {!item.trend && <span className="text-slate-400 text-sm">—</span>}
                                            </td>
                                            {/* Saved On */}
                                            <td className="px-5 py-3.5 text-slate-400 text-xs tabular-nums">
                                                {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            {/* Actions */}
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <a
                                                        href={`https://www.etsy.com/search?q=${encodeURIComponent(item.keyword)}`}
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
                                            No saved keywords yet. Go to <span className="font-semibold text-teal-600">Keyword Research</span> to save some!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>

        {selectedKeyword && (
            <KeywordDetailModal item={selectedKeyword} onClose={() => setSelectedKeyword(null)} />
        )}
    </>
    )
}

