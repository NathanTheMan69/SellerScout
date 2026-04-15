"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { ImageIcon, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const topListings = [
    { id: "LST-001", title: "Handmade Ceramic Mug", sales: 142, revenue: "$3,408.00" },
    { id: "LST-002", title: "Leather Wallet", sales: 98, revenue: "$4,410.00" },
    { id: "LST-003", title: "Wool Scarf", sales: 76, revenue: "$2,432.00" },
    { id: "LST-004", title: "Silver Ring", sales: 65, revenue: "$4,225.00" },
    { id: "LST-005", title: "Wooden Bowl", sales: 54, revenue: "$1,512.00" },
]

const TIME_RANGES = [
    { label: "Last 7 Days",    value: "7d" },
    { label: "Last 30 Days",   value: "30d" },
    { label: "Last 3 Months",  value: "3m" },
    { label: "Last 6 Months",  value: "6m" },
    { label: "Last Year",      value: "1y" },
]

export function TopListings() {
    const [selected, setSelected] = React.useState("30d")
    const [open, setOpen] = React.useState(false)
    const ref = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const selectedLabel = TIME_RANGES.find(r => r.value === selected)?.label ?? "Last 30 Days"

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-1 border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5 overflow-hidden">
            <CardHeader className="bg-teal-500/80 px-5 py-3.5 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold text-white tracking-wide">Top Performing Listings</CardTitle>
                <div ref={ref} className="relative">
                    <button
                        onClick={() => setOpen(v => !v)}
                        className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition-colors text-white text-xs font-medium px-2.5 py-1 rounded-md"
                    >
                        {selectedLabel}
                        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
                    </button>
                    {open && (
                        <div className="absolute right-0 top-full mt-1.5 w-40 bg-white border border-slate-200 rounded-xl shadow-lg shadow-teal-900/10 z-50 overflow-hidden">
                            {TIME_RANGES.map(r => (
                                <button
                                    key={r.value}
                                    onClick={() => { setSelected(r.value); setOpen(false) }}
                                    className={cn(
                                        "w-full text-left px-3.5 py-2 text-xs transition-colors",
                                        selected === r.value
                                            ? "bg-teal-50 text-teal-700 font-semibold"
                                            : "text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-5">
                <div className="space-y-6">
                    {topListings.map((listing) => (
                        <div key={listing.id} className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-teal-50 flex items-center justify-center border border-teal-100">
                                <ImageIcon className="h-6 w-6 text-teal-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate">{listing.title}</p>
                                <p className="text-xs text-slate-500">{listing.sales} sales</p>
                            </div>
                            <div className="font-semibold text-slate-800">
                                {listing.revenue}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
