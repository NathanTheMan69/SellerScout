import * as React from "react"
import { Sidebar } from "@/components/Sidebar"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="layout-container">
            <Sidebar />
            <main className="main-content md:pl-64">
                <div className="container mx-auto p-6 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
