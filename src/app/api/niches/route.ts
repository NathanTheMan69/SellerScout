import { NextResponse } from 'next/server'
import { scrapeEtsySearch } from '@/lib/etsy-scraper'

// Cache this route for 1 hour — first call scrapes Etsy, all subsequent calls
// are served instantly from Next.js's data cache until the TTL expires.
export const revalidate = 3600

const NICHE_KEYWORDS: { id: string; keyword: string }[] = [
    { id: 'n1',  keyword: 'minimalist jewelry' },
    { id: 'n2',  keyword: 'printable wall art' },
    { id: 'n3',  keyword: 'digital planner' },
    { id: 'n4',  keyword: 'handmade soy candle' },
    { id: 'n5',  keyword: 'custom shirt' },
    { id: 'n6',  keyword: 'macrame wall hanging' },
    { id: 'n7',  keyword: 'personalized gift' },
    { id: 'n8',  keyword: 'nursery decor' },
    { id: 'n9',  keyword: 'beaded bracelet set' },
    { id: 'n10', keyword: 'custom pet portrait' },
    { id: 'n11', keyword: 'sticker pack' },
    { id: 'n12', keyword: 'boho wedding decor' },
    { id: 'n13', keyword: 'embroidery hoop art' },
    { id: 'n14', keyword: 'resin coaster set' },
    { id: 'n15', keyword: 'crystal healing set' },
    { id: 'n16', keyword: 'wax seal stamp kit' },
    { id: 'n17', keyword: 'custom dog bandana' },
    { id: 'n18', keyword: 'affirmation card deck' },
    { id: 'n19', keyword: 'dried flower bouquet' },
    { id: 'n20', keyword: 'birth flower necklace' },
    { id: 'n21', keyword: 'clay earrings handmade' },
    { id: 'n22', keyword: 'mushroom art print' },
    { id: 'n23', keyword: 'tarot card deck' },
    { id: 'n24', keyword: 'personalized keychain' },
    { id: 'n25', keyword: 'linen tote bag' },
    { id: 'n26', keyword: 'terracotta planter' },
    { id: 'n27', keyword: 'moon phase wall decor' },
    { id: 'n28', keyword: 'friendship bracelet kit' },
    { id: 'n29', keyword: 'custom star map' },
    { id: 'n30', keyword: 'gratitude journal' },
]

/** Scrape one keyword and return enriched image + price data */
async function enrichNiche(id: string, keyword: string) {
    const listings = await scrapeEtsySearch(keyword, 8)

    // Best image: pick the first listing with a usable image
    const imageUrl =
        listings.find((l) => l.images?.[0]?.url_570xN?.startsWith('http'))
            ?.images?.[0]?.url_570xN ?? null

    // Price range from real listings
    const prices = listings
        .map((l) => l.price.amount / l.price.divisor)
        .filter((p) => p > 0)
        .sort((a, b) => a - b)

    let avgPrice: string | null = null
    if (prices.length >= 2) {
        avgPrice = `$${prices[0].toFixed(0)}–$${prices[prices.length - 1].toFixed(0)}`
    } else if (prices.length === 1) {
        avgPrice = `$${prices[0].toFixed(2)}`
    }

    // Total favorites as a proxy for demand
    const totalFavorers = listings.reduce((sum, l) => sum + (l.num_favorers ?? 0), 0)

    return { id, imageUrl, avgPrice, totalFavorers, listingCount: listings.length }
}

export async function GET() {
    // Scrape all niches in parallel — Next.js's fetch cache means each
    // individual Etsy page request is also cached for the revalidate window.
    const settled = await Promise.allSettled(
        NICHE_KEYWORDS.map(({ id, keyword }) => enrichNiche(id, keyword)),
    )

    const enriched: Record<string, { imageUrl: string | null; avgPrice: string | null; totalFavorers: number }> = {}

    settled.forEach((result, i) => {
        const { id } = NICHE_KEYWORDS[i]
        if (result.status === 'fulfilled' && result.value.imageUrl) {
            enriched[id] = {
                imageUrl: result.value.imageUrl,
                avgPrice: result.value.avgPrice,
                totalFavorers: result.value.totalFavorers,
            }
        }
        // Silently skip failed scrapes — page keeps its fallback image
    })

    return NextResponse.json(enriched)
}
