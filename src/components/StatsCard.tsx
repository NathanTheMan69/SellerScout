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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div
                    className={cn(
                        "text-2xl font-bold",
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
                    <p className="text-xs text-muted-foreground mt-1">
                        <span
                            className={cn(
                                "font-medium",
                                trend.value > 0 ? "text-emerald-600" : "text-rose-600"
                            )}
                        >
                            {trend.value > 0 ? "+" : ""}
                            {trend.value}%
                        </span>{" "}
                        {trend.label}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
