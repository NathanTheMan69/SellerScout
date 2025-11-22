import * as React from "react"
import { Sidebar } from "@/components/Sidebar"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="layout-container">
            <Sidebar />
            <main className="main-content pt-16 md:pt-0 md:pl-72">
                <div className="w-full px-8 py-6">
                    {children}
                </div>
            </main>
        </div>
    )
}
