'use client'

import { Sparkles, AlertTriangle, TrendingUp, Lightbulb } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { cn } from "@/lib/utils"

interface Insight {
    type: 'warning' | 'opportunity' | 'tip'
    title: string
    message: string
}

const DEFAULT_INSIGHTS: Insight[] = [
    {
        type: 'warning',
        title: 'Low Stock Alert',
        message: 'Several of your top-selling listings have fewer than 3 units remaining. Restock soon to avoid lost sales during peak traffic.',
    },
    {
        type: 'opportunity',
        title: 'Rising Keyword Trend',
        message: '"Personalized gift" searches are up 42% this month. Consider adding this phrase to your top listing titles and tags.',
    },
    {
        type: 'tip',
        title: 'Boost Your Photos',
        message: 'Listings with 5+ photos convert 30% better on average. Try adding lifestyle shots or size-reference images to underperforming listings.',
    },
]

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
    return (
        <Card className="border-teal-200 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/10 h-full relative overflow-hidden">
            <CardHeader className="bg-teal-600 px-4 md:px-5 py-3 md:py-3.5">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <Sparkles className="h-4 w-4 text-white/80 flex-shrink-0" />
                        <CardTitle className="text-sm md:text-base font-semibold text-white tracking-wide truncate">Scout AI Insights</CardTitle>
                    </div>
                    <span className="text-[10px] font-semibold bg-white/20 text-white/80 px-2 py-0.5 rounded-full flex-shrink-0">Demo</span>
                </div>
            </CardHeader>
            <CardContent className="relative z-10 p-4 md:p-6 pt-3 md:pt-4">
                <div className="space-y-2.5 md:space-y-3">
                    {DEFAULT_INSIGHTS.map((insight, i) => {
                        const config = typeConfig[insight.type] ?? typeConfig.tip
                        const Icon = config.icon
                        return (
                            <div
                                key={i}
                                className={cn(
                                    "rounded-lg p-3 md:p-3.5 border",
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
                                <p className="text-[13px] md:text-sm text-slate-600 leading-relaxed">
                                    {insight.message}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
