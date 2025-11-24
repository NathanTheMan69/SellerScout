const ETSY_API_KEY = process.env.ETSY_API_KEY;
const ETSY_API_URL = 'https://openapi.etsy.com/v3/application';

export async function searchEtsyListings(keyword: string, limit: number = 10) {
    if (!ETSY_API_KEY) {
        throw new Error('ETSY_API_KEY is not defined in environment variables');
    }

    const url = `${ETSY_API_URL}/listings/active?keywords=${encodeURIComponent(keyword)}&limit=${limit}&includes=Images`;

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

export async function findAllUserShops() {
    if (!ETSY_API_KEY) {
        throw new Error('ETSY_API_KEY is not defined in environment variables');
    }

    // Note: In a real app with OAuth, we would use the user's ID or __SELF__
    // For this API Key based implementation, we might need a specific user ID or shop ID if __SELF__ doesn't work with just an API Key.
    // However, the prompt implies we should try to find the user's shops.
    // If we are using a personal API key, it might be associated with the developer's account.
    // Let's try fetching the user's shops.
    // If this fails, we might need to ask the user for their Shop ID directly in settings.
    // For now, let's assume we can fetch it or fallback.

    const url = `${ETSY_API_URL}/users/__SELF__/shops`;

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
        console.error('Error fetching user shops:', error);
        throw error;
    }
}

export async function getShopListings(shopId: string | number) {
    if (!ETSY_API_KEY) {
        throw new Error('ETSY_API_KEY is not defined in environment variables');
    }

    const url = `${ETSY_API_URL}/shops/${shopId}/listings/active?limit=100&includes=Images,Inventory`;

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
        console.error(`Error fetching listings for shop ${shopId}:`, error);
        throw error;
    }
}

export async function findShopByName(shopName: string) {
    if (!ETSY_API_KEY) {
        throw new Error('ETSY_API_KEY is not defined in environment variables');
    }

    const url = `${ETSY_API_URL}/shops?shop_name=${encodeURIComponent(shopName)}&limit=1`;

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
        return data.results?.[0] || null;
    } catch (error) {
        console.error(`Error finding shop by name ${shopName}:`, error);
        throw error;
    }
}
