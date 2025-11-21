'use client'

import { useState } from 'react'
import { login, signup } from './actions'
import { Button } from '@/components/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card'
import { TrendingUp, MailCheck, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginPage({
    searchParams,
}: {
    searchParams: { message: string; error: string }
}) {
    const [isSignupSuccess, setIsSignupSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [clientError, setClientError] = useState<string | null>(null)
    const router = useRouter()

    async function handleLogin(formData: FormData) {
        setIsLoading(true)
        setClientError(null)
        try {
            await login(formData)
        } catch (e) {
            // Login action redirects on success, so we might catch redirect errors or actual errors
            // But since login action redirects, we mostly rely on server redirect.
            // If it throws, it's an error.
        } finally {
            setIsLoading(false)
        }
    }

    async function handleSignup(formData: FormData) {
        setIsLoading(true)
        setClientError(null)
        const res = await signup(formData)
        setIsLoading(false)

        if (res?.error) {
            setClientError(res.error)
        } else if (res?.success) {
            setIsSignupSuccess(true)
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="mb-8 flex items-center gap-2 text-teal-700">
                <TrendingUp className="h-10 w-10" />
                <span className="text-3xl font-bold tracking-tight">SellerScout</span>
            </div>

            <Card className="w-full max-w-md border-white/50 bg-white/70 backdrop-blur-md shadow-xl shadow-teal-900/5 transition-all duration-500">
                {isSignupSuccess ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
                        <div className="rounded-full bg-teal-100 p-4 shadow-inner">
                            <MailCheck className="h-12 w-12 text-teal-600" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-teal-800">Check your inbox! 📧</h3>
                            <p className="text-slate-600">
                                We have sent a confirmation link to your email address.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setIsSignupSuccess(false)}
                            className="mt-4 border-teal-200 text-teal-700 hover:bg-teal-50"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Login
                        </Button>
                    </div>
                ) : (
                    <>
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl font-bold text-center text-slate-800">
                                Welcome back
                            </CardTitle>
                            <CardDescription className="text-center text-slate-600">
                                Enter your email to sign in to your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="flex flex-col gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
                                        Email
                                    </label>
                                    <input
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white/50 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
                                        Password
                                    </label>
                                    <input
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white/50 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                    />
                                </div>

                                {(searchParams?.error || clientError) && (
                                    <div className="text-sm text-rose-600 bg-rose-50 p-2 rounded border border-rose-200 text-center">
                                        {clientError || searchParams.error}
                                    </div>
                                )}

                                <div className="flex flex-col gap-2 mt-2">
                                    <Button
                                        formAction={handleLogin}
                                        className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Loading...' : 'Sign In'}
                                    </Button>
                                    <Button
                                        formAction={handleSignup}
                                        variant="outline"
                                        className="w-full border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
                                        disabled={isLoading}
                                    >
                                        Sign Up
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    )
}
