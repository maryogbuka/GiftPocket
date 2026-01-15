// app/middleware/security.js
import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { validateRequest } from '@/lib/request-validation';

export async function securityMiddleware(request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const path = request.nextUrl.pathname;
  const userAgent = request.headers.get('user-agent');
  
  // 1. Rate Limiting by endpoint
  const limitKey = `${ip}:${path}`;
  const limit = await rateLimit(limitKey, 
    path.includes('/api/wallet') ? 10 : 30, // Stricter for wallet
    '1m'
  );
  
  if (limit.isLimited) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { 
        status: 429,
        headers: {
          'Retry-After': limit.retryAfter
        }
      }
    );
  }
  
  // 2. Request validation
  const validation = await validateRequest(request);
  if (!validation.valid) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
  
  // 3. Check for suspicious patterns
  if (await isSuspiciousRequest(ip, path, userAgent)) {
    await logSuspiciousActivity(ip, path, userAgent);
    // Optionally block or add CAPTCHA
  }
  
  return null; // Continue
}

// app/middleware.js
import { NextResponse } from 'next/server';
import { securityMiddleware } from './middleware/security';

export async function middleware(request) {
  // Apply security checks to all API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const securityCheck = await securityMiddleware(request);
    if (securityCheck) return securityCheck;
  }
  
  // Add security headers
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );
  
  // HSTS in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  return response;
}