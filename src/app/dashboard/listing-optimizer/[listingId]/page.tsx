'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Button } from '@/components/Button'
import {
    XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, Area, AreaChart,
    BarChart, Bar, Cell,
} from 'recharts'
import {
    ArrowLeft, Copy, TrendingUp,
    Tag, ExternalLink, Check, ImageOff,
    CheckCircle, AlertTriangle, XCircle,
    Star, ChevronLeft, ChevronRight, Sparkles, DollarSign,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Shared mock data (kept in sync with listing-optimizer/page.tsx) ──────────

const MOCK_MY_LISTINGS = [
    {
        listing_id: 1, title: "Handmade Sterling Silver Stacking Ring Set",
        section: "Rings",
        price: { amount: 3400, divisor: 100, currency_code: "USD" },
        quantity: 12, num_sales: 240, views: 4820, favorites: 1240, revenue: 8160, reviews: 186,
        created_at: "2025-02-18T00:00:00.000Z",
        tags: ["silver ring", "stacking ring", "minimalist jewelry", "handmade", "gift for her"],
        images: [{ url_fullxfull: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&q=80" }],
        score: 87, description: "Beautiful handmade sterling silver stacking ring set, carefully crafted to sit perfectly together.",
        suggested_title: "925 Sterling Silver Stacking Ring Set – Minimalist Handmade Rings, Gift for Her, Boho Stackable Rings, Thin Silver Band, Promise Ring",
        suggested_description: "Elevate your everyday jewelry stack with our handmade sterling silver stacking ring set — each ring is individually crafted and designed to layer beautifully together. Made from solid 925 sterling silver, these minimalist rings are tarnish-resistant and comfortable for all-day wear. Whether you're building a boho stack or keeping it simple with two or three bands, this set adapts effortlessly to your style.\n\nPerfect as a gift for her — birthdays, anniversaries, Valentine's Day, or just because. Our stacking rings arrive beautifully packaged and ready to gift. Available in sizes 5–10; please leave your ring size at checkout.\n\n✔ Solid 925 sterling silver\n✔ Hypoallergenic & nickel-free\n✔ Handmade to order — ships in 3–5 business days\n✔ Includes a satin jewelry pouch",
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
        images: [{ url_fullxfull: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=600&q=80" }],
        score: 92, description: "Personalized gold initial necklace, perfect for gifting. Available in 14k gold fill.",
        suggested_title: "Personalized Gold Initial Necklace – 14k Gold Fill Letter Necklace, Custom Name Necklace, Bridesmaid Gift, Mothers Day Gift, Dainty Jewelry",
        suggested_description: "Make it personal with our dainty gold initial necklace — a timeless keepsake she'll treasure forever. Each necklace is crafted in 14k gold fill and hand-stamped with the letter of your choice, creating a one-of-a-kind piece that tells her story. Delicate enough to wear daily and beautiful enough to layer, this initial necklace is the perfect gift for birthdays, Mother's Day, bridesmaid proposals, or any occasion worth celebrating.\n\nWhy our customers love it:\n✔ 14k gold fill — durable, radiant, and tarnish-resistant\n✔ Adjustable chain length (16\" – 18\")\n✔ Hypoallergenic and nickel-free\n✔ Arrives in a gift-ready box with a ribbon\n\nPersonalization options available at checkout. Ships within 2–4 business days.",
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
        images: [{ url_fullxfull: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80" }],
        score: 64, description: "Handcrafted boho crystal drop earrings, lightweight and perfect for everyday wear.",
        suggested_title: "Boho Crystal Dangle Earrings – Handmade Gemstone Drop Earrings, Healing Crystal Jewelry, Festival Earrings, Witchy Gift, Hypoallergenic",
        suggested_description: "Add a touch of boho magic to any outfit with our handcrafted crystal drop earrings. Featuring genuine healing crystals set in an antique brass frame, these dangle earrings catch the light beautifully and move gracefully with you throughout the day. Lightweight and comfortable even for long wear, they're perfect for festivals, markets, or a casual day out.\n\nEach pair is individually made by hand, meaning slight variations make every set truly unique. A wonderful gift for anyone who loves crystal healing, gemstone jewelry, or witchy aesthetics.\n\n✔ Genuine crystal gemstones\n✔ Lightweight — suitable for sensitive ears\n✔ Nickel-free hooks\n✔ Arrives wrapped in tissue paper\n\nMeasurements: approx. 6cm drop length. Ships within 3–5 business days.",
        tag_score: 31, suggested_tags: ["dangle earrings", "gemstone earrings", "festival jewelry", "witchy earrings", "healing crystals"],
        tips: [
            { type: "warn", text: 'Title missing high-volume keyword "dangle earrings"' },
            { type: "bad", text: "Only 4 tags — Etsy allows 13, add more" },
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
        images: [{ url_fullxfull: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&q=80" }],
        score: 71, description: "Handmade hammered copper cuff bracelet, each piece is unique.",
        suggested_title: "Hammered Copper Cuff Bracelet – Adjustable Handmade Artisan Bracelet, 7th Anniversary Gift, Rustic Chunky Bangle, Gift for Men or Women",
        suggested_description: "No two are alike — our handmade hammered copper cuff bracelet is individually forged and textured, giving each piece its own character and charm. Crafted from solid copper using traditional metalsmithing techniques, this bold cuff sits comfortably on the wrist and adjusts to fit most sizes.\n\nCopper jewelry is believed to support joint health and circulation, making this piece as functional as it is beautiful. A fantastic 7th anniversary gift or a striking addition to any rustic, artisan, or bohemian jewelry collection.\n\n✔ Solid copper — naturally ages to a beautiful patina\n✔ Adjustable to fit wrist sizes 6\"–8\"\n✔ Handmade one at a time in our studio\n✔ Arrives in a kraft gift box\n\nNote: copper may cause temporary skin discoloration in some individuals. Ships within 5–7 business days.",
        tag_score: 28, suggested_tags: ["rustic bracelet", "7th anniversary gift", "chunky bracelet", "adjustable bracelet", "gifts for men"],
        tips: [
            { type: "good", text: "Unique niche with low competition" },
            { type: "warn", text: 'Add "adjustable" to tags for wider reach' },
            { type: "bad", text: "Only 4 tags — missing significant search traffic" },
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
        images: [{ url_fullxfull: "https://images.unsplash.com/photo-1616077167999-51d36a3e7fcf?w=600&q=80" }],
        score: 95, description: "Delicate minimalist gold bar necklace, perfect for layering.",
        suggested_title: "Minimalist Gold Bar Necklace – 14k Gold Fill Dainty Layering Necklace, Simple Gold Jewelry, Gift for Her, Custom Engraved Bar Pendant",
        suggested_description: "Simple. Elegant. Endlessly wearable. Our minimalist gold bar necklace is the everyday staple your jewelry collection has been missing. Crafted in 14k gold fill, this dainty horizontal bar pendant sits delicately at the collarbone and layers flawlessly with other necklaces for that effortless stacked look.\n\nWhether you're dressing up or keeping it casual, this versatile piece works with everything. It also makes a genuinely thoughtful gift — for birthdays, graduations, or a treat for yourself.\n\n✔ 14k gold fill over sterling silver\n✔ Available in 16\", 18\", and 20\" chain lengths\n✔ Lobster clasp for secure wear\n✔ Tarnish-resistant and hypoallergenic\n✔ Gift-boxed and ready to give\n\nCan be engraved with a word or short phrase — see our personalization options at checkout. Ships in 2–3 business days.",
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
        images: [{ url_fullxfull: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80" }],
        score: 78, description: "Custom name ring in sterling silver. Choose any name or word.",
        suggested_title: "Custom Name Ring Sterling Silver – Personalized Engraved Ring, Stackable Mothers Ring, Push Present, Family Ring, Gift for Her",
        suggested_description: "Wear a name close to your heart — our custom sterling silver name ring is hand-stamped to order with any name, word, or short phrase of your choosing. Made from solid 925 sterling silver, this personalized ring is built to last and designed to be cherished.\n\nA beautiful push present, mothers ring, or sentimental gift for someone special. Each ring is made individually in our studio, so please allow 3–5 business days for production.\n\n✔ Solid 925 sterling silver — hypoallergenic & nickel-free\n✔ Available in sizes 5–11 (half sizes available)\n✔ Choose from block, script, or mixed font\n✔ Can be stacked with other bands\n✔ Arrives in a gift-ready satin pouch\n\nLeave your name/word and ring size in the order notes at checkout. Custom orders are non-refundable.",
        tag_score: 50, suggested_tags: ["mothers ring", "family ring", "stackable name ring", "push present"],
        tips: [
            { type: "good", text: "Personalization drives high average order value" },
            { type: "warn", text: 'Add "mothers day gift" to tags — seasonal opportunity' },
            { type: "warn", text: "Lead time not mentioned — add to listing details" },
            { type: "bad", text: "Fewer than 8 tags — leaving search traffic on the table" },
        ],
    },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function generateMonthlyRevenue(totalRevenue: number) {
    return MONTHS.map((month, i) => {
        const base = totalRevenue / 12
        const wobble = base * 0.35 * Math.sin(i * 1.4 + 1)
        return { month, revenue: Math.max(0, Math.round(base + wobble)) }
    })
}

function getListingAge(createdAt?: string) {
    if (!createdAt) return 'Unknown'
    const created = new Date(createdAt)
    if (Number.isNaN(created.getTime())) return 'Unknown'
    const now = new Date()
    const months = Math.max(0, (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth()))
    if (months < 1) return 'New'
    if (months < 12) return `${months}m old`
    const y = Math.floor(months / 12)
    const m = months % 12
    return m === 0 ? `${y}y old` : `${y}y ${m}m old`
}

function getScoreColor(score: number) {
    if (score >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200'
    if (score >= 70) return 'text-amber-700 bg-amber-50 border-amber-200'
    return 'text-rose-700 bg-rose-50 border-rose-200'
}

function getScoreLabel(score: number) {
    if (score >= 85) return 'Excellent'
    if (score >= 70) return 'Good'
    return 'Needs Work'
}

function formatPrice(amount: number, divisor: number) {
    return `$${(amount / divisor).toFixed(2)}`
}

const PRICE_BUCKETS = [
    { label: '$0–10',   min: 0,   max: 10  },
    { label: '$10–25',  min: 10,  max: 25  },
    { label: '$25–50',  min: 25,  max: 50  },
    { label: '$50–100', min: 50,  max: 100 },
    { label: '$100+',   min: 100, max: Infinity },
]

function generatePriceBreakdown(listingPrice: number, seed: number) {
    const activeIdx = PRICE_BUCKETS.findIndex(b => listingPrice >= b.min && listingPrice < b.max)
    const bases = [40, 120, 85, 30, 15]
    return PRICE_BUCKETS.map((b, i) => ({
        label: b.label,
        count: Math.max(5, bases[i] + ((seed * (i + 3)) % 25) - 12),
        active: i === activeIdx,
    }))
}

function getMockTagScore(tag: string) {
    let hash = 0
    for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash)
    return Math.abs(hash) % 51 + 50
}

// ─── Score Tooltip ────────────────────────────────────────────────────────────

type TooltipLine =
    | { type: 'title'; text: string }
    | { type: 'good';  text: string }
    | { type: 'warn';  text: string }
    | { type: 'bad';   text: string }
    | { type: 'info';  text: string }

function TooltipIcon({ type }: { type: TooltipLine['type'] }) {
    if (type === 'title') return null
    if (type === 'good')
        return <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-px" />
    if (type === 'warn')
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-px" />
    if (type === 'bad')
        return <XCircle className="h-3.5 w-3.5 text-rose-500 flex-shrink-0 mt-px" />
    return <div className="h-3.5 w-3.5 rounded-full border border-slate-300 flex-shrink-0 mt-px" />
}

const TOOLTIP_ORDER: Record<TooltipLine['type'], number> = { title: 0, good: 1, warn: 2, bad: 3, info: 4 }

function ScoreTooltip({ children, lines, position = 'bottom', align = 'center' }: {
    children: React.ReactNode
    lines: TooltipLine[]
    position?: 'top' | 'bottom'
    align?: 'left' | 'center' | 'right'
}) {
    const sorted = [...lines].sort((a, b) => TOOLTIP_ORDER[a.type] - TOOLTIP_ORDER[b.type])
    const triggerRef = useRef<HTMLDivElement>(null)
    const [visible, setVisible] = useState(false)
    const [style, setStyle] = useState<React.CSSProperties>({})
    const TOOLTIP_W = 288 // w-72

    const handleMouseEnter = () => {
        if (!triggerRef.current) return
        const r = triggerRef.current.getBoundingClientRect()
        const left =
            align === 'right'  ? r.right - TOOLTIP_W :
            align === 'left'   ? r.left :
            r.left + r.width / 2 - TOOLTIP_W / 2
        const top =
            position === 'top' ? r.top - 8 :   // translateY(-100%) applied via transform
            r.bottom + 8
        setStyle({
            position: 'fixed',
            zIndex: 9999,
            width: TOOLTIP_W,
            top,
            left: Math.max(8, Math.min(left, window.innerWidth - TOOLTIP_W - 8)),
            transform: position === 'top' ? 'translateY(-100%)' : 'none',
            pointerEvents: 'none',
        })
        setVisible(true)
    }

    const arrowLeft =
        align === 'left'  ? '1rem' :
        align === 'right' ? `${TOOLTIP_W - 20}px` :
        '50%'

    return (
        <div ref={triggerRef} className="inline-flex" onMouseEnter={handleMouseEnter} onMouseLeave={() => setVisible(false)}>
            {children}
            {visible && typeof window !== 'undefined' && createPortal(
                <div style={style}>
                    <div className="bg-white border border-teal-200 rounded-xl px-3.5 py-3 shadow-xl shadow-teal-900/10 text-xs space-y-2 relative">
                        {sorted.map((line, i) => (
                            line.type === 'title'
                                ? <p key={i} className="font-bold text-slate-800 leading-snug border-b border-slate-100 pb-2 mb-1">{line.text}</p>
                                : <div key={i} className="flex items-start gap-2">
                                    <TooltipIcon type={line.type} />
                                    <p className="text-slate-600 leading-snug">{line.text}</p>
                                </div>
                        ))}
                        {/* Arrow */}
                        <div style={{ position: 'absolute', left: arrowLeft, transform: 'translateX(-50%)', ...(
                            position === 'top'
                                ? { top: '100%', borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #99f6e4', width: 0, height: 0 }
                                : { bottom: '100%', borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '6px solid #99f6e4', width: 0, height: 0 }
                        )}} />
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}

type ListingType = typeof MOCK_MY_LISTINGS[number]

// Derived sub-scores from listing data
function getPhotoScore(listing: ListingType)  { return Math.min(100, Math.round(listing.images.length / 10 * 80 + 10)) }
function getTitleScore(listing: ListingType)  { return Math.min(100, Math.round(listing.title.length / 140 * 100)) }
function getDescScore(listing: ListingType)   { return Math.min(100, Math.round(listing.description.split(' ').length / 250 * 100)) }

// Overall score: breakdown of all sub-scores only
function buildOverallScoreReasoning(listing: ListingType): TooltipLine[] {
    const photoScore = getPhotoScore(listing)
    const titleScore = getTitleScore(listing)
    const descScore  = getDescScore(listing)
    const scoreType  = (s: number): TooltipLine['type'] => s >= 80 ? 'good' : s >= 60 ? 'warn' : 'bad'
    return [
        { type: 'title', text: `Overall Score: ${listing.score}/100 — ${getScoreLabel(listing.score)}` },
        { type: scoreType(photoScore),       text: `Photos: ${photoScore}/100` },
        { type: scoreType(listing.tag_score), text: `Tags: ${listing.tag_score}/100` },
        { type: scoreType(titleScore),        text: `Title: ${titleScore}/100` },
        { type: scoreType(descScore),         text: `Description: ${descScore}/100` },
        { type: listing.score >= 80 ? 'good' : 'warn',
          text: listing.score >= 80 ? 'Your listing is well optimised overall' : 'See sections below for specific improvements' },
    ]
}

// Photos: only image count and variety tips
function buildPhotoScoreReasoning(listing: ListingType): TooltipLine[] {
    const count = listing.images.length
    const score = getPhotoScore(listing)
    return [
        { type: 'title', text: `Photos Score: ${score}/100 — ${getScoreLabel(score)}` },
        { type: count >= 8 ? 'good' : count >= 5 ? 'warn' : 'bad', text: `${count}/10 photo slots used` },
        count < 5
            ? { type: 'bad',  text: `Add ${10 - count} more photos to fill the gallery` }
            : { type: 'good', text: 'Good photo coverage' },
        count < 10
            ? { type: 'warn', text: 'Listings with 10 photos get up to 2× more clicks' }
            : { type: 'good', text: 'All photo slots used' },
        { type: 'info', text: 'Include: lifestyle, detail close-up, scale reference, packaging' },
    ]
}

// Tags: only tag slots and keyword quality
function buildTagScoreReasoning(listing: ListingType): TooltipLine[] {
    const used      = listing.tags.length
    const available = 13 - used
    const score     = listing.tag_score
    return [
        { type: 'title', text: `Tag Score: ${score}/100 — ${getScoreLabel(score)}` },
        { type: used >= 10 ? 'good' : used >= 7 ? 'warn' : 'bad', text: `${used}/13 tag slots used (${available} empty)` },
        used < 10
            ? { type: 'bad',  text: `Add ${available} more tags — empty slots lose search traffic` }
            : { type: 'good', text: 'Good tag slot coverage' },
        score >= 80 ? { type: 'good', text: 'Tags match high-volume keywords for your niche' }
            : score >= 60 ? { type: 'warn', text: 'Some tags could target higher-volume keywords' }
            : { type: 'bad', text: 'Tags are underperforming — use the suggested tags below' },
        used < 13
            ? { type: 'info', text: 'Use all 13 slots with long-tail keyword phrases' }
            : { type: 'good', text: 'All 13 tag slots filled' },
    ]
}

// Title & Description: only length and keyword placement
function buildTitleScoreReasoning(listing: ListingType): TooltipLine[] {
    const chars = listing.title.length
    const score = getTitleScore(listing)
    return [
        { type: 'title', text: `Title Score: ${score}/100 — ${getScoreLabel(score)}` },
        { type: chars >= 100 ? 'good' : chars >= 60 ? 'warn' : 'bad', text: `${chars}/140 characters used` },
        chars < 100
            ? { type: 'bad',  text: 'Too short — aim for 100+ characters' }
            : { type: 'good', text: 'Title length is good' },
        chars >= 100
            ? { type: 'good', text: 'Good keyword density in title' }
            : { type: 'warn', text: 'Add more descriptive keywords to the title' },
        { type: 'info', text: 'Front-load your primary search keyword' },
    ]
}

function buildDescScoreReasoning(listing: ListingType): TooltipLine[] {
    const words = listing.description.split(' ').length
    const score = getDescScore(listing)
    return [
        { type: 'title', text: `Description Score: ${score}/100 — ${getScoreLabel(score)}` },
        { type: words >= 250 ? 'good' : words >= 100 ? 'warn' : 'bad', text: `${words} words written` },
        words < 250
            ? { type: 'bad',  text: 'Too short — aim for 250+ words' }
            : words < 500
            ? { type: 'warn', text: 'Good length — consider expanding to 500+ words' }
            : { type: 'good', text: 'Excellent description length' },
        words >= 100
            ? { type: 'good', text: 'Covers key product details' }
            : { type: 'bad',  text: 'Expand with materials, sizing, and gifting context' },
        { type: 'info', text: 'Include tags naturally in the description text' },
    ]
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function CopyDescriptionButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)
    return (
        <button
            onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
            className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 bg-white hover:bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg transition-colors shadow-sm">
            {copied ? <><Check className="h-3 w-3" /> Copied!</> : <><Copy className="h-3 w-3" /> Copy</>}
        </button>
    )
}

export default function ListingOptimizerDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = Number(params?.listingId)
    const listing = MOCK_MY_LISTINGS.find(l => l.listing_id === id) ?? MOCK_MY_LISTINGS[0]

    const price = listing.price.amount / listing.price.divisor
    const convRate = ((listing.num_sales / listing.views) * 100).toFixed(1)
    const ageLabel = getListingAge(listing.created_at)
    const usedSlots = listing.tags.length
    const totalSlots = 13
    const availableSlots = totalSlots - usedSlots

    // ── Revenue chart ──
    const [revRange, setRevRange] = useState<'1M'|'6M'|'1Y'|'ALL'>('1Y')
    const monthlyRev = generateMonthlyRevenue(listing.revenue)
    const prevYearRev = monthlyRev.map(d => ({ month: d.month + "'23", revenue: Math.round(d.revenue * 0.68) }))
    const thisYearRev = monthlyRev.map(d => ({ ...d, month: d.month + "'24" }))
    const lastMonthRev = monthlyRev[11]?.revenue ?? 0
    const oneMonthRev = ['Wk 1','Wk 2','Wk 3','Wk 4'].map((wk, i) => ({
        month: wk, revenue: Math.round(lastMonthRev / 4 * (0.88 + Math.sin(i * 1.4) * 0.12))
    }))
    const revData = revRange === '1M' ? oneMonthRev
        : revRange === '6M' ? monthlyRev.slice(-6)
        : revRange === 'ALL' ? [...prevYearRev, ...thisYearRev]
        : monthlyRev

    // ── Image carousel ──
    const images = listing.images.map(i => i.url_fullxfull)
    const extraImages = MOCK_MY_LISTINGS
        .filter(l => l.listing_id !== listing.listing_id)
        .slice(0, 3)
        .map(l => l.images[0].url_fullxfull)
    const allImages = [...images, ...extraImages].slice(0, 4)
    const [imgIdx, setImgIdx] = useState(0)

    // ── Copy states ──
    const [copiedSuggestedTag, setCopiedSuggestedTag] = useState<string|null>(null)

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-in fade-in duration-500">

                {/* ── Back nav ── */}
                <div className="flex items-center -mt-7">
                    <Button variant="ghost" className="pl-0 text-slate-500 hover:text-teal-600 gap-2" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" /> Back to Listing Optimizer
                    </Button>
                </div>

                {/* ── Hero: Image + Details ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-5 items-stretch">

                    {/* Left: image carousel */}
                    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm aspect-square relative self-start group/carousel">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <ImageOff className="h-12 w-12 text-slate-300" />
                        </div>
                        {allImages.map((src, i) => (
                            <img key={i} src={src} alt={`${listing.title} ${i + 1}`}
                                className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-300", i === imgIdx ? "opacity-100" : "opacity-0")}
                                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                        ))}
                        {/* Photos score badge — top right */}
                        <div className="absolute top-3 right-3 z-10">
                            <ScoreTooltip lines={buildPhotoScoreReasoning(listing)} position="bottom" align="right">
                                <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-sm cursor-default", getScoreColor(getPhotoScore(listing)))}>
                                    {listing.images.length}/10 photos — {getScoreLabel(getPhotoScore(listing))}
                                </span>
                            </ScoreTooltip>
                        </div>
                        <button onClick={() => setImgIdx(i => (i - 1 + allImages.length) % allImages.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 backdrop-blur-sm">
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button onClick={() => setImgIdx(i => (i + 1) % allImages.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 backdrop-blur-sm">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-[18px] left-0 right-0 flex items-center justify-center z-10">
                            <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
                                {allImages.map((_, i) => (
                                    <button key={i} onClick={() => setImgIdx(i)}
                                        className={cn("rounded-full transition-all duration-200", i === imgIdx ? "w-4 h-2 bg-white shadow-sm" : "w-2 h-2 bg-white/40 hover:bg-white/70")} />
                                ))}
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/45 via-black/20 to-transparent px-4 pt-10 pb-3 flex items-end justify-between">
                            <div>
                                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-0.5">Price</p>
                                <p className="text-lg font-black text-white">{formatPrice(listing.price.amount, listing.price.divisor)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-0.5">Section</p>
                                <p className="text-lg font-black text-white">{listing.section}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: info panel */}
                    <div className="flex flex-col gap-3 h-full">

                        {/* Teal title header */}
                        <div className="rounded-2xl bg-teal-500/80 px-5 py-4 text-white shadow-lg shadow-teal-900/15">
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <h1 className="text-2xl font-black tracking-tight text-white leading-snug">{listing.title}</h1>
                                <a href={`https://www.etsy.com/search?q=${encodeURIComponent(listing.title)}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                                    <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-white/20 border border-white/30 px-3 py-1.5 rounded-lg hover:bg-white/30 transition-colors whitespace-nowrap">
                                        <ExternalLink className="h-3 w-3" /> View on Etsy
                                    </button>
                                </a>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap mb-3">
                                <span className="text-xs font-semibold bg-black/25 text-white/90 px-2.5 py-0.5 rounded-full">{listing.section}</span>
                                <span className="text-white/70 text-sm">{ageLabel}</span>
                                <ScoreTooltip lines={buildOverallScoreReasoning(listing)} position="bottom">
                                    <span className={cn("text-xs font-bold px-2.5 py-0.5 rounded-full border cursor-default", getScoreColor(listing.score))}>
                                        {getScoreLabel(listing.score)}
                                    </span>
                                </ScoreTooltip>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">Optimization Score</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-28 h-2 bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-white rounded-full" style={{ width: `${listing.score}%` }} />
                                    </div>
                                    <span className="font-black text-white text-base leading-none">{listing.score}</span>
                                </div>
                            </div>
                        </div>

                        {/* Key stats — row 1 */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 items-stretch flex-1">
                            <div className="bg-white border border-teal-200 text-teal-900 rounded-xl p-4 shadow-sm flex flex-col justify-center h-full">
                                <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Revenue</p>
                                <p className="text-2xl font-black">
                                    {listing.revenue >= 1000 ? `$${(listing.revenue / 1000).toFixed(1)}k` : `$${listing.revenue}`}
                                </p>
                                <p className="text-xs opacity-60 mt-0.5">total earned</p>
                            </div>
                            <div className="bg-white border border-sky-200 text-sky-900 rounded-xl p-4 shadow-sm flex flex-col justify-center h-full">
                                <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Sales</p>
                                <p className="text-2xl font-black">{listing.num_sales.toLocaleString()}</p>
                                <p className="text-xs opacity-60 mt-0.5">units sold</p>
                            </div>
                            <div className="bg-white border border-orange-200 text-orange-900 rounded-xl p-4 shadow-sm flex flex-col justify-center h-full">
                                <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Reviews</p>
                                <p className="text-2xl font-black text-orange-600">{listing.reviews.toLocaleString()}</p>
                                <p className="text-xs opacity-60 mt-0.5">customer reviews</p>
                            </div>
                            <div className="bg-white border border-violet-200 text-violet-900 rounded-xl p-4 shadow-sm flex flex-col justify-center h-full">
                                <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Conv. Rate</p>
                                <p className="text-2xl font-black">{convRate}%</p>
                                <p className="text-xs opacity-60 mt-0.5">sales / views</p>
                            </div>
                        </div>

                        {/* Key stats — row 2 */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 items-stretch flex-1">
                            <div className="bg-white border border-slate-200 text-slate-700 rounded-xl p-4 shadow-sm flex flex-col justify-center h-full">
                                <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Views</p>
                                <p className="text-2xl font-black">{listing.views >= 1000 ? `${(listing.views / 1000).toFixed(1)}k` : listing.views}</p>
                                <p className="text-xs opacity-60 mt-0.5">total views</p>
                            </div>
                            <div className="bg-white border border-rose-200 text-rose-900 rounded-xl p-4 shadow-sm flex flex-col justify-center h-full">
                                <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Favorites</p>
                                <p className="text-2xl font-black">{listing.favorites >= 1000 ? `${(listing.favorites / 1000).toFixed(1)}k` : listing.favorites}</p>
                                <p className="text-xs opacity-60 mt-0.5">wishlisted</p>
                            </div>
                            <div className="bg-white border border-amber-200 text-amber-900 rounded-xl p-4 shadow-sm flex flex-col justify-center h-full">
                                <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Tag Score</p>
                                <p className="text-2xl font-black">{listing.tag_score}</p>
                                <p className="text-xs opacity-60 mt-0.5">/ 100</p>
                            </div>
                            <div className="bg-white border border-slate-200 text-slate-700 rounded-xl p-4 shadow-sm flex flex-col justify-center h-full">
                                <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">In Stock</p>
                                <p className="text-2xl font-black">{listing.quantity}</p>
                                <p className="text-xs opacity-60 mt-0.5">units available</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Revenue Chart + Optimization Tips ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {/* Revenue Chart */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-bold text-slate-700">Est. Revenue</p>
                            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                                {(['1M','6M','1Y','ALL'] as const).map(r => (
                                    <button key={r} onClick={() => setRevRange(r)}
                                        className={cn("px-2.5 py-1 rounded-md text-xs font-semibold transition-all",
                                            revRange === r ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                        )}>
                                        {r === 'ALL' ? 'All' : r}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 min-h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revData} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="listingRevGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={6} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(1)}k`} width={44} />
                                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                                        formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />
                                    <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#listingRevGrad)" dot={false} activeDot={{ r: 5, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Optimization Tips */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col">
                        <div className="bg-teal-500/80 px-5 py-3.5 flex items-center gap-2 rounded-t-2xl overflow-hidden">
                            <Star className="h-4 w-4 text-white/80" />
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Optimization Tips</h2>
                            <ScoreTooltip lines={buildOverallScoreReasoning(listing)} position="bottom" align="right">
                                <span className={cn("ml-auto text-xs font-bold px-2.5 py-0.5 rounded-full border cursor-default", getScoreColor(listing.score))}>
                                    Score: {listing.score} — {getScoreLabel(listing.score)}
                                </span>
                            </ScoreTooltip>
                        </div>
                        <div className="p-5 flex flex-col gap-3 flex-1">
                            {listing.tips.map((tip, i) => (
                                <div key={i} className={cn(
                                    "flex items-start gap-3 rounded-xl border p-4 flex-1",
                                    tip.type === 'good'
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                        : tip.type === 'warn'
                                        ? "bg-amber-50 border-amber-200 text-amber-800"
                                        : "bg-rose-50 border-rose-200 text-rose-800"
                                )}>
                                    {tip.type === 'good'
                                        ? <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-emerald-500" />
                                        : tip.type === 'warn'
                                        ? <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-500" />
                                        : <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-rose-500" />}
                                    <p className="text-sm font-medium leading-snug">{tip.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* ── Tag Optimization ── */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <div className="bg-teal-500/80 px-5 py-3.5 flex items-center gap-2 rounded-t-2xl overflow-hidden">
                        <Tag className="h-4 w-4 text-white" />
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Tag Optimization</h2>
                        <div className="ml-auto flex items-center gap-2">
                            <ScoreTooltip lines={buildTagScoreReasoning(listing)} position="bottom" align="right">
                                <span className={cn("text-xs font-bold px-2.5 py-0.5 rounded-full border cursor-default", getScoreColor(listing.tag_score))}>
                                    Score: {listing.tag_score} — {getScoreLabel(listing.tag_score)}
                                </span>
                            </ScoreTooltip>
                            <span className="text-xs font-semibold text-white/80">{usedSlots}/13 tags used</span>
                        </div>
                    </div>

                    <div className="p-5 space-y-5">
                        {/* Current tags */}
                        <div>
                            <div className="mb-2.5 flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current Tags</span>
                                {availableSlots > 0 && (
                                    <span className="text-xs font-medium text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                                        +{availableSlots} slots available
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {listing.tags.map(tag => {
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

                        {/* Suggested tags */}
                        {listing.suggested_tags.length > 0 && (
                            <div>
                                <div className="mb-2.5 flex items-center gap-1.5">
                                    <Sparkles className="h-3.5 w-3.5 text-teal-500" />
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Suggested Tags</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {listing.suggested_tags.map(tag => {
                                        const score = getMockTagScore(tag)
                                        return (
                                            <div key={tag} className="flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 pl-3 pr-1 py-1 shadow-sm transition-colors cursor-pointer hover:bg-teal-100">
                                                <span className="text-xs font-semibold text-teal-700">+{tag}</span>
                                                <span className="px-1.5 py-0.5 rounded-full bg-white/60 text-teal-600 text-[10px] font-bold border border-teal-100/50">
                                                    {score}
                                                </span>
                                                <button
                                                    onClick={() => { navigator.clipboard.writeText(tag); setCopiedSuggestedTag(tag); setTimeout(() => setCopiedSuggestedTag(null), 1500) }}
                                                    className="p-1.5 hover:bg-teal-100 rounded-full transition-colors"
                                                    title="Copy">
                                                    {copiedSuggestedTag === tag
                                                        ? <Check className="h-3.5 w-3.5 text-emerald-500" />
                                                        : <Copy className="h-3.5 w-3.5 text-teal-400 hover:text-teal-600" />}
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Listing Title + Pricing (left) / Description (right) ── */}
                {(() => {
                    const listingPrice = listing.price.amount / listing.price.divisor
                    const seed = listing.listing_id * 7
                    const priceData = generatePriceBreakdown(listingPrice, seed)
                    const activeBucket = PRICE_BUCKETS.find(b => listingPrice >= b.min && listingPrice < b.max)
                    return (
                        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-5 items-stretch">

                            {/* Left column: Title + Pricing Breakdown stacked */}
                            <div className="flex flex-col gap-5">

                                {/* Listing Title */}
                                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                                    <div className="bg-teal-500/80 px-5 py-3.5 flex items-center gap-2 rounded-t-2xl overflow-hidden">
                                        <TrendingUp className="h-4 w-4 text-white/80" />
                                        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Listing Title</h2>
                                        <ScoreTooltip lines={buildTitleScoreReasoning(listing)} position="top" align="right">
                                            <span className={cn("ml-auto text-xs font-bold px-2.5 py-0.5 rounded-full border cursor-default", getScoreColor(getTitleScore(listing)))}>
                                                Score: {getTitleScore(listing)} — {getScoreLabel(getTitleScore(listing))}
                                            </span>
                                        </ScoreTooltip>
                                    </div>
                                    <div className="flex flex-col divide-y divide-slate-100">
                                        <div className="p-5">
                                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Current</p>
                                            <p className="text-sm font-semibold text-slate-700 leading-snug">{listing.title}</p>
                                            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                                                <span>{listing.title.split(' ').length} words · {listing.title.length} chars</span>
                                                <span>·</span>
                                                <span className={listing.title.length >= 100 ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                                                    {listing.title.length >= 100 ? 'Good length' : 'Too short — aim for 100+ chars'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-5 bg-teal-50/40">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-1.5">
                                                    <Sparkles className="h-3.5 w-3.5 text-teal-500" />
                                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Suggested</p>
                                                </div>
                                                <CopyDescriptionButton text={listing.suggested_title} />
                                            </div>
                                            <p className="text-sm font-semibold text-slate-700 leading-snug">{listing.suggested_title}</p>
                                            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                                                <span>{listing.suggested_title.split(' ').length} words · {listing.suggested_title.length} chars</span>
                                                <span>·</span>
                                                <span className="text-emerald-600 font-semibold">Good length</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pricing Breakdown */}
                                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex-1">
                                    <div className="bg-teal-500/80 px-5 py-3.5 flex items-center gap-2 rounded-t-2xl overflow-hidden">
                                        <DollarSign className="h-4 w-4 text-white/80" />
                                        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Pricing Breakdown</h2>
                                        <span className="ml-auto text-xs font-semibold text-white/80">
                                            Your price: <span className="font-bold text-white">${listingPrice.toFixed(2)}</span>
                                            {activeBucket && <span className="ml-1 text-white/60">({activeBucket.label})</span>}
                                        </span>
                                    </div>
                                    <div className="p-5">
                                        <p className="text-xs text-slate-400 mb-4">
                                            Competitor listings by price range — <span className="font-semibold text-teal-600">teal bar</span> = your current bracket.
                                        </p>
                                        <div className="h-[180px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={priceData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barCategoryGap="30%">
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={4} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                                    <Tooltip
                                                        contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                                                        formatter={(v: number, _: string, entry: { payload: { label: string; active: boolean } }) => [
                                                            `${v} listings`,
                                                            entry.payload.active ? `${entry.payload.label} ← your price` : entry.payload.label,
                                                        ]}
                                                        labelFormatter={() => ''}
                                                    />
                                                    <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                                                        {priceData.map((entry, i) => (
                                                            <Cell key={i} fill={entry.active ? '#0d9488' : '#cbd5e1'} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                            </div>{/* end left column */}

                            {/* Right column: Listing Description */}
                            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col">
                                <div className="bg-teal-500/80 px-5 py-3.5 flex items-center gap-2 rounded-t-2xl overflow-hidden">
                                    <TrendingUp className="h-4 w-4 text-white/80" />
                                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Listing Description</h2>
                                    <ScoreTooltip lines={buildDescScoreReasoning(listing)} position="top" align="right">
                                        <span className={cn("ml-auto text-xs font-bold px-2.5 py-0.5 rounded-full border cursor-default", getScoreColor(getDescScore(listing)))}>
                                            Score: {getDescScore(listing)} — {getScoreLabel(getDescScore(listing))}
                                        </span>
                                    </ScoreTooltip>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 flex-1">
                                    <div className="p-5">
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Current</p>
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
                                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                                            <span>{listing.description.split(' ').length} words</span>
                                            <span>·</span>
                                            <span className={listing.description.split(' ').length >= 250 ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                                                {listing.description.split(' ').length >= 250 ? 'Good length' : 'Too short — aim for 250+ words'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5 bg-teal-50/40">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-1.5">
                                                <Sparkles className="h-3.5 w-3.5 text-teal-500" />
                                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Suggested</p>
                                            </div>
                                            <CopyDescriptionButton text={listing.suggested_description} />
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{listing.suggested_description}</p>
                                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                                            <span>{listing.suggested_description.split(' ').length} words</span>
                                            <span>·</span>
                                            <span className="text-emerald-600 font-semibold">Good length</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )
                })()}

            </div>
        </DashboardLayout>
    )
}
