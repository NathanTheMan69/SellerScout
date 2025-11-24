import { NextResponse } from 'next/server';
import { findAllUserShops, getShopListings } from '@/lib/etsy';

export async function GET() {
    try {
        // 1. Get User's Shop
        const shopsResponse = await findAllUserShops();
        const shops = shopsResponse.results || [];

        if (shops.length === 0) {
            // If no shop found, return empty or mock?
            // User requested: "If the API key is pending (403), strictly use Mock Data"
            // If we get here, it means the API call succeeded but returned no shops.
            // Let's return empty for now, or maybe mock if we want to be helpful.
            return NextResponse.json({ listings: [] });
        }

        const shopId = shops[0].shop_id;

        // 2. Get Shop Listings
        const listingsResponse = await getShopListings(shopId);
        const listings = listingsResponse.results || [];

        return NextResponse.json({ listings });

    } catch (error: any) {
        console.error('Listings API Error:', error);

        // User requested: "If the API key is pending (403), strictly use Mock Data"
        // We check for 403 in the error message or status
        if (error.message?.includes('403') || error.status === 403) {
            // Return Mock Data
            const mockListings = [
                {
                    listing_id: 1,
                    title: "Handmade Leather Wallet - Minimalist Design",
                    price: { amount: 4500, divisor: 100, currency_code: "USD" },
                    quantity: 3, // Low stock
                    tags: ["leather", "wallet", "handmade", "gift"], // Low tags
                    images: [{ url_170x135: "https://images.unsplash.com/photo-1627123424574-181ce5171c98?w=300&q=80" }],
                    creation_tsz: Math.floor(Date.now() / 1000) - (86400 * 5), // 5 days ago
                    num_sales: 12
                },
                {
                    listing_id: 2,
                    title: "Digital Planner 2025 - iPad & Tablet",
                    price: { amount: 1200, divisor: 100, currency_code: "USD" },
                    quantity: 999,
                    tags: ["planner", "digital", "2025", "ipad", "goodnotes", "notability", "productivity", "organization", "template", "download", "monthly", "weekly", "daily"], // Good tags
                    images: [{ url_170x135: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=300&q=80" }],
                    creation_tsz: Math.floor(Date.now() / 1000) - (86400 * 45), // 1.5 months ago
                    num_sales: 450
                },
                {
                    listing_id: 3,
                    title: "Ceramic Coffee Mug - Speckled White",
                    price: { amount: 2800, divisor: 100, currency_code: "USD" },
                    quantity: 12,
                    tags: ["mug", "coffee", "ceramic", "handmade", "kitchen", "gift"], // Low tags
                    images: [{ url_170x135: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=300&q=80" }],
                    creation_tsz: Math.floor(Date.now() / 1000) - (86400 * 400), // 1+ year ago
                    num_sales: 89
                },
                {
                    listing_id: 4,
                    title: "Boho Macrame Wall Hanging",
                    price: { amount: 6500, divisor: 100, currency_code: "USD" },
                    quantity: 2, // Low stock
                    tags: ["macrame", "wall decor", "boho", "handmade", "art", "fiber art", "home decor", "gift", "wedding", "nursery", "bedroom", "living room", "unique"], // Good tags
                    images: [{ url_170x135: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&q=80" }],
                    creation_tsz: Math.floor(Date.now() / 1000) - (86400 * 10), // 10 days ago
                    num_sales: 5
                },
                {
                    listing_id: 5,
                    title: "Vintage Denim Jacket - Embroidered",
                    price: { amount: 8500, divisor: 100, currency_code: "USD" },
                    quantity: 1, // Low stock
                    tags: ["vintage", "denim", "jacket", "embroidered", "fashion"], // Low tags
                    images: [{ url_170x135: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=300&q=80" }],
                    creation_tsz: Math.floor(Date.now() / 1000) - (86400 * 60), // 2 months ago
                    num_sales: 1
                },
                {
                    listing_id: 6,
                    title: "Soy Wax Candle - Lavender & Sage",
                    price: { amount: 2200, divisor: 100, currency_code: "USD" },
                    quantity: 50,
                    tags: ["candle", "soy wax", "lavender", "sage", "aromatherapy", "home fragrance", "gift", "relaxing", "spa", "handmade", "natural", "vegan", "eco friendly"], // Good tags
                    images: [{ url_170x135: "https://images.unsplash.com/photo-1602825389660-3f0365deb7b4?w=300&q=80" }],
                    creation_tsz: Math.floor(Date.now() / 1000) - (86400 * 20), // 20 days ago
                    num_sales: 120
                },
                {
                    listing_id: 7,
                    title: "Gold Plated Hoop Earrings",
                    price: { amount: 3500, divisor: 100, currency_code: "USD" },
                    quantity: 15,
                    tags: ["earrings", "gold", "hoops", "jewelry", "minimalist"], // Low tags
                    images: [{ url_170x135: "https://images.unsplash.com/photo-1630019852942-f89202989a51?w=300&q=80" }],
                    creation_tsz: Math.floor(Date.now() / 1000) - (86400 * 100), // 3 months ago
                    num_sales: 34
                },
                {
                    listing_id: 8,
                    title: "Abstract Watercolor Painting Print",
                    price: { amount: 4000, divisor: 100, currency_code: "USD" },
                    quantity: 100,
                    tags: ["art print", "watercolor", "abstract", "wall art", "decor", "painting", "colorful", "modern", "living room", "bedroom", "office", "gift", "printable"], // Good tags
                    images: [{ url_170x135: "https://images.unsplash.com/photo-1579783902614-a3fb39279c71?w=300&q=80" }],
                    creation_tsz: Math.floor(Date.now() / 1000) - (86400 * 500), // 1+ year ago
                    num_sales: 210
                },
                {
                    listing_id: 9,
                    title: "Personalized Wooden Cutting Board",
                    price: { amount: 5500, divisor: 100, currency_code: "USD" },
                    quantity: 8,
                    tags: ["cutting board", "wood", "personalized", "engraved", "kitchen", "wedding gift", "housewarming", "custom", "cooking", "chef", "rustic", "home decor", "gift for couple"], // Good tags
                    images: [{ url_170x135: "https://images.unsplash.com/photo-1624821588855-a5ff394dc018?w=300&q=80" }],
                    creation_tsz: Math.floor(Date.now() / 1000) - (86400 * 2), // 2 days ago
                    num_sales: 3
                },
                {
                    listing_id: 10,
                    title: "Knitted Chunky Blanket - Grey",
                    price: { amount: 12000, divisor: 100, currency_code: "USD" },
                    quantity: 4, // Low stock
                    tags: ["blanket", "chunky knit", "throw", "cozy", "winter", "home decor", "grey", "handmade", "soft", "warm", "bedding", "sofa", "gift"], // Good tags
                    images: [{ url_170x135: "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=300&q=80" }],
                    creation_tsz: Math.floor(Date.now() / 1000) - (86400 * 150), // 5 months ago
                    num_sales: 18
                },
                {
                    listing_id: 11,
                    title: "Crystal Quartz Necklace",
                    price: { amount: 4800, divisor: 100, currency_code: "USD" },
                    quantity: 20,
                    tags: ["necklace", "crystal", "quartz", "jewelry", "boho", "healing", "stone"], // Low tags
                    images: [{ url_170x135: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=300&q=80" }],
                    creation_tsz: Math.floor(Date.now() / 1000) - (86400 * 300), // 10 months ago
                    num_sales: 67
                },
                {
                    listing_id: 12,
                    title: "Linen Table Runner - Natural",
                    price: { amount: 3200, divisor: 100, currency_code: "USD" },
                    quantity: 10,
                    tags: ["table runner", "linen", "natural", "dining", "kitchen", "rustic", "farmhouse", "decor", "wedding", "party", "holiday", "textile", "handmade"], // Good tags
                    images: [{ url_170x135: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=300&q=80" }],
                    creation_tsz: Math.floor(Date.now() / 1000) - (86400 * 80), // 2.5 months ago
                    num_sales: 25
                },
                {
                    listing_id: 13,
                    title: "Set of 3 Succulent Planters",
                    price: { amount: 2500, divisor: 100, currency_code: "USD" },
                    quantity: 3, // Low stock
                    tags: ["planter", "succulent", "pot", "ceramic", "garden", "indoor"], // Low tags
                    images: [{ url_170x135: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=300&q=80" }],
                    creation_tsz: Math.floor(Date.now() / 1000) - (86400 * 15), // 15 days ago
                    num_sales: 8
                },
                {
                    listing_id: 14,
                    title: "Beeswax Food Wraps - Eco Friendly",
                    price: { amount: 1800, divisor: 100, currency_code: "USD" },
                    quantity: 60,
                    tags: ["beeswax wrap", "eco friendly", "sustainable", "zero waste", "kitchen", "food storage", "reusable", "organic", "plastic free", "gift", "handmade", "natural", "home"], // Good tags
                    images: [{ url_170x135: "https://images.unsplash.com/photo-1605265058749-78afeb664989?w=300&q=80" }],
                    creation_tsz: Math.floor(Date.now() / 1000) - (86400 * 200), // 6+ months ago
                    num_sales: 150
                },
                {
                    listing_id: 15,
                    title: "Hand-poured Concrete Coasters",
                    price: { amount: 2000, divisor: 100, currency_code: "USD" },
                    quantity: 25,
                    tags: ["coasters", "concrete", "industrial", "modern", "home decor", "drinkware", "barware", "gift", "handmade", "minimalist", "grey", "round", "set"], // Good tags
                    images: [{ url_170x135: "https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=300&q=80" }],
                    creation_tsz: Math.floor(Date.now() / 1000) - (86400 * 30), // 1 month ago
                    num_sales: 42
                },
                {
                    listing_id: 16,
                    title: "Silk Scarf - Floral Print",
                    price: { amount: 5800, divisor: 100, currency_code: "USD" },
                    quantity: 7,
                    tags: ["scarf", "silk", "floral", "fashion", "accessory", "gift for her"], // Low tags
                    images: [{ url_170x135: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=300&q=80" }],
                    creation_tsz: Math.floor(Date.now() / 1000) - (86400 * 90), // 3 months ago
                    num_sales: 15
                },
                {
                    listing_id: 17,
                    title: "Copper Wire LED Fairy Lights",
                    price: { amount: 1500, divisor: 100, currency_code: "USD" },
                    quantity: 100,
                    tags: ["lights", "fairy lights", "led", "copper", "decor", "wedding", "party", "bedroom", "string lights", "battery operated", "warm white", "gift", "christmas"], // Good tags
                    images: [{ url_170x135: "https://images.unsplash.com/photo-1545042746-ec9e5a59b359?w=300&q=80" }],
                    creation_tsz: Math.floor(Date.now() / 1000) - (86400 * 365), // 1 year ago
                    num_sales: 480
                },
                {
                    listing_id: 18,
                    title: "Leather Keychain - Monogram",
                    price: { amount: 1500, divisor: 100, currency_code: "USD" },
                    quantity: 4, // Low stock
                    tags: ["keychain", "leather", "monogram", "personalized", "gift"], // Low tags
                    images: [{ url_170x135: "https://images.unsplash.com/photo-1616165665111-335e6a85c545?w=300&q=80" }],
                    creation_tsz: Math.floor(Date.now() / 1000) - (86400 * 600), // 1.5+ years ago
                    num_sales: 95
                },
                {
                    listing_id: 19,
                    title: "Woven Basket - Seagrass",
                    price: { amount: 3800, divisor: 100, currency_code: "USD" },
                    quantity: 18,
                    tags: ["basket", "woven", "seagrass", "storage", "organizer", "home decor", "boho", "plant pot", "laundry", "toy storage", "natural", "rustic", "handmade"], // Good tags
                    images: [{ url_170x135: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=300&q=80" }],
                    creation_tsz: Math.floor(Date.now() / 1000) - (86400 * 120), // 4 months ago
                    num_sales: 60
                },
                {
                    listing_id: 20,
                    title: "Minimalist Wall Clock - Wood",
                    price: { amount: 7500, divisor: 100, currency_code: "USD" },
                    quantity: 6,
                    tags: ["clock", "wall clock", "wood", "minimalist", "modern", "decor"], // Low tags
                    images: [{ url_170x135: "https://images.unsplash.com/photo-1563861826100-9cb868c72876?w=300&q=80" }],
                    creation_tsz: Math.floor(Date.now() / 1000) - (86400 * 700), // 2 years ago
                    num_sales: 32
                }
            ];
            return NextResponse.json({ listings: mockListings, isMock: true });
        }

        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
