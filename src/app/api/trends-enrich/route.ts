import { NextResponse } from 'next/server'
import { scrapeEtsySearch } from '@/lib/etsy-scraper'

export const revalidate = 3600

const TREND_KEYWORDS: { id: string; keyword: string }[] = [
    { id: 's1',  keyword: 'digital planner 2025' },
    { id: 's2',  keyword: 'personalized leather gift' },
    { id: 's3',  keyword: 'minimalist wall art' },
    { id: 's4',  keyword: 'custom name necklace' },
    { id: 's5',  keyword: 'beaded bracelet set' },
    { id: 's6',  keyword: 'macrame wall hanging' },
    { id: 's7',  keyword: 'custom pet portrait' },
    { id: 's8',  keyword: 'printable budget planner' },
    { id: 's9',  keyword: 'boho wedding decor' },
    { id: 's10', keyword: 'handmade soy candle' },
    { id: 's11', keyword: 'personalized baby gift' },
    { id: 's12', keyword: 'sticker pack' },
    { id: 's13', keyword: 'vintage style ring' },
    { id: 's14', keyword: 'nursery wall art printable' },
    { id: 's15', keyword: 'chunky knit blanket' },
    { id: 's16', keyword: 'custom wedding invitation' },
    { id: 's17', keyword: 'embroidery hoop art' },
    { id: 's18', keyword: 'resin coaster set' },
    { id: 's19', keyword: 'dad gifts from daughter' },
    { id: 's20', keyword: 'planner sticker sheet' },
    { id: 's21', keyword: 'crystal healing set' },
    { id: 's22', keyword: 'pressed flower bookmark' },
    { id: 's23', keyword: 'gold initial necklace' },
    { id: 's24', keyword: 'custom dog bandana' },
    { id: 's25', keyword: 'affirmation card deck' },
    { id: 's26', keyword: 'personalised mug' },
    { id: 's27', keyword: 'crochet baby blanket' },
    { id: 's28', keyword: 'motivational poster' },
    { id: 's29', keyword: 'handmade leather wallet' },
    { id: 's30', keyword: 'dried flower wreath' },
]

async function enrichTrend(id: string, keyword: string) {
    const listings = await scrapeEtsySearch(keyword, 6)
    const imageUrl =
        listings.find((l) => l.images?.[0]?.url_570xN?.startsWith('http'))
            ?.images?.[0]?.url_570xN ?? null

    const prices = listings
        .map((l) => l.price.amount / l.price.divisor)
        .filter((p) => p > 0)
        .sort((a, b) => a - b)

    let avg_price: string | null = null
    if (prices.length >= 2) {
        avg_price = `$${prices[0].toFixed(0)}–$${prices[prices.length - 1].toFixed(0)}`
    } else if (prices.length === 1) {
        avg_price = `$${prices[0].toFixed(2)}`
    }

    return { id, imageUrl, avg_price }
}

export async function GET() {
    const settled = await Promise.allSettled(
        TREND_KEYWORDS.map(({ id, keyword }) => enrichTrend(id, keyword)),
    )

    const enriched: Record<string, { imageUrl: string | null; avg_price: string | null }> = {}

    settled.forEach((result, i) => {
        const { id } = TREND_KEYWORDS[i]
        if (result.status === 'fulfilled' && result.value.imageUrl) {
            enriched[id] = {
                imageUrl: result.value.imageUrl,
                avg_price: result.value.avg_price,
            }
        }
    })

    return NextResponse.json(enriched)
}
