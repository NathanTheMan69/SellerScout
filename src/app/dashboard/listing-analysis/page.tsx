"use client";

import React, { useState, useEffect } from 'react'
import { Search, ShoppingBag, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'
import { DashboardLayout } from '@/components/DashboardLayout'
import { cn } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'

const MOCK_LISTING_RESULTS = [
    { id: 'l1', title: 'Handmade Silver Ring', price: 45.00, views: 120, favorites: 450, revenue: 1200, image: 'https://placehold.co/400x400/e2e8f0/1e293b?text=Ring' },
    { id: 'l2', title: 'Vintage Gold Necklace', price: 120.00, views: 85, favorites: 320, revenue: 2400, image: 'https://placehold.co/400x400/e2e8f0/1e293b?text=Necklace' },
    { id: 'l3', title: 'Boho Gemstone Earrings', price: 35.00, views: 200, favorites: 600, revenue: 1500, image: 'https://placehold.co/400x400/e2e8f0/1e293b?text=Earrings' },
]

const MOCK_DETAILED_STATS = {
    id: 'l_detail',
    title: 'Custom Engraved Leather Wallet',
    price: 55.00,
    views: 350,
    favorites: 1200,
    revenue: 4500,
    image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Wallet',
    tags: ['Leather', 'Gift for Him', 'Custom', 'Wallet']
}

interface SavedListing {
    id: string
    listing_title: string
    listing_url: string
    price: number
    image_url: string
    total_sales: number
    created_at: string
}

export default function ListingAnalysisPage(): React.JSX.Element {
    const [listingSearchQuery, setListingSearchQuery] = useState('')
    const [listingSearchResults, setListingSearchResults] = useState<any[]>([])
    const [selectedListing, setSelectedListing] = useState<any | null>(null)
    const [hasListingSearched, setHasListingSearched] = useState(false)
    const [savedListings, setSavedListings] = useState<SavedListing[]>([])
    const [recentListings, setRecentListings] = useState<SavedListing[]>([])
    const supabase = createClient()

    useEffect(() => {
        fetchSavedListings()
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

    const handleListingSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setHasListingSearched(true)
        setSelectedListing(null)
        setListingSearchResults([])

        if (!listingSearchQuery.trim()) return

        // Smart Logic: Check if URL
        if (listingSearchQuery.includes('etsy.com') || listingSearchQuery.startsWith('http')) {
            setSelectedListing(MOCK_DETAILED_STATS)
        } else {
            // Assume Keyword
            setListingSearchResults(MOCK_LISTING_RESULTS)
        }
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

    const isSelectedSaved = selectedListing ? savedListings.some(l => l.listing_title === selectedListing.title) : false

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="relative">
                    <div className="absolute -left-4 top-0 h-full w-1 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full" />
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Listing Analysis</h1>
                    <p className="text-muted-foreground">Analyze specific listings or find top performers.</p>
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
                                className="absolute right-2 h-10 bg-teal-600 hover:bg-teal-700 text-white px-6 rounded-lg"
                            >
                                Analyze
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Results Area */}
                {hasListingSearched ? (
                    <div className="space-y-6">
                        {selectedListing ? (
                            // Detailed Stats Card
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-slate-800">Detailed Analysis</h2>
                                    <Button
                                        onClick={(e) => handleTrackItem(e, selectedListing)}
                                        className={cn(
                                            "flex items-center gap-2 transition-all duration-200",
                                            isSelectedSaved
                                                ? "bg-rose-50 text-rose-500 hover:bg-rose-100 border border-rose-200"
                                                : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
                                        )}
                                    >
                                        <Heart className={cn("h-4 w-4", isSelectedSaved && "fill-rose-500")} />
                                        {isSelectedSaved ? 'Tracked' : 'Track Listing'}
                                    </Button>
                                </div>
                                <Card className="border-white/50 bg-white/80 backdrop-blur-md shadow-xl shadow-teal-900/10 overflow-hidden">
                                    <div className="grid md:grid-cols-3 gap-0">
                                        {/* Image Section */}
                                        <div className="bg-slate-100 relative h-64 md:h-auto">
                                            <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-200">
                                                {/* Placeholder for Image */}
                                                <ShoppingBag className="h-16 w-16 opacity-20" />
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="col-span-2 p-8 space-y-6">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">Active Listing</span>
                                                    <span className="text-slate-400 text-sm">ID: {selectedListing.id}</span>
                                                </div>
                                                <h3 className="text-2xl font-bold text-slate-800">{selectedListing.title}</h3>
                                                <p className="text-3xl font-light text-teal-600 mt-2">${selectedListing.price.toFixed(2)}</p>
                                            </div>

                                            <div className="grid grid-cols-3 gap-6">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Views</p>
                                                    <p className="text-xl font-bold text-slate-800">{selectedListing.views}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Favorites</p>
                                                    <p className="text-xl font-bold text-slate-800">{selectedListing.favorites}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Est. Revenue/Mo</p>
                                                    <p className="text-xl font-bold text-teal-600">${selectedListing.revenue}</p>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-slate-100">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tags</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedListing.tags?.map((tag: string) => (
                                                        <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                                                            {tag}
                                                        </span>
                                                    )) || <span className="text-slate-400 text-sm">No tags available</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ) : (
                            // Top Results Cards
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-xl font-semibold text-slate-800 mb-4">Top Results for "{listingSearchQuery}"</h2>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                    {listingSearchResults.map((item) => {
                                        const isSaved = savedListings.some(l => l.listing_title === item.title)
                                        return (
                                            <Card
                                                key={item.id}
                                                className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group relative"
                                                onClick={() => setSelectedListing({ ...MOCK_DETAILED_STATS, title: item.title, price: item.price })}
                                            >
                                                <CardContent className="p-0">
                                                    <div className="h-48 bg-slate-200 relative overflow-hidden">
                                                        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                                            <ShoppingBag className="h-12 w-12 opacity-20" />
                                                        </div>
                                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                                            <p className="text-white font-bold truncate">{item.title}</p>
                                                            <p className="text-teal-200 font-medium">${item.price.toFixed(2)}</p>
                                                        </div>

                                                        {/* Heart Button */}
                                                        <button
                                                            onClick={(e) => handleTrackItem(e, item)}
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
                                                            <p className="font-semibold text-slate-700">{item.views}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-xs text-slate-400 uppercase font-bold">Revenue</p>
                                                            <p className="font-semibold text-teal-600">${item.revenue}</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Recently Tracked Listings
                    recentListings.length > 0 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">Recently Tracked Listings</h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                {recentListings.map((item) => {
                                    const isSaved = true // It's in recentListings, so it's saved
                                    return (
                                        <Card
                                            key={item.id}
                                            className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group relative"
                                            onClick={() => setSelectedListing({ ...MOCK_DETAILED_STATS, title: item.listing_title, price: item.price })}
                                        >
                                            <CardContent className="p-0">
                                                <div className="h-48 bg-slate-200 relative overflow-hidden">
                                                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                                        {item.image_url ? (
                                                            <img src={item.image_url} alt={item.listing_title} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <ShoppingBag className="h-12 w-12 opacity-20" />
                                                        )}
                                                    </div>
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                                        <p className="text-white font-bold truncate">{item.listing_title}</p>
                                                        <p className="text-teal-200 font-medium">${item.price?.toFixed(2)}</p>
                                                    </div>

                                                    {/* Heart Button */}
                                                    <button
                                                        onClick={(e) => handleTrackItem(e, item)}
                                                        className={cn(
                                                            "absolute top-3 right-3 p-2 rounded-full shadow-sm transition-all duration-200 z-10",
                                                            "bg-white text-rose-500 hover:bg-rose-50"
                                                        )}
                                                    >
                                                        <Heart className={cn("h-5 w-5 fill-rose-500")} />
                                                    </button>
                                                </div>
                                                <div className="p-6 grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <p className="text-xs text-slate-400 uppercase font-bold">Views</p>
                                                        <p className="font-semibold text-slate-700">-</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-xs text-slate-400 uppercase font-bold">Revenue</p>
                                                        <p className="font-semibold text-teal-600">-</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        </div>
                    )
                )}
            </div>
        </DashboardLayout>
    )
}
