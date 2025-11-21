import { DashboardLayout } from "@/components/DashboardLayout"
import { StatsCard } from "@/components/StatsCard"
import { SalesChart } from "@/components/SalesChart"
import { TopListings } from "@/components/TopListings"
import { DollarSign, ShoppingBag, Users, Activity } from "lucide-react"

export default function Home() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="relative">
          <div className="absolute -left-4 top-0 h-full w-1 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full" />
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
            title="Active Now"
            value="+573"
            icon={Activity}
            trend={{ value: 201, label: "since last hour" }}
          />
          <StatsCard
            title="New Customers"
            value="+12,234"
            icon={Users}
            trend={{ value: -4, label: "from last month" }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SalesChart />
          <TopListings />
        </div>
      </div>
    </DashboardLayout>
  )
}
