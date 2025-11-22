export interface EtsyListing {
    listing_id: number;
    title: string;
    price: {
        amount: number;
        divisor: number;
        currency_code: string;
    };
    url: string;
    tags: string[];
    images: {
        url_570xN: string;
        url_fullxfull: string;
    }[];
}

export interface Listing {
    id: number;
    title: string;
    price: number;
    currency: string;
    imageUrl: string;
    link: string;
}

export interface AnalysisResult {
    stats: {
        averagePrice: number;
        minPrice: number;
        maxPrice: number;
        listingCount: number;
    };
    topTags: { tag: string; count: number; averagePrice: number }[];
    cleanedListings: Listing[];
}

export function analyzeSearchResults(rawListings: any[], searchKeyword?: string): AnalysisResult {
    // 1. Clean and Map Listings
    const cleanedListings: Listing[] = rawListings.map((item: any) => {
        // Handle price calculation safely
        const amount = item.price?.amount || 0;
        const divisor = item.price?.divisor || 100;
        const price = amount / divisor;

        // Get first image safely
        const imageUrl = item.images && item.images.length > 0
            ? item.images[0].url_570xN
            : '';

        return {
            id: item.listing_id,
            title: item.title,
            price: price,
            currency: item.price?.currency_code || 'USD',
            imageUrl: imageUrl,
            link: item.url
        };
    });

    if (cleanedListings.length === 0) {
        return {
            stats: { averagePrice: 0, minPrice: 0, maxPrice: 0, listingCount: 0 },
            topTags: [],
            cleanedListings: []
        };
    }

    // 2. Calculate Stats
    const prices = cleanedListings.map(l => l.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const total = prices.reduce((sum, p) => sum + p, 0);
    const averagePrice = parseFloat((total / prices.length).toFixed(2));

    // 3. Analyze Tags
    const tagData: Record<string, { count: number; totalPrice: number }> = {};
    const normalizedSearchTerm = searchKeyword ? searchKeyword.toLowerCase() : '';

    cleanedListings.forEach((listing, index) => {
        const rawItem = rawListings[index];
        if (rawItem.tags && Array.isArray(rawItem.tags)) {
            rawItem.tags.forEach((tag: string) => {
                const normalizedTag = tag.toLowerCase();
                // Exclude the search keyword itself to find *related* tags
                if (normalizedTag !== normalizedSearchTerm) {
                    if (!tagData[normalizedTag]) {
                        tagData[normalizedTag] = { count: 0, totalPrice: 0 };
                    }
                    tagData[normalizedTag].count += 1;
                    tagData[normalizedTag].totalPrice += listing.price;
                }
            });
        }
    });

    // Sort tags by frequency and take top 10
    const topTags = Object.entries(tagData)
        .map(([tag, data]) => ({
            tag,
            count: data.count,
            averagePrice: parseFloat((data.totalPrice / data.count).toFixed(2))
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    return {
        stats: {
            averagePrice,
            minPrice,
            maxPrice,
            listingCount: cleanedListings.length
        },
        topTags,
        cleanedListings
    };
}
