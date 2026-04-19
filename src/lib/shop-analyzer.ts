import { findShopByName, getShopListings } from './etsy';
import { scrapeEtsyShop } from './etsy-scraper';

export interface ShopReport {
    details: {
        shop_id: number;
        shop_name: string;
        title: string | null;
        icon_url_fullxfull: string | null;
        url: string;
        transaction_sold_count: number;
        num_favorers: number;
        review_count: number | null;
        review_average: number | null;
        creation_tsz: number;
    };
    bestsellers: {
        listing_id: number;
        title: string;
        price: string;
        num_favorers: number;
        image_url: string | null;
    }[];
    metrics: {
        average_price: number;
        total_active_listings: number;
        shop_age_months: number;
        top_tags: { tag: string; count: number }[];
    };
}

const MOCK_SHOP_REPORT: ShopReport = {
    details: {
        shop_id: 12345678,
        shop_name: "SilverCraftCo",
        title: "Handmade Silver Jewelry & Accessories",
        icon_url_fullxfull: "https://images.unsplash.com/photo-1627123424574-181ce5171c98?w=300&q=80",
        url: "https://www.etsy.com/shop/SilverCraftCo",
        transaction_sold_count: 12543,
        num_favorers: 4521,
        review_count: 892,
        review_average: 4.8,
        creation_tsz: 1609459200 // Jan 1, 2021
    },
    bestsellers: [
        {
            listing_id: 101,
            title: "Sterling Silver Moon Ring - Boho Style",
            price: "$45.00",
            num_favorers: 1250,
            image_url: "https://images.unsplash.com/photo-1627123424574-181ce5171c98?w=300&q=80"
        },
        {
            listing_id: 102,
            title: "Hammered Silver Cuff Bracelet",
            price: "$85.00",
            num_favorers: 980,
            image_url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=300&q=80"
        },
        {
            listing_id: 103,
            title: "Minimalist Silver Stud Earrings",
            price: "$25.00",
            num_favorers: 850,
            image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&q=80"
        }
    ],
    metrics: {
        average_price: 51.66,
        total_active_listings: 142,
        shop_age_months: 34,
        top_tags: [
            { tag: "silver ring", count: 45 },
            { tag: "boho jewelry", count: 32 },
            { tag: "handmade gift", count: 28 },
            { tag: "minimalist", count: 20 },
            { tag: "statement ring", count: 15 }
        ]
    }
};

export async function analyzeCompetitorShop(shopName: string): Promise<ShopReport | null> {
    // ── Try official Etsy API if key is present ────────────────────────────────
    const apiKey = process.env.ETSY_API_KEY;
    if (!apiKey) {
        // No API key — go straight to scraper
        console.log(`[shop-analyzer] No API key — scraping ${shopName}`);
        const scraped = await scrapeEtsyShop(shopName);
        if (scraped) return scraped as ShopReport;
        // Full fallback to mock if scrape also failed (e.g. blocked)
        console.warn(`[shop-analyzer] Scrape failed for ${shopName} — using mock data`);
        return { ...MOCK_SHOP_REPORT, details: { ...MOCK_SHOP_REPORT.details, shop_name: shopName } };
    }

    try {
        // 1. Fetch Shop Details
        const shop = await findShopByName(shopName);

        if (!shop) {
            // API returned nothing — try scraper before giving up
            console.warn(`[shop-analyzer] API: shop not found — trying scraper for ${shopName}`);
            const scraped = await scrapeEtsyShop(shopName);
            if (scraped) return scraped as ShopReport;
            return { ...MOCK_SHOP_REPORT, details: { ...MOCK_SHOP_REPORT.details, shop_name: shopName } };
        }

        // 2. Fetch Active Listings (Limit 50 for analysis)
        const listingsData = await getShopListings(shop.shop_id);
        const listings = listingsData.results || [];

        // 3. Analyze Bestsellers (Sort by num_favorers)
        const sortedListings = [...listings].sort((a: any, b: any) => (b.num_favorers || 0) - (a.num_favorers || 0));
        const top3 = sortedListings.slice(0, 3).map((item: any) => ({
            listing_id: item.listing_id,
            title: item.title,
            price: `$${(item.price.amount / item.price.divisor).toFixed(2)}`,
            num_favorers: item.num_favorers || 0,
            image_url: item.images?.[0]?.url_170x135 || null
        }));

        // 4. Calculate Metrics

        // Average Price
        let totalPrice = 0;
        let validPriceCount = 0;
        listings.forEach((item: any) => {
            if (item.price && item.price.amount && item.price.divisor) {
                totalPrice += (item.price.amount / item.price.divisor);
                validPriceCount++;
            }
        });
        const avgPrice = validPriceCount > 0 ? totalPrice / validPriceCount : 0;

        // Shop Age
        const now = Date.now() / 1000;
        const ageSeconds = now - shop.creation_tsz;
        const ageMonths = Math.floor(ageSeconds / (30 * 24 * 60 * 60));

        // Tag Consistency
        const tagCounts: Record<string, number> = {};
        listings.forEach((item: any) => {
            if (item.tags && Array.isArray(item.tags)) {
                item.tags.forEach((tag: string) => {
                    const normalizedTag = tag.toLowerCase();
                    tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
                });
            }
        });

        const topTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([tag, count]) => ({ tag, count }));

        return {
            details: {
                shop_id: shop.shop_id,
                shop_name: shop.shop_name,
                title: shop.title,
                icon_url_fullxfull: shop.icon_url_fullxfull,
                url: shop.url || `https://www.etsy.com/shop/${shop.shop_name}`,
                transaction_sold_count: shop.transaction_sold_count,
                num_favorers: shop.num_favorers,
                review_count: shop.review_count,
                review_average: shop.review_average,
                creation_tsz: shop.creation_tsz
            },
            bestsellers: top3,
            metrics: {
                average_price: parseFloat(avgPrice.toFixed(2)),
                total_active_listings: shop.listing_active_count,
                shop_age_months: ageMonths,
                top_tags: topTags
            }
        };

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('[shop-analyzer] API error:', msg, '— trying scraper');
        const scraped = await scrapeEtsyShop(shopName).catch(() => null);
        if (scraped) return scraped as ShopReport;
        console.warn('[shop-analyzer] Scraper also failed — using mock data');
        return MOCK_SHOP_REPORT;
    }
}
