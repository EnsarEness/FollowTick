import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow static files, api routes (magic assistant might be called internally or externally)
    // But protect standard pages
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/api/') ||
        pathname === '/login'
    ) {
        return NextResponse.next();
    }

    const appPin = process.env.APP_PIN;

    // If no PIN is configured, skip protection (useful for dev)
    if (!appPin) {
        return NextResponse.next();
    }

    const authCookie = request.cookies.get('followtick_auth');

    if (authCookie?.value !== appPin) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};
