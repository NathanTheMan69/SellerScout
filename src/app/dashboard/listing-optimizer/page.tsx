"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { DashboardLayout } from "@/components/DashboardLayout"
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
} from "lucide-react"

const MOCK_MY_LISTINGS = [
    {
        listing_id: 1, title: "Handmade Sterling Silver Stacking Ring Set",
        price: { amount: 3400, divisor: 100, currency_code: "USD" },
        quantity: 12, num_sales: 240, views: 4820, favorites: 1240, revenue: 8160,
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
        price: { amount: 4800, divisor: 100, currency_code: "USD" },
        quantity: 8, num_sales: 175, views: 3100, favorites: 890, revenue: 8400,
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
        price: { amount: 2200, divisor: 100, currency_code: "USD" },
        quantity: 20, num_sales: 88, views: 1850, favorites: 420, revenue: 1936,
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
        price: { amount: 4100, divisor: 100, currency_code: "USD" },
        quantity: 3, num_sales: 42, views: 920, favorites: 210, revenue: 1722,
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
        price: { amount: 3800, divisor: 100, currency_code: "USD" },
        quantity: 15, num_sales: 310, views: 5600, favorites: 1680, revenue: 11780,
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
        price: { amount: 5500, divisor: 100, currency_code: "USD" },
        quantity: 7, num_sales: 98, views: 2340, favorites: 560, revenue: 5390,
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
        <button
            type="button"
            onClick={() => onSelect(listing)}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-all hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-900/10"
        >
            <div className="relative aspect-square overflow-hidden bg-slate-100">
                {listing.images[0] && !imgError ? (
                    <img
                        src={listing.images[0].url_fullxfull || listing.images[0].url_170x135}
                        alt={listing.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <ImageOff className="h-8 w-8 text-slate-300" />
                    </div>
                )}

                <div className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
                    {formatPrice(listing)}
                </div>

                <div className={cn("absolute right-3 top-3 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur", getScoreColor(listing.score), "bg-white/90")}>
                    {listing.score}/100
                </div>

                <div className="absolute left-3 bottom-3 flex items-center gap-1 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    {getListingAge(listing.created_at)}
                </div>

                <div className="absolute right-3 bottom-3 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
                    {listing.quantity} in stock
                </div>
            </div>

            <div className="space-y-3 p-4">
                <div>
                    <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold text-slate-800">
                        {listing.title}
                    </h3>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="flex items-center justify-between rounded-full border border-slate-200 bg-slate-50 px-3 py-2 shadow-[0_1px_2px_-1px_rgba(0,0,0,0.05)] transition-colors hover:border-teal-200 hover:bg-teal-50/50">
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <DollarSign className="h-3.5 w-3.5 text-teal-600" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider">Rev</span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">${listing.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-full border border-slate-200 bg-slate-50 px-3 py-2 shadow-[0_1px_2px_-1px_rgba(0,0,0,0.05)] transition-colors hover:border-blue-200 hover:bg-blue-50/50">
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <ShoppingBag className="h-3.5 w-3.5 text-blue-500" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider">Sold</span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">{listing.num_sales.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-full border border-slate-200 bg-slate-50 px-3 py-2 shadow-[0_1px_2px_-1px_rgba(0,0,0,0.05)] transition-colors hover:border-violet-200 hover:bg-violet-50/50">
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <Eye className="h-3.5 w-3.5 text-violet-500" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider">Views</span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">{listing.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-full border border-slate-200 bg-slate-50 px-3 py-2 shadow-[0_1px_2px_-1px_rgba(0,0,0,0.05)] transition-colors hover:border-rose-200 hover:bg-rose-50/50">
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <Heart className="h-3.5 w-3.5 text-rose-500" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider">Favs</span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">{listing.favorites.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </button>
    )
}

function getMockTagScore(tag: string) {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash) % 51 + 50; // Random deterministic score 50-100
}

function ListingDetailModal({ listing, onClose }: { listing: MockListing; onClose: () => void }) {
    const [imgError, setImgError] = useState(false)

    return (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="modal-card flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50 shadow-2xl shadow-slate-900/20" onClick={(e) => e.stopPropagation()}>
                {/* Header (Integrated and Minimal) */}
                <div className="flex items-center justify-between border-b border-slate-200/60 bg-white px-6 py-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-md shadow-teal-500/20">
                            <Package className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="line-clamp-1 text-xl font-bold text-slate-800">{listing.title}</h3>
                            <a
                                href={`https://www.etsy.com/search?q=${encodeURIComponent(listing.title)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 transition-colors hover:text-teal-700 hover:underline"
                            >
                                View on Etsy <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid gap-6 lg:grid-cols-12">
                        {/* LEFT COLUMN: Context */}
                        <div className="space-y-6 lg:col-span-5">
                            {/* Image Container */}
                            <div className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                {listing.images[0] && !imgError ? (
                                    <img
                                        src={listing.images[0].url_fullxfull || listing.images[0].url_170x135}
                                        alt={listing.title}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        onError={() => setImgError(true)}
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-slate-50">
                                        <ImageOff className="h-10 w-10 text-slate-300" />
                                    </div>
                                )}
                                <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-slate-900/70 px-3 py-1.5 text-sm font-semibold text-white shadow-sm backdrop-blur-md">
                                    {formatPrice(listing)}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Description</h4>
                                <p className="text-sm leading-relaxed text-slate-600">
                                    {listing.description || "No description available for this listing yet."}
                                </p>
                            </div>


                        </div>

                        {/* RIGHT COLUMN: Optimization */}
                        <div className="space-y-6 lg:col-span-7">
                            {/* Score Card */}
                            <div className={cn(
                                "flex flex-col items-center justify-between gap-4 rounded-2xl border p-6 sm:flex-row shadow-sm",
                                listing.score >= 85 ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100" :
                                listing.score >= 70 ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100" :
                                "bg-gradient-to-br from-rose-50 to-red-50 border-rose-100"
                            )}>
                                <div className="text-center sm:text-left">
                                    <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
                                        <Zap className={cn("h-5 w-5", listing.score >= 85 ? "text-emerald-500" : listing.score >= 70 ? "text-amber-500" : "text-rose-500")} />
                                        <h4 className={cn("text-sm font-bold uppercase tracking-wider", listing.score >= 85 ? "text-emerald-700" : listing.score >= 70 ? "text-amber-700" : "text-rose-700")}>Listing Score</h4>
                                    </div>
                                    <p className="text-sm font-medium text-slate-600">Based on SEO best practices and current performance.</p>
                                </div>
                                <div className="flex items-end gap-1">
                                    <span className={cn("text-6xl font-black tabular-nums tracking-tighter", listing.score >= 85 ? "text-emerald-600" : listing.score >= 70 ? "text-amber-600" : "text-rose-600")}>
                                        {listing.score}
                                    </span>
                                    <span className="mb-2 text-lg font-bold text-slate-400">/100</span>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                { /* Revenue */ }
                                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:border-teal-200 hover:shadow-md">
                                    <div className="mb-3 flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                                            <DollarSign className="h-4 w-4" />
                                        </div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Revenue</p>
                                    </div>
                                    <p className="text-2xl font-bold tracking-tight text-slate-800">${listing.revenue.toLocaleString()}</p>
                                </div>
                                
                                { /* Sales */ }
                                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:border-blue-200 hover:shadow-md">
                                    <div className="mb-3 flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                            <ShoppingBag className="h-4 w-4" />
                                        </div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sales</p>
                                    </div>
                                    <p className="text-2xl font-bold tracking-tight text-slate-800">{listing.num_sales.toLocaleString()}</p>
                                </div>

                                { /* Quantity */ }
                                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:border-orange-200 hover:shadow-md">
                                    <div className="mb-3 flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                                            <Package className="h-4 w-4" />
                                        </div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">In Stock</p>
                                    </div>
                                    <p className="text-2xl font-bold tracking-tight text-slate-800">{listing.quantity}</p>
                                </div>

                                { /* Favorites */ }
                                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:border-rose-200 hover:shadow-md">
                                    <div className="mb-3 flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
                                            <Heart className="h-4 w-4 fill-rose-500" />
                                        </div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Favorites</p>
                                    </div>
                                    <p className="text-2xl font-bold tracking-tight text-slate-800">{listing.favorites.toLocaleString()}</p>
                                </div>

                                { /* Views */ }
                                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:border-violet-200 hover:shadow-md">
                                    <div className="mb-3 flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                                            <Eye className="h-4 w-4" />
                                        </div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Views</p>
                                    </div>
                                    <p className="text-2xl font-bold tracking-tight text-slate-800">{listing.views.toLocaleString()}</p>
                                </div>

                                { /* Listing Age */ }
                                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:border-slate-300 hover:shadow-md">
                                    <div className="mb-3 flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Age</p>
                                    </div>
                                    <p className="text-2xl font-bold tracking-tight text-slate-800">{getListingAge(listing.created_at)}</p>
                                </div>
                            </div>

                            {/* Tag Optimization */}
                            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-teal-600" />
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Tag Optimization</h4>
                                    </div>
                                </div>
                                
                                <div className="p-5">
                                    <div className="mb-5">
                                        <div className="mb-2.5 flex items-center justify-between">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current Tags ({listing.tags.length}/13)</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {listing.tags.map((tag) => {
                                                const score = getMockTagScore(tag)
                                                return (
                                                    <div key={tag} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white pl-3 pr-1 py-1 shadow-sm transition-colors hover:border-teal-200">
                                                        <span className="text-xs font-semibold text-slate-700">#{tag}</span>
                                                        <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-bold", 
                                                            score >= 85 ? "bg-emerald-100 text-emerald-700" :
                                                            score >= 70 ? "bg-slate-100 text-slate-600" :
                                                            "bg-rose-100 text-rose-700"
                                                        )}>
                                                            {score}
                                                        </span>
                                                        <div className="ml-1">
                                                            <CopyButton text={tag} />
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                            {listing.tags.length < 13 && (
                                                <div className="rounded-full border border-dashed border-slate-300 bg-slate-50 px-3 py-1 flex items-center text-xs font-medium text-slate-400">
                                                    +{13 - listing.tags.length} available
                                                </div>
                                            )}
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
        </div>
    )
}

export default function ListingOptimizerPage() {
    const [listings, setListings] = useState<MockListing[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedListing, setSelectedListing] = useState<MockListing | null>(null)
    const [usingMock, setUsingMock] = useState(false)
    const [performanceFilter, setPerformanceFilter] = useState<"all" | "top" | "trending">("all")
    const [stockFilter, setStockFilter] = useState<"all" | "high" | "low">("all")
    const [showNeedsOptimization, setShowNeedsOptimization] = useState(false)

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

    const needsOptimizationCount = listings.filter((l) => (l.score ?? 0) <= 60).length

    const filtered = listings
        .filter((l) => l.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .filter((l) => !showNeedsOptimization || (l.score ?? 0) <= 60)
        .sort((a, b) => {
            if (performanceFilter === "top") return (b.revenue ?? 0) - (a.revenue ?? 0)
            if (performanceFilter === "trending") return (b.views ?? 0) - (a.views ?? 0)
            if (stockFilter === "high") return (b.quantity ?? 0) - (a.quantity ?? 0)
            if (stockFilter === "low") return (a.quantity ?? 0) - (b.quantity ?? 0)
            return a.title.localeCompare(b.title)
        })

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
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <select
                            value={performanceFilter}
                            onChange={(e) => setPerformanceFilter(e.target.value as "all" | "top" | "trending")}
                            className="h-9 pl-9 pr-7 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 focus:border-teal-500 outline-none appearance-none cursor-pointer shadow-sm hover:border-teal-300 transition-colors"
                        >
                            <option value="all">All (A–Z)</option>
                            <option value="top">Top Performers</option>
                            <option value="trending">Trending</option>
                        </select>
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <select
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value as "all" | "high" | "low")}
                            className="h-9 pl-9 pr-7 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 focus:border-teal-500 outline-none appearance-none cursor-pointer shadow-sm hover:border-teal-300 transition-colors"
                        >
                            <option value="all">All Stock</option>
                            <option value="high">High Stock</option>
                            <option value="low">Low Stock</option>
                        </select>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowNeedsOptimization((v) => !v)}
                        className={cn(
                            "h-9 inline-flex items-center gap-2 px-4 rounded-xl border text-sm font-medium shadow-sm transition-colors",
                            showNeedsOptimization
                                ? "bg-amber-500 border-amber-500 text-white hover:bg-amber-600"
                                : "bg-white border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-600"
                        )}
                    >
                        <Zap className="h-3.5 w-3.5" />
                        Optimize Listings
                        <span className={cn(
                            "inline-flex items-center justify-center rounded-full text-xs font-bold px-1.5 min-w-[1.25rem] h-5",
                            showNeedsOptimization ? "bg-white/30 text-white" : "bg-slate-100 text-slate-600"
                        )}>
                            {needsOptimizationCount}
                        </span>
                    </button>
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
