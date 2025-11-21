'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, CreditCard, LogOut, ShieldAlert, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/Card'
import { Button } from '@/components/Button'
import { DashboardLayout } from '@/components/DashboardLayout'
import { createClient } from '@/utils/supabase/client'

export default function SettingsPage() {
    const [userEmail, setUserEmail] = useState<string>('')
    const [displayName, setDisplayName] = useState<string>('Demo User')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user && user.email) {
                setUserEmail(user.email)
                // In a real app, we'd fetch the display name from a profile table here
            }
            setLoading(false)
        }
        getUser()
    }, [])

    const handleSaveProfile = () => {
        setSaving(true)
        // Simulate API call
        setTimeout(() => {
            setSaving(false)
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 3000)
        }, 800)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="relative">
                    <div className="absolute -left-4 top-0 h-full w-1 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full" />
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Settings</h1>
                    <p className="text-muted-foreground">Manage your account preferences and subscription.</p>
                </div>

                {/* Profile Section */}
                <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-teal-600 mb-1">
                            <User className="h-5 w-5" />
                            <h2 className="font-semibold">Profile Information</h2>
                        </div>
                        <CardDescription>Update your personal details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={loading ? 'Loading...' : userEmail}
                                disabled
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 focus:outline-none cursor-not-allowed"
                            />
                            <p className="text-xs text-slate-500">Your email address is managed via your login provider.</p>
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="displayName" className="text-sm font-medium text-slate-700">Display Name</label>
                            <input
                                id="displayName"
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            />
                        </div>

                        <div className="pt-2 flex items-center gap-3">
                            <Button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="bg-teal-600 hover:bg-teal-700 text-white"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>

                            {showSuccess && (
                                <div className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium animate-in fade-in slide-in-from-left-2">
                                    <Check className="h-4 w-4" />
                                    Saved successfully!
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Subscription Section */}
                <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-teal-600 mb-1">
                            <CreditCard className="h-5 w-5" />
                            <h2 className="font-semibold">Subscription</h2>
                        </div>
                        <CardDescription>Manage your billing and plan details.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 rounded-lg border border-teal-100 bg-teal-50/50">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-slate-800">Pro Plan</h3>
                                    <span className="inline-flex items-center rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-800">
                                        Active
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 mt-1">$29/month • Next billing date: Dec 21, 2025</p>
                            </div>
                            <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800">
                                Manage Subscription
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-rose-100 bg-white/70 backdrop-blur-md shadow-lg shadow-rose-900/5">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-rose-600 mb-1">
                            <ShieldAlert className="h-5 w-5" />
                            <h2 className="font-semibold">Danger Zone</h2>
                        </div>
                        <CardDescription>Irreversible actions for your account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-slate-800">Sign Out</h3>
                                <p className="text-sm text-slate-500">Securely log out of your session.</p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleLogout}
                                className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Sign Out
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
