// middleware.js
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Edge-compatible rate limiting
class RateLimiter {
  constructor() {
    // Use a simple Map for in-memory storage (Edge compatible)
    this.requests = new Map();
  }

  check(ip, key, limit, windowMs) {
    const now = Date.now();
    const windowStart = now - windowMs;
    const fullKey = `${ip}:${key}`;
    
    if (!this.requests.has(fullKey)) {
      this.requests.set(fullKey, []);
    }
    
    const requests = this.requests.get(fullKey).filter(time => time > windowStart);
    this.requests.set(fullKey, requests);
    
    if (requests.length >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(requests[0] + windowMs)
      };
    }
    
    requests.push(now);
    return {
      allowed: true,
      remaining: limit - requests.length,
      resetTime: new Date(now + windowMs)
    };
  }

  // Simple cleanup (Edge doesn't support intervals)
  cleanup() {
    const now = Date.now();
    for (const [key, requests] of this.requests.entries()) {
      const filtered = requests.filter(time => now - time < 15 * 60 * 1000);
      if (filtered.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, filtered);
      }
    }
  }
}

const rateLimiter = new RateLimiter();

// Edge-compatible random string generation
function generateRandomString(length = 16) {
  // Use Web Crypto API (available in Edge Runtime)
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Security headers configuration
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
};

// CSP Header
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.flutterwave.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://api.flutterwave.com https://*.flutterwave.com;
  frame-src 'self' https://checkout.flutterwave.com;
  media-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  block-all-mixed-content;
  upgrade-insecure-requests;
`.replace(/\s+/g, ' ').trim();

export async function middleware(request) {
  const { pathname, origin } = request.nextUrl;
  const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Create response
  const response = NextResponse.next();
  
  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Add CSP header (production only)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Content-Security-Policy', cspHeader);
  }
  
  // Add HSTS in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  // CORS headers for API routes
  if (pathname.startsWith('/api')) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: response.headers,
      });
    }
  }
  
  // Rate limiting with different limits for different endpoints
  if (pathname.startsWith('/api')) {
    let limitKey = pathname;
    let limit = 100;
    let windowMs = 15 * 60 * 1000; // 15 minutes
    
    // Stricter limits for sensitive endpoints
    if (pathname.includes('/auth') || pathname.includes('/login')) {
      limit = 10;
      windowMs = 5 * 60 * 1000; // 5 minutes
    } else if (pathname.includes('/wallet') || pathname.includes('/transfer')) {
      limit = 30;
      windowMs = 5 * 60 * 1000; // 5 minutes
    } else if (pathname.includes('/register')) {
      limit = 3;
      windowMs = 10 * 60 * 1000; // 10 minutes
    }
    
    const rateLimitResult = rateLimiter.check(ip, limitKey, limit, windowMs);
    
    if (!rateLimitResult.allowed) {
      response.headers.set('Retry-After', Math.ceil((rateLimitResult.resetTime.getTime() - Date.now()) / 1000));
      
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.resetTime.getTime() - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: response.headers,
        }
      );
    }
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toISOString());
  }
  
  // Validate request origin for sensitive endpoints (excluding webhooks)
  if ((pathname.includes('/webhook') || pathname.includes('/flutterwave')) && !pathname.includes('webhook')) {
    const requestOrigin = request.headers.get('origin') || request.headers.get('referer');
    
    if (requestOrigin && process.env.ALLOWED_ORIGINS) {
      const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
      try {
        const originUrl = new URL(requestOrigin);
        
        if (!allowedOrigins.includes(originUrl.origin)) {
          return new NextResponse(
            JSON.stringify({ success: false, message: 'Invalid request origin' }),
            { status: 403, headers: response.headers }
          );
        }
      } catch (e) {
        // Invalid URL format
        return new NextResponse(
          JSON.stringify({ success: false, message: 'Invalid request origin' }),
          { status: 403, headers: response.headers }
        );
      }
    }
  }
  
  // Protect API routes (except public endpoints)
  const publicApiPaths = [
    '/api/auth',
    '/api/forgot-password',
    '/api/reset-password',
    '/api/register',
    '/api/health',
    '/api/webhook',
    '/api/flutterwave-webhook',
  ];
  
  const isPublicApi = publicApiPaths.some(path => pathname.startsWith(path));
  
  if (pathname.startsWith('/api') && !isPublicApi) {
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
          headers: response.headers 
        }
      );
    }
    
    // Add user info to headers for downstream use
    response.headers.set('X-User-ID', token.id || '');
    response.headers.set('X-User-Email', token.email || '');
  }
  
  // Protect authenticated pages
  const authenticatedPages = [
    '/dashboard',
    '/wallet',
    '/schedule',
    '/transactions',
    '/virtual-account',
    '/analytics',
    '/calendar',
    '/giftsPage',
    '/people',
  ];
  
  if (authenticatedPages.some(page => pathname.startsWith(page))) {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURIComponent(pathname));
      return NextResponse.redirect(url);
    }
    
    // Add security token for client-side verification
    response.headers.set('X-Auth-Token', generateRandomString(32));
  }
  
  // Redirect authenticated users away from auth pages
  if (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password') {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  // Add request ID for tracing (using Edge-compatible crypto)
  const requestId = generateRandomString(16);
  response.headers.set('X-Request-ID', requestId);
  response.headers.set('X-Request-Timestamp', Date.now().toString());
  
  return response;
}

// IMPORTANT: Configure to use Edge Runtime
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next/ (Next.js internals)
     * 2. /_static (static files)
     * 3. /_vercel (Vercel internals)
     * 4. /favicon.ico, /sitemap.xml, /robots.txt (static files)
     * 5. /api/health (health check)
     * 6. Public files (images, fonts, etc.)
     */
    '/((?!_next/|_static|_vercel|favicon.ico|sitemap.xml|robots.txt|api/health|.*\\.(?:ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot)$).*)',
  ],
  runtime: 'edge', // Explicitly specify Edge runtime
};