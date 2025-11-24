"use client"

import * as React from "react"
import {
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { cn } from "@/lib/utils"

// Generate 365 days of mock data
const generateData = () => {
    const data = [];
    const today = new Date();
    for (let i = 365; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        // Random sales between 1000 and 5000 + some trend
        const base = 2000;
        const trend = Math.sin(i / 30) * 500; // Monthly-ish trend
        const random = Math.random() * 1000;
        data.push({
            date: date,
            total: Math.floor(base + trend + random),
        });
    }
    return data;
};

const ALL_DATA = generateData();

export function SalesChart() {
    const [timeRange, setTimeRange] = React.useState("30D");

    const filteredData = React.useMemo(() => {
        if (timeRange === "6M" || timeRange === "1Y") {
            const monthsToKeep = timeRange === "6M" ? 6 : 12;

            // Group by month
            const monthlyData: Record<string, { name: string; total: number; order: number }> = {};

            ALL_DATA.forEach(item => {
                const monthKey = item.date.toLocaleString('default', { month: 'short' });
                const year = item.date.getFullYear();
                const key = `${monthKey}-${year}`;

                if (!monthlyData[key]) {
                    monthlyData[key] = {
                        name: monthKey,
                        total: 0,
                        order: item.date.getTime()
                    };
                }
                monthlyData[key].total += item.total;
            });

            return Object.values(monthlyData)
                .sort((a, b) => a.order - b.order)
                .slice(-monthsToKeep);
        }

        let days = 30;
        if (timeRange === "7D") days = 7;
        if (timeRange === "All") days = 365;

        const sliced = ALL_DATA.slice(-days);

        return sliced.map(item => ({
            name: timeRange === "7D"
                ? item.date.toLocaleDateString('en-US', { weekday: 'short' })
                : item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            total: item.total
        }));
    }, [timeRange]);

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                <CardTitle className="text-base font-normal">Sales Trend</CardTitle>
                <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-lg">
                    {["7D", "30D", "6M", "1Y", "All"].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={cn(
                                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                timeRange === range
                                    ? "bg-white text-teal-700 shadow-sm"
                                    : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-700"
                            )}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={filteredData}
                            margin={{
                                top: 5,
                                right: 10,
                                left: 10,
                                bottom: 0,
                            }}
                        >
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="name"
                                stroke="#334155"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                stroke="#334155"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "var(--card)",
                                    borderColor: "var(--border)",
                                    borderRadius: "var(--radius)",
                                    color: "var(--card-foreground)",
                                }}
                                itemStyle={{ color: "var(--primary)" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="#0d9488"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorTotal)"
                                animationDuration={500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
