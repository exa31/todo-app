import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value

    if (!token && request.nextUrl.pathname.startsWith('/') && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/register')) {
        // Redirect ke login jika belum login dan akses ke halaman privat
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

// agar tidak semua route diintercept
export const config = {
    matcher: ['/', '/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
