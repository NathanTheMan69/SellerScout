"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, Lock, MoreHorizontal, ChevronDown, ChevronUp, Filter, Download, Search, ImageOff, ExternalLink } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Button } from '@/components/Button';
import { cn } from '@/lib/utils';

// --- Mock Data Generation ---
const generateMockListings = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
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
        ][i % 10] + ` - Style ${Math.floor(i / 10) + 1}`,
        image: `https://source.unsplash.com/random/100x100?product,${i}`,
        price: (Math.random() * 50 + 10).toFixed(2),
        favorites: Math.floor(Math.random() * 2000) + 50,
        orders: Math.floor(Math.random() * 500) + 10,
        age_months: Math.floor(Math.random() * 36) + 1,
        est_revenue: Math.floor(Math.random() * 15000) + 500,
    }));
};

const MOCK_LISTINGS = generateMockListings(55);

type SortField = 'price' | 'favorites' | 'age_months' | 'est_revenue' | 'orders';
type SortOrder = 'asc' | 'desc';

const ProductImage = ({ src, alt }: { src: string, alt: string }) => {
    const [error, setError] = useState(false);

    if (error) {
        return (
            <div className="h-full w-full bg-slate-100 flex items-center justify-center">
                <ImageOff className="h-4 w-4 text-slate-400" />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
            onError={() => setError(true)}
        />
    );
};

export default function ShopDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const shopId = params.shopId as string;
    const decodedShopName = decodeURIComponent(shopId);

    const [listings, setListings] = useState(MOCK_LISTINGS);
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [isLoading, setIsLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    const filteredListings = listings.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedListings = [...filteredListings].sort((a, b) => {
        if (!sortField) return 0;
        const aValue = parseFloat(String(a[sortField]));
        const bValue = parseFloat(String(b[sortField]));
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <div className="w-4 h-4" />;
        return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <Button
                            variant="ghost"
                            className="pl-0 text-slate-500 hover:text-teal-600 gap-2 mb-2"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to Tracker
                        </Button>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                            {decodedShopName} <span className="text-slate-400 font-normal text-xl">Analysis</span>
                        </h1>
                        <p className="text-slate-500">Deep dive into listing performance and revenue estimates.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" /> Filter
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" /> Export CSV
                        </Button>
                    </div>
                </div>

                {/* Search Filter Bar */}
                <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                    <CardContent className="p-6">
                        <div className="relative flex items-center">
                            <Search className="absolute left-4 h-6 w-6 text-teal-600" />
                            <input
                                type="text"
                                placeholder="Filter listings by title..."
                                className="h-14 w-full rounded-xl border-2 border-teal-100 bg-white/50 pl-14 pr-4 text-lg text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Data Table Card */}
                <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5 overflow-hidden">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold text-slate-700">Active Listings ({filteredListings.length})</CardTitle>
                            <div className="text-sm text-slate-500">
                                Last updated: <span className="font-medium text-slate-700">Just now</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 w-[35%]">Product</th>
                                        <th
                                            className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                                            onClick={() => handleSort('est_revenue')}
                                        >
                                            <div className="flex items-center gap-1 text-teal-700">
                                                Est. Revenue <Lock className="h-3 w-3 ml-1 opacity-70" /> <SortIcon field="est_revenue" />
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                                            onClick={() => handleSort('orders')}
                                        >
                                            <div className="flex items-center gap-1 text-teal-700">
                                                Orders <Lock className="h-3 w-3 ml-1 opacity-70" /> <SortIcon field="orders" />
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                                            onClick={() => handleSort('favorites')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Favorites <SortIcon field="favorites" />
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                                            onClick={() => handleSort('price')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Price <SortIcon field="price" />
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                                            onClick={() => handleSort('age_months')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Listing Age <SortIcon field="age_months" />
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 w-10"></th>
                                        <th className="px-6 py-4 text-right">Listing Analysis</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {isLoading ? (
                                        // Skeleton Loading Rows
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i}>
                                                <td className="px-6 py-4"><div className="h-10 w-48 bg-slate-100 rounded animate-pulse" /></td>
                                                <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded animate-pulse" /></td>
                                                <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-100 rounded animate-pulse" /></td>
                                                <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-100 rounded animate-pulse" /></td>
                                                <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-100 rounded animate-pulse" /></td>
                                                <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-100 rounded animate-pulse" /></td>
                                                <td className="px-6 py-4"><div className="h-8 w-8 bg-slate-100 rounded-full ml-auto animate-pulse" /></td>
                                                <td className="px-6 py-4"><div className="h-8 w-8 bg-slate-100 rounded-full ml-auto animate-pulse" /></td>
                                            </tr>
                                        ))
                                    ) : sortedListings.length > 0 ? (
                                        sortedListings.map((item) => (
                                            <tr key={item.id} className="hover:bg-teal-50/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0 border border-slate-200">
                                                            <ProductImage src={item.image} alt={item.title} />
                                                        </div>
                                                        <span className="font-medium text-slate-800 line-clamp-1" title={item.title}>
                                                            {item.title}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 font-bold text-slate-800 select-none blur-sm">
                                                        ${item.est_revenue.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 font-bold text-slate-800 select-none blur-sm">
                                                        {item.orders.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    {item.favorites.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 font-medium">
                                                    ${item.price}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    {item.age_months} Mo.
                                                </td>
                                                <td className="px-6 py-4">
                                                    <a
                                                        href={`https://www.etsy.com/listing/${item.id.replace('listing-', '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-slate-400 hover:text-teal-600 hover:bg-teal-50 gap-2"
                                                        onClick={() => router.push(`/dashboard/listing-analysis?query=${encodeURIComponent(item.title)}&returnTo=${encodeURIComponent(pathname)}`)}
                                                    >
                                                        <Search className="h-4 w-4" /> Analyze
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                                No listings match your filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        <div className="border-t border-slate-100 p-4 flex justify-center bg-slate-50/30">
                            <Button variant="ghost" className="text-slate-500 hover:text-teal-600 w-full max-w-xs">
                                Load Next 100 Listings
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
