import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value

    if (!token && request.nextUrl.pathname.startsWith('/') && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/register')) {
        // Redirect ke login jika belum login dan akses ke halaman privat
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (request.nextUrl.pathname.startsWith('/api/1.0/auth')) {
        // Izinkan akses ke endpoint auth tanpa token
        return NextResponse.next()
    }

    if (request.nextUrl.pathname.startsWith('/api/1.0/**') && !token) {
        // Jika akses ke task API tanpa token, kembalikan 401 Unauthorized
        return NextResponse.json(
            {status: 401, message: 'Unauthorized', data: null, timestamp: new Date().toISOString()},
            {status: 401, headers: {'Content-Type': 'application/json'}}
        )
    }

    return NextResponse.next()
}

// agar tidak semua route diintercept
export const config = {
    matcher: ['/', '/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
