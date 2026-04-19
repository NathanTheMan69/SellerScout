import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { findAllUserShops, getShopListings } from '@/lib/etsy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MOCK_LISTINGS = [
    { title: "Handmade Leather Wallet - Minimalist Design", price: 45, tags: ["leather", "wallet", "handmade", "gift"], num_sales: 12, quantity: 3, days_listed: 5 },
    { title: "Digital Planner 2025 - iPad & Tablet", price: 12, tags: ["planner", "digital", "2025", "ipad", "goodnotes", "notability", "productivity", "organization", "template", "download", "monthly", "weekly", "daily"], num_sales: 450, quantity: 999, days_listed: 45 },
    { title: "Ceramic Coffee Mug - Speckled White", price: 28, tags: ["mug", "coffee", "ceramic", "handmade", "kitchen", "gift"], num_sales: 89, quantity: 12, days_listed: 400 },
    { title: "Boho Macrame Wall Hanging", price: 65, tags: ["macrame", "wall decor", "boho", "handmade", "art", "fiber art", "home decor", "gift", "wedding", "nursery", "bedroom", "living room", "unique"], num_sales: 5, quantity: 2, days_listed: 10 },
    { title: "Vintage Denim Jacket - Embroidered", price: 85, tags: ["vintage", "denim", "jacket", "embroidered", "fashion"], num_sales: 1, quantity: 1, days_listed: 60 },
    { title: "Soy Wax Candle - Lavender & Sage", price: 22, tags: ["candle", "soy wax", "lavender", "sage", "aromatherapy", "home fragrance", "gift", "relaxing", "spa", "handmade", "natural", "vegan", "eco friendly"], num_sales: 120, quantity: 50, days_listed: 20 },
];

export async function GET() {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
        }
        const client = new OpenAI({ apiKey });

        let listings: any[] = [];

        try {
            const shopsResponse = await findAllUserShops();
            const shops = shopsResponse.results || [];
            if (shops.length > 0) {
                const listingsResponse = await getShopListings(shops[0].shop_id);
                listings = (listingsResponse.results || []).slice(0, 15).map((l: any) => ({
                    title: l.title,
                    price: l.price ? (l.price.amount / l.price.divisor) : 0,
                    tags: l.tags || [],
                    num_sales: l.num_sales || 0,
                    quantity: l.quantity || 0,
                    days_listed: Math.floor((Date.now() / 1000 - l.creation_tsz) / 86400),
                }));
            }
        } catch {
            // Fall back to mock data if Etsy API unavailable
        }

        if (listings.length === 0) {
            listings = MOCK_LISTINGS;
        }

        const listingSummary = listings.map(l =>
            `- "${l.title}" | $${l.price} | ${l.num_sales} sales | ${l.tags.length} tags | ${l.quantity} in stock | listed ${l.days_listed} days ago`
        ).join('\n');

        const completion = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are Scout AI, an expert Etsy shop advisor. Analyze the seller's listings and provide exactly 3 concise, actionable insights. 
                    
Return a JSON object with this exact shape:
{
  "insights": [
    { "type": "warning" | "opportunity" | "tip", "title": "Short title (max 6 words)", "message": "Specific actionable advice (1-2 sentences, reference specific listing titles where relevant)" }
  ]
}

Types: "warning" = urgent issue, "opportunity" = growth potential, "tip" = optimization advice.
Be specific and reference actual listing names from the data. Do not use generic advice.`,
                },
                {
                    role: 'user',
                    content: `Here are my current Etsy listings:\n\n${listingSummary}\n\nGive me 3 specific insights to improve my shop performance.`,
                },
            ],
            response_format: { type: 'json_object' },
            max_tokens: 500,
            temperature: 0.7,
        });

        const raw = completion.choices[0].message.content || '{}';
        const parsed = JSON.parse(raw);

        return NextResponse.json({ insights: parsed.insights || [] });
    } catch (error: any) {
        console.error('Insights API error:', error);
        return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
    }
}
