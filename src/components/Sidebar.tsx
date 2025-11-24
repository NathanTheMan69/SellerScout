"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
    Home,
    Search,
    TrendingUp,
    Eye,
    ClipboardCheck,
    Settings,
    Menu,
    X,
    ShoppingBag,
    Tag,
    Store,
    LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/Button"
import { createClient } from "@/utils/supabase/client"

const sidebarItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: Search, label: "Keyword Research", href: "/dashboard/keyword-research" },
    { icon: TrendingUp, label: "Trends", href: "/dashboard/trends" },
    { icon: Store, label: "Shop Tracker", href: "/dashboard/shops" },
    { icon: Tag, label: "Listing Analysis", href: "/dashboard/listing-analysis" },
    { icon: ClipboardCheck, label: "Listing Optimizer", href: "/dashboard/listing-optimizer" },
]

function SellerScoutLogo({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
            <path d="M7 14l3-3 2 2 4-5" />
        </svg>
    )
}

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [isOpen, setIsOpen] = React.useState(false)
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-emerald-50 z-50 flex items-center justify-between px-4 md:hidden">
                <div className="flex items-center gap-2 text-teal-600">
                    <SellerScoutLogo className="h-6 w-6" />
                    <span className="text-xl font-bold tracking-tight">SellerScout</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-64 transform bg-white/70 backdrop-blur-md shadow-xl shadow-teal-900/5 transition-transform duration-200 ease-in-out",
                    "h-full rounded-none border-r border-white/50", // Mobile styles
                    "md:m-4 md:h-[calc(100vh-2rem)] md:rounded-2xl md:border md:translate-x-0", // Desktop styles
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Logo / Header */}
                    <div className="flex h-20 items-center px-6 border-b border-emerald-50">
                        <div className="flex items-center gap-2 text-teal-600">
                            <SellerScoutLogo className="h-8 w-8" />
                            <span className="text-2xl font-bold tracking-tight">SellerScout</span>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 space-y-1 px-3 py-6">
                        {sidebarItems.map((item) => {
                            const isActive = pathname === item.href || (item.href === "/" && pathname === "/dashboard")
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-r-full px-4 py-3 text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-teal-50 text-teal-700 border-l-4 border-teal-500"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent"
                                    )}
                                >
                                    <item.icon className={cn("h-5 w-5", isActive ? "text-teal-600" : "text-slate-400")} />
                                    {item.label}
                                </Link>
                            )
                        })}

                        {/* Saved Group */}
                        <div className="pt-6 mt-2">
                            <h3 className="px-4 text-sm font-bold text-teal-600 uppercase tracking-wider mb-2">
                                Saved
                            </h3>
                            <Link
                                href="/dashboard/saved-keywords"
                                className={cn(
                                    "flex items-center gap-3 rounded-r-full px-4 py-3 text-sm font-medium transition-all duration-200",
                                    pathname === "/dashboard/saved-keywords"
                                        ? "bg-teal-50 text-teal-700 border-l-4 border-teal-500"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent"
                                )}
                            >
                                <Search className={cn("h-5 w-5", pathname === "/dashboard/saved-keywords" ? "text-teal-600" : "text-slate-400")} />
                                Keywords
                            </Link>
                            <Link
                                href="/dashboard/saved-shops"
                                className={cn(
                                    "flex items-center gap-3 rounded-r-full px-4 py-3 text-sm font-medium transition-all duration-200",
                                    pathname === "/dashboard/saved-shops"
                                        ? "bg-teal-50 text-teal-700 border-l-4 border-teal-500"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent"
                                )}
                            >
                                <Store className={cn("h-5 w-5", pathname === "/dashboard/saved-shops" ? "text-teal-600" : "text-slate-400")} />
                                Shops
                            </Link>
                            <Link
                                href="/dashboard/saved-listings"
                                className={cn(
                                    "flex items-center gap-3 rounded-r-full px-4 py-3 text-sm font-medium transition-all duration-200",
                                    pathname === "/dashboard/saved-listings"
                                        ? "bg-teal-50 text-teal-700 border-l-4 border-teal-500"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent"
                                )}
                            >
                                <Tag className={cn("h-5 w-5", pathname === "/dashboard/saved-listings" ? "text-teal-600" : "text-slate-400")} />
                                Listings
                            </Link>
                        </div>
                    </nav>

                    {/* Settings & Footer */}
                    <div className="p-3 border-t border-emerald-50">
                        <Link
                            href="/dashboard/settings"
                            className={cn(
                                "flex items-center gap-3 rounded-r-full px-4 py-3 text-sm font-medium transition-all duration-200",
                                pathname === "/dashboard/settings"
                                    ? "bg-teal-50 text-teal-700 border-l-4 border-teal-500"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent"
                            )}
                        >
                            <Settings className={cn("h-5 w-5", pathname === "/dashboard/settings" ? "text-teal-600" : "text-slate-400")} />
                            Settings
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="mt-4 w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 rounded-xl transition-colors text-left group"
                        >
                            <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold group-hover:bg-teal-200 transition-colors">
                                DU
                            </div>
                            <div className="flex flex-col flex-1">
                                <span className="text-sm font-medium text-slate-900">Demo User</span>
                                <span className="text-xs text-slate-500">Pro Plan</span>
                            </div>
                            <LogOut className="h-4 w-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-sm md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
