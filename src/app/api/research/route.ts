import { NextResponse } from 'next/server'
import { searchEtsyListings } from '@/lib/etsy'
import { scrapeEtsySearch } from '@/lib/etsy-scraper'
import { analyzeSearchResults } from '@/lib/analyzer'

export async function POST(request: Request) {
    try {
        const { keyword } = await request.json()

        if (!keyword) {
            return NextResponse.json({ error: 'Keyword is required' }, { status: 400 })
        }

        // ── Try official API first ───────────────────────────────────────────────
        const apiKey = process.env.ETSY_API_KEY
        if (apiKey) {
            try {
                const etsyData = await searchEtsyListings(keyword)
                if (etsyData.results?.length) {
                    const analysis = analyzeSearchResults(etsyData.results, keyword)
                    return NextResponse.json({ ...analysis, _source: 'api' })
                }
            } catch { /* fall through to scraper */ }
        }

        // ── Scraper fallback ─────────────────────────────────────────────────────
        const listings = await scrapeEtsySearch(keyword, 24)
        if (!listings.length) {
            return NextResponse.json(
                { error: 'No listings found for this keyword.' },
                { status: 404 },
            )
        }

        const analysis = analyzeSearchResults(listings, keyword)
        return NextResponse.json({ ...analysis, _source: 'scraper' })

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Internal Server Error'
        const status = msg.includes('403') ? 403 : 500
        console.error('Research API error:', msg)
        return NextResponse.json({ error: msg }, { status })
    }
}
