import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { ImageIcon } from "lucide-react"

const topListings = [
    {
        id: "LST-001",
        title: "Handmade Ceramic Mug",
        sales: 142,
        revenue: "$3,408.00",
    },
    {
        id: "LST-002",
        title: "Leather Wallet",
        sales: 98,
        revenue: "$4,410.00",
    },
    {
        id: "LST-003",
        title: "Wool Scarf",
        sales: 76,
        revenue: "$2,432.00",
    },
    {
        id: "LST-004",
        title: "Silver Ring",
        sales: 65,
        revenue: "$4,225.00",
    },
    {
        id: "LST-005",
        title: "Wooden Bowl",
        sales: 54,
        revenue: "$1,512.00",
    },
]

export function TopListings() {
    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-1 border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
            <CardHeader>
                <CardTitle>Top Performing Listings (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {topListings.map((listing) => (
                        <div key={listing.id} className="flex items-center gap-4">
                            {/* Thumbnail Placeholder */}
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
