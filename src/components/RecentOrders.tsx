import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Badge } from "@/components/Badge"

const orders = [
    {
        id: "ORD-001",
        customer: "Alice Freeman",
        product: "Handmade Ceramic Mug",
        amount: "$24.00",
        status: "Shipped",
        date: "2 mins ago",
    },
    {
        id: "ORD-002",
        customer: "Bob Smith",
        product: "Leather Wallet",
        amount: "$45.00",
        status: "Processing",
        date: "1 hour ago",
    },
    {
        id: "ORD-003",
        customer: "Charlie Brown",
        product: "Wool Scarf",
        amount: "$32.00",
        status: "Delivered",
        date: "3 hours ago",
    },
    {
        id: "ORD-004",
        customer: "Diana Prince",
        product: "Silver Ring",
        amount: "$65.00",
        status: "Processing",
        date: "5 hours ago",
    },
    {
        id: "ORD-005",
        customer: "Evan Wright",
        product: "Wooden Bowl",
        amount: "$28.00",
        status: "Shipped",
        date: "1 day ago",
    },
]

export function RecentOrders() {
    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
            <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {orders.map((order) => (
                        <div key={order.id} className="flex items-center">
                            <div className="ml-4 space-y-1 flex-1">
                                <p className="text-sm font-medium leading-none">{order.customer}</p>
                                <p className="text-xs text-muted-foreground">{order.product}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="font-medium">{order.amount}</div>
                                <Badge
                                    variant={
                                        order.status === "Delivered"
                                            ? "secondary"
                                            : order.status === "Processing"
                                                ? "outline"
                                                : "default"
                                    }
                                    className="text-[10px] px-1.5 py-0 h-5"
                                >
                                    {order.status}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
