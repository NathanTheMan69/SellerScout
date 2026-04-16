import Link from "next/link"
import { Search, TrendingUp, Store, Sparkles, BarChart2, ArrowRight, CheckCircle, Star, Zap, Shield } from "lucide-react"

const FEATURES = [
  {
    icon: Search,
    title: "Keyword Research",
    description: "Uncover high-demand, low-competition keywords that drive real traffic to your Etsy listings.",
    color: "from-teal-600 to-teal-500",
  },
  {
    icon: TrendingUp,
    title: "Trend Analysis",
    description: "Spot rising niches before they peak and position your shop ahead of the competition.",
    color: "from-teal-500 to-teal-400",
  },
  {
    icon: Store,
    title: "Shop Tracker",
    description: "Analyze top-performing competitor shops and benchmark your performance against the best.",
    color: "from-teal-600 to-teal-400",
  },
  {
    icon: Sparkles,
    title: "Listing Optimizer",
    description: "Get AI-powered SEO scores and actionable tips to improve every listing in your shop.",
    color: "from-teal-700 to-teal-500",
  },
]

const STATS = [
  { value: "50K+", label: "Keywords tracked" },
  { value: "10K+", label: "Shops analyzed" },
  { value: "98%", label: "Seller satisfaction" },
  { value: "3x", label: "Average revenue growth" },
]

const PERKS = [
  "No Etsy experience needed",
  "Real-time market data",
  "Actionable SEO recommendations",
  "Competitor intelligence",
  "Cancel anytime",
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="SellerScout" className="h-9 w-9 drop-shadow-sm" />
            <span className="text-xl font-bold text-teal-600" style={{ fontFamily: 'var(--font-raleway)' }}>
              Seller Scout
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-teal-600 transition-colors">Features</a>
            <a href="#stats" className="hover:text-teal-600 transition-colors">Why Seller Scout</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-teal-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-500/20 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-teal-200/40 to-teal-100/30 blur-3xl" />
          <div className="absolute top-1/2 -left-48 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-teal-100/50 to-teal-50/40 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5 text-sm font-medium text-teal-700 mb-8">
            <Zap className="h-3.5 w-3.5" />
            AI-powered Etsy analytics
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight mb-6">
            Grow your Etsy shop{" "}
            <span className="text-teal-600">
              smarter
            </span>
          </h1>

          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            SellerScout gives Etsy sellers the research tools, competitor insights, and SEO optimization they need to stand out and sell more.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="flex items-center gap-2 px-8 py-4 text-base font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-2xl shadow-lg shadow-teal-500/25 transition-all hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5"
            >
              Start for free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-8 py-4 text-base font-semibold text-slate-700 bg-white border border-slate-200 hover:border-teal-300 hover:text-teal-600 rounded-2xl shadow-sm transition-all"
            >
              Sign in to your account
            </Link>
          </div>

          {/* Perks row */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {PERKS.map((perk) => (
              <span key={perk} className="flex items-center gap-1.5 text-sm text-slate-500">
                <CheckCircle className="h-4 w-4 text-teal-500 flex-shrink-0" />
                {perk}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 px-6 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-4xl font-extrabold text-teal-600 mb-1">
                {value}
              </div>
              <div className="text-sm text-slate-500 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
              Everything you need to win on Etsy
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              A complete toolkit built specifically for Etsy sellers who want data-driven results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map(({ icon: Icon, title, description, color }) => (
              <div
                key={title}
                className="group relative bg-white rounded-2xl border border-slate-100 p-8 shadow-sm hover:shadow-lg hover:shadow-teal-900/5 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br ${color} shadow-md mb-5`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-500 leading-relaxed">{description}</p>
                <div className="mt-5">
                  <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors group-hover:gap-2.5">
                    Explore feature <ArrowRight className="h-3.5 w-3.5 transition-all" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl bg-teal-600 shadow-2xl shadow-teal-500/30 px-10 py-16 text-center">
          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium text-white mb-6">
              <Shield className="h-3.5 w-3.5" />
              Free to get started
            </div>
            <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
              Ready to grow your shop?
            </h2>
            <p className="text-teal-100 text-lg mb-8 max-w-xl mx-auto">
              Join sellers using SellerScout to find winning products, track competitors, and optimize their listings.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="flex items-center gap-2 px-8 py-4 text-base font-bold text-teal-700 bg-white hover:bg-teal-50 rounded-2xl shadow-lg transition-all hover:-translate-y-0.5"
              >
                Create free account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 px-8 py-4 text-base font-semibold text-white border border-white/40 hover:bg-white/10 rounded-2xl transition-all"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="SellerScout" className="h-7 w-7" />
            <span className="text-base font-bold text-teal-600" style={{ fontFamily: 'var(--font-raleway)' }}>
              Seller Scout
            </span>
          </div>
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} Seller Scout. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-teal-600 transition-colors">Privacy Policy</Link>
            <Link href="/login" className="hover:text-teal-600 transition-colors">Sign In</Link>
            <Link href="/login" className="hover:text-teal-600 transition-colors">Get Started</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
