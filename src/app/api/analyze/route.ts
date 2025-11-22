import { NextResponse } from 'next/server';
import { extractListingIdFromUrl } from '@/lib/utils';
import { getListingDetails, searchEtsyListings } from '@/lib/etsy';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { query } = body;

        if (!query) {
            return NextResponse.json(
                { error: 'Query is required' },
                { status: 400 }
            );
        }

        // Smart Detection
        const listingId = extractListingIdFromUrl(query);

        if (listingId) {
            // Case A: It's a URL (Listing ID found)
            const listingData = await getListingDetails(listingId);
            return NextResponse.json({
                type: 'listing',
                data: listingData
            });
        } else {
            // Case B: It's a Keyword
            const searchResults = await searchEtsyListings(query);
            return NextResponse.json({
                type: 'search',
                data: searchResults
            });
        }

    } catch (error: any) {
        console.error('Analyze API Error:', error);

        const status = error.message?.includes('403') ? 403 : 500;
        const message = error.message || 'Internal Server Error';

        return NextResponse.json(
            { error: message },
            { status: status }
        );
    }
}
