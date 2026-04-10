'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Heart, TrendingUp, TrendingDown, Minus, AlertCircle, X, ShoppingBag, Star, ExternalLink, ImageOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/Card'
import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'
import { DashboardLayout } from '@/components/DashboardLayout'
import { createClient } from '@/utils/supabase/client'
import { AnalysisResult } from '@/lib/analyzer'
import { useToast } from '@/components/Toast'

// Mock keyword data — 30 items for 6 rows of 5
const MOCK_DATA = [
    { id:  1, keyword: 'Silver Ring',           volume: 12500, competition: 'High',      ctr: '2.4%', trend: 'up'     },
    { id:  2, keyword: 'Leather Wallet',         volume:  8200, competition: 'Medium',    ctr: '3.1%', trend: 'stable' },
    { id:  3, keyword: 'Personalized Mug',       volume: 22000, competition: 'Very High', ctr: '1.8%', trend: 'up'     },
    { id:  4, keyword: 'Digital Planner',        volume: 15600, competition: 'High',      ctr: '4.2%', trend: 'up'     },
    { id:  5, keyword: 'Handmade Soap',          volume:  5400, competition: 'Low',       ctr: '3.8%', trend: 'down'   },
    { id:  6, keyword: 'Gold Necklace',          volume:  9200, competition: 'High',      ctr: '2.1%', trend: 'up'     },
    { id:  7, keyword: 'Vintage Jacket',         volume:  6100, competition: 'Medium',    ctr: '3.5%', trend: 'stable' },
    { id:  8, keyword: 'Custom Pet Tag',         volume:  8800, competition: 'Low',       ctr: '4.9%', trend: 'up'     },
    { id:  9, keyword: 'Enamel Pin',             volume:  7300, competition: 'Low',       ctr: '5.1%', trend: 'up'     },
    { id: 10, keyword: 'Gift for Him',           volume: 45000, competition: 'Very High', ctr: '1.2%', trend: 'up'     },
    { id: 11, keyword: 'Minimalist Jewelry',     volume: 38000, competition: 'High',      ctr: '2.1%', trend: 'stable' },
    { id: 12, keyword: 'Custom Portrait',        volume: 32000, competition: 'High',      ctr: '2.8%', trend: 'up'     },
    { id: 13, keyword: 'Wedding Decor',          volume: 29000, competition: 'Very High', ctr: '1.5%', trend: 'up'     },
    { id: 14, keyword: 'Initial Necklace',       volume: 25000, competition: 'High',      ctr: '1.9%', trend: 'stable' },
    { id: 15, keyword: 'Bridesmaid Gift',        volume: 22000, competition: 'High',      ctr: '2.4%', trend: 'up'     },
    { id: 16, keyword: 'Gifts for Mom',          volume: 21000, competition: 'Very High', ctr: '1.1%', trend: 'down'   },
    { id: 17, keyword: 'Scented Candle',         volume: 18400, competition: 'High',      ctr: '2.6%', trend: 'up'     },
    { id: 18, keyword: 'Macrame Wall Art',       volume:  9700, competition: 'Medium',    ctr: '3.3%', trend: 'up'     },
    { id: 19, keyword: 'Boho Earrings',          volume: 11200, competition: 'Medium',    ctr: '3.7%', trend: 'up'     },
    { id: 20, keyword: 'Handcrafted Boho Ring',  volume:  4200, competition: 'Medium',    ctr: '4.5%', trend: 'up'     },
    { id: 21, keyword: 'Sterling Stackable',     volume:  3100, competition: 'Low',       ctr: '5.2%', trend: 'up'     },
    { id: 22, keyword: 'Vintage Gemstone',       volume:  2800, competition: 'Medium',    ctr: '3.8%', trend: 'stable' },
    { id: 23, keyword: 'Tarnish Free Band',      volume:  5600, competition: 'Medium',    ctr: '4.1%', trend: 'up'     },
    { id: 24, keyword: 'Gold Plated Ring',       volume:  6200, competition: 'High',      ctr: '3.1%', trend: 'up'     },
    { id: 25, keyword: 'Minimalist Band',        volume:  4800, competition: 'Medium',    ctr: '4.4%', trend: 'stable' },
    { id: 26, keyword: 'Pearl Promise Ring',     volume:  3500, competition: 'Low',       ctr: '5.6%', trend: 'up'     },
    { id: 27, keyword: 'Custom Stamp',           volume:  6900, competition: 'Low',       ctr: '4.8%', trend: 'up'     },
    { id: 28, keyword: 'Pressed Flower Art',     volume:  5100, competition: 'Low',       ctr: '4.2%', trend: 'up'     },
    { id: 29, keyword: 'Ceramic Planter',        volume:  8400, competition: 'Medium',    ctr: '3.6%', trend: 'stable' },
    { id: 30, keyword: 'Personalized Bookmark',  volume:  4600, competition: 'Low',       ctr: '5.0%', trend: 'up'     },
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

interface KeywordDetailPanelProps {
    item: typeof MOCK_DATA[0]
    onClose: () => void
}

function KeywordDetailModal({ item, onClose }: KeywordDetailPanelProps) {
    const listings = KEYWORD_LISTINGS[item.keyword] ?? KEYWORD_LISTINGS['default']

    const competitionColor = (c: string) => {
        if (c === 'Low') return 'text-emerald-700 bg-emerald-100/60 border-emerald-200'
        if (c === 'Medium') return 'text-amber-700 bg-amber-100/60 border-amber-200'
        return 'text-rose-700 bg-rose-100/60 border-rose-200'
    }

    return (
        <div
            className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="modal-card w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200/80 bg-slate-50 shadow-2xl shadow-slate-900/20"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 bg-slate-50 sticky top-0 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                            <Search className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-base">{item.keyword}</h3>
                            <p className="text-xs text-slate-500">Keyword breakdown & top performing listings</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-teal-100/35 rounded-xl border border-teal-200 p-4">
                            <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">Search Volume</p>
                            <p className="text-2xl font-bold text-slate-800">{item.volume.toLocaleString()}</p>
                            <p className="text-xs text-teal-500 mt-0.5">monthly searches</p>
                        </div>
                        <div className={cn("rounded-xl border p-4", competitionColor(item.competition))}>
                            <p className="text-xs font-semibold uppercase tracking-wider mb-1">Competition</p>
                            <p className="text-2xl font-bold">{item.competition}</p>
                            <p className="text-xs mt-0.5 opacity-60">seller density</p>
                        </div>
                        <div className="bg-blue-100/60 rounded-xl border border-blue-200 p-4">
                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Click-Through Rate</p>
                            <p className="text-2xl font-bold text-slate-800">{item.ctr}</p>
                            <p className="text-xs text-blue-500 mt-0.5">avg across listings</p>
                        </div>
                        <div className={cn("rounded-xl border p-4",
                            item.trend === 'up'     ? 'bg-emerald-100/35 border-emerald-200' :
                            item.trend === 'down'   ? 'bg-rose-100/60 border-rose-200' :
                                                      'bg-slate-100/80 border-slate-300'
                        )}>
                            <p className={cn("text-xs font-semibold uppercase tracking-wider mb-1", item.trend === 'up' ? 'text-emerald-600' : item.trend === 'down' ? 'text-rose-600' : 'text-slate-500')}>7d Trend</p>
                            <div className="flex items-center gap-2">
                                {item.trend === 'up'     && <TrendingUp className="h-6 w-6 text-emerald-500" />}
                                {item.trend === 'down'   && <TrendingDown className="h-6 w-6 text-rose-500" />}
                                {item.trend === 'stable' && <Minus className="h-6 w-6 text-slate-400" />}
                                <p className={cn("text-2xl font-bold", item.trend === 'up' ? 'text-emerald-700' : item.trend === 'down' ? 'text-rose-700' : 'text-slate-700')}>
                                    {item.trend === 'up' ? 'Rising' : item.trend === 'down' ? 'Falling' : 'Stable'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Top Listings Grid */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                            <h4 className="font-bold text-slate-800">Top Performing Listings</h4>
                            <span className="text-xs bg-teal-50 text-teal-600 border border-teal-100 px-2 py-0.5 rounded-full font-medium">by favorites</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            {listings.map((listing, i) => (
                                <TopListingCard key={i} listing={listing} />
                            ))}
                        </div>
                    </div>

                        {/* Footer CTA */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <p className="text-xs text-slate-400">Data reflects estimated Etsy market trends</p>
                        <a
                            href={`https://www.etsy.com/search?q=${encodeURIComponent(item.keyword)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline transition-colors"
                        >
                            View on Etsy <ExternalLink className="h-3 w-3" />
                        </a>
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
                                            item.competition === 'Low' && "bg-emerald-50 text-emerald-700 border-emerald-200",
                                            item.competition === 'Medium' && "bg-amber-50 text-amber-700 border-amber-200",
                                            (item.competition === 'High' || item.competition === 'Very High') && "bg-rose-50 text-rose-700 border-rose-200"
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

    const handleSave = async (keyword: string, volume?: number, competition?: string) => {
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
                await supabase.from('saved_keywords').delete().eq('user_id', user.id).eq('keyword', keyword)
            } else {
                await supabase.from('saved_keywords').insert({ user_id: user.id, keyword, search_volume: volume || 0, competition: competition || 'Unknown' })
            }
        } catch {
            toastError('Failed to save keyword', 'Please try again.')
            setSavedKeywords(prev => { const next = new Set(prev); isSaved ? next.add(keyword) : next.delete(keyword); return next })
        }
    }

    const toggleExpand = (id: number | string) => {
        setExpandedKeyword(prev => prev === id ? null : id)
    }

    const renderKeywordRow = (item: any, index: number) => (
        <tr
            key={item.id}
            onClick={() => toggleExpand(item.id)}
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
                    <span className="font-semibold text-slate-800 group-hover:text-teal-700 group-hover:font-bold transition-all">{item.keyword}</span>
                </div>
            </td>
            {/* Search Vol */}
            <td className="px-5 py-3.5">
                <span className="font-bold text-teal-600 tabular-nums">{item.volume.toLocaleString()}</span>
                <span className="text-xs text-slate-400 ml-1">/mo</span>
            </td>
            {/* Competition */}
            <td className="px-5 py-3.5">
                <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border",
                    item.competition === 'Low'    && "bg-emerald-50 text-emerald-700 border-emerald-200",
                    item.competition === 'Medium' && "bg-amber-50 text-amber-700 border-amber-200",
                    (item.competition === 'High' || item.competition === 'Very High') && "bg-rose-50 text-rose-700 border-rose-200"
                )}>
                    <span className={cn("h-1.5 w-1.5 rounded-full",
                        item.competition === 'Low'    && "bg-emerald-500",
                        item.competition === 'Medium' && "bg-amber-500",
                        (item.competition === 'High' || item.competition === 'Very High') && "bg-rose-500"
                    )} />
                    {item.competition}
                </span>
            </td>
            {/* CTR */}
            <td className="px-5 py-3.5">
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-teal-400"
                            style={{ width: `${Math.min(100, parseFloat(item.ctr) * 16)}%` }}
                        />
                    </div>
                    <span className="font-semibold text-slate-700 tabular-nums text-sm">{item.ctr}</span>
                </div>
            </td>
            {/* Trend */}
            <td className="px-5 py-3.5">
                {item.trend === 'up'     && <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full"><TrendingUp className="h-3.5 w-3.5" />Rising</span>}
                {item.trend === 'down'   && <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full"><TrendingDown className="h-3.5 w-3.5" />Falling</span>}
                {item.trend === 'stable' && <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full"><Minus className="h-3.5 w-3.5" />Stable</span>}
            </td>
            {/* Save */}
            <td className="px-5 py-3.5 text-right">
                <button
                    onClick={(e) => { e.stopPropagation(); handleSave(item.keyword, item.volume, item.competition) }}
                    className="p-1.5 rounded-full border border-transparent hover:border-rose-200 hover:bg-rose-50 transition-colors"
                >
                    <Heart className={cn("h-4 w-4 transition-colors", savedKeywords.has(item.keyword) ? "fill-rose-500 text-rose-500" : "text-slate-300 hover:text-rose-400")} />
                </button>
            </td>
        </tr>
    )

    const renderKeywordTable = (data: any[]) => (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-teal-900/5">
            <table className="w-full text-sm text-left">
                <thead>
                    <tr className="border-b border-teal-200/60 bg-teal-500/80">
                        <th className="w-10 pl-5 pr-2 py-4" />
                        <th className="px-3 py-4 text-sm font-medium uppercase tracking-wider text-white text-left">Keyword</th>
                        <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white text-left">Search Vol</th>
                        <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white text-left">Competition</th>
                        <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white text-left">CTR</th>
                        <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white text-left">Trend</th>
                        <th className="px-5 py-4 text-sm font-medium uppercase tracking-wider text-white text-right">Save</th>
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
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-md shadow-teal-900/20">
                        <Search className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Keyword Research</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Analyze search volume and competition to find your next bestseller.</p>
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
