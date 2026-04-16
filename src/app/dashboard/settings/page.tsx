'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    User, CreditCard, LogOut, ShieldAlert, Check,
    Sparkles, Bell, Moon, Sun, Monitor, Palette,
    Receipt, Package
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardDescription } from '@/components/Card'
import { Button } from '@/components/Button'
import { DashboardLayout } from '@/components/DashboardLayout'
import { createClient } from '@/utils/supabase/client'
import { cn } from '@/lib/utils'

type Tab = 'account' | 'billing' | 'subscription' | 'appearance'

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'billing', label: 'Billing', icon: Receipt },
    { id: 'subscription', label: 'Subscription', icon: Package },
    { id: 'appearance', label: 'Appearance', icon: Palette },
]

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('account')
    const [userEmail, setUserEmail] = useState<string>('')
    const [displayName, setDisplayName] = useState<string>('Demo User')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
    const [emailNotifs, setEmailNotifs] = useState(true)
    const [insightNotifs, setInsightNotifs] = useState(true)

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.email) setUserEmail(user.email)
            setLoading(false)
        }
        getUser()
    }, [])

    const handleSaveProfile = () => {
        setSaving(true)
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
            <div className="space-y-6 max-w-3xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-md shadow-teal-900/20">
                        <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Settings</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Manage your account preferences and subscription.</p>
                    </div>
                </div>

                {/* Tab Bar */}
                <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={cn(
                                "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                                activeTab === id
                                    ? "bg-white text-teal-700 shadow-sm shadow-slate-200"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    ))}
                </div>

                {/* Account Tab */}
                {activeTab === 'account' && (
                    <div className="space-y-6">
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
                                    <Button onClick={handleSaveProfile} disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white">
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

                        <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                            <CardHeader>
                                <div className="flex items-center gap-2 text-teal-600 mb-1">
                                    <Bell className="h-5 w-5" />
                                    <h2 className="font-semibold">Notifications</h2>
                                </div>
                                <CardDescription>Choose what updates you receive.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { id: 'email', label: 'Email Notifications', desc: 'Receive weekly shop performance summaries.', value: emailNotifs, setter: setEmailNotifs },
                                    { id: 'insights', label: 'AI Insight Alerts', desc: 'Get notified when Scout detects new opportunities.', value: insightNotifs, setter: setInsightNotifs },
                                ].map(({ id, label, desc, value, setter }) => (
                                    <div key={id} className="flex items-center justify-between py-1">
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{label}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                                        </div>
                                        <button
                                            onClick={() => setter(!value)}
                                            className={cn(
                                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                                                value ? "bg-teal-600" : "bg-slate-200"
                                            )}
                                        >
                                            <span className={cn(
                                                "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                                                value ? "translate-x-6" : "translate-x-1"
                                            )} />
                                        </button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                            <CardContent className="pt-6">
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
                )}

                {/* Billing Tab */}
                {activeTab === 'billing' && (
                    <div className="space-y-6">
                        <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                            <CardHeader>
                                <div className="flex items-center gap-2 text-teal-600 mb-1">
                                    <CreditCard className="h-5 w-5" />
                                    <h2 className="font-semibold">Payment Method</h2>
                                </div>
                                <CardDescription>Manage your payment details.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-14 items-center justify-center rounded-md border border-slate-200 bg-white text-xs font-bold text-slate-700 tracking-widest">
                                            VISA
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">Visa ending in 4242</p>
                                            <p className="text-xs text-slate-500">Expires 08/2027</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="text-sm border-slate-200 text-slate-600 hover:bg-slate-50">
                                        Replace
                                    </Button>
                                </div>
                                <Button variant="outline" className="w-full border-dashed border-slate-300 text-slate-500 hover:text-slate-700 hover:border-slate-400">
                                    + Add Payment Method
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                            <CardHeader>
                                <div className="flex items-center gap-2 text-teal-600 mb-1">
                                    <Receipt className="h-5 w-5" />
                                    <h2 className="font-semibold">Billing History</h2>
                                </div>
                                <CardDescription>Your recent invoices and receipts.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="divide-y divide-slate-100">
                                    {[
                                        { date: 'Mar 21, 2026', amount: '$29.00', status: 'Paid' },
                                        { date: 'Feb 21, 2026', amount: '$29.00', status: 'Paid' },
                                        { date: 'Jan 21, 2026', amount: '$29.00', status: 'Paid' },
                                    ].map((invoice) => (
                                        <div key={invoice.date} className="flex items-center justify-between py-3">
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">{invoice.date}</p>
                                                <p className="text-xs text-slate-500">Pro Plan — Monthly</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-semibold text-slate-700">{invoice.amount}</span>
                                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                                    {invoice.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Subscription Tab */}
                {activeTab === 'subscription' && (
                    <div className="space-y-6">
                        <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                            <CardHeader>
                                <div className="flex items-center gap-2 text-teal-600 mb-1">
                                    <Package className="h-5 w-5" />
                                    <h2 className="font-semibold">Current Plan</h2>
                                </div>
                                <CardDescription>Your active subscription details.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-lg border border-teal-100 bg-teal-50/50">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-800">Pro Plan</h3>
                                            <span className="inline-flex items-center rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-800">
                                                Active
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 mt-1">$29/month · Next billing: Apr 21, 2026</p>
                                    </div>
                                    <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
                                        Manage
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid gap-4 sm:grid-cols-3">
                            {[
                                { name: 'Starter', price: '$0', desc: 'Basic keyword research and shop tracking.', features: ['5 keyword searches/mo', '1 shop tracked', 'Basic insights'], current: false },
                                { name: 'Pro', price: '$29', desc: 'Everything you need to grow your Etsy shop.', features: ['Unlimited searches', '10 shops tracked', 'AI Scout Insights', 'Listing optimizer'], current: true },
                                { name: 'Business', price: '$79', desc: 'For power sellers managing multiple stores.', features: ['Unlimited everything', '50 shops tracked', 'Priority support', 'Team access'], current: false },
                            ].map((plan) => (
                                <div
                                    key={plan.name}
                                    className={cn(
                                        "rounded-xl border p-5 space-y-3 transition-all",
                                        plan.current
                                            ? "border-teal-400 bg-teal-50/60 shadow-md shadow-teal-900/10"
                                            : "border-slate-200 bg-white/70"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-slate-800">{plan.name}</h3>
                                        {plan.current && (
                                            <span className="text-xs font-medium text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">Current</span>
                                        )}
                                    </div>
                                    <div className="text-2xl font-bold text-slate-800">{plan.price}<span className="text-sm font-normal text-slate-500">/mo</span></div>
                                    <p className="text-xs text-slate-500">{plan.desc}</p>
                                    <ul className="space-y-1.5">
                                        {plan.features.map((f) => (
                                            <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                                                <Check className="h-3.5 w-3.5 text-teal-500 flex-shrink-0" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        disabled={plan.current}
                                        className={cn(
                                            "w-full text-sm",
                                            plan.current
                                                ? "bg-teal-100 text-teal-700 cursor-default"
                                                : "bg-teal-600 hover:bg-teal-700 text-white"
                                        )}
                                    >
                                        {plan.current ? 'Current Plan' : `Switch to ${plan.name}`}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                    <div className="space-y-6">
                        <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                            <CardHeader>
                                <div className="flex items-center gap-2 text-teal-600 mb-1">
                                    <Sun className="h-5 w-5" />
                                    <h2 className="font-semibold">Theme</h2>
                                </div>
                                <CardDescription>Choose how SellerScout looks to you.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-3">
                                    {([
                                        { id: 'light', label: 'Light', icon: Sun },
                                        { id: 'dark', label: 'Dark', icon: Moon },
                                        { id: 'system', label: 'System', icon: Monitor },
                                    ] as const).map(({ id, label, icon: Icon }) => (
                                        <button
                                            key={id}
                                            onClick={() => setTheme(id)}
                                            className={cn(
                                                "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all",
                                                theme === id
                                                    ? "border-teal-400 bg-teal-50 text-teal-700 shadow-sm"
                                                    : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                                            )}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span className="text-sm font-medium">{label}</span>
                                            {theme === id && <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5">
                            <CardHeader>
                                <div className="flex items-center gap-2 text-teal-600 mb-1">
                                    <Sparkles className="h-5 w-5" />
                                    <h2 className="font-semibold">Dashboard Preferences</h2>
                                </div>
                                <CardDescription>Customize what you see on your dashboard.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { label: 'Show AI Insights', desc: 'Display Scout AI Insights card on the dashboard.' },
                                    { label: 'Show Recent Reviews', desc: 'Display the latest customer reviews.' },
                                    { label: 'Compact View', desc: 'Use a denser layout to fit more content.' },
                                ].map(({ label, desc }) => (
                                    <div key={label} className="flex items-center justify-between py-1">
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{label}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                                        </div>
                                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-teal-600 transition-colors focus:outline-none">
                                            <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow translate-x-6 transition-transform" />
                                        </button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                )}

            </div>
        </DashboardLayout>
    )
}
