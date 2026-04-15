"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { DashboardLayout } from "@/components/DashboardLayout"
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts"
import {
    Search,
    Loader2,
    Eye,
    Heart,
    X,
    ShoppingBag,
    ImageOff,
    Copy,
    Check,
    Package,
    DollarSign,
    Zap,
    CheckCircle,
    AlertTriangle,
    ExternalLink,
    Star,
    TrendingUp,
    Clock,
    Tag,
    Sparkles,
    Filter,
    Layers,
    Calendar,
    ChevronDown,
} from "lucide-react"

const MOCK_MY_LISTINGS = [
    {
        listing_id: 1, title: "Handmade Sterling Silver Stacking Ring Set",
        section: "Rings",
        price: { amount: 3400, divisor: 100, currency_code: "USD" },
        quantity: 12, num_sales: 240, views: 4820, favorites: 1240, revenue: 8160, reviews: 186,
        created_at: "2025-02-18T00:00:00.000Z",
        tags: ["silver ring", "stacking ring", "minimalist jewelry", "handmade", "gift for her"],
        images: [{ url_170x135: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=300&q=80", url_fullxfull: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&q=80" }],
        score: 87, description: "Beautiful handmade sterling silver stacking ring set, carefully crafted to sit perfectly together.",
        tag_score: 55, suggested_tags: ["925 silver", "boho ring", "thin ring", "promise ring"],
        tips: [
            { type: "good", text: 'Title includes primary keyword "silver ring"' },
            { type: "good", text: "5 relevant tags used" },
            { type: "warn", text: "Description could include more long-tail keywords" },
            { type: "warn", text: "Consider adding a size guide to reduce returns" },
        ],
    },
    {
        listing_id: 2, title: "Personalized Gold Initial Necklace",
        section: "Necklaces",
        price: { amount: 4800, divisor: 100, currency_code: "USD" },
        quantity: 8, num_sales: 175, views: 3100, favorites: 890, revenue: 8400, reviews: 142,
        created_at: "2024-11-09T00:00:00.000Z",
        tags: ["initial necklace", "personalized", "gold necklace", "custom jewelry", "bridesmaid gift"],
        images: [{ url_170x135: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=300&q=80", url_fullxfull: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=600&q=80" }],
        score: 92, description: "Personalized gold initial necklace, perfect for gifting. Available in 14k gold fill.",
        tag_score: 62, suggested_tags: ["letter necklace", "name necklace", "mothers day gift", "delicate necklace"],
        tips: [
            { type: "good", text: "Excellent use of gift-related keywords" },
            { type: "good", text: "High CTR from personalized angle" },
            { type: "good", text: "Strong bridesmaid gift positioning" },
            { type: "warn", text: "Add more photo angles to boost conversions" },
        ],
    },
    {
        listing_id: 3, title: "Boho Crystal Drop Earrings",
        section: "Earrings",
        price: { amount: 2200, divisor: 100, currency_code: "USD" },
        quantity: 20, num_sales: 88, views: 1850, favorites: 420, revenue: 1936, reviews: 54,
        created_at: "2025-08-01T00:00:00.000Z",
        tags: ["boho earrings", "crystal earrings", "drop earrings", "handmade earrings"],
        images: [{ url_170x135: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&q=80", url_fullxfull: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80" }],
        score: 64, description: "Handcrafted boho crystal drop earrings, lightweight and perfect for everyday wear.",
        tag_score: 31, suggested_tags: ["dangle earrings", "gemstone earrings", "festival jewelry", "witchy earrings", "healing crystals"],
        tips: [
            { type: "warn", text: 'Title missing high-volume keyword "dangle earrings"' },
            { type: "bad", text: "Only 4 tags - Etsy allows 13, add more" },
            { type: "warn", text: "Price is below category average ($28), consider raising" },
            { type: "good", text: "Photos are well-lit and high quality" },
        ],
    },
    {
        listing_id: 4, title: "Hammered Copper Cuff Bracelet",
        section: "Bracelets",
        price: { amount: 4100, divisor: 100, currency_code: "USD" },
        quantity: 3, num_sales: 42, views: 920, favorites: 210, revenue: 1722, reviews: 28,
        created_at: "2024-06-21T00:00:00.000Z",
        tags: ["copper bracelet", "cuff bracelet", "hammered metal", "artisan jewelry"],
        images: [{ url_170x135: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=300&q=80", url_fullxfull: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&q=80" }],
        score: 71, description: "Handmade hammered copper cuff bracelet, each piece is unique.",
        tag_score: 28, suggested_tags: ["rustic bracelet", "7th anniversary gift", "chunky bracelet", "adjustable bracelet", "gifts for men"],
        tips: [
            { type: "good", text: "Unique niche with low competition" },
            { type: "warn", text: 'Add "adjustable" to tags for wider reach' },
            { type: "bad", text: "Only 4 tags - missing significant search traffic" },
            { type: "warn", text: "Description is too short, expand to 250+ words" },
        ],
    },
    {
        listing_id: 5, title: "Minimalist Gold Bar Necklace",
        section: "Necklaces",
        price: { amount: 3800, divisor: 100, currency_code: "USD" },
        quantity: 15, num_sales: 310, views: 5600, favorites: 1680, revenue: 11780, reviews: 274,
        created_at: "2023-12-12T00:00:00.000Z",
        tags: ["gold bar necklace", "minimalist", "dainty necklace", "layering necklace", "gift for her", "gold jewelry", "simple necklace"],
        images: [{ url_170x135: "https://images.unsplash.com/photo-1616077167999-51d36a3e7fcf?w=300&q=80", url_fullxfull: "https://images.unsplash.com/photo-1616077167999-51d36a3e7fcf?w=600&q=80" }],
        score: 95, description: "Delicate minimalist gold bar necklace, perfect for layering.",
        tag_score: 87, suggested_tags: ["14k gold necklace", "engraved necklace", "custom bar"],
        tips: [
            { type: "good", text: "Top-performing listing in your shop" },
            { type: "good", text: "7 well-chosen, high-volume tags" },
            { type: "good", text: "Price is competitive for the category" },
            { type: "good", text: "Strong repeat customer rate" },
        ],
    },
    {
        listing_id: 6, title: "Custom Name Ring Sterling Silver",
        section: "Rings",
        price: { amount: 5500, divisor: 100, currency_code: "USD" },
        quantity: 7, num_sales: 98, views: 2340, favorites: 560, revenue: 5390, reviews: 71,
        created_at: "2025-04-03T00:00:00.000Z",
        tags: ["name ring", "custom ring", "personalized ring", "sterling silver", "engraved ring"],
        images: [{ url_170x135: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&q=80", url_fullxfull: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80" }],
        score: 78, description: "Custom name ring in sterling silver. Choose any name or word.",
        tag_score: 50, suggested_tags: ["mothers ring", "family ring", "stackable name ring", "push present"],
        tips: [
            { type: "good", text: "Personalization drives high average order value" },
            { type: "warn", text: 'Add "mothers day gift" to tags - seasonal opportunity' },
            { type: "warn", text: "Lead time not mentioned - add to listing details" },
            { type: "bad", text: "Fewer than 8 tags - leaving search traffic on the table" },
        ],
    },
]

type MockListing = typeof MOCK_MY_LISTINGS[number]

function formatPrice(listing: MockListing) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: listing.price.currency_code || "USD",
    }).format(listing.price.amount / listing.price.divisor)
}

function getScoreColor(score: number) {
    return score >= 85
        ? "text-emerald-700 bg-emerald-100/35 border-emerald-200"
        : score >= 70
            ? "text-amber-700 bg-amber-100/60 border-amber-200"
            : "text-rose-700 bg-rose-100/60 border-rose-200"
}

function getScoreLabel(score: number) {
    return score >= 85 ? "Excellent" : score >= 70 ? "Good" : "Needs Work"
}

function getListingAge(createdAt?: string) {
    if (!createdAt) return "Unknown"
    const created = new Date(createdAt)
    if (Number.isNaN(created.getTime())) return "Unknown"

    const now = new Date()
    const months = Math.max(
        0,
        (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth())
    )

    if (months < 1) return "New"
    if (months === 1) return "1 month"
    if (months < 12) return `${months} months`

    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    if (remainingMonths === 0) return years === 1 ? "1 year" : `${years} years`
    return `${years}y ${remainingMonths}m`
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)

    return (
        <button
            onClick={async (e) => {
                e.stopPropagation()
                await navigator.clipboard.writeText(text)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            }}
            className="p-1.5 hover:bg-teal-100 rounded-md transition-colors"
            title="Copy"
        >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-teal-400 hover:text-teal-600" />}
        </button>
    )
}

function ListingGridCard({ listing, onSelect }: { listing: MockListing; onSelect: (listing: MockListing) => void }) {
    const [imgError, setImgError] = useState(false)

    return (
        <div
            onClick={() => onSelect(listing)}
            className="group cursor-pointer rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-teal-300 hover:shadow-md hover:shadow-teal-900/10 overflow-hidden flex flex-col"
        >
            {/* Square image */}
            <div className="relative aspect-square bg-slate-100 overflow-hidden shrink-0">
                {listing.images[0] && !imgError ? (
                    <img
                        src={listing.images[0].url_fullxfull || listing.images[0].url_170x135}
                        alt={listing.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <ImageOff className="h-8 w-8 text-slate-300" />
                    </div>
                )}

                {/* Price — top left */}
                <div className="absolute top-2 left-2 flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-white">
                    {formatPrice(listing)}
                </div>

                {/* Score — top right */}
                <div className={cn(
                    "absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full border",
                    listing.score >= 85 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    listing.score >= 70 ? "bg-amber-50 text-amber-700 border-amber-200" :
                    "bg-rose-50 text-rose-700 border-rose-200"
                )}>
                    {listing.score}/100
                </div>
            </div>

            {/* Card body */}
            <div className="px-3 py-2.5 flex flex-col gap-1.5">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-800 text-sm leading-tight flex-1 min-w-0 truncate" title={listing.title}>
                        {listing.title}
                    </h3>
                    <div className="flex items-center gap-1 text-slate-400 whitespace-nowrap flex-shrink-0">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs font-semibold">{getListingAge(listing.created_at)}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <span className="text-sm font-black text-teal-600">${listing.revenue.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 font-medium">revenue</span>
                    </div>
                    <span className="text-slate-200">·</span>
                    <div className="flex items-center gap-1">
                        <span className="text-sm font-black text-slate-700">{listing.num_sales.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 font-medium">sales</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function getMockTagScore(tag: string) {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash) % 51 + 50; // Random deterministic score 50-100
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function generateListingRevenue(listing: MockListing) {
    const monthly = listing.revenue / 12
    return MONTHS.map((month, i) => ({
        month,
        revenue: Math.round(monthly * (0.7 + Math.sin(i * 0.8 + 1) * 0.2 + (i / 24))),
    }))
}

function ListingDetailModal({ listing, onClose }: { listing: MockListing; onClose: () => void }) {
    const [imgError, setImgError] = useState(false)
    const [revenueRange, setRevenueRange] = useState<'1M' | '6M' | '1Y' | 'ALL'>('1Y')

    return (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl shadow-slate-900/25 border border-slate-200/60 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="modal-card max-h-[92vh] overflow-y-auto">

                    {/* ── Teal Banner Header ── */}
                    <div className="relative rounded-t-2xl bg-teal-500/80 px-6 pt-3 pb-4 text-white overflow-hidden">
                        <div className="relative flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                {/* Thumbnail */}
                                <div className="h-20 w-20 rounded-xl bg-white/20 border-2 border-white/30 overflow-hidden flex-shrink-0 shadow-md flex items-center justify-center">
                                    {listing.images[0] && !imgError ? (
                                        <img
                                            src={listing.images[0].url_fullxfull || listing.images[0].url_170x135}
                                            alt={listing.title}
                                            className="h-full w-full object-cover"
                                            onError={() => setImgError(true)}
                                        />
                                    ) : (
                                        <Package className="h-6 w-6 text-white/80" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-normal leading-tight line-clamp-1">{listing.title}</h2>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">{formatPrice(listing)}</span>
                                        <span className="text-sm text-white/80 font-semibold">{getListingAge(listing.created_at)} old</span>
                                    </div>
                                    {/* Listing Score bar */}
                                    <div className="flex items-center gap-2.5 mt-2.5">
                                        <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">Listing Score</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-28 h-2 bg-white/20 rounded-full overflow-hidden">
                                                <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${listing.score}%` }} />
                                            </div>
                                            <span className="font-black text-white text-lg leading-none">{listing.score}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <a
                                    href={`https://www.etsy.com/search?q=${encodeURIComponent(listing.title)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 border border-white/30 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" /> View on Etsy
                                </a>
                                <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/70 hover:text-white">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Body ── */}
                    <div className="p-5 space-y-5 bg-slate-50 rounded-b-2xl">

                        {/* Stat Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-stretch">
                            <div className="rounded-xl border border-teal-200 bg-white p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">Revenue</span>
                                    <DollarSign className="h-4 w-4 text-teal-400 opacity-70" />
                                </div>
                                <p className="text-2xl font-black text-teal-900">${listing.revenue.toLocaleString()}</p>
                                <p className="text-xs text-teal-500 mt-0.5">total earned</p>
                            </div>
                            <div className="rounded-xl border border-emerald-200 bg-white p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Sales</span>
                                    <ShoppingBag className="h-4 w-4 text-emerald-400 opacity-70" />
                                </div>
                                <p className="text-2xl font-black text-emerald-900">{listing.num_sales.toLocaleString()}</p>
                                <p className="text-xs text-emerald-500 mt-0.5">units sold</p>
                            </div>
                            <div className="rounded-xl border border-orange-200 bg-white p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">Reviews</span>
                                    <Star className="h-4 w-4 text-orange-400 opacity-70" />
                                </div>
                                <p className="text-2xl font-black text-orange-900">{(listing.reviews ?? 0).toLocaleString()}</p>
                                <p className="text-xs text-orange-500 mt-0.5">customer reviews</p>
                            </div>
                            <div className="rounded-xl border border-violet-200 bg-white p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600">Conv. Rate</span>
                                    <TrendingUp className="h-4 w-4 text-violet-400 opacity-70" />
                                </div>
                                <p className="text-2xl font-black text-violet-900">
                                    {listing.views > 0 ? ((listing.num_sales / listing.views) * 100).toFixed(1) : '0.0'}%
                                </p>
                                <p className="text-xs text-violet-500 mt-0.5">sales / views</p>
                            </div>
                        </div>

                        {/* Revenue Chart */}
                        {(() => {
                            const allData = generateListingRevenue(listing)
                            const lastRev = allData[allData.length - 1].revenue
                            const oneMonthData = ['Wk 1','Wk 2','Wk 3','Wk 4'].map((wk, i) => ({
                                month: wk,
                                revenue: Math.round(lastRev / 4 * (0.85 + Math.sin(i * 1.4) * 0.15)),
                            }))
                            const prevYearData = allData.map(d => ({ ...d, month: d.month + "'23", revenue: Math.round(d.revenue * 0.75) }))
                            const thisYearData = allData.map(d => ({ ...d, month: d.month + "'24" }))
                            const RANGES = [
                                { key: '1M' as const, label: '1M' },
                                { key: '6M' as const, label: '6M' },
                                { key: '1Y' as const, label: '1Y' },
                                { key: 'ALL' as const, label: 'All' },
                            ]
                            const chartData =
                                revenueRange === '1M'  ? oneMonthData :
                                revenueRange === '6M'  ? allData.slice(-6) :
                                revenueRange === 'ALL' ? [...prevYearData, ...thisYearData] :
                                allData
                            return (
                                <div className="rounded-xl border border-slate-200 bg-white p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-bold text-slate-700">Est. Revenue</p>
                                        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                                            {RANGES.map(r => (
                                                <button
                                                    key={r.key}
                                                    onClick={() => setRevenueRange(r.key)}
                                                    className={cn(
                                                        "px-2.5 py-1 rounded-md text-xs font-semibold transition-all",
                                                        revenueRange === r.key
                                                            ? "bg-white text-teal-700 shadow-sm"
                                                            : "text-slate-500 hover:text-slate-700"
                                                    )}
                                                >
                                                    {r.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="h-[200px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="optRevGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.25} />
                                                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`} width={45} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: 12 }}
                                                    formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']}
                                                />
                                                <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} fill="url(#optRevGrad)" dot={false} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )
                        })()}

                        {/* Tag Optimization */}
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between bg-teal-500 px-5 py-3">
                                <div className="flex items-center gap-2">
                                    <Tag className="h-4 w-4 text-white" />
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">Tag Optimization</h4>
                                </div>
                                <span className="text-xs text-white/80 font-medium">{listing.tags.length}/13 tags used</span>
                            </div>

                            <div className="p-5 space-y-5">
                                <div>
                                    <div className="mb-2.5 flex items-center justify-between">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current Tags</span>
                                        {listing.tags.length < 13 && (
                                            <span className="text-xs font-medium text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                                                +{13 - listing.tags.length} slots available
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {listing.tags.map((tag) => {
                                            const score = getMockTagScore(tag)
                                            return (
                                                <div key={tag} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm transition-colors hover:border-teal-200">
                                                    <span className="text-xs font-semibold text-slate-700">#{tag}</span>
                                                    <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                                                        score >= 85 ? "bg-emerald-100 text-emerald-700" :
                                                        score >= 70 ? "bg-slate-100 text-slate-600" :
                                                        "bg-rose-100 text-rose-700"
                                                    )}>
                                                        {score}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-2.5 flex items-center gap-1.5">
                                        <Sparkles className="h-3.5 w-3.5 text-teal-500" />
                                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Suggested Tags</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {listing.suggested_tags.map((tag) => {
                                            const score = getMockTagScore(tag)
                                            return (
                                                <div key={tag} className="flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 pl-3 pr-1 py-1 shadow-sm transition-colors cursor-pointer hover:bg-teal-100">
                                                    <span className="text-xs font-semibold text-teal-700">+{tag}</span>
                                                    <span className="px-1.5 py-0.5 rounded-full bg-white/60 text-teal-600 text-[10px] font-bold border border-teal-100/50">
                                                        {score}
                                                    </span>
                                                    <div className="ml-1">
                                                        <CopyButton text={tag} />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function ListingOptimizerPage() {
    const [listings, setListings] = useState<MockListing[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedListing, setSelectedListing] = useState<MockListing | null>(null)
    const [usingMock, setUsingMock] = useState(false)
    const [performanceFilter, setPerformanceFilter] = useState<"top" | "trending">("top")
    const [sectionFilter, setSectionFilter] = useState("All")
    const [ageFilter, setAgeFilter] = useState("All")
    const [optimizationFilter, setOptimizationFilter] = useState<"All" | "Excellent" | "Good" | "Needs Refinement">("All")
    const [sectionOpen, setSectionOpen] = useState(false)
    const [ageOpen, setAgeOpen] = useState(false)
    const [optimizationOpen, setOptimizationOpen] = useState(false)

    useEffect(() => {
        fetchListings()
    }, [])

    const fetchListings = async () => {
        try {
            const response = await fetch("/api/listings/mine")
            const data = await response.json()

            if (data.listings && data.listings.length > 0) {
                setListings(
                    data.listings.map((listing: any, i: number) => {
                        const fallback = MOCK_MY_LISTINGS[i % MOCK_MY_LISTINGS.length]
                        const createdAt =
                            listing.created_at ??
                            (listing.original_creation_tsz ? new Date(listing.original_creation_tsz * 1000).toISOString() : undefined) ??
                            fallback.created_at

                        return {
                            ...listing,
                            quantity: listing.quantity ?? fallback.quantity,
                            views: listing.views ?? 0,
                            favorites: listing.num_favorers ?? 0,
                            revenue: ((listing.price?.amount ?? 0) / (listing.price?.divisor ?? 100)) * (listing.num_sales ?? 0),
                            score: fallback.score,
                            description: listing.description ?? fallback.description,
                            tags: listing.tags?.length ? listing.tags : fallback.tags,
                            tag_score: fallback.tag_score,
                            suggested_tags: fallback.suggested_tags,
                            tips: fallback.tips,
                            images: listing.images?.length ? listing.images : fallback.images,
                            created_at: createdAt,
                        }
                    })
                )
            } else {
                setListings(MOCK_MY_LISTINGS)
                setUsingMock(true)
            }
        } catch {
            setListings(MOCK_MY_LISTINGS)
            setUsingMock(true)
        } finally {
            setIsLoading(false)
        }
    }

    const passesAge = (l: typeof listings[0]) => {
        if (ageFilter === "All") return true
        const months = Math.max(0,
            (new Date().getFullYear() - new Date(l.created_at).getFullYear()) * 12 +
            (new Date().getMonth() - new Date(l.created_at).getMonth())
        )
        const years = months / 12
        if (ageFilter === "< 1 year" && years >= 1) return false
        if (ageFilter === "1–2 years" && (years < 1 || years >= 3)) return false
        if (ageFilter === "3–5 years" && (years < 3 || years >= 5)) return false
        if (ageFilter === "5+ years" && years < 5) return false
        return true
    }

    const availableSections = Array.from(
        new Set(listings.map(l => l.section).filter(Boolean))
    ) as string[]

    const baseFiltered = listings
        .filter((l) => l.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .filter(passesAge)
        .filter((l) => sectionFilter === "All" || l.section === sectionFilter)

    const optimizationCounts = {
        All: baseFiltered.length,
        Excellent: baseFiltered.filter(l => (l.score ?? 0) >= 80).length,
        Good: baseFiltered.filter(l => { const s = l.score ?? 0; return s >= 60 && s < 80 }).length,
        "Needs Refinement": baseFiltered.filter(l => (l.score ?? 0) < 60).length,
    }

    const filtered = baseFiltered
        .filter((l) => {
            if (optimizationFilter === "All") return true
            const s = l.score ?? 0
            if (optimizationFilter === "Excellent" && s < 80) return false
            if (optimizationFilter === "Good" && (s < 60 || s >= 80)) return false
            if (optimizationFilter === "Needs Refinement" && s >= 60) return false
            return true
        })
        .sort((a, b) =>
            performanceFilter === "top"
                ? (b.revenue ?? 0) - (a.revenue ?? 0)
                : (b.views ?? 0) - (a.views ?? 0)
        )

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-md shadow-teal-500/20">
                        <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Listing Optimizer</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Review your shop&apos;s listings and get actionable SEO improvement tips.</p>
                    </div>
                </div>

                {/* Search bar */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search listings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-14 w-full pl-12 pr-5 rounded-xl border border-slate-200 bg-white text-lg font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <button
                        type="button"
                        className="h-14 min-w-[120px] bg-teal-600 hover:bg-teal-700 text-white px-8 rounded-xl text-base font-semibold shadow-sm transition-colors"
                    >
                        Search
                    </button>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                    {/* Top Performing */}
                    <button
                        onClick={() => setPerformanceFilter("top")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
                            performanceFilter === "top"
                                ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-900/10"
                                : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600"
                        )}
                    >
                        <Star className="h-4 w-4" /> Top Performing
                    </button>

                    {/* Trending */}
                    <button
                        onClick={() => setPerformanceFilter("trending")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
                            performanceFilter === "trending"
                                ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-900/10"
                                : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600"
                        )}
                    >
                        <TrendingUp className="h-4 w-4" /> Trending
                    </button>

                    {/* Sections dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => { setSectionOpen(v => !v); setAgeOpen(false); setOptimizationOpen(false) }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
                                sectionFilter !== "All"
                                    ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-900/10"
                                    : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600"
                            )}
                        >
                            <Layers className="h-4 w-4" />
                            {sectionFilter === "All" ? "Sections" : sectionFilter}
                            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", sectionOpen && "rotate-180")} />
                        </button>
                        {sectionOpen && (
                            <div className="absolute top-full left-0 mt-1.5 z-20 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-900/10 py-1 min-w-[180px]">
                                {availableSections.length === 0 ? (
                                    <div className="px-4 py-2 text-sm text-slate-400 italic">N/A</div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => { setSectionFilter("All"); setSectionOpen(false) }}
                                            className={cn(
                                                "w-full text-left px-4 py-2 text-sm font-medium transition-colors",
                                                sectionFilter === "All"
                                                    ? "text-teal-700 bg-teal-50 font-semibold"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                                            )}
                                        >
                                            All Sections
                                        </button>
                                        {availableSections.map(section => (
                                            <button
                                                key={section}
                                                onClick={() => { setSectionFilter(section); setSectionOpen(false) }}
                                                className={cn(
                                                    "w-full text-left px-4 py-2 text-sm font-medium transition-colors",
                                                    sectionFilter === section
                                                        ? "text-teal-700 bg-teal-50 font-semibold"
                                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                                                )}
                                            >
                                                {section}
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Listing Age dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => { setAgeOpen(v => !v); setSectionOpen(false); setOptimizationOpen(false) }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
                                ageFilter !== "All"
                                    ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-900/10"
                                    : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600"
                            )}
                        >
                            <Calendar className="h-4 w-4" />
                            {ageFilter === "All" ? "Listing Age" : ageFilter}
                            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", ageOpen && "rotate-180")} />
                        </button>
                        {ageOpen && (
                            <div className="absolute top-full left-0 mt-1.5 z-20 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-900/10 py-1 min-w-[160px]">
                                {(["All", "< 1 year", "1–2 years", "3–5 years", "5+ years"] as const).map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => { setAgeFilter(opt); setAgeOpen(false) }}
                                        className={cn(
                                            "w-full text-left px-4 py-2 text-sm font-medium transition-colors",
                                            ageFilter === opt
                                                ? "text-teal-700 bg-teal-50 font-semibold"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                                        )}
                                    >
                                        {opt === "All" ? "Any Age" : opt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Optimization Score dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => { setOptimizationOpen(v => !v); setSectionOpen(false); setAgeOpen(false) }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
                                optimizationFilter !== "All"
                                    ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-900/10"
                                    : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600"
                            )}
                        >
                            <Sparkles className="h-4 w-4" />
                            {optimizationFilter === "All" ? "Optimization" : optimizationFilter}
                            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", optimizationOpen && "rotate-180")} />
                        </button>
                        {optimizationOpen && (
                            <div className="absolute top-full left-0 mt-1.5 z-20 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-900/10 py-1 min-w-[200px]">
                                {([
                                    { value: "All",              label: `All Scores (${optimizationCounts.All})` },
                                    { value: "Excellent",        label: `Excellent (${optimizationCounts.Excellent})` },
                                    { value: "Good",             label: `Good (${optimizationCounts.Good})` },
                                    { value: "Needs Refinement", label: `Needs Refinement (${optimizationCounts["Needs Refinement"]})` },
                                ] as const).map(({ value, label }) => (
                                    <button
                                        key={value}
                                        onClick={() => { setOptimizationFilter(value); setOptimizationOpen(false) }}
                                        className={cn(
                                            "w-full text-left px-4 py-2 text-sm font-medium transition-colors",
                                            optimizationFilter === value
                                                ? "text-teal-700 bg-teal-50 font-semibold"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                                        )}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex h-48 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center text-slate-500">
                        No listings found matching &quot;{searchQuery}&quot;
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                        {filtered.map((listing) => (
                            <ListingGridCard key={listing.listing_id} listing={listing} onSelect={setSelectedListing} />
                        ))}
                    </div>
                )}
            </div>

            {selectedListing && <ListingDetailModal listing={selectedListing} onClose={() => setSelectedListing(null)} />}
        </DashboardLayout>
    )
}
