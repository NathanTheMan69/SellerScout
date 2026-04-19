import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// Origins allowed to call the API (Etsy pages, Chrome extension, local dev)
const ALLOWED_ORIGINS = [
    'https://www.etsy.com',
    'https://etsy.com',
    'http://localhost:3000',
    'http://localhost:3001',
]

function isAllowedOrigin(origin: string | null) {
    if (!origin) return true  // no origin = server-to-server, allow
    if (origin.startsWith('chrome-extension://')) return true
    return ALLOWED_ORIGINS.includes(origin)
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const origin = request.headers.get('origin')

    // Apply CORS to all /api/* routes
    if (pathname.startsWith('/api/')) {
        // Preflight
        if (request.method === 'OPTIONS') {
            return new NextResponse(null, {
                status: 204,
                headers: {
                    'Access-Control-Allow-Origin': isAllowedOrigin(origin) ? (origin ?? '*') : '',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Max-Age': '86400',
                },
            })
        }

        const response = NextResponse.next()
        if (isAllowedOrigin(origin)) {
            response.headers.set('Access-Control-Allow-Origin', origin ?? '*')
            response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        }
        return response
    }

    return await updateSession(request)
}

export const config = {
    matcher: [
        '/',
        '/dashboard/:path*',
        '/api/:path*',
    ],
}
