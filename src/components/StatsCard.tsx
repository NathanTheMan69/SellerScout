import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
    title: string
    value: string
    icon: LucideIcon
    trend?: {
        value: number
        label: string
    }
    className?: string
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    trend,
    className,
}: StatsCardProps) {
    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-teal-600 px-3 py-2 md:px-5 md:py-1.5 gap-2">
                <CardTitle className="text-xs md:text-base font-semibold text-white tracking-wide truncate">
                    {title}
                </CardTitle>
                <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <Icon className="h-3 w-3 md:h-4 md:w-4 text-teal-500" />
                </div>
            </CardHeader>
            <CardContent className="p-3 md:p-6 md:pt-4">
                <div
                    className={cn(
                        "text-lg md:text-2xl font-bold truncate",
                        title === "Total Revenue" &&
                        "bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent",
                        value.startsWith("$") &&
                        title !== "Total Revenue" &&
                        "text-emerald-600"
                    )}
                >
                    {value}
                </div>
                {trend && (
                    <p className="text-[10px] md:text-xs text-muted-foreground mt-1 truncate">
                        <span
                            className={cn(
                                "font-medium",
                                trend.value > 0 ? "text-emerald-600" : "text-rose-600"
                            )}
                        >
                            {trend.value > 0 ? "+" : ""}
                            {trend.value}%
                        </span>{" "}
                        <span className="hidden sm:inline">{trend.label}</span>
                        <span className="sm:hidden">vs last mo</span>
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
