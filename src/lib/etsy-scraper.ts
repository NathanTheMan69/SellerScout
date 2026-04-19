/**
 * Etsy listing scraper — runs server-side only.
 *
 * Three extraction strategies in priority order:
 *  1. __NEXT_DATA__ JSON blob  (richest — has tags, full price, shop name)
 *  2. JSON-LD structured data  (reliable for title/price/shop, tags from HTML)
 *  3. CSS / meta-tag fallback  (last resort)
 *
 * Switch to the real Etsy API by replacing calls to `scrapeEtsyListing`
 * with `getListingDetails` from `@/lib/etsy` once you have your API key.
 */

import * as cheerio from 'cheerio'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScrapedListing {
    url: string
    title: string
    price: string
    currency: string
    shopName: string
    shopUrl: string | null
    tags: string[]
    description: string | null
    imageUrl: string | null
    /** Which strategy successfully extracted the data */
    _source: 'next-data' | 'json-ld' | 'html'
}

export type ScrapeResult =
    | { success: true; listing: ScrapedListing }
    | { success: false; error: string }

// ─── Request headers ──────────────────────────────────────────────────────────

const FETCH_HEADERS: HeadersInit = {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,' +
        'image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Upgrade-Insecure-Requests': '1',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Recursively search an object tree for the first node that matches
 * `predicate`. Stops at depth 12 to prevent runaway searches.
 */
function deepFind<T>(
    obj: unknown,
    predicate: (v: unknown) => v is T,
    depth = 0,
): T | null {
    if (depth > 12 || obj === null || typeof obj !== 'object') return null
    if (predicate(obj)) return obj
    for (const val of Object.values(obj as Record<string, unknown>)) {
        const hit = deepFind(val, predicate, depth + 1)
        if (hit) return hit
    }
    return null
}

function formatPrice(cents: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(cents / 100)
}

/**
 * Extract tags from Etsy's HTML — they're anchor tags linking to
 * `/search?q=<tag>` or `/search?q=<tag>&ref=tag_header_link`
 */
function extractTagsFromHtml($: cheerio.CheerioAPI): string[] {
    const seen = new Set<string>()
    const tags: string[] = []

    $('a[href*="/search?q="]').each((_, el) => {
        const href = $(el).attr('href') ?? ''
        const match = href.match(/\/search\?q=([^&]+)/)
        if (!match) return
        const tag = decodeURIComponent(match[1]).replace(/\+/g, ' ').trim()
        if (tag.length < 2 || tag.length > 45 || seen.has(tag)) return
        seen.add(tag)
        tags.push(tag)
    })

    return tags.slice(0, 13) // Etsy enforces a 13-tag limit
}

// ─── Strategy 1: __NEXT_DATA__ ────────────────────────────────────────────────

interface NextDataListing {
    title: string
    tags: string[]
    description?: string
    price?: { amount: number; currency_code?: string }
    listing_price?: { amount: number; currency_code?: string }
    shop?: { shop_name?: string; url?: string; shop_url?: string }
    shop_name?: string
    images?: { url_fullxfull?: string }[]
    image_url?: string
}

function isNextDataListing(v: unknown): v is NextDataListing {
    if (!v || typeof v !== 'object') return false
    const obj = v as Record<string, unknown>
    return (
        typeof obj.title === 'string' &&
        Array.isArray(obj.tags) &&
        obj.tags.length > 0
    )
}

function fromNextData(
    $: cheerio.CheerioAPI,
    url: string,
): ScrapedListing | null {
    const raw = $('#__NEXT_DATA__').text()
    if (!raw) return null

    let nextData: unknown
    try {
        nextData = JSON.parse(raw)
    } catch {
        return null
    }

    const listing = deepFind(nextData, isNextDataListing)
    if (!listing) return null

    const priceObj = listing.price ?? listing.listing_price
    if (!priceObj) return null

    const currency = priceObj.currency_code ?? 'USD'
    const price = formatPrice(priceObj.amount, currency)
    const shopName = listing.shop?.shop_name ?? listing.shop_name ?? ''
    const shopUrl =
        listing.shop?.url ??
        listing.shop?.shop_url ??
        (shopName ? `https://www.etsy.com/shop/${shopName}` : null)

    return {
        url,
        title: listing.title,
        price,
        currency,
        shopName,
        shopUrl,
        tags: listing.tags,
        description: listing.description ?? null,
        imageUrl: listing.images?.[0]?.url_fullxfull ?? listing.image_url ?? null,
        _source: 'next-data',
    }
}

// ─── Strategy 2: JSON-LD ──────────────────────────────────────────────────────

function fromJsonLd(
    $: cheerio.CheerioAPI,
    url: string,
): ScrapedListing | null {
    let result: ScrapedListing | null = null

    $('script[type="application/ld+json"]').each((_, el) => {
        if (result) return
        let data: unknown
        try {
            data = JSON.parse($(el).text())
        } catch {
            return
        }

        const product = Array.isArray(data)
            ? (data as unknown[]).find(
                  (d): d is Record<string, unknown> =>
                      typeof d === 'object' &&
                      d !== null &&
                      (d as Record<string, unknown>)['@type'] === 'Product',
              )
            : typeof data === 'object' &&
                data !== null &&
                (data as Record<string, unknown>)['@type'] === 'Product'
              ? (data as Record<string, unknown>)
              : null

        if (!product) return

        const title = String(product.name ?? '')
        if (!title) return

        const offers = product.offers as Record<string, unknown> | undefined
        const rawPrice = parseFloat(String(offers?.price ?? 0))
        if (!rawPrice) return

        const currency = String(offers?.priceCurrency ?? 'USD')
        const price = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
        }).format(rawPrice)

        const brand = product.brand as Record<string, unknown> | undefined
        const shopName = String(brand?.name ?? '')
        const shopUrl = shopName
            ? `https://www.etsy.com/shop/${shopName}`
            : null

        const imageRaw = product.image
        const imageUrl = Array.isArray(imageRaw)
            ? String(imageRaw[0] ?? '')
            : String(imageRaw ?? '') || null

        result = {
            url,
            title,
            price,
            currency,
            shopName,
            shopUrl,
            tags: extractTagsFromHtml($),
            description: String(product.description ?? '') || null,
            imageUrl: imageUrl || null,
            _source: 'json-ld',
        }
    })

    return result
}

// ─── Strategy 3: HTML / meta fallback ────────────────────────────────────────

function fromHtml(
    $: cheerio.CheerioAPI,
    url: string,
): ScrapedListing | null {
    const title =
        $('h1[data-buy-box-listing-title]').first().text().trim() ||
        $('h1').first().text().trim() ||
        $('meta[property="og:title"]').attr('content') ||
        ''

    if (!title) return null

    // Etsy price can appear as data-price attr or text
    const rawPrice =
        $('[data-price]').first().attr('data-price') ||
        $('p[class*="price"]').first().text().replace(/[^0-9.]/g, '') ||
        $('meta[property="product:price:amount"]').attr('content') ||
        ''

    const price = rawPrice
        ? `$${parseFloat(rawPrice).toFixed(2)}`
        : 'See listing'

    // Shop name from shop link
    const shopName =
        $('a[href*="/shop/"]').not('[href*="listing"]').first().text().trim() ||
        ''
    const shopHref = $('a[href*="/shop/"]').not('[href*="listing"]').first().attr('href') ?? null
    const shopUrl = shopHref
        ? shopHref.startsWith('http')
            ? shopHref
            : `https://www.etsy.com${shopHref}`
        : null

    const imageUrl =
        $('meta[property="og:image"]').attr('content') ||
        $('img[data-listing-image]').first().attr('src') ||
        null

    const description =
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="description"]').attr('content') ||
        null

    return {
        url,
        title,
        price,
        currency: 'USD',
        shopName,
        shopUrl,
        tags: extractTagsFromHtml($),
        description,
        imageUrl,
        _source: 'html',
    }
}

// ─── Strategy helpers shared by search + shop scrapers ───────────────────────

/** Find the first plain array of objects whose items look like Etsy listings */
function isListingArray(v: unknown): v is Record<string, unknown>[] {
    if (!Array.isArray(v) || v.length === 0) return false
    const first = v[0]
    if (!first || typeof first !== 'object') return false
    const f = first as Record<string, unknown>
    return (
        (typeof f.listing_id === 'number' || typeof f.listing_id === 'string') &&
        typeof f.title === 'string'
    )
}

// ─── Search scraper ───────────────────────────────────────────────────────────

export interface ScrapedSearchListing {
    listing_id: number
    title: string
    price: { amount: number; divisor: number; currency_code: string }
    url: string
    tags: string[]
    num_favorers: number
    images: { url_570xN: string; url_fullxfull: string }[]
    shop?: { shop_name: string }
}

/**
 * Scrape Etsy search results for a keyword.
 * Returns listings in the same shape that `analyzeSearchResults` in analyzer.ts expects.
 */
export async function scrapeEtsySearch(
    keyword: string,
    limit = 24,
): Promise<ScrapedSearchListing[]> {
    const url = `https://www.etsy.com/search?q=${encodeURIComponent(keyword)}&explicit=1`

    const res = await fetch(url, {
        headers: FETCH_HEADERS,
        signal: AbortSignal.timeout(12_000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching search results`)
    const html = await res.text()
    const $ = cheerio.load(html)

    // ── Try __NEXT_DATA__ first ────────────────────────────────────────────────
    const raw = $('#__NEXT_DATA__').text()
    if (raw) {
        try {
            const nextData = JSON.parse(raw)
            const listings = deepFind(nextData, isListingArray)
            if (listings && listings.length > 0) {
                return listings.slice(0, limit).map(normaliseSearchListing)
            }
        } catch { /* fall through */ }
    }

    // ── CSS fallback — extract from listing cards ──────────────────────────────
    const results: ScrapedSearchListing[] = []
    $('a[href*="/listing/"]').each((_, el) => {
        if (results.length >= limit) return
        const href = $(el).attr('href') ?? ''
        const titleEl = $(el).find('h3, [class*="title"], [data-listing-title]').first()
        const title = titleEl.text().trim() || $(el).attr('aria-label') || ''
        if (!title || title.length < 3) return

        const idMatch = href.match(/\/listing\/(\d+)/)
        const listing_id = idMatch ? parseInt(idMatch[1]) : Date.now() + results.length

        const priceText = $(el).find('[class*="price"]').first().text().replace(/[^0-9.]/g, '')
        const priceCents = priceText ? Math.round(parseFloat(priceText) * 100) : 0

        const imgSrc = $(el).find('img').first().attr('src') ?? ''

        results.push({
            listing_id,
            title,
            price: { amount: priceCents, divisor: 100, currency_code: 'USD' },
            url: href.startsWith('http') ? href : `https://www.etsy.com${href}`,
            tags: [],
            num_favorers: 0,
            images: imgSrc ? [{ url_570xN: imgSrc, url_fullxfull: imgSrc }] : [],
        })
    })
    return results
}

function normaliseSearchListing(raw: Record<string, unknown>): ScrapedSearchListing {
    const price = (raw.price as Record<string, unknown> | undefined) ??
        (raw.listing_price as Record<string, unknown> | undefined)
    const amount = typeof price?.amount === 'number' ? price.amount : 0
    const divisor = typeof price?.divisor === 'number' ? price.divisor : 100
    const currency = typeof price?.currency_code === 'string' ? price.currency_code : 'USD'

    const images = Array.isArray(raw.images)
        ? (raw.images as Record<string, unknown>[]).map((img) => ({
              url_570xN: String(img.url_570xN ?? img.url_fullxfull ?? ''),
              url_fullxfull: String(img.url_fullxfull ?? ''),
          }))
        : []

    const shop = raw.shop as Record<string, unknown> | undefined

    return {
        listing_id: Number(raw.listing_id),
        title: String(raw.title ?? ''),
        price: { amount, divisor, currency_code: currency },
        url: String(raw.url ?? raw.listing_url ?? ''),
        tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
        num_favorers: Number(raw.num_favorers ?? 0),
        images,
        shop: shop ? { shop_name: String(shop.shop_name ?? '') } : undefined,
    }
}

// ─── Shop scraper ─────────────────────────────────────────────────────────────

export interface ScrapedShopReport {
    details: {
        shop_id: number
        shop_name: string
        title: string | null
        icon_url_fullxfull: string | null
        url: string
        transaction_sold_count: number
        num_favorers: number
        review_count: number | null
        review_average: number | null
        creation_tsz: number
    }
    bestsellers: {
        listing_id: number
        title: string
        price: string
        num_favorers: number
        image_url: string | null
    }[]
    metrics: {
        average_price: number
        total_active_listings: number
        shop_age_months: number
        top_tags: { tag: string; count: number }[]
    }
}

/**
 * Scrape an Etsy shop page by shop name.
 * Returns data shaped identically to `ShopReport` in shop-analyzer.ts.
 */
export async function scrapeEtsyShop(shopName: string): Promise<ScrapedShopReport | null> {
    const url = `https://www.etsy.com/shop/${encodeURIComponent(shopName)}`

    let html: string
    try {
        const res = await fetch(url, {
            headers: FETCH_HEADERS,
            signal: AbortSignal.timeout(12_000),
        })
        if (!res.ok) return null
        html = await res.text()
    } catch {
        return null
    }

    const $ = cheerio.load(html)

    // ── Try __NEXT_DATA__ ──────────────────────────────────────────────────────
    const raw = $('#__NEXT_DATA__').text()
    if (raw) {
        try {
            const nextData = JSON.parse(raw)

            // Locate the shop object (has shop_name + transaction_sold_count)
            const shopObj = deepFind(
                nextData,
                (v): v is Record<string, unknown> =>
                    !!v &&
                    typeof v === 'object' &&
                    typeof (v as Record<string, unknown>).shop_name === 'string' &&
                    typeof (v as Record<string, unknown>).transaction_sold_count === 'number',
            )

            if (shopObj) {
                // Locate listings array inside nextData
                const listingsArr = deepFind(nextData, isListingArray) ?? []

                return buildShopReport(shopName, url, shopObj, listingsArr)
            }
        } catch { /* fall through */ }
    }

    // ── HTML fallback ──────────────────────────────────────────────────────────
    const title = $('meta[property="og:title"]').attr('content') ?? shopName
    const icon = $('meta[property="og:image"]').attr('content') ?? null

    // Sales count often appears as "X Sales" near the shop header
    const salesText = $('body').text().match(/([0-9,]+)\s*[Ss]ales/)
    const sales = salesText ? parseInt(salesText[1].replace(/,/g, '')) : 0

    const listings: Record<string, unknown>[] = []
    $('a[href*="/listing/"]').each((_, el) => {
        if (listings.length >= 12) return
        const href = $(el).attr('href') ?? ''
        const itemTitle = $(el).find('h3, [class*="title"]').first().text().trim()
        const imgSrc = $(el).find('img').first().attr('src') ?? ''
        const priceText = $(el).find('[class*="price"]').first().text().replace(/[^0-9.]/g, '')
        const idMatch = href.match(/\/listing\/(\d+)/)
        if (!itemTitle) return
        listings.push({
            listing_id: idMatch ? parseInt(idMatch[1]) : listings.length,
            title: itemTitle,
            price: { amount: priceText ? Math.round(parseFloat(priceText) * 100) : 0, divisor: 100, currency_code: 'USD' },
            num_favorers: 0,
            images: imgSrc ? [{ url_570xN: imgSrc, url_fullxfull: imgSrc }] : [],
        })
    })

    return buildShopReport(shopName, url, {
        shop_name: shopName,
        title: title.replace(/ on Etsy$/, '').trim(),
        icon_url_fullxfull: icon,
        transaction_sold_count: sales,
        num_favorers: 0,
        review_count: null,
        review_average: null,
        creation_tsz: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 365 * 2,
        shop_id: 0,
    }, listings)
}

function buildShopReport(
    shopName: string,
    url: string,
    shopObj: Record<string, unknown>,
    listings: Record<string, unknown>[],
): ScrapedShopReport {
    const prices = listings.map((l) => {
        const p = l.price as Record<string, unknown> | undefined
        const amount = typeof p?.amount === 'number' ? p.amount : 0
        const divisor = typeof p?.divisor === 'number' ? p.divisor : 100
        return amount / divisor
    }).filter((p) => p > 0)

    const avgPrice = prices.length
        ? parseFloat((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2))
        : 0

    // Tag frequency map
    const tagCounts: Record<string, number> = {}
    listings.forEach((l) => {
        if (Array.isArray(l.tags)) {
            l.tags.forEach((t: unknown) => {
                const tag = String(t).toLowerCase()
                tagCounts[tag] = (tagCounts[tag] ?? 0) + 1
            })
        }
    })
    const top_tags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count }))

    const creationTs = typeof shopObj.creation_tsz === 'number'
        ? shopObj.creation_tsz
        : Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 365 * 2

    const ageMonths = Math.round(
        (Date.now() / 1000 - creationTs) / (60 * 60 * 24 * 30),
    )

    const bestsellers = listings.slice(0, 9).map((l, i) => {
        const p = l.price as Record<string, unknown> | undefined
        const amount = typeof p?.amount === 'number' ? p.amount : 0
        const divisor = typeof p?.divisor === 'number' ? p.divisor : 100
        const imgs = Array.isArray(l.images) ? (l.images as Record<string, unknown>[]) : []
        return {
            listing_id: Number(l.listing_id ?? i),
            title: String(l.title ?? ''),
            price: `$${(amount / divisor).toFixed(2)}`,
            num_favorers: Number(l.num_favorers ?? 0),
            image_url: imgs[0] ? String(imgs[0].url_570xN ?? imgs[0].url_fullxfull ?? '') || null : null,
        }
    })

    return {
        details: {
            shop_id: Number(shopObj.shop_id ?? 0),
            shop_name: String(shopObj.shop_name ?? shopName),
            title: shopObj.title ? String(shopObj.title) : null,
            icon_url_fullxfull: shopObj.icon_url_fullxfull ? String(shopObj.icon_url_fullxfull) : null,
            url: shopObj.url ? String(shopObj.url) : url,
            transaction_sold_count: Number(shopObj.transaction_sold_count ?? 0),
            num_favorers: Number(shopObj.num_favorers ?? 0),
            review_count: shopObj.review_count != null ? Number(shopObj.review_count) : null,
            review_average: shopObj.review_average != null ? Number(shopObj.review_average) : null,
            creation_tsz: creationTs,
        },
        bestsellers,
        metrics: {
            average_price: avgPrice,
            total_active_listings: listings.length,
            shop_age_months: ageMonths,
            top_tags,
        },
    }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Scrape a single Etsy listing URL.
 *
 * @example
 * const result = await scrapeEtsyListing('https://www.etsy.com/listing/123/my-item')
 * if (result.success) {
 *   console.log(result.listing.title, result.listing.price, result.listing.tags)
 * }
 */
export async function scrapeEtsyListing(url: string): Promise<ScrapeResult> {
    if (!url.includes('etsy.com/listing')) {
        return { success: false, error: 'URL must be an Etsy listing URL (etsy.com/listing/...)' }
    }

    let html: string
    try {
        const res = await fetch(url, {
            headers: FETCH_HEADERS,
            signal: AbortSignal.timeout(12_000),
        })

        if (res.status === 403) {
            return {
                success: false,
                error: 'Etsy blocked the request (403). This occasionally happens — try again in a few seconds.',
            }
        }
        if (res.status === 429) {
            return {
                success: false,
                error: 'Rate limited by Etsy (429). Wait a moment before retrying.',
            }
        }
        if (!res.ok) {
            return { success: false, error: `HTTP ${res.status}: ${res.statusText}` }
        }

        html = await res.text()
    } catch (err: unknown) {
        const e = err as { name?: string; message?: string }
        if (e.name === 'TimeoutError') {
            return { success: false, error: 'Request timed out after 12 seconds.' }
        }
        return { success: false, error: e.message ?? 'Network error' }
    }

    const $ = cheerio.load(html)

    const listing =
        fromNextData($, url) ??
        fromJsonLd($, url) ??
        fromHtml($, url)

    if (!listing) {
        return {
            success: false,
            error: 'Could not extract listing data. Etsy may have changed their page structure.',
        }
    }

    return { success: true, listing }
}

/**
 * Scrape multiple listings with a small delay between requests
 * to avoid triggering Etsy's rate limiter.
 */
export async function scrapeEtsyListings(
    urls: string[],
    delayMs = 800,
): Promise<ScrapeResult[]> {
    const results: ScrapeResult[] = []
    for (let i = 0; i < urls.length; i++) {
        if (i > 0) await new Promise((r) => setTimeout(r, delayMs))
        results.push(await scrapeEtsyListing(urls[i]))
    }
    return results
}
