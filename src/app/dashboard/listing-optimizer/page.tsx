"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/Card"
import { Button } from "@/components/Button"
import { cn } from "@/lib/utils"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Plus, Loader2, AlertCircle, Eye, Heart, X, Search, Sparkles, ShoppingBag, ImageOff } from "lucide-react"

interface Listing {
    listing_id: number;
    title: string;
    price: { amount: number; divisor: number; currency_code: string };
    quantity: number;
    tags: string[];
    images: { url_170x135: string }[];
    creation_tsz?: number;
    num_sales?: number;
}

interface TagGrade {
    tag: string;
    score: number;
    volume: number;
    competition: number;
}

interface Suggestion {
    tag: string;
    score: number;
    volume: number;
    competition: number;
}

interface OptimizationResult {
    grades: TagGrade[];
    suggestions: Suggestion[];
}

interface OptimizerListingCardProps {
    listing: Listing;
    onClick: (listing: Listing) => void;
}

function OptimizerListingCard({ listing, onClick }: OptimizerListingCardProps) {
    const [imageError, setImageError] = useState(false);
    const hasLowStock = listing.quantity < 5;
    const hasMissingTags = (listing.tags?.length || 0) < 13;
    const attentionNeeded = hasLowStock || hasMissingTags;

    const formatPrice = (price: any) => {
        if (!price) return "$0.00";
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: price.currency_code || 'USD'
        }).format(price.amount / price.divisor);
    };

    return (
        <Card
            className="group cursor-pointer hover:shadow-lg hover:shadow-teal-900/5 transition-all duration-200 border-white/50 bg-white/70 backdrop-blur-md overflow-hidden"
            onClick={() => onClick(listing)}
        >
            <div className="h-32 relative bg-slate-100">
                {listing.images?.[0] && !imageError ? (
                    <img
                        src={listing.images[0].url_170x135}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center gap-2">
                        {imageError ? (
                            <>
                                <ImageOff className="w-8 h-8 text-slate-400" />
                                <span className="text-xs text-slate-500 font-medium">Preview unavailable</span>
                            </>
                        ) : (
                            <div className="text-slate-400 text-xs">No Image</div>
                        )}
                    </div>
                )}
                {attentionNeeded && (
                    <div className="absolute top-1 right-1">
                        <div className="relative group/tooltip">
                            <div className="bg-red-500 text-white p-1 rounded-full shadow-sm">
                                <AlertCircle className="h-3 w-3" />
                            </div>
                            <div className="absolute right-0 mt-2 w-32 p-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                                {hasLowStock && <div>• Low Stock</div>}
                                {hasMissingTags && <div>• Missing Tags</div>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="p-3 space-y-1.5">
                <h3 className="font-medium text-slate-900 line-clamp-2 h-9 text-xs leading-tight">
                    {listing.title}
                </h3>
                <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-teal-700">
                        {formatPrice(listing.price)}
                    </span>
                    <span className={cn("text-slate-500", hasLowStock && "text-red-600 font-medium")}>
                        Qty: {listing.quantity}
                    </span>
                    {listing.num_sales !== undefined && (
                        <div className="flex items-center gap-1 text-slate-500" title="Total Sales">
                            <ShoppingBag className="h-3 w-3" />
                            <span>{listing.num_sales}</span>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}

export default function ListingOptimizerPage() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
    const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [tentativeTags, setTentativeTags] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [modalImageError, setModalImageError] = useState(false);

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            const response = await fetch('/api/listings/mine');
            const data = await response.json();
            if (data.listings) {
                setListings(data.listings);
            }
        } catch (error) {
            console.error("Failed to fetch listings", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleListingClick = async (listing: Listing) => {
        setSelectedListing(listing);
        setModalImageError(false);
        setTentativeTags(listing.tags || []);
        setIsOptimizing(true);
        setOptimizationResult(null);

        // Trigger Analysis
        try {
            const response = await fetch('/api/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: listing.title,
                    tags: (listing.tags || []).join(', ')
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setOptimizationResult(data);
            }
        } catch (error) {
            console.error("Optimization failed", error);
        } finally {
            setIsOptimizing(false);
        }
    };

    const formatPrice = (price: any) => {
        if (!price) return "$0.00";
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: price.currency_code || 'USD'
        }).format(price.amount / price.divisor);
    };

    const filteredListings = listings.filter(listing =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRelativeTime = (timestamp?: number) => {
        if (!timestamp) return "Unknown Age";

        const now = Date.now();
        const created = timestamp * 1000; // Etsy API uses seconds
        const diff = now - created;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if (days < 30) return `Listed ${days} days ago`;
        if (months < 12) return `Listed ${months} month${months > 1 ? 's' : ''} ago`;
        return `Listed ${years} year${years > 1 ? 's' : ''} ago`;
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="relative pl-4">
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full" />
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Shop Dashboard</h1>
                    <p className="text-muted-foreground">Monitor and optimize your active listings.</p>
                </div>

                {/* Search Section */}
                <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                    <CardContent className="p-8">
                        <div className="relative flex items-center">
                            <Search className="absolute left-4 h-6 w-6 text-teal-600" />
                            <input
                                type="text"
                                placeholder="Search your listings..."
                                className="h-14 w-full rounded-xl border-2 border-teal-100 bg-white/50 pl-14 pr-32 text-lg text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Button
                                className="absolute right-2 h-10 bg-teal-600 hover:bg-teal-700 text-white px-6 rounded-lg shadow-md shadow-teal-900/10"
                            >
                                Search
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Listing Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {filteredListings.map((listing) => (
                            <OptimizerListingCard
                                key={listing.listing_id}
                                listing={listing}
                                onClick={handleListingClick}
                            />
                        ))}
                        {filteredListings.length === 0 && (
                            <div className="col-span-full text-center py-12 text-slate-500">
                                No listings found matching "{searchQuery}"
                            </div>
                        )}
                    </div>
                )}

                {/* Optimization Modal */}
                {selectedListing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                            {/* Modal Header */}
                            <div className="flex items-start justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex gap-4">
                                    <div className="h-16 w-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                                        {selectedListing.images?.[0] && !modalImageError ? (
                                            <img
                                                src={selectedListing.images[0].url_170x135}
                                                alt=""
                                                className="w-full h-full object-cover"
                                                onError={() => setModalImageError(true)}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                                <ImageOff className="w-6 h-6 text-slate-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 line-clamp-1">{selectedListing.title}</h2>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <Eye className="h-4 w-4" />
                                                <span>1.2k Views</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                                                <span>48 Favorites</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <ShoppingBag className="h-4 w-4" />
                                                <span>{selectedListing.num_sales ?? 0} Sales</span>
                                            </div>
                                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium">
                                                <span>{getRelativeTime(selectedListing.creation_tsz)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedListing(null)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <X className="h-5 w-5 text-slate-500" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto bg-slate-50/30 relative">
                                <div className="p-6 pb-24">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                        {/* Left Column: Current Tags */}
                                        <div className="flex flex-col bg-white rounded-xl border border-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.2)] overflow-hidden relative">
                                            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                                <h3 className="font-semibold text-slate-900">Current Tags</h3>
                                                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                                    {tentativeTags.length}/13 Used
                                                </span>
                                            </div>

                                            <div className="pb-4">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-white text-slate-500 font-medium sticky top-0 z-10">
                                                        <tr>
                                                            <th className="px-4 py-3">Tag</th>
                                                            <th className="px-4 py-3 w-24">Volume</th>
                                                            <th className="px-4 py-3 w-24">Comp.</th>
                                                            <th className="px-4 py-3 w-32">Score</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {tentativeTags.map((tag) => {
                                                            // Find grade data if available
                                                            const grade = optimizationResult?.grades.find(g => g.tag.toLowerCase() === tag.toLowerCase());
                                                            const volume = grade?.volume || 0;
                                                            const competition = grade?.competition || 0;
                                                            const score = grade?.score || 0;

                                                            return (
                                                                <tr key={tag} className="group hover:bg-slate-50/50 transition-colors">
                                                                    <td className="px-4 py-3 font-medium text-slate-700">{tag}</td>
                                                                    <td className="px-4 py-3 text-slate-500 text-xs">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <div className={cn("h-1.5 w-1.5 rounded-full",
                                                                                volume < 1000 ? "bg-red-500" :
                                                                                    volume < 4000 ? "bg-orange-500" : "bg-emerald-500"
                                                                            )} />
                                                                            {volume > 0 ? volume.toLocaleString() : "-"}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-slate-500 text-xs">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <div className={cn("h-1.5 w-1.5 rounded-full",
                                                                                competition < 500 ? "bg-emerald-500" :
                                                                                    competition < 2000 ? "bg-orange-500" : "bg-red-500"
                                                                            )} />
                                                                            {competition > 0 ? competition : "-"}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                                                <div
                                                                                    className={cn("h-full rounded-full", score < 40 ? "bg-red-500" : score < 70 ? "bg-yellow-500" : "bg-emerald-500")}
                                                                                    style={{ width: `${score}%` }}
                                                                                />
                                                                            </div>
                                                                            <span className="text-xs font-medium text-slate-600 w-6 text-right">{score}</span>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                        {tentativeTags.length === 0 && (
                                                            <tr>
                                                                <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">
                                                                    No tags found.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>

                                            </div>
                                        </div>

                                        {/* Right Column: Recommended Opportunities */}
                                        <div className="flex flex-col bg-teal-50 rounded-xl border border-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.2)] overflow-hidden relative">
                                            <div className="p-4 border-b border-teal-100 bg-teal-50/50 flex items-center justify-between">
                                                <h3 className="font-semibold text-teal-900 flex items-center gap-2">
                                                    <Sparkles className="h-4 w-4 text-teal-600" />
                                                    Recommended Tags
                                                    {isOptimizing && <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-600" />}
                                                </h3>
                                            </div>

                                            <div className="relative pb-4">
                                                {isOptimizing ? (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                                                        <Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-2" />
                                                        <p className="text-sm text-teal-600 font-medium animate-pulse">Analyzing Competitors...</p>
                                                    </div>
                                                ) : null}

                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-teal-50 text-slate-500 font-medium sticky top-0 z-10">
                                                        <tr>
                                                            <th className="px-4 py-3">Tag</th>
                                                            <th className="px-4 py-3 w-24">Volume</th>
                                                            <th className="px-4 py-3 w-24">Comp.</th>
                                                            <th className="px-4 py-3 w-32">Score</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {optimizationResult?.suggestions
                                                            .filter(s => !tentativeTags.includes(s.tag))
                                                            .map((suggestion) => (
                                                                <tr key={suggestion.tag} className="group hover:bg-teal-50/30 transition-colors">
                                                                    <td className="px-4 py-3 font-medium text-slate-700">{suggestion.tag}</td>
                                                                    <td className="px-4 py-3 text-slate-500 text-xs">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <div className={cn("h-1.5 w-1.5 rounded-full",
                                                                                suggestion.volume < 1000 ? "bg-red-500" :
                                                                                    suggestion.volume < 4000 ? "bg-orange-500" : "bg-emerald-500"
                                                                            )} />
                                                                            {suggestion.volume.toLocaleString()}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-slate-500 text-xs">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <div className={cn("h-1.5 w-1.5 rounded-full",
                                                                                suggestion.competition < 500 ? "bg-emerald-500" :
                                                                                    suggestion.competition < 2000 ? "bg-orange-500" : "bg-red-500"
                                                                            )} />
                                                                            {suggestion.competition}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                                                <div
                                                                                    className={cn("h-full rounded-full", suggestion.score < 40 ? "bg-red-500" : suggestion.score < 70 ? "bg-yellow-500" : "bg-emerald-500")}
                                                                                    style={{ width: `${suggestion.score}%` }}
                                                                                />
                                                                            </div>
                                                                            <span className="text-xs font-medium text-slate-600 w-6 text-right">{suggestion.score}</span>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}

                                                        {(!optimizationResult || optimizationResult.suggestions.filter(s => !tentativeTags.includes(s.tag)).length === 0) && !isOptimizing && (
                                                            <tr>
                                                                <td colSpan={4} className="px-4 py-12 text-center text-slate-400">
                                                                    {optimizationResult ? "All top recommendations added!" : ""}
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                        </div>

                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="sticky bottom-0 z-20 bg-white border-t border-transparent p-6 flex justify-end gap-3">
                                    <div className="absolute -top-10 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                                    <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-900/20" onClick={() => setSelectedListing(null)}>
                                        Done
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
