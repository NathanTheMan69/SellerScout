const ETSY_API_KEY = process.env.ETSY_API_KEY;
const ETSY_API_URL = 'https://openapi.etsy.com/v3/application';

export async function searchEtsyListings(keyword: string) {
    if (!ETSY_API_KEY) {
        throw new Error('ETSY_API_KEY is not defined in environment variables');
    }

    const url = `${ETSY_API_URL}/listings/active?keywords=${encodeURIComponent(keyword)}&limit=10&includes=Images`;

    try {
        const response = await fetch(url, {
            headers: {
                'x-api-key': ETSY_API_KEY,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Etsy API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error searching Etsy listings:', error);
        throw error;
    }
}

export async function getListingDetails(listingId: string) {
    if (!ETSY_API_KEY) {
        throw new Error('ETSY_API_KEY is not defined in environment variables');
    }

    const url = `${ETSY_API_URL}/listings/${listingId}?includes=Images,Inventory`;

    try {
        const response = await fetch(url, {
            headers: {
                'x-api-key': ETSY_API_KEY,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Etsy API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching listing details for ID ${listingId}:`, error);
        throw error;
    }
}
