"use client";

import React, { useState, useEffect } from 'react'
import { Search, ShoppingBag, Heart, AlertCircle, ImageOff, ArrowLeft } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'
import { DashboardLayout } from '@/components/DashboardLayout'
import { cn } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'

const MOCK_LISTING_RESULTS = [
    { id: 'l1', title: 'Handmade Silver Ring', price: 45.00, views: 120, favorites: 450, revenue: 1200, image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=400&q=80' },
    { id: 'l2', title: 'Vintage Gold Necklace', price: 120.00, views: 85, favorites: 320, revenue: 2400, image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&w=400&q=80' },
    { id: 'l3', title: 'Boho Gemstone Earrings', price: 35.00, views: 200, favorites: 600, revenue: 1500, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80' },
]



interface SavedListing {
    id: string
    listing_title: string
    listing_url: string
    price: number
    image_url: string
    total_sales: number
    created_at: string
}

interface ListingAnalysisCardProps {
    item: any;
    onClick: (item: any) => void;
    onTrack: (e: React.MouseEvent, item: any) => void;
    isSaved: boolean;
}

function ListingAnalysisCard({ item, onClick, onTrack, isSaved }: ListingAnalysisCardProps) {
    const [imageError, setImageError] = useState(false);
    const title = item.listing_title || item.title;
    const price = item.price;
    const image = item.image_url || item.image;

    // Treat placehold.co images as "fallback candidates" if user dislikes them
    const isPlaceholder = image?.includes('placehold.co');

    return (
        <Card
            className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group relative"
            onClick={() => onClick(item)}
        >
            <CardContent className="p-0">
                <div className="h-48 bg-slate-200 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                        {image && !imageError && !isPlaceholder ? (
                            <img
                                src={image}
                                alt={title}
                                className="h-full w-full object-cover"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="w-full h-48 bg-slate-100 flex flex-col items-center justify-center gap-2">
                                {imageError || isPlaceholder ? (
                                    <>
                                        <ImageOff className="w-8 h-8 text-slate-400" />
                                        <span className="text-xs text-slate-500 font-medium">Preview unavailable</span>
                                    </>
                                ) : (
                                    <ShoppingBag className="h-12 w-12 opacity-20" />
                                )}
                            </div>
                        )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <p className="text-white font-bold truncate">{title}</p>
                        <p className="text-teal-200 font-medium">${price?.toFixed(2)}</p>
                    </div>

                    {/* Heart Button */}
                    <button
                        onClick={(e) => onTrack(e, item)}
                        className={cn(
                            "absolute top-3 right-3 p-2 rounded-full shadow-sm transition-all duration-200 z-10",
                            isSaved
                                ? "bg-white text-rose-500 hover:bg-rose-50"
                                : "bg-white/80 text-slate-400 hover:bg-white hover:text-rose-500"
                        )}
                    >
                        <Heart className={cn("h-5 w-5", isSaved && "fill-rose-500")} />
                    </button>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-xs text-slate-400 uppercase font-bold">Views</p>
                        <p className="font-semibold text-slate-700">{item.views || '-'}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-slate-400 uppercase font-bold">Revenue</p>
                        <p className="font-semibold text-teal-600">{typeof item.revenue === 'number' ? `$${item.revenue}` : (item.revenue || '-')}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function EmptyState({ onSearch }: { onSearch: (term: string) => void }) {
    const examples = [
        { icon: '🌱', text: 'Handmade Soap' },
        { icon: '💍', text: 'Silver Ring' },
        { icon: '📅', text: 'Digital Planner' }
    ];

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-teal-50/50 p-6 rounded-full mb-6 ring-1 ring-teal-100 shadow-lg shadow-teal-900/5">
                <Search className="h-12 w-12 text-teal-500/80" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">Start Your Investigation</h2>
            <p className="text-slate-500 text-center max-w-md mb-8">
                Paste an Etsy listing URL above to unlock hidden data, or try one of these examples:
            </p>
            <div className="flex flex-wrap justify-center gap-3">
                {examples.map((example) => (
                    <button
                        key={example.text}
                        onClick={() => onSearch(example.text)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/60 hover:bg-white border border-teal-100 hover:border-teal-300 rounded-full shadow-sm hover:shadow-md transition-all duration-200 text-slate-700 hover:text-teal-700 group"
                    >
                        <span className="grayscale group-hover:grayscale-0 transition-all">{example.icon}</span>
                        <span className="font-medium">{example.text}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function ListingAnalysisPage(): React.JSX.Element {
    const [listingSearchQuery, setListingSearchQuery] = useState('')
    const [listingSearchResults, setListingSearchResults] = useState<any[]>([])
    const [hasListingSearched, setHasListingSearched] = useState(false)
    const [savedListings, setSavedListings] = useState<SavedListing[]>([])
    const [recentListings, setRecentListings] = useState<SavedListing[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [apiError, setApiError] = useState<string | null>(null)
    const [imageError, setImageError] = useState(false)
    const supabase = createClient()


    const searchParams = useSearchParams()
    const router = useRouter()
    const returnTo = searchParams.get('returnTo')

    useEffect(() => {
        fetchSavedListings()

        const query = searchParams.get('query')
        if (query) {
            setListingSearchQuery(query)
            executeSearch(query)
        }
    }, [])

    const fetchSavedListings = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('saved_listings')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error

            if (data) {
                setSavedListings(data)
                setRecentListings(data.slice(0, 5))
            }
        } catch (error) {
            console.error('Error fetching saved listings:', error)
        }
    }

    const executeSearch = async (query: string) => {
        if (!query.trim()) return

        setIsLoading(true)
        setApiError(null)
        setHasListingSearched(true)
        setImageError(false)
        setListingSearchResults([])

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query }),
            })

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`)
            }

            const result = await response.json()

            if (result.type === 'listing') {
                // Map API Listing Data
                const data = result.data
                const price = data.price ? (data.price.amount / data.price.divisor) : 0
                const image = data.images && data.images.length > 0 ? data.images[0].url_fullxfull : null

                // Redirect to Report Page
                router.push(`/dashboard/listing-analysis/report?query=${encodeURIComponent(data.title)}&returnTo=/dashboard/listing-analysis`)
                return
            } else if (result.type === 'search') {
                // Map API Search Results
                const mappedResults = result.data.results.map((item: any) => {
                    const price = item.price ? (item.price.amount / item.price.divisor) : 0
                    const image = item.images && item.images.length > 0 ? item.images[0].url_570xN : null
                    return {
                        id: item.listing_id,
                        title: item.title,
                        price: price,
                        views: item.views || 0,
                        favorites: item.num_favorers || 0,
                        revenue: 'N/A',
                        image: image
                    }
                })
                setListingSearchResults(mappedResults)
            }

        } catch (error) {
            console.error('Analysis failed:', error)
            setApiError('API Key Pending - Showing Demo Data')

            // Fallback to Mock Data
            if (query.includes('etsy.com') || query.startsWith('http')) {
                router.push(`/dashboard/listing-analysis/report?query=${encodeURIComponent(query)}&returnTo=/dashboard/listing-analysis`)
            } else {
                setListingSearchResults(MOCK_LISTING_RESULTS)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleListingSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        executeSearch(listingSearchQuery)
    }

    const handleChipSearch = (term: string) => {
        setListingSearchQuery(term)
        executeSearch(term)
    }

    const handleTrackItem = async (e: React.MouseEvent, item: any) => {
        e.stopPropagation() // Prevent card click

        // Determine if item is a SavedListing or a Mock Result
        const title = item.listing_title || item.title
        const price = item.price
        const image = item.image_url || item.image

        const isSaved = savedListings.some(l => l.listing_title === title)

        if (isSaved) {
            // Un-track (Remove)
            const savedListing = savedListings.find(l => l.listing_title === title)
            if (!savedListing) return

            setSavedListings(prev => prev.filter(l => l.id !== savedListing.id))
            setRecentListings(prev => prev.filter(l => l.id !== savedListing.id))

            try {
                const { error } = await supabase
                    .from('saved_listings')
                    .delete()
                    .eq('id', savedListing.id)

                if (error) throw error
            } catch (error) {
                console.error('Error removing listing:', error)
                alert('Failed to remove listing.')
                setSavedListings(prev => [...prev, savedListing]) // Revert
                setRecentListings(prev => [savedListing, ...prev].slice(0, 5)) // Revert
            }
        } else {
            // Track (Add)
            const newListing: SavedListing = {
                id: 'temp-' + Date.now(),
                listing_title: title,
                listing_url: listingSearchQuery.includes('http') ? listingSearchQuery : '',
                price: price,
                image_url: image,
                total_sales: 0, // Mock data doesn't have total sales, defaulting to 0
                created_at: new Date().toISOString()
            }
            setSavedListings(prev => [newListing, ...prev])
            setRecentListings(prev => [newListing, ...prev].slice(0, 5))

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            try {
                const { data, error } = await supabase
                    .from('saved_listings')
                    .insert({
                        user_id: user.id,
                        listing_title: title,
                        listing_url: listingSearchQuery.includes('http') ? listingSearchQuery : '',
                        price: price,
                        image_url: image,
                        total_sales: 0
                    })
                    .select()
                    .single()

                if (error) throw error

                if (data) {
                    setSavedListings(prev => prev.map(l => l.id === newListing.id ? data : l))
                    setRecentListings(prev => prev.map(l => l.id === newListing.id ? data : l))
                }
            } catch (error) {
                console.error('Error saving listing:', error)
                alert('Failed to save listing.')
                setSavedListings(prev => prev.filter(l => l.id !== newListing.id))
                setRecentListings(prev => prev.filter(l => l.id !== newListing.id))
            }
        }
    }



    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div>
                    {returnTo && (
                        <Button
                            variant="ghost"
                            className="mb-6 rounded-full bg-white border border-slate-200 text-slate-700 shadow-sm hover:border-teal-500 hover:text-teal-600 gap-2 px-4"
                            onClick={() => router.push(returnTo)}
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to Shop Analysis
                        </Button>
                    )}
                    <div className="relative pl-4">
                        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full" />
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Listing Analysis</h1>
                        <p className="text-muted-foreground">Analyze specific listings or find top performers.</p>
                    </div>
                </div>

                {/* Search Section */}
                <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                    <CardContent className="p-8">
                        <form onSubmit={handleListingSearch} className="relative flex items-center">
                            <Search className="absolute left-4 h-6 w-6 text-teal-600" />
                            <input
                                type="text"
                                placeholder="Paste Etsy URL or Search Keywords..."
                                className="h-14 w-full rounded-xl border-2 border-teal-100 bg-white/50 pl-14 pr-4 text-lg text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition-all"
                                value={listingSearchQuery}
                                onChange={(e) => {
                                    setListingSearchQuery(e.target.value)
                                    if (e.target.value === '') {
                                        setHasListingSearched(false)
                                    }
                                }}
                            />
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="absolute right-2 h-10 bg-teal-600 hover:bg-teal-700 text-white px-6 rounded-lg disabled:opacity-50"
                            >
                                {isLoading ? 'Analyzing...' : 'Analyze'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* API Error Toast / Banner */}
                {apiError && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3 text-amber-800">
                        <AlertCircle className="h-5 w-5" />
                        <p className="font-medium">{apiError}</p>
                    </div>
                )}

                {/* Results Area */}
                {hasListingSearched ? (
                    <div className="space-y-6">
                        {/* Top Results Cards */}
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">Top Results for "{listingSearchQuery}"</h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                {listingSearchResults.map((item) => {
                                    const isSaved = savedListings.some(l => l.listing_title === item.title)
                                    return (
                                        <ListingAnalysisCard
                                            key={item.id}
                                            item={item}
                                            onClick={() => {
                                                router.push(`/dashboard/listing-analysis/report?query=${encodeURIComponent(item.title)}&returnTo=/dashboard/listing-analysis`)
                                            }}
                                            onTrack={handleTrackItem}
                                            isSaved={isSaved}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Recently Tracked Listings OR Empty State
                    recentListings.length > 0 ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">Recently Tracked Listings</h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                {recentListings.map((item) => {
                                    const isSaved = true // It's in recentListings, so it's saved
                                    return (
                                        <ListingAnalysisCard
                                            key={item.id}
                                            item={item}
                                            onClick={() => {
                                                router.push(`/dashboard/listing-analysis/report?query=${encodeURIComponent(item.listing_title)}&returnTo=/dashboard/listing-analysis`)
                                            }}
                                            onTrack={handleTrackItem}
                                            isSaved={isSaved}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    ) : (
                        <EmptyState onSearch={handleChipSearch} />
                    )
                )}
            </div>
        </DashboardLayout>
    )
}
