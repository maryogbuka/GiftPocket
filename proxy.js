// middleware.js - FIXED & SIMPLIFIED VERSION
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy (request) {
  const { pathname } = request.nextUrl;
  
  // Create response
  const response = NextResponse.next();
  
  // Add security headers (Edge-compatible)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // CORS headers for API routes
  if (pathname.startsWith('/api')) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Origin', 'https://giftpocket.ng');    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: response.headers,
      });
    }
  }
  
  // Protect API routes (except public endpoints)
  const publicApiPaths = [
    '/api/auth',
    '/api/register',
    '/api/health',
    '/api/webhook',
    '/api/flutterwave-webhook',
  ];
  
  const isPublicApi = publicApiPaths.some(path => pathname.startsWith(path));
  
  if (pathname.startsWith('/api') && !isPublicApi) {
    try {
      const token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });
      
      if (!token) {
        return new NextResponse(
          JSON.stringify({ 
            success: false, 
            message: 'Unauthorized. Please log in.',
            code: 'UNAUTHORIZED'
          }),
          { 
            status: 401, 
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
      }
      
      // Add user info to headers for downstream use
      response.headers.set('X-User-ID', token.id || '');
      
    } catch (error) {
      console.error('Middleware auth error:', error);
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'Authentication error',
          code: 'AUTH_ERROR'
        }),
        { 
          status: 500, 
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
  }
  
  // Protect authenticated pages
  const authenticatedPages = [
    '/dashboard',
    '/wallet',
    '/transactions',
    '/virtual-account',
    '/profile',
    '/settings',
  ];
  
  if (authenticatedPages.some(page => pathname.startsWith(page))) {
    try {
      const token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });
      
      if (!token) {
        const url = new URL('/login', request.url);
        url.searchParams.set('callbackUrl', encodeURIComponent(pathname));
        return NextResponse.redirect(url);
      }
      
    } catch (error) {
      console.error('Middleware auth error:', error);
      const url = new URL('/login', request.url);
      return NextResponse.redirect(url);
    }
  }
  
  // Redirect authenticated users away from auth pages
  const authPages = ['/login', '/register', '/forgot-password'];
  
  if (authPages.includes(pathname)) {
    try {
      const token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });
      
      if (token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      // Continue to auth page if error
      console.error('Middleware token check error:', error);
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    // Match all API routes and protected pages
    '/api/:path*',
    '/dashboard/:path*',
    '/wallet/:path*',
    '/transactions/:path*',
    '/virtual-account/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/login',
    '/register',
    '/forgot-password',
  ],
};