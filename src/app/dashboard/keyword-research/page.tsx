'use client'

import { useState, useEffect } from 'react'
import { Search, Heart, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/Card'
import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'
import { DashboardLayout } from '@/components/DashboardLayout'
import { createClient } from '@/utils/supabase/client'

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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery.trim()) {
            setResults(MOCK_DATA)
            return
        }

        const filtered = MOCK_DATA.filter(item =>
            item.keyword.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setResults(filtered)
    }

    const handleSave = async (item: typeof MOCK_DATA[0]) => {
        const isSaved = savedKeywords.has(item.keyword)

        // Optimistic update
        setSavedKeywords(prev => {
            const next = new Set(prev)
            if (isSaved) {
                next.delete(item.keyword)
            } else {
                next.add(item.keyword)
            }
            return next
        })

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            // Revert if no user (shouldn't happen in protected route but good safety)
            setSavedKeywords(prev => {
                const next = new Set(prev)
                if (isSaved) next.add(item.keyword)
                else next.delete(item.keyword)
                return next
            })
            return
        }

        try {
            if (isSaved) {
                // Remove from DB
                const { error } = await supabase
                    .from('saved_keywords')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('keyword', item.keyword)

                if (error) throw error
            } else {
                // Add to DB
                const { error } = await supabase
                    .from('saved_keywords')
                    .insert({
                        user_id: user.id,
                        keyword: item.keyword,
                        search_volume: item.volume,
                        competition: item.competition
                    })

                if (error) throw error
            }
        } catch (error) {
            console.error('Error saving keyword:', error)
            alert('Failed to save keyword. Please try again.')

            // Revert state on error
            setSavedKeywords(prev => {
                const next = new Set(prev)
                if (isSaved) {
                    next.add(item.keyword)
                } else {
                    next.delete(item.keyword)
                }
                return next
            })
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="relative">
                    <div className="absolute -left-4 top-0 h-full w-1 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full" />
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
                                className="absolute right-2 h-10 bg-teal-600 hover:bg-teal-700 text-white px-6 rounded-lg"
                            >
                                Search
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Results Table */}
                <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5 overflow-hidden">
                    <CardHeader>
                        <CardTitle>Search Results</CardTitle>
                        <CardDescription>Found {results.length} keywords matching your search.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-teal-50/50 text-slate-600">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Keyword</th>
                                        <th className="px-6 py-4 font-semibold">Search Volume</th>
                                        <th className="px-6 py-4 font-semibold">Competition</th>
                                        <th className="px-6 py-4 font-semibold">CTR</th>
                                        <th className="px-6 py-4 font-semibold">Trend</th>
                                        <th className="px-6 py-4 font-semibold text-right">Save</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {results.length > 0 ? (
                                        results.map((item) => (
                                            <tr key={item.id} className="hover:bg-teal-50/30 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-800">{item.keyword}</td>
                                                <td className="px-6 py-4 text-slate-600">{item.volume.toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={cn(
                                                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                        item.competition === 'Low' && "bg-emerald-100 text-emerald-800",
                                                        item.competition === 'Medium' && "bg-yellow-100 text-yellow-800",
                                                        (item.competition === 'High' || item.competition === 'Very High') && "bg-rose-100 text-rose-800"
                                                    )}>
                                                        {item.competition}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">{item.ctr}</td>
                                                <td className="px-6 py-4">
                                                    {item.trend === 'up' && <TrendingUp className="h-4 w-4 text-emerald-500" />}
                                                    {item.trend === 'down' && <TrendingDown className="h-4 w-4 text-rose-500" />}
                                                    {item.trend === 'stable' && <Minus className="h-4 w-4 text-slate-400" />}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleSave(item)}
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
