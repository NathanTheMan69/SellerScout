'use client'

import { useState, useEffect } from 'react'
import { Search, Heart, TrendingUp, TrendingDown, Minus, DollarSign, Tag, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/Card'
import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'
import { DashboardLayout } from '@/components/DashboardLayout'
import { createClient } from '@/utils/supabase/client'
import { AnalysisResult } from '@/lib/analyzer'

// Mock Data
const MOCK_DATA = [
    { id: 1, keyword: 'Silver Ring', volume: 12500, competition: 'High', ctr: '2.4%', trend: 'up' },
    { id: 2, keyword: 'Leather Wallet', volume: 8200, competition: 'Medium', ctr: '3.1%', trend: 'stable' },
    { id: 3, keyword: 'Personalized Mug', volume: 22000, competition: 'Very High', ctr: '1.8%', trend: 'up' },
    { id: 4, keyword: 'Digital Planner', volume: 15600, competition: 'High', ctr: '4.2%', trend: 'up' },
    { id: 5, keyword: 'Handmade Soap', volume: 5400, competition: 'Low', ctr: '3.8%', trend: 'down' },
]

export default function KeywordResearchPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [results, setResults] = useState(MOCK_DATA)
    const [hasSearched, setHasSearched] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [apiData, setApiData] = useState<AnalysisResult | null>(null)
    const [showDemoData, setShowDemoData] = useState(false)
    const [apiError, setApiError] = useState<string | null>(null)
    const [savedKeywords, setSavedKeywords] = useState<Set<string>>(new Set())
    const supabase = createClient()

    useEffect(() => {
        const fetchSavedKeywords = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('saved_keywords')
                .select('keyword')
                .eq('user_id', user.id)

            if (error) {
                console.error('Error fetching saved keywords:', error)
                return
            }

            if (data) {
                setSavedKeywords(new Set(data.map(k => k.keyword)))
            }
        }

        fetchSavedKeywords()
    }, [])

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery.trim()) {
            setResults(MOCK_DATA)
            setHasSearched(false)
            setApiData(null)
            setShowDemoData(false)
            setApiError(null)
            return
        }

        setIsLoading(true)
        setApiError(null)
        setHasSearched(true)
        setShowDemoData(false)
        setApiData(null)

        try {
            const response = await fetch('/api/research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword: searchQuery }),
            })

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`)
            }

            const data: AnalysisResult = await response.json()
            setApiData(data)
        } catch (error) {
            console.error('Search failed:', error)
            setApiError('API Key Pending - Showing Demo Data')
            setShowDemoData(true)
            // Filter mock data as fallback
            const filtered = MOCK_DATA.filter(item =>
                item.keyword.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setResults(filtered.length > 0 ? filtered : MOCK_DATA)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async (keyword: string, volume?: number, competition?: string) => {
        const isSaved = savedKeywords.has(keyword)

        // Optimistic update
        setSavedKeywords(prev => {
            const next = new Set(prev)
            if (isSaved) {
                next.delete(keyword)
            } else {
                next.add(keyword)
            }
            return next
        })

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        try {
            if (isSaved) {
                // Remove from DB
                const { error } = await supabase
                    .from('saved_keywords')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('keyword', keyword)

                if (error) throw error
            } else {
                // Add to DB
                const { error } = await supabase
                    .from('saved_keywords')
                    .insert({
                        user_id: user.id,
                        keyword: keyword,
                        search_volume: volume || 0,
                        competition: competition || 'Unknown'
                    })

                if (error) throw error
            }
        } catch (error) {
            console.error('Error saving keyword:', error)
            alert('Failed to save keyword. Please try again.')
            // Revert
            setSavedKeywords(prev => {
                const next = new Set(prev)
                if (isSaved) next.add(keyword)
                else next.delete(keyword)
                return next
            })
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="relative pl-4">
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full" />
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Keyword Research</h1>
                    <p className="text-muted-foreground">Analyze search volume and competition to find your next bestseller.</p>
                </div>

                {/* Search Section */}
                <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                    <CardContent className="p-8">
                        <form onSubmit={handleSearch} className="relative flex items-center">
                            <Search className="absolute left-4 h-6 w-6 text-teal-600" />
                            <input
                                type="text"
                                placeholder="Enter a keyword (e.g., 'Silver Ring')..."
                                className="h-14 w-full rounded-xl border-2 border-teal-100 bg-white/50 pl-14 pr-4 text-lg text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="absolute right-2 h-10 bg-teal-600 hover:bg-teal-700 text-white px-6 rounded-lg disabled:opacity-50"
                            >
                                {isLoading ? 'Searching...' : 'Search'}
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

                {/* Summary Cards (Only if API Data exists) */}
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

                {/* Results Table */}
                <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5 overflow-hidden">
                    <CardHeader>
                        <CardTitle>{hasSearched ? 'Search Results' : 'Top Searched Keywords'}</CardTitle>
                        <CardDescription>
                            {hasSearched
                                ? (apiData ? `Found ${apiData.topTags.length} related tags.` : `Found ${results.length} keywords matching your search.`)
                                : 'Trending keywords on Etsy right now.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-teal-50/50 text-slate-600">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Keyword / Tag</th>
                                        {apiData ? (
                                            <>
                                                <th className="px-6 py-4 font-semibold">Frequency</th>
                                                <th className="px-6 py-4 font-semibold">Avg Price</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="px-6 py-4 font-semibold">Search Volume</th>
                                                <th className="px-6 py-4 font-semibold">Competition</th>
                                                <th className="px-6 py-4 font-semibold">CTR</th>
                                                <th className="px-6 py-4 font-semibold">Trend</th>
                                            </>
                                        )}
                                        <th className="px-6 py-4 font-semibold text-right">Save</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {apiData ? (
                                        apiData.topTags.map((tag, index) => (
                                            <tr key={index} className="hover:bg-teal-50/30 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-800">{tag.tag}</td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    Used in {tag.count}/{apiData.stats.listingCount} listings
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    ${tag.averagePrice.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleSave(tag.tag)}
                                                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                                    >
                                                        <Heart
                                                            className={cn(
                                                                "h-5 w-5 transition-colors",
                                                                savedKeywords.has(tag.tag) ? "fill-rose-500 text-rose-500" : "text-slate-400"
                                                            )}
                                                        />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        results.length > 0 ? (
                                            results.map((item) => (
                                                <tr key={item.id} className="hover:bg-teal-50/30 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-slate-800">{item.keyword}</td>
                                                    <td className="px-6 py-4 text-slate-600">{item.volume.toLocaleString()}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className={cn(
                                                                "text-xs font-medium w-16",
                                                                item.competition === 'Low' && "text-emerald-700",
                                                                item.competition === 'Medium' && "text-yellow-700",
                                                                (item.competition === 'High' || item.competition === 'Very High') && "text-rose-700"
                                                            )}>
                                                                {item.competition}
                                                            </span>
                                                            <div className="h-1.5 w-24 bg-slate-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className={cn(
                                                                        "h-full rounded-full",
                                                                        item.competition === 'Low' && "bg-emerald-500 w-1/3",
                                                                        item.competition === 'Medium' && "bg-yellow-500 w-2/3",
                                                                        (item.competition === 'High' || item.competition === 'Very High') && "bg-rose-500 w-full"
                                                                    )}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">{item.ctr}</td>
                                                    <td className="px-6 py-4">
                                                        {item.trend === 'up' && <TrendingUp className="h-4 w-4 text-emerald-500" />}
                                                        {item.trend === 'down' && <TrendingDown className="h-4 w-4 text-rose-500" />}
                                                        {item.trend === 'stable' && <Minus className="h-4 w-4 text-slate-400" />}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleSave(item.keyword, item.volume, item.competition)}
                                                            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                                        >
                                                            <Heart
                                                                className={cn(
                                                                    "h-5 w-5 transition-colors",
                                                                    savedKeywords.has(item.keyword) ? "fill-rose-500 text-rose-500" : "text-slate-400"
                                                                )}
                                                            />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                                    No keywords found. Try a different search term.
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
