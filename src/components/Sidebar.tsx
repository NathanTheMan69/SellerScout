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
                    <img src="/logo.png" alt="SellerScout" className="h-8 w-8 object-contain" />
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
                    "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-in-out",
                    "h-full rounded-none border-r border-slate-200/60 overflow-hidden",
                    "bg-gradient-to-b from-white via-white to-teal-50/40",
                    "shadow-xl shadow-teal-900/5 backdrop-blur-md",
                    "md:m-4 md:h-[calc(100vh-2rem)] md:rounded-2xl md:border md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Logo / Header */}
                    <div className="flex h-24 items-center px-5 border-b border-slate-100">
                        <div className="flex items-center gap-3 text-teal-600">
                            <img src="/logo.png" alt="SellerScout" className="h-14 w-14 object-contain drop-shadow-sm" />
                            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">SellerScout</span>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
                        {sidebarItems.map((item) => {
                            const isActive =
                                (item.href === "/" && (pathname === "/" || pathname === "/dashboard")) ||
                                (item.href !== "/" && pathname?.startsWith(item.href))
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                                        isActive
                                            ? "bg-teal-500/80 text-white shadow-md shadow-teal-500/25"
                                            : "text-slate-500 hover:bg-teal-50 hover:text-teal-700"
                                    )}
                                >
                                    <div className={cn(
                                        "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150",
                                        isActive
                                            ? "bg-white/20"
                                            : "bg-slate-100 group-hover:bg-teal-100"
                                    )}>
                                        <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-teal-600")} />
                                    </div>
                                    {item.label}
                                </Link>
                            )
                        })}

                        {/* Saved Group */}
                        <div className="pt-5 mt-1">
                            <div className="flex items-center gap-2 px-3 mb-2">
                                <div className="h-px flex-1 bg-slate-200/80" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saved</span>
                                <div className="h-px flex-1 bg-slate-200/80" />
                            </div>
                            {[
                                { href: "/dashboard/saved-keywords", icon: Search, label: "Keywords" },
                                { href: "/dashboard/saved-shops", icon: Store, label: "Shops" },
                                { href: "/dashboard/saved-listings", icon: Tag, label: "Listings" },
                            ].map(({ href, icon: Icon, label }) => {
                                const isActive = pathname === href
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={cn(
                                            "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                                            isActive
                                                ? "bg-teal-500/80 text-white shadow-md shadow-teal-500/25"
                                                : "text-slate-500 hover:bg-teal-50 hover:text-teal-700"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150",
                                            isActive ? "bg-white/20" : "bg-slate-100 group-hover:bg-teal-100"
                                        )}>
                                            <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-teal-600")} />
                                        </div>
                                        {label}
                                    </Link>
                                )
                            })}
                        </div>
                    </nav>

                    {/* Settings & Footer */}
                    <div className="p-3 border-t border-slate-100 space-y-1">
                        {(() => {
                            const isActive = pathname === "/dashboard/settings"
                            return (
                                <Link
                                    href="/dashboard/settings"
                                    className={cn(
                                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                                        isActive
                                            ? "bg-teal-500/80 text-white shadow-md shadow-teal-500/25"
                                            : "text-slate-500 hover:bg-teal-50 hover:text-teal-700"
                                    )}
                                >
                                    <div className={cn(
                                        "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150",
                                        isActive ? "bg-white/20" : "bg-slate-100 group-hover:bg-teal-100"
                                    )}>
                                        <Settings className={cn("h-4 w-4 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-teal-600")} />
                                    </div>
                                    Settings
                                </Link>
                            )
                        })()}

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-50 transition-all duration-150 text-left group"
                        >
                            <div className="h-8 w-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold group-hover:bg-teal-200 transition-colors flex-shrink-0">
                                DU
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-sm font-medium text-slate-800 truncate">Demo User</span>
                                <span className="text-xs text-slate-400">Pro Plan</span>
                            </div>
                            <LogOut className="h-4 w-4 text-slate-300 group-hover:text-rose-500 transition-colors flex-shrink-0" />
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
