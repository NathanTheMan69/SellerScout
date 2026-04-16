'use client'

import { useEffect, useState } from "react"
import { Sparkles, AlertTriangle, TrendingUp, Lightbulb, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { cn } from "@/lib/utils"

interface Insight {
    type: 'warning' | 'opportunity' | 'tip'
    title: string
    message: string
}

const typeConfig = {
    warning: {
        icon: AlertTriangle,
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        iconColor: 'text-orange-500',
        titleColor: 'text-orange-700',
    },
    opportunity: {
        icon: TrendingUp,
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        iconColor: 'text-emerald-500',
        titleColor: 'text-emerald-700',
    },
    tip: {
        icon: Lightbulb,
        bg: 'bg-teal-50',
        border: 'border-teal-200',
        iconColor: 'text-teal-500',
        titleColor: 'text-teal-700',
    },
}

function SkeletonInsight() {
    return (
        <div className="rounded-lg p-3.5 border border-slate-100 bg-slate-50 animate-pulse">
            <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-4 rounded bg-slate-200" />
                <div className="h-3.5 w-28 rounded bg-slate-200" />
            </div>
            <div className="space-y-1.5">
                <div className="h-3 w-full rounded bg-slate-200" />
                <div className="h-3 w-4/5 rounded bg-slate-200" />
            </div>
        </div>
    )
}

export function ScoutInsights() {
    const [insights, setInsights] = useState<Insight[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const fetchInsights = async () => {
        setLoading(true)
        setError(false)
        try {
            const res = await fetch('/api/insights')
            if (!res.ok) throw new Error('Failed')
            const data = await res.json()
            setInsights(data.insights || [])
        } catch {
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInsights()
    }, [])

    return (
        <Card className="border-teal-200 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/10 h-full relative overflow-hidden">
            <CardHeader className="bg-teal-600 px-5 py-3.5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-white/80" />
                        <CardTitle className="text-base font-semibold text-white tracking-wide">Scout AI Insights</CardTitle>
                    </div>
                    {!loading && (
                        <button
                            onClick={fetchInsights}
                            className="text-white/70 hover:text-white transition-colors"
                            title="Refresh insights"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-4">
                <div className="space-y-3">
                    {loading ? (
                        <>
                            <SkeletonInsight />
                            <SkeletonInsight />
                            <SkeletonInsight />
                        </>
                    ) : error ? (
                        <div className="text-center py-6 space-y-3">
                            <p className="text-sm text-slate-500">Could not load insights right now.</p>
                            <Button
                                onClick={fetchInsights}
                                className="bg-teal-600 hover:bg-teal-700 text-white text-sm px-4 py-1.5"
                            >
                                Try Again
                            </Button>
                        </div>
                    ) : (
                        insights.map((insight, i) => {
                            const config = typeConfig[insight.type] ?? typeConfig.tip
                            const Icon = config.icon
                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "rounded-lg p-3.5 border",
                                        config.bg,
                                        config.border
                                    )}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Icon className={cn("h-4 w-4 flex-shrink-0", config.iconColor)} />
                                        <span className={cn("text-sm font-semibold", config.titleColor)}>
                                            {insight.title}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {insight.message}
                                    </p>
                                </div>
                            )
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
