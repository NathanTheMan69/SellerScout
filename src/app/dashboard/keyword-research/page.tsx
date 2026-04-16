'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Heart, TrendingUp, TrendingDown, Minus, AlertCircle, X, ShoppingBag, Star, ExternalLink, ImageOff, BarChart2, Tag, DollarSign, Copy, Check } from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/Card'
import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'
import { DashboardLayout } from '@/components/DashboardLayout'
import { createClient } from '@/utils/supabase/client'
import { AnalysisResult } from '@/lib/analyzer'
import { useToast } from '@/components/Toast'

// Mock keyword data — 30 items for 6 rows of 5
const MOCK_DATA = [
    { id:  1, keyword: 'Silver Ring',           volume: 12500, competition: 'High',      ctr: '2.4%', trend: 'up',     category: 'Jewelry'        },
    { id:  2, keyword: 'Leather Wallet',         volume:  8200, competition: 'Medium',    ctr: '3.1%', trend: 'stable', category: 'Accessories'    },
    { id:  3, keyword: 'Personalized Mug',       volume: 22000, competition: 'Very High', ctr: '1.8%', trend: 'up',     category: 'Home & Living'  },
    { id:  4, keyword: 'Digital Planner',        volume: 15600, competition: 'High',      ctr: '4.2%', trend: 'up',     category: 'Digital'        },
    { id:  5, keyword: 'Handmade Soap',          volume:  5400, competition: 'Low',       ctr: '3.8%', trend: 'down',   category: 'Bath & Beauty'  },
    { id:  6, keyword: 'Gold Necklace',          volume:  9200, competition: 'High',      ctr: '2.1%', trend: 'up',     category: 'Jewelry'        },
    { id:  7, keyword: 'Vintage Jacket',         volume:  6100, competition: 'Medium',    ctr: '3.5%', trend: 'stable', category: 'Clothing'       },
    { id:  8, keyword: 'Custom Pet Tag',         volume:  8800, competition: 'Low',       ctr: '4.9%', trend: 'up',     category: 'Pet Supplies'   },
    { id:  9, keyword: 'Enamel Pin',             volume:  7300, competition: 'Low',       ctr: '5.1%', trend: 'up',     category: 'Accessories'    },
    { id: 10, keyword: 'Gift for Him',           volume: 45000, competition: 'Very High', ctr: '1.2%', trend: 'up',     category: 'Gifts'          },
    { id: 11, keyword: 'Minimalist Jewelry',     volume: 38000, competition: 'High',      ctr: '2.1%', trend: 'stable', category: 'Jewelry'        },
    { id: 12, keyword: 'Custom Portrait',        volume: 32000, competition: 'High',      ctr: '2.8%', trend: 'up',     category: 'Art'            },
    { id: 13, keyword: 'Wedding Decor',          volume: 29000, competition: 'Very High', ctr: '1.5%', trend: 'up',     category: 'Weddings'       },
    { id: 14, keyword: 'Initial Necklace',       volume: 25000, competition: 'High',      ctr: '1.9%', trend: 'stable', category: 'Jewelry'        },
    { id: 15, keyword: 'Bridesmaid Gift',        volume: 22000, competition: 'High',      ctr: '2.4%', trend: 'up',     category: 'Gifts'          },
    { id: 16, keyword: 'Gifts for Mom',          volume: 21000, competition: 'Very High', ctr: '1.1%', trend: 'down',   category: 'Gifts'          },
    { id: 17, keyword: 'Scented Candle',         volume: 18400, competition: 'High',      ctr: '2.6%', trend: 'up',     category: 'Home & Living'  },
    { id: 18, keyword: 'Macrame Wall Art',       volume:  9700, competition: 'Medium',    ctr: '3.3%', trend: 'up',     category: 'Home Decor'     },
    { id: 19, keyword: 'Boho Earrings',          volume: 11200, competition: 'Medium',    ctr: '3.7%', trend: 'up',     category: 'Jewelry'        },
    { id: 20, keyword: 'Handcrafted Boho Ring',  volume:  4200, competition: 'Medium',    ctr: '4.5%', trend: 'up',     category: 'Jewelry'        },
    { id: 21, keyword: 'Sterling Stackable',     volume:  3100, competition: 'Low',       ctr: '5.2%', trend: 'up',     category: 'Jewelry'        },
    { id: 22, keyword: 'Vintage Gemstone',       volume:  2800, competition: 'Medium',    ctr: '3.8%', trend: 'stable', category: 'Jewelry'        },
    { id: 23, keyword: 'Tarnish Free Band',      volume:  5600, competition: 'Medium',    ctr: '4.1%', trend: 'up',     category: 'Jewelry'        },
    { id: 24, keyword: 'Gold Plated Ring',       volume:  6200, competition: 'High',      ctr: '3.1%', trend: 'up',     category: 'Jewelry'        },
    { id: 25, keyword: 'Minimalist Band',        volume:  4800, competition: 'Medium',    ctr: '4.4%', trend: 'stable', category: 'Jewelry'        },
    { id: 26, keyword: 'Pearl Promise Ring',     volume:  3500, competition: 'Low',       ctr: '5.6%', trend: 'up',     category: 'Jewelry'        },
    { id: 27, keyword: 'Custom Stamp',           volume:  6900, competition: 'Low',       ctr: '4.8%', trend: 'up',     category: 'Craft Supplies' },
    { id: 28, keyword: 'Pressed Flower Art',     volume:  5100, competition: 'Low',       ctr: '4.2%', trend: 'up',     category: 'Art'            },
    { id: 29, keyword: 'Ceramic Planter',        volume:  8400, competition: 'Medium',    ctr: '3.6%', trend: 'stable', category: 'Home & Garden'  },
    { id: 30, keyword: 'Personalized Bookmark',  volume:  4600, competition: 'Low',       ctr: '5.0%', trend: 'up',     category: 'Books'          },
]

// Curated top listing examples per keyword (used when Etsy API not available)
const KEYWORD_LISTINGS: Record<string, { title: string; shop: string; price: string; favorites: number; sales: string; image: string }[]> = {
    default: [
        { title: 'Sterling Silver Stacking Ring Set',   shop: 'CaitlynMinimalist', price: '$34.00', favorites: 18420, sales: '12k+', image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&q=80' },
        { title: 'Personalized Initial Ring Band',      shop: 'DelicateGoldsmith',  price: '$28.00', favorites: 9810,  sales: '8.4k+', image: 'https://images.unsplash.com/photo-1616077167999-51d36a3e7fcf?w=400&q=80' },
        { title: 'Dainty Midi Ring Set of 5',          shop: 'BohoGemFinds',       price: '$22.00', favorites: 7630,  sales: '5.1k+', image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=400&q=80' },
        { title: 'Adjustable Crystal Band Ring',       shop: 'MoonlitCrafts',      price: '$19.00', favorites: 5210,  sales: '3.9k+', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80' },
        { title: 'Hammered Silver Thumb Ring',         shop: 'ForgeAndFern',       price: '$41.00', favorites: 4080,  sales: '2.7k+', image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400&q=80' },
        { title: 'Minimalist Engravable Band',         shop: 'PureMetalStudio',    price: '$55.00', favorites: 3660,  sales: '2.1k+', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80' },
    ],
    'Silver Ring': [
        { title: 'Sterling Silver Stacking Ring Set',  shop: 'CaitlynMinimalist',  price: '$34.00', favorites: 18420, sales: '12k+', image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&q=80' },
        { title: 'Personalized Initial Ring Band',     shop: 'DelicateGoldsmith',  price: '$28.00', favorites: 9810,  sales: '8.4k+', image: 'https://images.unsplash.com/photo-1616077167999-51d36a3e7fcf?w=400&q=80' },
        { title: 'Dainty Midi Ring Set of 5',         shop: 'BohoGemFinds',        price: '$22.00', favorites: 7630,  sales: '5.1k+', image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=400&q=80' },
        { title: 'Adjustable Crystal Band Ring',      shop: 'MoonlitCrafts',       price: '$19.00', favorites: 5210,  sales: '3.9k+', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80' },
        { title: 'Hammered Silver Thumb Ring',        shop: 'ForgeAndFern',        price: '$41.00', favorites: 4080,  sales: '2.7k+', image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400&q=80' },
        { title: 'Minimalist Engravable Band',        shop: 'PureMetalStudio',     price: '$55.00', favorites: 3660,  sales: '2.1k+', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80' },
    ],
    'Leather Wallet': [
        { title: 'Slim Bifold Leather Wallet',         shop: 'HideAndThread',  price: '$45.00', favorites: 11200, sales: '7.8k+', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80' },
        { title: 'Personalized Mens Wallet Card',      shop: 'LeatherLore',    price: '$38.00', favorites: 8900,  sales: '5.2k+', image: 'https://images.unsplash.com/photo-1601592272942-2da5cf2f0e3c?w=400&q=80' },
        { title: 'Minimalist Cardholder Wallet',       shop: 'NomadCraft',     price: '$29.00', favorites: 6430,  sales: '4.0k+', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80' },
        { title: 'Engraved Slim Front Pocket Wallet',  shop: 'WornAndMade',    price: '$52.00', favorites: 5160,  sales: '3.1k+', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80' },
        { title: 'Distressed Brown Fold Wallet',       shop: 'RusticGrove',    price: '$42.00', favorites: 3800,  sales: '2.4k+', image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400&q=80' },
        { title: 'Full Grain Trifold Wallet',          shop: 'PassionForHide', price: '$65.00', favorites: 2940,  sales: '1.8k+', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80' },
    ],
    'Personalized Mug': [
        { title: 'Custom Name Coffee Mug',             shop: 'MugsByMornings', price: '$18.00', favorites: 24100, sales: '18k+', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&q=80' },
        { title: 'Personalized Teacher Gift Mug',      shop: 'GiftableGoods',  price: '$21.00', favorites: 15600, sales: '11k+', image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&q=80' },
        { title: 'Photo Upload Ceramic Mug',           shop: 'PixelPots',      price: '$24.00', favorites: 9800,  sales: '7.2k+', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80' },
        { title: 'Funny Quote Best Friend Mug',        shop: 'CheekyKilns',    price: '$16.00', favorites: 7340,  sales: '5.5k+', image: 'https://images.unsplash.com/photo-1606787503419-df35ee800b45?w=400&q=80' },
        { title: 'Birth Month Flower Custom Mug',      shop: 'BloomSips',      price: '$22.00', favorites: 5680,  sales: '3.9k+', image: 'https://images.unsplash.com/photo-1588479839125-2f14e7d7f11d?w=400&q=80' },
        { title: 'Handlettered Name Mug Set',          shop: 'BrewedScript',   price: '$28.00', favorites: 3910,  sales: '2.6k+', image: 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400&q=80' },
    ],
    'Digital Planner': [
        { title: 'GoodNotes Daily Digital Planner',    shop: 'PlannerKate1',    price: '$9.99',  favorites: 31400, sales: '22k+', image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&q=80' },
        { title: 'iPad Hyperlinked Weekly Planner',    shop: 'DigitalOrganize', price: '$7.50',  favorites: 18600, sales: '14k+', image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&q=80' },
        { title: '2025 Undated Digital Planner PDF',   shop: 'PaperlessStudio', price: '$12.00', favorites: 12100, sales: '9.1k+', image: 'https://images.unsplash.com/photo-1631516175854-75e65cba7a42?w=400&q=80' },
        { title: 'Aesthetic Notion Planner Template',  shop: 'NotionNest',      price: '$5.00',  favorites: 8700,  sales: '6.4k+', image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&q=80' },
        { title: 'Business Digital Planner Bundle',    shop: 'BossInkDigital',  price: '$19.00', favorites: 6200,  sales: '4.2k+', image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&q=80' },
        { title: 'Minimal Black Digital Planner',      shop: 'InkDropStudios',  price: '$8.00',  favorites: 4810,  sales: '3.5k+', image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&q=80' },
    ],
    'Handmade Soap': [
        { title: 'Lavender Oat Milk Handmade Soap Bar', shop: 'SoapSanctuaryco', price: '$8.00',  favorites: 9200,  sales: '6.8k+', image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&q=80' },
        { title: 'Eucalyptus Mint Cold Process Soap',   shop: 'GreenLatherCo',  price: '$7.50',  favorites: 6700,  sales: '4.9k+', image: 'https://images.unsplash.com/photo-1583947582022-d3c95de27c52?w=400&q=80' },
        { title: 'Goat Milk & Honey Soap Set of 4',     shop: 'FarmFreshSoaps', price: '$24.00', favorites: 5100,  sales: '3.8k+', image: 'https://images.unsplash.com/photo-1510014080738-30ef4871ac4f?w=400&q=80' },
        { title: 'Charcoal Tea Tree Detox Bar',         shop: 'PureRootsBath',  price: '$9.00',  favorites: 4060,  sales: '2.9k+', image: 'https://images.unsplash.com/photo-1534361960057-19f4434706ea?w=400&q=80' },
        { title: 'Rose Clay Luxury Soap Bar',           shop: 'BloomLather',    price: '$11.00', favorites: 3380,  sales: '2.3k+', image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=80' },
        { title: 'Custom Gift Soap Sampler Set',        shop: 'SudsByDawn',     price: '$28.00', favorites: 2640,  sales: '1.7k+', image: 'https://images.unsplash.com/photo-1591167868849-4e8a08e94b34?w=400&q=80' },
    ],
}

function TopListingCard({ listing }: { listing: { title: string; shop: string; price: string; favorites: number; sales: string; image: string } }) {
    const [imgError, setImgError] = useState(false)
    return (
        <div className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="h-36 bg-slate-100 relative overflow-hidden">
                {listing.image && !imgError ? (
                    <img src={listing.image} alt={listing.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" onError={() => setImgError(true)} />
                ) : (
                    <div className="h-full w-full flex items-center justify-center"><ImageOff className="h-8 w-8 text-slate-300" /></div>
                )}
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Heart className="h-2.5 w-2.5 fill-white" /> {listing.favorites.toLocaleString()}
                </div>
            </div>
            <div className="p-3 space-y-1">
                <p className="font-semibold text-slate-800 text-xs line-clamp-2 leading-snug" title={listing.title}>{listing.title}</p>
                <p className="text-xs text-teal-600 font-medium">{listing.shop}</p>
                <div className="flex items-center justify-between pt-1">
                    <span className="font-bold text-slate-700 text-sm">{listing.price}</span>
                    <span className="text-xs text-slate-400 flex items-center gap-0.5"><ShoppingBag className="h-3 w-3" /> {listing.sales}</span>
                </div>
            </div>
        </div>
    )
}

function calcKwScore(item: { volume: number; competition: string; trend: string }) {
    const growthPct = item.trend === 'up' ? 42 : item.trend === 'down' ? -18 : 5
    return Math.min(99, Math.max(20, Math.round(
        (growthPct > 0 ? Math.min(growthPct, 150) / 2.5 : 0) +
        (item.competition === 'Low' ? 35 : item.competition === 'Medium' ? 25 : item.competition === 'Very High' ? 5 : 12) +
        Math.min(item.volume / 1500, 22)
    )))
}

interface KeywordDetailPanelProps {
    item: typeof MOCK_DATA[0]
    onClose: () => void
}

function KeywordDetailModal({ item, onClose }: KeywordDetailPanelProps) {
    const router = useRouter()
    const [volumeRange, setVolumeRange] = useState<'1M'|'6M'|'1Y'|'ALL'>('1Y')
    const [copiedTag, setCopiedTag] = useState<string|null>(null)
    const [copiedAll, setCopiedAll] = useState(false)

    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const growthPct = item.trend === 'up' ? 42 : item.trend === 'down' ? -18 : 5
    const baseRev = item.volume * (item.competition === 'Low' ? 0.048 : item.competition === 'Medium' ? 0.032 : item.competition === 'Very High' ? 0.012 : 0.022) * 28

    const monthlyVolData = MONTHS.map((month, i) => {
        const progress = i / 11
        const trend = item.volume * (1 - growthPct/200) + item.volume * (growthPct/200) * 2 * progress
        return { month, searches: Math.max(50, Math.round(trend + trend * 0.07 * Math.sin(i * 1.3))) }
    })
    const prevYearVolData = monthlyVolData.map(d => ({ month: d.month + "'23", searches: Math.round(d.searches * 0.72) }))
    const thisYearVolData = monthlyVolData.map(d => ({ ...d, month: d.month + "'24" }))
    const lastVol = monthlyVolData[11].searches
    const oneMonthVolData = ['Wk 1','Wk 2','Wk 3','Wk 4'].map((wk, i) => ({
        month: wk, searches: Math.round(lastVol / 4 * (0.88 + Math.sin(i * 1.4) * 0.12)),
    }))
    const chartData = volumeRange === '1M' ? oneMonthVolData : volumeRange === '6M' ? monthlyVolData.slice(-6) : volumeRange === 'ALL' ? [...prevYearVolData, ...thisYearVolData] : monthlyVolData

    const kwScore = Math.min(99, Math.max(20, Math.round(
        (growthPct > 0 ? Math.min(growthPct, 150) / 2.5 : 0) +
        (item.competition === 'Low' ? 35 : item.competition === 'Medium' ? 25 : item.competition === 'Very High' ? 5 : 12) +
        Math.min(item.volume / 1500, 22)
    )))

    const compColor = (c: string) => {
        if (c === 'Low')       return 'text-emerald-700 bg-emerald-50 border-emerald-200'
        if (c === 'Medium')    return 'text-amber-700   bg-amber-50   border-amber-200'
        if (c === 'High')      return 'text-rose-700    bg-rose-50    border-rose-200'
        if (c === 'Very High') return 'text-purple-700  bg-purple-50  border-purple-200'
        return 'text-slate-600 bg-slate-50 border-slate-200'
    }

    const relatedTags = [item.keyword.toLowerCase(), ...item.keyword.toLowerCase().split(' '), 'handmade', 'gift', 'etsy', 'custom']
        .filter((v, i, a) => a.indexOf(v) === i && v.length > 2).slice(0, 8)

    const COMPS = ['Low','Medium','High','Very High'] as const
    const tagRows = relatedTags.map((tag, i) => {
        const seed = tag.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
        const vol = Math.round(item.volume * (0.06 + (seed % 38) / 100))
        const comp = COMPS[(seed + i) % 4]
        const score = Math.min(99, Math.max(18, Math.round(
            (growthPct > 0 ? Math.min(growthPct, 150) / 3 : 0) +
            (['Low','Medium'].includes(comp) ? 28 : 8) +
            Math.min(vol / 1200, 18) + (seed % 18)
        )))
        return { tag, vol, comp, score }
    })

    const monthlyRev = Math.round(baseRev)

    return (
        <div className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl shadow-slate-900/25 border border-slate-200/60 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="modal-card max-h-[92vh] overflow-y-auto">

                {/* ── Teal Banner ── */}
                <div className="relative rounded-t-2xl bg-teal-600 px-6 pt-3 pb-4 text-white overflow-hidden">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-xl bg-white/20 border-2 border-white/30 flex-shrink-0 shadow-md flex items-center justify-center">
                                <Search className="h-6 w-6 text-white/80" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-normal leading-tight capitalize">{item.keyword}</h2>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-xs font-semibold bg-black/25 text-white/90 px-2.5 py-0.5 rounded-full">
                                        {item.category}
                                    </span>
                                    <span className="text-sm text-white/80 font-semibold">{item.volume.toLocaleString()} searches/mo</span>
                                </div>
                                <div className="flex items-center gap-2.5 mt-2.5">
                                    <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">Keyword Score</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-28 h-2 bg-white/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${kwScore}%` }} />
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

                {/* ── Body ── */}
                <div className="p-5 space-y-5 bg-slate-50 rounded-b-2xl">

                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-stretch">
                        <div className="rounded-xl border border-teal-200 bg-white p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">Revenue</span>
                                <DollarSign className="h-4 w-4 text-teal-400 opacity-70" />
                            </div>
                            <p className="text-2xl font-black text-teal-900">
                                {monthlyRev >= 1000000 ? `$${(monthlyRev/1000000).toFixed(1)}M` : monthlyRev >= 1000 ? `$${(monthlyRev/1000).toFixed(0)}k` : `$${monthlyRev}`}
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
                        <div className={cn("rounded-xl border p-4 bg-white", compColor(item.competition).replace(/bg-\S+/g, ''))}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider">Competition</span>
                                <Tag className="h-4 w-4 opacity-40" />
                            </div>
                            <p className="text-xl font-black whitespace-nowrap">{item.competition}</p>
                            <p className="text-xs mt-0.5 opacity-60">seller density</p>
                        </div>
                        <div className="rounded-xl border border-violet-200 bg-white p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600">Conversion Rate</span>
                                <TrendingUp className="h-4 w-4 text-violet-400 opacity-70" />
                            </div>
                            <p className="text-2xl font-black text-violet-900">{item.ctr}</p>
                            <p className="text-xs text-violet-500 mt-0.5 opacity-60">avg. estimate</p>
                        </div>
                    </div>

                    {/* Search Volume Chart */}
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
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)' }} formatter={(v: number) => [`${v.toLocaleString()}`, 'Searches']} itemStyle={{ color: '#0f766e', fontWeight: 600 }} labelStyle={{ color: '#475569', fontWeight: 500 }} />
                                    <Area type="monotone" dataKey="searches" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#kwVolGradient)" dot={false} activeDot={{ r: 5, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Related Keywords Table */}
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
                                    <th className="px-4 py-3 w-[18%] text-right">Keyword Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tagRows.map(({ tag, vol, comp, score }) => (
                                    <tr key={tag} className="group hover:bg-teal-50 hover:outline hover:outline-2 hover:outline-teal-500 hover:-outline-offset-1 hover:shadow-[inset_2px_0_0_#0d9488,inset_-2px_0_0_#0d9488]">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => { navigator.clipboard.writeText(tag); setCopiedTag(tag); setTimeout(() => setCopiedTag(null), 1500) }}
                                                    className="text-slate-300 hover:text-teal-500 transition-colors flex-shrink-0">
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

function ViewAllModal({ title, data, onClose, onSave, savedKeywords, onExpand }: { title: string, data: any[], onClose: () => void, onSave: (k: string, v?: number, c?: string) => void, savedKeywords: Set<string>, onExpand: (id: number) => void }) {
    return (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
            <div className="modal-card w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/20" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 text-xl">{title}</h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-0 overflow-y-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider sticky top-0 z-10 shadow-sm border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3">Keyword</th>
                                <th className="px-6 py-3">Search Vol</th>
                                <th className="px-6 py-3">Competition</th>
                                <th className="px-6 py-3">CTR</th>
                                <th className="px-6 py-3">Trend</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.map((item) => (
                                <tr key={item.id} onClick={() => onExpand(item.id)} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                                    <td className="px-6 py-4 font-bold text-slate-800">{item.keyword}</td>
                                    <td className="px-6 py-4 font-medium text-teal-600">{item.volume.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded border w-fit",
                                            item.competition === 'Low'       && "bg-emerald-50 text-emerald-700 border-emerald-200",
                                            item.competition === 'Medium'    && "bg-amber-50 text-amber-700 border-amber-200",
                                            item.competition === 'High'      && "bg-rose-50 text-rose-700 border-rose-200",
                                            item.competition === 'Very High' && "bg-purple-50 text-purple-700 border-purple-200"
                                        )}>{item.competition}</span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-700">{item.ctr}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            {item.trend === 'up' && <><TrendingUp className="h-4 w-4 text-emerald-500" /><span className="text-sm font-bold text-emerald-600">Rising</span></>}
                                            {item.trend === 'down' && <><TrendingDown className="h-4 w-4 text-rose-500" /><span className="text-sm font-bold text-rose-600">Falling</span></>}
                                            {item.trend === 'stable' && <><Minus className="h-4 w-4 text-slate-400" /><span className="text-sm font-bold text-slate-500">Stable</span></>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={(e) => { e.stopPropagation(); onSave(item.keyword, item.volume, item.competition) }} className="p-2 rounded-full hover:bg-slate-100 hover:border-rose-200 border border-transparent transition-colors inline-block shadow-[0_1px_2px_-1px_rgba(0,0,0,0.05)]">
                                            <Heart className={cn("h-4 w-4 transition-colors", savedKeywords.has(item.keyword) ? "fill-rose-500 text-rose-500" : "text-slate-400 hover:text-rose-500")} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default function KeywordResearchPage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [results, setResults] = useState(MOCK_DATA)
    const [hasSearched, setHasSearched] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [apiData, setApiData] = useState<AnalysisResult | null>(null)
    const [showDemoData, setShowDemoData] = useState(false)
    const [apiError, setApiError] = useState<string | null>(null)
    const [savedKeywords, setSavedKeywords] = useState<Set<string>>(new Set())
    const [expandedKeyword, setExpandedKeyword] = useState<number | string | null>(null)
    const [viewAllSection, setViewAllSection] = useState<{title: string, data: any[]} | null>(null)
    const { success, error: toastError } = useToast()
    const supabase = createClient()

    useEffect(() => {
        const fetchSavedKeywords = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { data, error } = await supabase.from('saved_keywords').select('keyword').eq('user_id', user.id)
            if (!error && data) setSavedKeywords(new Set(data.map(k => k.keyword)))
        }
        fetchSavedKeywords()
    }, [])

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery.trim()) return
        setIsLoading(true)
        router.push(`/dashboard/keyword-research/${encodeURIComponent(searchQuery)}`)
    }

    const handleSave = async (keyword: string, volume?: number, competition?: string, ctr?: string, trend?: string) => {
        const isSaved = savedKeywords.has(keyword)
        setSavedKeywords(prev => { const next = new Set(prev); isSaved ? next.delete(keyword) : next.add(keyword); return next })
        if (isSaved) {
            success('Keyword removed', `"${keyword}" removed from saved keywords.`)
        } else {
            success('Keyword saved! 🎉', `"${keyword}" added to your saved keywords.`)
        }
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        try {
            if (isSaved) {
                const { error } = await supabase.from('saved_keywords').delete().eq('user_id', user.id).eq('keyword', keyword)
                if (error) throw error
            } else {
                // Try with new columns first; fall back to base columns if migration hasn't run
                const { error } = await supabase.from('saved_keywords').insert({
                    user_id: user.id, keyword,
                    search_volume: volume || 0,
                    competition: competition || 'Unknown',
                    ctr: ctr || null,
                    trend: trend || null,
                })
                if (error) {
                    const { error: fallbackError } = await supabase.from('saved_keywords').insert({
                        user_id: user.id, keyword,
                        search_volume: volume || 0,
                        competition: competition || 'Unknown',
                    })
                    if (fallbackError) throw fallbackError
                }
            }
        } catch (err) {
            console.error('Failed to save keyword:', err)
            toastError('Failed to save keyword', 'Please try again.')
            setSavedKeywords(prev => { const next = new Set(prev); isSaved ? next.add(keyword) : next.delete(keyword); return next })
        }
    }

    const toggleExpand = (id: number | string) => {
        setExpandedKeyword(prev => prev === id ? null : id)
    }

    const renderKeywordRow = (item: any, index: number) => {
        const score = calcKwScore(item)
        return (
        <tr
            key={item.id}
            onClick={() => toggleExpand(item.id)}
            className="group cursor-pointer transition-all duration-150 hover:bg-teal-50 hover:shadow-[inset_3px_0_0_0_#14b8a6]"
        >
            {/* Heart / Save */}
            <td className="pl-5 pr-2 py-3.5">
                <button
                    onClick={(e) => { e.stopPropagation(); handleSave(item.keyword, item.volume, item.competition, item.ctr, item.trend) }}
                    className="p-1 rounded-full border border-transparent hover:border-rose-200 hover:bg-rose-50 transition-colors"
                >
                    <Heart className={cn("h-4 w-4 transition-colors", savedKeywords.has(item.keyword) ? "fill-rose-500 text-rose-500" : "text-slate-300 hover:text-rose-400")} />
                </button>
            </td>
            {/* Keyword */}
            <td className="px-3 py-3.5">
                <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-100 transition-colors">
                        <Search className="h-3.5 w-3.5 text-teal-500" />
                    </div>
                    <span className="font-semibold text-slate-800 group-hover:text-teal-700 group-hover:font-bold transition-all">{item.keyword}</span>
                </div>
            </td>
            {/* Search Vol */}
            <td className="px-5 py-3.5">
                <span className="font-bold text-teal-600 tabular-nums">{item.volume.toLocaleString()}</span>
                <span className="text-xs text-slate-400 ml-1">/mo</span>
            </td>
            {/* Competition */}
            <td className="px-5 py-3.5 text-center">
                <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border",
                    item.competition === 'Low'       && "bg-emerald-50 text-emerald-700 border-emerald-200",
                    item.competition === 'Medium'    && "bg-amber-50 text-amber-700 border-amber-200",
                    item.competition === 'High'      && "bg-rose-50 text-rose-700 border-rose-200",
                    item.competition === 'Very High' && "bg-purple-50 text-purple-700 border-purple-200"
                )}>
                    <span className={cn("h-1.5 w-1.5 rounded-full",
                        item.competition === 'Low'       && "bg-emerald-500",
                        item.competition === 'Medium'    && "bg-amber-500",
                        item.competition === 'High'      && "bg-rose-500",
                        item.competition === 'Very High' && "bg-purple-500"
                    )} />
                    {item.competition}
                </span>
            </td>
            {/* Conversion */}
            <td className="px-5 py-3.5 text-center">
                <span className="font-semibold text-slate-700 tabular-nums text-sm">{item.ctr}</span>
            </td>
            {/* Trend */}
            <td className="px-5 py-3.5 text-center">
                {item.trend === 'up'     && <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full"><TrendingUp className="h-3.5 w-3.5" />Rising</span>}
                {item.trend === 'down'   && <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full"><TrendingDown className="h-3.5 w-3.5" />Falling</span>}
                {item.trend === 'stable' && <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full"><Minus className="h-3.5 w-3.5" />Stable</span>}
            </td>
            {/* Score */}
            <td className="pl-14 pr-5 py-3.5">
                <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full" style={{ width: `${score}%` }} />
                    </div>
                    <span className="font-bold text-slate-700 text-sm tabular-nums w-6">{score}</span>
                </div>
            </td>
        </tr>
        )
    }

    const renderKeywordTable = (data: any[]) => (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-teal-900/5">
            <table className="w-full text-sm text-left table-fixed">
                <colgroup>
                    <col className="w-[4%]" />
                    <col className="w-[20%]" />
                    <col className="w-[13%]" />
                    <col className="w-[15%]" />
                    <col className="w-[15%]" />
                    <col className="w-[15%]" />
                    <col className="w-[18%]" />
                </colgroup>
                <thead>
                    <tr className="border-b border-teal-200/60 bg-teal-600">
                        <th className="pl-5 pr-2 py-4" />
                        <th className="px-3 py-4 text-sm font-medium uppercase tracking-wider text-white text-left">Keyword</th>
                        <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white text-left">Search Vol</th>
                        <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white text-center">Competition</th>
                        <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white text-center">Conversion</th>
                        <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white text-center">Trend</th>
                        <th className="pl-14 pr-5 py-4 text-sm font-medium uppercase tracking-wider text-white text-left">Score</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.map((item, i) => renderKeywordRow(item, i))}
                </tbody>
            </table>
        </div>
    )

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="rounded-2xl bg-teal-600 px-7 py-5 flex items-center gap-5 shadow-md shadow-teal-900/20">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 flex-shrink-0">
                        <Search className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Keyword Research</h1>
                        <p className="text-sm text-white/75 mt-0.5">Analyze search volume and competition to find your next bestseller.</p>
                    </div>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Discover your next bestseller (e.g. 'Silver Ring')..."
                            className="h-14 w-full pl-12 pr-5 rounded-xl border border-slate-200 bg-white text-lg font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <Button type="submit" disabled={isLoading} className="h-14 min-w-[120px] bg-teal-600 hover:bg-teal-700 text-white px-8 rounded-xl text-base font-semibold shadow-sm disabled:opacity-50">
                        {isLoading ? 'Analyzing...' : 'Explore'}
                    </Button>
                </form>

                {/* API Error Banner */}
                {apiError && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3 text-amber-800">
                        <AlertCircle className="h-5 w-5" />
                        <p className="font-medium">{apiError}</p>
                    </div>
                )}

                {/* Summary Cards (live API data only) */}
                {apiData && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                            <CardContent className="p-6">
                                <p className="text-sm font-medium text-slate-500">Average Price</p>
                                <h3 className="text-2xl font-bold text-slate-800 mt-1">${apiData.stats.averagePrice.toFixed(2)}</h3>
                            </CardContent>
                        </Card>
                        <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                            <CardContent className="p-6">
                                <p className="text-sm font-medium text-slate-500">Min Price</p>
                                <h3 className="text-2xl font-bold text-slate-800 mt-1">${apiData.stats.minPrice.toFixed(2)}</h3>
                            </CardContent>
                        </Card>
                        <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                            <CardContent className="p-6">
                                <p className="text-sm font-medium text-slate-500">Max Price</p>
                                <h3 className="text-2xl font-bold text-slate-800 mt-1">${apiData.stats.maxPrice.toFixed(2)}</h3>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Results Section */}
                <div className="space-y-4 pt-4">
                    {hasSearched ? (
                        <>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
                                    <Search className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">
                                        {apiData ? `Found ${apiData.topTags.length} Related Tags` : `Found ${results.length} Keyword Results`}
                                    </h2>
                                    <p className="text-sm text-slate-500">Click any card to deeply analyze its listings</p>
                                </div>
                            </div>
                            
                            {apiData ? (
                                renderKeywordTable(apiData.topTags.map((tag, i) => ({ id: i, keyword: tag.tag, volume: 0, competition: 'Unknown', ctr: `$${tag.averagePrice.toFixed(2)}`, trend: 'stable' })))
                            ) : results.length > 0 ? (
                                renderKeywordTable(results)
                            ) : (
                                <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-16 text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
                                        <Search className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-700 mb-1">No keywords found</h3>
                                    <p className="text-slate-500 font-medium">Try extending your search to find more results.</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div>
                            {renderKeywordTable(MOCK_DATA)}
                        </div>
                    )}
                </div>
            </div>

            {/* Keyword Detail Modal */}
            {expandedKeyword !== null && (() => {
                const selectedItem = [...results, ...MOCK_DATA].find(item => item.id === expandedKeyword)
                return selectedItem ? <KeywordDetailModal item={selectedItem} onClose={() => setExpandedKeyword(null)} /> : null
            })()}

            {/* View All Modal */}
            {viewAllSection && (
                <ViewAllModal 
                    title={viewAllSection.title} 
                    data={viewAllSection.data} 
                    onClose={() => setViewAllSection(null)} 
                    onSave={handleSave} 
                    savedKeywords={savedKeywords} 
                    onExpand={toggleExpand}
                />
            )}
        </DashboardLayout>
    )
}
