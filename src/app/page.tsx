import { DashboardLayout } from "@/components/DashboardLayout"
import { StatsCard } from "@/components/StatsCard"
import { SalesChart } from "@/components/SalesChart"
import { TopListings } from "@/components/TopListings"
import { RecentReviews } from "@/components/RecentReviews"
import { ScoutInsights } from "@/components/ScoutInsights"
import { DollarSign, ShoppingBag, Eye, Star } from "lucide-react"

export default function Home() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 pb-20">
        <div className="relative pl-4">
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full" />
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your store&apos;s performance.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Revenue"
            value="$45,231.89"
            icon={DollarSign}
            trend={{ value: 20.1, label: "from last month" }}
          />
          <StatsCard
            title="Orders"
            value="+2350"
            icon={ShoppingBag}
            trend={{ value: 180.1, label: "from last month" }}
          />
          <StatsCard
            title="Views"
            value="+12,234"
            icon={Eye}
            trend={{ value: 15.3, label: "from last month" }}
          />
          <StatsCard
            title="Rating"
            value="4.9"
            icon={Star}
            trend={{ value: 2.4, label: "from last month" }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SalesChart />
          <TopListings />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <RecentReviews />
          <ScoutInsights />
        </div>
      </div>

      {/* Visual Scroll Hint */}
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none z-50" />
    </DashboardLayout>
  )
}
