import { NextResponse } from 'next/server'
import { extractListingIdFromUrl } from '@/lib/utils'
import { getListingDetails, searchEtsyListings } from '@/lib/etsy'
import { scrapeEtsyListing, scrapeEtsySearch } from '@/lib/etsy-scraper'
import { analyzeSearchResults } from '@/lib/analyzer'

export async function POST(request: Request) {
    try {
        const { query } = await request.json()

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 })
        }

        const listingId = extractListingIdFromUrl(query)

        if (listingId) {
            // ── Listing URL path ─────────────────────────────────────────────────
            // Try official API first; fall back to scraper
            const apiKey = process.env.ETSY_API_KEY
            if (apiKey) {
                try {
                    const data = await getListingDetails(listingId)
                    return NextResponse.json({ type: 'listing', data, _source: 'api' })
                } catch { /* fall through to scraper */ }
            }

            // Scraper path — reconstruct a full URL from the listing ID
            const listingUrl = query.startsWith('http')
                ? query
                : `https://www.etsy.com/listing/${listingId}`

            const result = await scrapeEtsyListing(listingUrl)
            if (!result.success) {
                return NextResponse.json({ error: result.error }, { status: 422 })
            }

            // Shape the scraped data to match what the frontend expects
            return NextResponse.json({
                type: 'listing',
                data: {
                    listing_id: parseInt(listingId),
                    title: result.listing.title,
                    description: result.listing.description,
                    price: {
                        amount: Math.round(parseFloat(result.listing.price.replace(/[^0-9.]/g, '')) * 100),
                        divisor: 100,
                        currency_code: result.listing.currency,
                    },
                    url: result.listing.url,
                    tags: result.listing.tags,
                    shop: { shop_name: result.listing.shopName },
                    images: result.listing.imageUrl
                        ? [{ url_570xN: result.listing.imageUrl, url_fullxfull: result.listing.imageUrl }]
                        : [],
                },
                _source: 'scraper',
            })

        } else {
            // ── Keyword search path ──────────────────────────────────────────────
            const apiKey = process.env.ETSY_API_KEY
            if (apiKey) {
                try {
                    const etsyData = await searchEtsyListings(query)
                    if (etsyData.results?.length) {
                        const analysis = analyzeSearchResults(etsyData.results, query)
                        return NextResponse.json({ type: 'search', data: analysis, _source: 'api' })
                    }
                } catch { /* fall through to scraper */ }
            }

            const listings = await scrapeEtsySearch(query)
            if (!listings.length) {
                return NextResponse.json({ error: 'No results found for that keyword.' }, { status: 404 })
            }
            const analysis = analyzeSearchResults(listings, query)
            return NextResponse.json({ type: 'search', data: analysis, _source: 'scraper' })
        }

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Internal Server Error'
        const status = msg.includes('403') ? 403 : 500
        console.error('Analyze API error:', msg)
        return NextResponse.json({ error: msg }, { status })
    }
}
