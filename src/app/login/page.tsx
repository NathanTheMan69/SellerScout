'use client'

import { useState } from 'react'
import { login, signup } from './actions'
import { Button } from '@/components/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card'
import { MailCheck, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginPage({
    searchParams,
}: {
    searchParams: { message: string; error: string }
}) {
    const [mode, setMode] = useState<'signin' | 'signup'>('signin')
    const [isSignupSuccess, setIsSignupSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [clientError, setClientError] = useState<string | null>(null)
    const router = useRouter()

    function switchMode(next: 'signin' | 'signup') {
        setMode(next)
        setClientError(null)
    }

    async function handleLogin(formData: FormData) {
        setIsLoading(true)
        setClientError(null)
        const res = await login(formData)
        setIsLoading(false)
        if (res?.error) {
            setClientError(res.error)
        } else if (res?.success) {
            router.push('/dashboard')
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

    const isSignIn = mode === 'signin'

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
            <div className="mb-8 flex items-center gap-3 text-teal-700">
                <img src="/logo.png" alt="SellerScout" className="h-12 w-12 object-contain" />
                <span className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
                    SellerScout
                </span>
            </div>

            <Card className="w-full max-w-md border-slate-200 bg-white shadow-2xl shadow-slate-300/60 ring-1 ring-slate-100">
                {isSignupSuccess ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
                        <div className="rounded-full bg-teal-100 p-4">
                            <MailCheck className="h-12 w-12 text-teal-600" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-slate-800">Check your inbox!</h3>
                            <p className="text-slate-500">
                                We sent a confirmation link to your email. Click it to activate your account.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => { setIsSignupSuccess(false); switchMode('signin') }}
                            className="border-teal-200 text-teal-700 hover:bg-teal-50"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Log In
                        </Button>
                    </div>
                ) : (
                    <>
                        <CardHeader className="space-y-1 pb-4">
                            <CardTitle className="text-2xl font-bold text-center text-slate-800">
                                {isSignIn ? 'Welcome back' : 'Create an account'}
                            </CardTitle>
                            <CardDescription className="text-center text-slate-500">
                                {isSignIn
                                    ? 'Log in to your SellerScout account'
                                    : 'Start growing your Etsy shop today'}
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form className="flex flex-col gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700" htmlFor="email">
                                        Email
                                    </label>
                                    <input
                                        className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1 disabled:opacity-50"
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700" htmlFor="password">
                                        Password
                                    </label>
                                    <input
                                        className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1 disabled:opacity-50"
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                {(searchParams?.error || clientError) && (
                                    <div className="text-sm text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200 text-center">
                                        {clientError || searchParams.error}
                                    </div>
                                )}

                                <Button
                                    formAction={isSignIn ? handleLogin : handleSignup}
                                    className="w-full mt-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Loading...' : isSignIn ? 'Log In' : 'Create Account'}
                                </Button>
                            </form>

                            <p className="mt-5 text-center text-sm text-slate-500">
                                {isSignIn ? (
                                    <>
                                        Don&apos;t have an account?{' '}
                                        <button
                                            type="button"
                                            onClick={() => switchMode('signup')}
                                            className="font-semibold text-teal-600 hover:text-teal-700 hover:underline"
                                        >
                                            Sign up
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        Already have an account?{' '}
                                        <button
                                            type="button"
                                            onClick={() => switchMode('signin')}
                                            className="font-semibold text-teal-600 hover:text-teal-700 hover:underline"
                                        >
                                            Log in
                                        </button>
                                    </>
                                )}
                            </p>
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    )
}
