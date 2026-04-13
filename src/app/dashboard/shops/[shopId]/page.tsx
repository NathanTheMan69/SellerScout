"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/components/Toast';
import {
    ArrowLeft, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search, ImageOff, ExternalLink, X,
    Star, Calendar, Tag, ShoppingBag, TrendingUp, Heart, Copy, Check,
    BarChart2, Store, DollarSign, Package, Eye, Clock
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';
import { cn } from '@/lib/utils';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';

// --- Revenue chart data ---
const generateRevenueData = () => {
    const data = [];
    const today = new Date();
    for (let i = 365; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const base = 1800;
        const trend = Math.sin(i / 28) * 400;
        const random = Math.random() * 900;
        data.push({ date, total: Math.floor(base + trend + random) });
    }
    return data;
};
const ALL_REVENUE = generateRevenueData();

const getRevenueData = (range: '30D' | '6M' | '1Y') => {
    if (range === '6M' || range === '1Y') {
        const monthsToKeep = range === '6M' ? 6 : 12;
        const monthly: Record<string, { name: string; total: number; order: number }> = {};
        ALL_REVENUE.forEach(item => {
            const key = `${item.date.toLocaleString('default', { month: 'short' })}-${item.date.getFullYear()}`;
            if (!monthly[key]) monthly[key] = { name: item.date.toLocaleString('default', { month: 'short' }), total: 0, order: item.date.getTime() };
            monthly[key].total += item.total;
        });
        return Object.values(monthly).sort((a, b) => a.order - b.order).slice(-monthsToKeep);
    }
    return ALL_REVENUE.slice(-30).map(item => ({
        name: item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total: item.total,
    }));
};

// --- Mock Data ---
const MOCK_SHOP = {
    name: "SilverCraftCo",
    logo: "https://images.unsplash.com/photo-1627123424574-181ce5171c98?w=300&q=80",
    rating: 4.8,
    reviews: 892,
    founded: 2021,
    totalSales: 12543,
    activeListings: 142,
    totalFavorers: 4521,
    avgPrice: 51.66,
    ageMonths: 34,
    topTags: ["silver ring", "boho jewelry", "handmade gift", "minimalist", "statement ring", "gift for her", "925 silver"],
    topCategories: [
        { name: "Rings", pct: 42 },
        { name: "Bracelets", pct: 28 },
        { name: "Earrings", pct: 18 },
        { name: "Necklaces", pct: 12 },
    ],
    monthlyGrowth: "+14%",
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function generateListingMonthly(estRevenue: number) {
    return MONTHS.map((month, i) => {
        const base = estRevenue / 12;
        const wobble = base * 0.3 * Math.sin(i * 1.4 + 1);
        return { month, revenue: Math.max(0, Math.round(base + wobble)) };
    });
}

const LISTING_STOCK_PHOTOS = [
    "https://images.unsplash.com/photo-1627123424574-181ce5171c98?w=400&q=80",
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80",
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",
    "https://images.unsplash.com/photo-1583511655826-05700442982a?w=400&q=80",
    "https://images.unsplash.com/photo-1603905623639-cbe42eea3087?w=400&q=80",
    "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&q=80",
    "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&q=80",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=80",
    "https://images.unsplash.com/photo-1594040226829-7f251ab46d80?w=400&q=80",
    "https://images.unsplash.com/photo-1615812214207-34e3be6812df?w=400&q=80",
];

const generateMockListings = (count: number) =>
    Array.from({ length: count }).map((_, i) => ({
        id: `listing-${i}`,
        title: [
            "Personalized Leather Keyring",
            "Minimalist Silver Ring",
            "Boho Wall Art Print",
            "Custom Pet Portrait",
            "Vintage Brass Candle Holder",
            "Handmade Ceramic Mug",
            "Digital Planner Template",
            "Wedding Invitation Suite",
            "Macrame Plant Hanger",
            "Gold Plated Necklace"
        ][i % 10] + ` — Style ${Math.floor(i / 10) + 1}`,
        image: LISTING_STOCK_PHOTOS[i % LISTING_STOCK_PHOTOS.length],
        price: (Math.random() * 50 + 10).toFixed(2),
        favorites: Math.floor(Math.random() * 2000) + 50,
        orders: Math.floor(Math.random() * 500) + 10,
        age_months: Math.floor(Math.random() * 36) + 1,
        est_revenue: Math.floor(Math.random() * 15000) + 500,
        trend: i % 4 === 3 ? Math.round(-(Math.random() * 40 + 5) * 10) / 10 : Math.round((Math.random() * 120 + 5) * 10) / 10,
    }));

const MOCK_LISTINGS = generateMockListings(55);

type SortField = 'price' | 'trend' | 'age_months' | 'est_revenue' | 'orders';
type SortOrder = 'asc' | 'desc';

const ProductImage = ({ src, alt }: { src: string; alt: string }) => {
    const [error, setError] = useState(false);
    if (error) return (
        <div className="h-full w-full bg-slate-100 flex items-center justify-center">
            <ImageOff className="h-4 w-4 text-slate-400" />
        </div>
    );
    return <img src={src} alt={alt} className="h-full w-full object-cover" onError={() => setError(true)} />;
};

const StatCard = ({ icon, label, value, sub, color }: {
    icon: React.ReactNode; label: string; value: string; sub?: string; color: string
}) => (
    <div className={cn("rounded-2xl border p-5 flex flex-col gap-3", color)}>
        <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</span>
            <div className="opacity-60">{icon}</div>
        </div>
        <div>
            <div className="text-3xl font-black tracking-tight">{value}</div>
            {sub && <div className="text-xs mt-0.5 opacity-60 font-medium">{sub}</div>}
        </div>
    </div>
);

export default function ShopDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const shopId = params.shopId as string;
    const decodedShopName = decodeURIComponent(shopId);

    const supabase = createClient();
    const { success, error: toastError } = useToast();
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
    const [savedDbIds, setSavedDbIds] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchSaved = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data } = await supabase.from('saved_listings').select('id, listing_title').eq('user_id', user.id);
            if (data) {
                const titles = new Set(data.map((d: { listing_title: string }) => d.listing_title));
                const dbMap: Record<string, string> = {};
                data.forEach((d: { id: string; listing_title: string }) => { dbMap[d.listing_title] = d.id });
                setSavedIds(new Set(MOCK_LISTINGS.filter(l => titles.has(l.title)).map(l => l.id)));
                setSavedDbIds(dbMap);
            }
        };
        fetchSaved();
    }, []);

    const handleSaveListing = useCallback(async (e: React.MouseEvent, item: typeof MOCK_LISTINGS[0]) => {
        e.stopPropagation();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        if (savedIds.has(item.id)) {
            const dbId = savedDbIds[item.title];
            setSavedIds(prev => { const s = new Set(prev); s.delete(item.id); return s });
            const { error: err } = await supabase.from('saved_listings').delete().eq('id', dbId);
            if (err) { setSavedIds(prev => new Set(prev).add(item.id)); toastError('Failed to remove listing'); }
            else success('Listing removed', item.title);
        } else {
            setSavedIds(prev => new Set(prev).add(item.id));
            const { data, error: err } = await supabase.from('saved_listings').insert({
                user_id: user.id,
                listing_title: item.title,
                listing_url: `https://www.etsy.com/search?q=${encodeURIComponent(item.title)}`,
                price: parseFloat(item.price),
                image_url: item.image,
                total_sales: item.orders,
            }).select('id').single();
            if (err) { setSavedIds(prev => { const s = new Set(prev); s.delete(item.id); return s }); toastError('Failed to save listing'); }
            else { success('Listing saved!', item.title); if (data) setSavedDbIds(prev => ({ ...prev, [item.title]: data.id })); }
        }
    }, [savedIds, savedDbIds]);

    const [listings, ] = useState(MOCK_LISTINGS);
    const [selectedListing, setSelectedListing] = useState<typeof MOCK_LISTINGS[0] | null>(null);
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedTag, setCopiedTag] = useState<string | null>(null);
    const [revenueRange, setRevenueRange] = useState<'30D' | '6M' | '1Y'>('30D');
    const revenueData = getRevenueData(revenueRange);
    const [listingsPage, setListingsPage] = useState(1);
    const LISTINGS_PER_PAGE = 20;

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 700);
        return () => clearTimeout(timer);
    }, []);

    const handleSort = (field: SortField) => {
        if (sortField === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortOrder('desc'); }
        setListingsPage(1);
    };

    const handleCopyTag = (tag: string) => {
        navigator.clipboard.writeText(tag);
        setCopiedTag(tag);
        setTimeout(() => setCopiedTag(null), 2000);
    };

    const filteredListings = listings.filter(l =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const sortedListings = [...filteredListings].sort((a, b) => {
        if (!sortField) return 0;
        const aV = parseFloat(String(a[sortField]));
        const bV = parseFloat(String(b[sortField]));
        return sortOrder === 'asc' ? aV - bV : bV - aV;
    });

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <div className="w-4 h-4 opacity-30"><ChevronDown className="w-4 h-4" /></div>;
        return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-in fade-in duration-500">

                {/* ── Top Nav ── */}
                <div className="flex items-center -mt-7">
                    <Button variant="ghost" className="pl-0 text-slate-500 hover:text-teal-600 gap-2" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" /> Back to Tracker
                    </Button>
                </div>

                {/* ── Shop Identity Banner ── */}
                <div className="rounded-2xl bg-teal-500/80 p-6 text-white shadow-xl shadow-teal-900/20 flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="h-20 w-20 rounded-2xl bg-white/20 border-2 border-white/30 overflow-hidden flex-shrink-0 shadow-lg flex items-center justify-center">
                        <img
                            src={MOCK_SHOP.logo}
                            alt={decodedShopName}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                                const el = e.target as HTMLImageElement
                                el.style.display = 'none'
                                el.parentElement!.innerHTML = `<div class="h-full w-full flex items-center justify-center text-2xl font-black text-white/90">${decodedShopName.substring(0, 2).toUpperCase()}</div>`
                            }}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-4xl font-black tracking-tight">{decodedShopName}</h1>
                            <a href={`https://www.etsy.com/shop/${decodedShopName}`} target="_blank" rel="noopener noreferrer">
                                <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 gap-2 h-8 text-sm">
                                    <ExternalLink className="h-3.5 w-3.5" /> View on Etsy
                                </Button>
                            </a>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-white/80">
                            <div className="flex items-center gap-1.5">
                                <Star className="h-4 w-4 text-amber-300 fill-amber-300" />
                                <span className="font-bold text-white">{MOCK_SHOP.rating}</span>
                                <span>({MOCK_SHOP.reviews.toLocaleString()} reviews)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                <span>Est. {MOCK_SHOP.founded}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Stats Grid ── */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                    <StatCard
                        icon={<ShoppingBag className="h-5 w-5" />}
                        label="Total Sales"
                        value={MOCK_SHOP.totalSales.toLocaleString()}
                        sub="all time"
                        color="bg-teal-50 border-teal-200 text-teal-900"
                    />
                    <StatCard
                        icon={<Package className="h-5 w-5" />}
                        label="Active Listings"
                        value={MOCK_SHOP.activeListings.toLocaleString()}
                        sub="live now"
                        color="bg-blue-50 border-blue-200 text-blue-900"
                    />
                    <StatCard
                        icon={<TrendingUp className="h-5 w-5" />}
                        label="Growth"
                        value="+14%"
                        sub="last 30 days"
                        color="bg-emerald-50 border-emerald-200 text-emerald-900"
                    />
                    <StatCard
                        icon={<Heart className="h-5 w-5" />}
                        label="Favorites"
                        value={MOCK_SHOP.totalFavorers.toLocaleString()}
                        sub="all time"
                        color="bg-rose-50 border-rose-200 text-rose-900"
                    />
                    <StatCard
                        icon={<TrendingUp className="h-5 w-5" />}
                        label="Conversion Rate"
                        value="3.8%"
                        sub="avg across listings"
                        color="bg-amber-50 border-amber-200 text-amber-900"
                    />
                    <StatCard
                        icon={<Calendar className="h-5 w-5" />}
                        label="Shop Age"
                        value={`${Math.floor(MOCK_SHOP.ageMonths / 12)}y ${MOCK_SHOP.ageMonths % 12}m`}
                        sub={`Est. ${MOCK_SHOP.founded}`}
                        color="bg-purple-50 border-purple-200 text-purple-900"
                    />
                </div>

                {/* ── Revenue Chart + Top Performing Listings ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                    <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <BarChart2 className="h-5 w-5 text-teal-600" />
                                    <h3 className="text-base font-bold text-slate-800">Estimated Revenue</h3>
                                </div>
                                <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-lg">
                                    {(['30D', '6M', '1Y'] as const).map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setRevenueRange(r)}
                                            className={cn(
                                                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                                revenueRange === r
                                                    ? "bg-white text-teal-700 shadow-sm"
                                                    : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-700"
                                            )}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#334155" fontSize={11} tickLine={false} axisLine={false} minTickGap={30} />
                                    <YAxis width={38} stroke="#334155" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip
                                        contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                                        formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']}
                                    />
                                    <Area type="monotone" dataKey="total" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" animationDuration={400} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                {/* Top Performing Listings — right column of the grid */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-teal-600" />
                        <h3 className="text-lg font-bold text-slate-800">Top Performing Listings</h3>
                        <span className="ml-auto text-xs text-slate-400">by favorites</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 flex-1">
                        {[...listings].sort((a, b) => b.favorites - a.favorites).slice(0, 3).map((item, i) => (
                            <div key={item.id} onClick={() => setSelectedListing(item)} className="group cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:border-teal-200 hover:shadow-md hover:shadow-teal-900/10 transition-all duration-200 hover:scale-[1.03] flex flex-col">
                                {/* Image */}
                                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden flex-shrink-0">
                                    <ProductImage src={item.image} alt={item.title} />
                                    <div className="absolute top-2 left-2 h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-sm bg-teal-500/80">
                                        {i + 1}
                                    </div>
                                    <div className="absolute bottom-2 right-2 flex items-center gap-0.5 rounded-full border border-white/70 bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold text-slate-700 shadow-sm backdrop-blur">
                                        <Clock className="h-2.5 w-2.5 text-slate-400" />{item.age_months}mo
                                    </div>
                                </div>
                                {/* Info */}
                                <div className="p-2.5 flex flex-col gap-1.5 flex-1">
                                    <p className="text-xs font-semibold text-slate-800 group-hover:text-teal-700 line-clamp-2 leading-snug transition-colors">{item.title}</p>
                                    <span className="text-sm font-bold text-teal-600">${item.price}</span>
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-auto pt-1 border-t border-slate-100">
                                        {[
                                            { icon: <DollarSign className="h-3 w-3 text-teal-500" />, label: 'Rev', value: `$${(item.est_revenue / 1000).toFixed(1)}k` },
                                            { icon: <ShoppingBag className="h-3 w-3 text-blue-500" />, label: 'Sold', value: item.orders },
                                            { icon: <Eye className="h-3 w-3 text-violet-500" />, label: 'Views', value: `${((item.favorites * 4) / 1000).toFixed(1)}k` },
                                            { icon: <Heart className="h-3 w-3 text-rose-500" />, label: 'Favs', value: item.favorites.toLocaleString() },
                                        ].map(s => (
                                            <div key={s.label} className="flex items-center gap-1">
                                                {s.icon}
                                                <span className="text-[10px] text-slate-400 font-medium">{s.label}</span>
                                                <span className="text-[11px] font-bold text-slate-700 ml-auto">{s.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                </div>{/* end grid */}

                {/* ── Full Listings Table ── */}
                <div>
                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search listings by title..."
                            className="h-14 w-full pl-12 pr-5 rounded-xl border border-slate-200 bg-white text-base font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setListingsPage(1); }}
                        />
                        {searchQuery && (
                            <button type="button" onClick={() => { setSearchQuery(''); setListingsPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-teal-500/80 text-white text-xs font-bold uppercase tracking-wider">
                                            <th className="w-10 pl-5 pr-2 py-4"></th>
                                            <th className="px-4 py-4 w-[28%]">Product</th>
                                            <th className="w-[12%] px-4 py-4 cursor-pointer hover:bg-teal-600/30 transition-colors" onClick={() => handleSort('trend')}>
                                                <div className="flex items-center gap-1">Trend <SortIcon field="trend" /></div>
                                            </th>
                                            <th className="w-[12%] px-4 py-4 cursor-pointer hover:bg-teal-600/30 transition-colors" onClick={() => handleSort('est_revenue')}>
                                                <div className="flex items-center gap-1">Revenue <SortIcon field="est_revenue" /></div>
                                            </th>
                                            <th className="w-[13%] px-4 py-4 cursor-pointer hover:bg-teal-600/30 transition-colors" onClick={() => handleSort('orders')}>
                                                <div className="flex items-center gap-1">Conversion <SortIcon field="orders" /></div>
                                            </th>
                                            <th className="w-[10%] px-4 py-4 cursor-pointer hover:bg-teal-600/30 transition-colors" onClick={() => handleSort('price')}>
                                                <div className="flex items-center gap-1">Price <SortIcon field="price" /></div>
                                            </th>
                                            <th className="w-[8%] px-4 py-4 cursor-pointer hover:bg-teal-600/30 transition-colors" onClick={() => handleSort('age_months')}>
                                                <div className="flex items-center gap-1">Age <SortIcon field="age_months" /></div>
                                            </th>
                                            <th className="px-4 py-4 text-right">Etsy</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {isLoading ? (
                                            Array.from({ length: 6 }).map((_, i) => (
                                                <tr key={i}>
                                                    <td className="pl-5 pr-2 py-4"><div className="h-3 w-5 bg-slate-100 rounded animate-pulse" /></td>
                                                    <td className="px-4 py-4"><div className="h-10 w-48 bg-slate-100 rounded animate-pulse" /></td>
                                                    <td className="px-4 py-4"><div className="h-4 w-16 bg-slate-100 rounded animate-pulse" /></td>
                                                    <td className="px-4 py-4"><div className="h-4 w-16 bg-slate-100 rounded animate-pulse" /></td>
                                                    <td className="px-4 py-4"><div className="h-4 w-16 bg-slate-100 rounded animate-pulse" /></td>
                                                    <td className="px-4 py-4"><div className="h-4 w-12 bg-slate-100 rounded animate-pulse" /></td>
                                                    <td className="px-4 py-4"><div className="h-4 w-12 bg-slate-100 rounded animate-pulse" /></td>
                                                    <td className="px-4 py-4"><div className="h-8 w-20 bg-slate-100 rounded ml-auto animate-pulse" /></td>
                                                </tr>
                                            ))
                                        ) : sortedListings.length > 0 ? (
                                            sortedListings
                                                .slice((listingsPage - 1) * LISTINGS_PER_PAGE, listingsPage * LISTINGS_PER_PAGE)
                                                .map((item, index) => {
                                                    const globalIndex = (listingsPage - 1) * LISTINGS_PER_PAGE + index
                                                    return (
                                                        <tr key={item.id} className="group hover:bg-teal-50 hover:outline hover:outline-2 hover:outline-teal-500 hover:-outline-offset-1 hover:shadow-[inset_2px_0_0_#0d9488,inset_-2px_0_0_#0d9488]">
                                                            <td className="pl-5 pr-2 py-3.5">
                                                                <button
                                                                    onClick={(e) => handleSaveListing(e, item)}
                                                                    className={cn("transition-colors", savedIds.has(item.id) ? "text-rose-500" : "text-slate-300 hover:text-rose-500")}
                                                                >
                                                                    <Heart className={cn("h-5 w-5", savedIds.has(item.id) && "fill-rose-500")} />
                                                                </button>
                                                            </td>
                                                            <td className="px-4 py-3.5">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-10 w-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 group-hover:border-teal-300 transition-colors">
                                                                        <ProductImage src={item.image} alt={item.title} />
                                                                    </div>
                                                                    <span className="font-medium text-slate-800 group-hover:text-teal-700 line-clamp-1 transition-colors" title={item.title}>
                                                                        {item.title}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                                <td className="px-4 py-3.5">
                                                                <div className={cn(
                                                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold",
                                                                    item.trend >= 0
                                                                        ? "bg-emerald-100 text-emerald-700"
                                                                        : "bg-rose-100 text-rose-700"
                                                                )}>
                                                                    {item.trend >= 0
                                                                        ? <TrendingUp className="h-3 w-3" />
                                                                        : <TrendingUp className="h-3 w-3 rotate-180" />}
                                                                    {item.trend >= 0 ? '+' : ''}{item.trend}%
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3.5">
                                                                <span className="text-sm font-semibold text-slate-700 tabular-nums">${(item.est_revenue / 1000).toFixed(1)}k</span>
                                                            </td>
                                                            <td className="px-4 py-3.5">
                                                                <span className="text-sm font-semibold text-slate-700 tabular-nums">
                                                                    {((item.orders / (item.favorites * 4)) * 100).toFixed(1)}%
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3.5">
                                                                <span className="text-sm font-semibold text-slate-700 tabular-nums">${item.price}</span>
                                                            </td>
                                                            <td className="px-4 py-3.5 text-slate-400 text-xs tabular-nums">
                                                                {item.age_months} mo.
                                                            </td>
                                                            <td className="px-4 py-3.5 text-right">
                                                                <a
                                                                    href={`https://www.etsy.com/search?q=${encodeURIComponent(item.title)}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline transition-colors"
                                                                >
                                                                    View <ExternalLink className="h-3 w-3" />
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                        ) : (
                                            <tr>
                                                <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                                                    No listings match your search.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination */}
                            {!isLoading && sortedListings.length > LISTINGS_PER_PAGE && (
                                <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between bg-slate-50/30">
                                    <span className="text-xs text-slate-400">
                                        Showing {(listingsPage - 1) * LISTINGS_PER_PAGE + 1}–{Math.min(listingsPage * LISTINGS_PER_PAGE, sortedListings.length)} of {sortedListings.length}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setListingsPage(p => Math.max(1, p - 1))}
                                            disabled={listingsPage === 1}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        {Array.from({ length: Math.ceil(sortedListings.length / LISTINGS_PER_PAGE) }).map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setListingsPage(i + 1)}
                                                className={cn(
                                                    "h-7 w-7 rounded-lg text-xs font-bold transition-colors",
                                                    listingsPage === i + 1
                                                        ? "bg-teal-500 text-white"
                                                        : "text-slate-500 hover:bg-teal-50 hover:text-teal-600"
                                                )}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setListingsPage(p => Math.min(Math.ceil(sortedListings.length / LISTINGS_PER_PAGE), p + 1))}
                                            disabled={listingsPage === Math.ceil(sortedListings.length / LISTINGS_PER_PAGE)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ── Top Performing Tags ── */}
                <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Tag className="h-5 w-5 text-teal-600" />
                            <h3 className="text-base font-bold text-slate-800">Top Performing Tags</h3>
                            <span className="ml-auto text-xs text-slate-400">Click to copy</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {MOCK_SHOP.topTags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => handleCopyTag(tag)}
                                    className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-teal-50 hover:border-teal-300 text-slate-700 hover:text-teal-700 rounded-full text-sm font-medium transition-all"
                                >
                                    {copiedTag === tag ? (
                                        <><Check className="h-3 w-3 text-teal-600" /><span className="text-teal-600 font-bold">Copied!</span></>
                                    ) : (
                                        <><Copy className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />#{tag}</>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="mt-6 space-y-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Listing Categories</p>
                            {MOCK_SHOP.topCategories.map((cat) => (
                                <div key={cat.name} className="space-y-1">
                                    <div className="flex justify-between text-xs text-slate-600 font-medium">
                                        <span>{cat.name}</span>
                                        <span className="text-teal-600 font-bold">{cat.pct}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-700"
                                            style={{ width: `${cat.pct}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

            </div>

            {/* ── Listing Detail Modal ── */}
            {selectedListing && (() => {
                const item = selectedListing;
                const monthlyData = generateListingMonthly(item.est_revenue);
                const peakMonth = monthlyData.reduce((p, c) => c.revenue > p.revenue ? c : p);
                const convRate = ((item.orders / (item.favorites * 4)) * 100).toFixed(1);
                return (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setSelectedListing(null)}
                    >
                        <div
                            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200/80 bg-slate-50 shadow-2xl shadow-slate-900/20"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 bg-slate-50 sticky top-0 rounded-t-2xl z-10">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                                        <ShoppingBag className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-base line-clamp-1">{item.title}</h3>
                                        <p className="text-xs text-slate-500">Listing · Revenue &amp; performance analysis</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedListing(null)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600 flex-shrink-0">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Top image + stats row */}
                                <div className="flex gap-5">
                                    <div className="w-40 h-40 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
                                        <ProductImage src={item.image} alt={item.title} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 flex-1">
                                        <div className="bg-teal-100/35 rounded-xl border border-teal-200 p-4">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <DollarSign className="h-3.5 w-3.5 text-teal-500" />
                                                <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider">Est. Revenue</p>
                                            </div>
                                            <p className="text-2xl font-bold text-slate-800">${item.est_revenue.toLocaleString()}</p>
                                            <p className="text-xs text-teal-500 mt-0.5">estimated total</p>
                                        </div>
                                        <div className="bg-blue-100/35 rounded-xl border border-blue-200 p-4">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <ShoppingBag className="h-3.5 w-3.5 text-blue-500" />
                                                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Orders Sold</p>
                                            </div>
                                            <p className="text-2xl font-bold text-slate-800">{item.orders.toLocaleString()}</p>
                                            <p className="text-xs text-blue-500 mt-0.5">total sold</p>
                                        </div>
                                        <div className="bg-rose-100/35 rounded-xl border border-rose-200 p-4">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Heart className="h-3.5 w-3.5 text-rose-500" />
                                                <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Favorites</p>
                                            </div>
                                            <p className="text-2xl font-bold text-slate-800">{item.favorites.toLocaleString()}</p>
                                            <p className="text-xs text-rose-500 mt-0.5">total favorites</p>
                                        </div>
                                        <div className="bg-orange-100/60 rounded-xl border border-orange-200 p-4">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <DollarSign className="h-3.5 w-3.5 text-orange-500" />
                                                <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Price</p>
                                            </div>
                                            <p className="text-2xl font-bold text-slate-800">${item.price}</p>
                                            <p className="text-xs text-orange-400 mt-0.5">listing price</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Monthly Revenue Chart */}
                                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                                    <p className="text-sm font-semibold text-slate-700 mb-4">12-Month Revenue Estimate</p>
                                    <div className="h-[200px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="listingGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} width={42} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)' }}
                                                    formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']}
                                                    itemStyle={{ color: '#0f766e', fontWeight: 600 }}
                                                    labelStyle={{ color: '#475569', fontWeight: 500 }}
                                                />
                                                <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#listingGradient)" dot={false} activeDot={{ r: 5, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Insights row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="rounded-xl border border-amber-200 bg-amber-100/60 p-4 flex items-start gap-3">
                                        <Eye className="h-5 w-5 mt-0.5 text-amber-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-0.5">Est. Views</p>
                                            <p className="text-2xl font-bold text-slate-800">{(item.favorites * 4).toLocaleString()}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">based on favorites ratio</p>
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-blue-200 bg-blue-100/60 p-4 flex items-start gap-3">
                                        <TrendingUp className="h-5 w-5 mt-0.5 text-blue-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-0.5">Peak Month</p>
                                            <p className="text-2xl font-bold text-slate-800">{peakMonth.month}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">${peakMonth.revenue.toLocaleString()} revenue</p>
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-violet-300 bg-violet-100/90 p-4 flex items-start gap-3">
                                        <Star className="h-5 w-5 mt-0.5 text-violet-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-0.5">Conv. Rate</p>
                                            <p className="text-2xl font-bold text-slate-800">{convRate}%</p>
                                            <p className="text-xs text-slate-400 mt-0.5">orders / views</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>Listed {item.age_months} months ago</span>
                                    </div>
                                    <a
                                        href={`https://www.etsy.com/search?q=${encodeURIComponent(item.title)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline transition-colors"
                                    >
                                        Search on Etsy <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

        </DashboardLayout>
    );
}
