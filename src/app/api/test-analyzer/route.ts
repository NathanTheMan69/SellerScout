import { NextResponse } from 'next/server';
import { analyzeCompetitorShop } from '@/lib/shop-analyzer';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const shopName = searchParams.get('shop') || 'Etsy'; // Default to Etsy if no shop provided

    try {
        const report = await analyzeCompetitorShop(shopName);
        return NextResponse.json(report);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to analyze shop' },
            { status: 500 }
        );
    }
}
