import { NextRequest, NextResponse } from 'next/server'
import { scrapeEtsyListing, scrapeEtsyListings } from '@/lib/etsy-scraper'

/**
 * GET  /api/scrape?url=https://www.etsy.com/listing/...
 * POST /api/scrape  { urls: [...] }   ← batch up to 10 listings
 */

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url')

    if (!url) {
        return NextResponse.json(
            { error: 'Missing ?url= query parameter' },
            { status: 400 },
        )
    }

    const result = await scrapeEtsyListing(url)

    if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 422 })
    }

    return NextResponse.json(result.listing)
}

export async function POST(req: NextRequest) {
    let body: { urls?: unknown }
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    if (!Array.isArray(body.urls) || body.urls.length === 0) {
        return NextResponse.json(
            { error: 'Body must contain a non-empty "urls" array' },
            { status: 400 },
        )
    }

    if (body.urls.length > 10) {
        return NextResponse.json(
            { error: 'Maximum 10 URLs per batch request' },
            { status: 400 },
        )
    }

    const urls = body.urls.filter((u): u is string => typeof u === 'string')
    const results = await scrapeEtsyListings(urls)

    const succeeded = results
        .filter((r) => r.success)
        .map((r) => (r as Extract<typeof r, { success: true }>).listing)
    const failed = results
        .filter((r) => !r.success)
        .map((r) => (r as Extract<typeof r, { success: false }>).error)

    return NextResponse.json({ listings: succeeded, errors: failed })
}
