"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Home,
    Search,
    TrendingUp,
    Eye,
    ClipboardCheck,
    Settings,
    Menu,
    X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/Button"

const sidebarItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: Search, label: "Keyword Research", href: "/keywords" },
    { icon: TrendingUp, label: "Trends", href: "/trends" },
    { icon: Eye, label: "Competitor Analysis", href: "/competitors" },
    { icon: ClipboardCheck, label: "Listing Optimizer", href: "/optimizer" },
]

export function Sidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <>
            {/* Mobile Menu Button */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 md:hidden"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-64 transform bg-white border-r border-emerald-100 transition-transform duration-200 ease-in-out md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Logo / Header */}
                    <div className="flex h-20 items-center px-6 border-b border-emerald-50">
                        <div className="flex items-center gap-2 text-teal-600">
                            <TrendingUp className="h-8 w-8" />
                            <span className="text-2xl font-bold tracking-tight">SellerScout</span>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 space-y-1 px-3 py-6">
                        {sidebarItems.map((item) => {
                            const isActive = pathname === item.href
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
                    </nav>

                    {/* Settings & Footer */}
                    <div className="p-3 border-t border-emerald-50">
                        <Link
                            href="/settings"
                            className={cn(
                                "flex items-center gap-3 rounded-r-full px-4 py-3 text-sm font-medium transition-all duration-200",
                                pathname === "/settings"
                                    ? "bg-teal-50 text-teal-700 border-l-4 border-teal-500"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent"
                            )}
                        >
                            <Settings className={cn("h-5 w-5", pathname === "/settings" ? "text-teal-600" : "text-slate-400")} />
                            Settings
                        </Link>

                        <div className="mt-4 flex items-center gap-3 px-4 py-2">
                            <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                                DU
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-900">Demo User</span>
                                <span className="text-xs text-slate-500">Pro Plan</span>
                            </div>
                        </div>
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
