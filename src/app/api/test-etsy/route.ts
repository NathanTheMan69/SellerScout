import { NextResponse } from 'next/server';
import { searchEtsyListings } from '@/lib/etsy';

export async function GET() {
    try {
        const data = await searchEtsyListings('silver ring');
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to fetch data from Etsy' },
            { status: 500 }
        );
    }
}
