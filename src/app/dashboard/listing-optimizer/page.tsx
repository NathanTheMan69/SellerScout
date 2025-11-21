"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/Card"
import { Button } from "@/components/Button"
import { cn } from "@/lib/utils"
import { DashboardLayout } from "@/components/DashboardLayout"

export default function ListingOptimizerPage() {
    const [title, setTitle] = useState("")
    const [tags, setTags] = useState("")
    const [description, setDescription] = useState("")

    const [score, setScore] = useState(0)
    const [hasAnalyzed, setHasAnalyzed] = useState(false)

    const handleAnalyze = () => {
        // Mock Grading Logic
        let calculatedScore = 0

        // Title length logic
        if (title.length > 0) {
            if (title.length < 50) calculatedScore += 30
            else if (title.length < 100) calculatedScore += 60
            else calculatedScore += 90
        }

        // Simple boosts for other fields
        if (tags.length > 10) calculatedScore += 5
        if (description.length > 50) calculatedScore += 5

        // Cap at 100
        setScore(Math.min(calculatedScore, 100))
        setHasAnalyzed(true)
    }

    const getGradeColor = (s: number) => {
        if (s >= 80) return "text-green-600 border-green-200 bg-green-50"
        if (s >= 50) return "text-yellow-600 border-yellow-200 bg-yellow-50"
        return "text-red-600 border-red-200 bg-red-50"
    }

    const getGradeLabel = (s: number) => {
        if (s >= 80) return "Excellent"
        if (s >= 50) return "Good"
        return "Needs Improvement"
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="relative">
                    <div className="absolute -left-4 top-0 h-full w-1 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full" />
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Listing Optimizer</h1>
                    <p className="text-muted-foreground">Optimize your listings to rank higher and sell more.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Side: The Editor */}
                    <div className="space-y-6">
                        <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                            <CardHeader>
                                <CardTitle className="text-slate-800">Listing Details</CardTitle>
                                <CardDescription>Enter your listing information below.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="title" className="text-sm font-medium leading-none text-slate-700">
                                        Listing Title
                                    </label>
                                    <input
                                        id="title"
                                        className="flex h-10 w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                                        placeholder="e.g. Handmade Leather Wallet..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                    <p className="text-xs text-slate-400 text-right">{title.length} chars</p>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="tags" className="text-sm font-medium leading-none text-slate-700">
                                        Tags (comma separated)
                                    </label>
                                    <input
                                        id="tags"
                                        className="flex h-10 w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                                        placeholder="leather, wallet, handmade, gift..."
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="description" className="text-sm font-medium leading-none text-slate-700">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        className="flex min-h-[150px] w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-2 text-sm ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                                        placeholder="Describe your item in detail..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>

                                <Button
                                    className="w-full h-12 text-lg shadow-lg shadow-teal-900/20 bg-teal-600 hover:bg-teal-700 text-white rounded-xl"
                                    onClick={handleAnalyze}
                                >
                                    Analyze & Optimize
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Side: The Report */}
                    <div className="space-y-6">
                        {hasAnalyzed ? (
                            <>
                                {/* Grade Card */}
                                <Card className="overflow-hidden border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-slate-800">Optimization Score</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex flex-col items-center justify-center py-8">
                                        <div className={cn(
                                            "relative flex items-center justify-center w-32 h-32 rounded-full border-4 text-4xl font-bold transition-all duration-500 shadow-inner",
                                            getGradeColor(score)
                                        )}>
                                            {score}
                                        </div>
                                        <p className="mt-4 text-xl font-medium text-slate-700">
                                            {getGradeLabel(score)}
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Checklist */}
                                <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                                    <CardHeader>
                                        <CardTitle className="text-slate-800">Optimization Checklist</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold", title.length >= 100 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                                                {title.length >= 100 ? "✓" : "✕"}
                                            </div>
                                            <span className="text-slate-600">Title uses 100+ characters</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={cn("flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold", tags.length > 10 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700")}>
                                                {tags.length > 10 ? "✓" : "!"}
                                            </div>
                                            <span className="text-slate-600">Tags are descriptive</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={cn("flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold", description.length > 50 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                                                {description.length > 50 ? "✓" : "✕"}
                                            </div>
                                            <span className="text-slate-600">Description is detailed</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* AI Suggestions */}
                                <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-100 shadow-lg shadow-teal-900/5">
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">✨</span>
                                            <CardTitle className="text-teal-900">AI Recommendation</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-teal-800">Recommended Title:</p>
                                            <div className="p-3 bg-white/80 rounded-xl border border-teal-200 text-slate-700 shadow-sm">
                                                {title.length > 0 ? `Premium ${title} - Handcrafted & Unique Gift Idea` : "Enter a title to get recommendations..."}
                                            </div>
                                            <p className="text-xs text-teal-600 mt-2">
                                                This title includes high-volume keywords and is optimized for click-through rate.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <div className="h-full flex items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white/30 backdrop-blur-sm">
                                <div className="text-center space-y-2">
                                    <div className="text-4xl mb-4">🔍</div>
                                    <h3 className="text-lg font-medium text-slate-900">Ready to Analyze</h3>
                                    <p className="text-slate-500 max-w-xs mx-auto">
                                        Fill out the listing details on the left and click "Analyze" to see your optimization score.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
