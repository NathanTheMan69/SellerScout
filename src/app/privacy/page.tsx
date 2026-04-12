import Link from "next/link"

export default function PrivacyPage() {
    const lastUpdated = "April 9, 2025"

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navbar */}
            <header className="bg-white border-b border-slate-100 shadow-sm">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <img src="/logo.png" alt="Seller Scout" className="h-8 w-8" />
                        <span className="text-lg font-bold bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-raleway)' }}>
                            Seller Scout
                        </span>
                    </Link>
                    <Link href="/" className="text-sm text-slate-500 hover:text-teal-600 transition-colors">
                        ← Back to home
                    </Link>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-16">
                <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Privacy Policy</h1>
                <p className="text-sm text-slate-400 mb-12">Last updated: {lastUpdated}</p>

                <div className="prose prose-slate max-w-none space-y-10 text-slate-600 leading-relaxed">

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-3">1. Introduction</h2>
                        <p>Welcome to Seller Scout ("we", "us", or "our"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform at <a href="https://sellerscout.live" className="text-teal-600 hover:underline">sellerscout.live</a>.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-3">2. Information We Collect</h2>
                        <p>We collect information you provide directly to us, including:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Account information (name, email address) when you register</li>
                            <li>Authentication data when you sign in with Google or email</li>
                            <li>Usage data such as features you interact with and searches you perform</li>
                            <li>Etsy shop data if you choose to connect your Etsy account</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-3">3. How We Use Your Information</h2>
                        <p>We use the information we collect to:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Provide, maintain, and improve our services</li>
                            <li>Personalize your experience on the platform</li>
                            <li>Send you service-related communications</li>
                            <li>Monitor and analyze usage patterns to improve the platform</li>
                            <li>Detect and prevent fraudulent or unauthorized activity</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-3">4. Data Storage & Security</h2>
                        <p>Your data is stored securely using Supabase, a trusted cloud database provider. We implement industry-standard security measures to protect your information from unauthorized access, alteration, or disclosure. However, no method of transmission over the internet is 100% secure.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-3">5. Third-Party Services</h2>
                        <p>We may use third-party services including:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li><strong>Google OAuth</strong> — for sign-in authentication</li>
                            <li><strong>Supabase</strong> — for database and authentication services</li>
                            <li><strong>Vercel</strong> — for hosting and deployment</li>
                            <li><strong>Etsy API</strong> — to retrieve your shop data when authorized</li>
                        </ul>
                        <p className="mt-2">Each of these services has their own privacy policies governing how they handle your data.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-3">6. Cookies</h2>
                        <p>We use cookies and similar tracking technologies to maintain your session and improve your experience. You can control cookies through your browser settings, though disabling them may affect functionality.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-3">7. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Access the personal data we hold about you</li>
                            <li>Request correction of inaccurate data</li>
                            <li>Request deletion of your account and associated data</li>
                            <li>Withdraw consent at any time</li>
                        </ul>
                        <p className="mt-2">To exercise these rights, contact us at the email below.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-3">8. Children's Privacy</h2>
                        <p>Seller Scout is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-3">9. Changes to This Policy</h2>
                        <p>We may update this Privacy Policy from time to time. We will notify you of any significant changes by updating the date at the top of this page. Continued use of the service after changes constitutes acceptance of the updated policy.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-3">10. Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                        <p className="mt-2 font-medium text-slate-800">Seller Scout<br />
                        <a href="https://sellerscout.live" className="text-teal-600 hover:underline">sellerscout.live</a></p>
                    </section>

                </div>
            </div>

            <footer className="border-t border-slate-100 bg-white py-6 px-6 mt-16">
                <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-slate-400">
                    <span>© {new Date().getFullYear()} Seller Scout. All rights reserved.</span>
                    <Link href="/" className="hover:text-teal-600 transition-colors">Back to home</Link>
                </div>
            </footer>
        </div>
    )
}
