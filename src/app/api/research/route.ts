import { NextResponse } from 'next/server';
import { searchEtsyListings } from '@/lib/etsy';
import { analyzeSearchResults } from '@/lib/analyzer';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { keyword } = body;

        if (!keyword) {
            return NextResponse.json(
                { error: 'Keyword is required' },
                { status: 400 }
            );
        }

        // 1. Fetch raw data from Etsy
        const etsyData = await searchEtsyListings(keyword);

        // Check if we have results
        if (!etsyData.results || etsyData.results.length === 0) {
            return NextResponse.json(
                { message: 'No listings found for this keyword.' },
                { status: 404 }
            );
        }

        // 2. Analyze the data
        const analysis = analyzeSearchResults(etsyData.results, keyword);

        // 3. Return the analyzed result
        return NextResponse.json(analysis);

    } catch (error: any) {
        console.error('Research API Error:', error);

        // Handle specific Etsy API errors if possible, otherwise generic 500
        const status = error.message?.includes('403') ? 403 : 500;
        const message = error.message || 'Internal Server Error';

        return NextResponse.json(
            { error: message },
            { status: status }
        );
    }
}
