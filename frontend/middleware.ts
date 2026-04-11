import { NextRequest, NextResponse } from 'next/server';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/verify-otp', '/reset-password'];

const PUBLIC_ASSET_PREFIXES = ['/videos/', '/images/', '/icons/'];
const PUBLIC_FILE_REGEX = /\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|css|js|map|txt|xml)$/i;

// Shared routes accessible by all authenticated users
const SHARED_ROUTES = ['/unauthorized'];

// Role-based route access
const ROLE_ROUTES: Record<string, string[]> = {
  CLIENT: ['/client'],
  AGENT: ['/dashboard/agent'],
  ADMIN: ['/dashboard/admin'],
  DIRECTION: ['/dashboard/direction'],
};

// Admin and Direction can access their respective routes
const ADMIN_ROUTES = ['/dashboard/admin', '/dashboard/direction'];

// Simple JWT decoder (without external dependency)
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return decoded;
  } catch (error) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('Middleware: Processing', pathname);

  // Always allow static/public assets.
  if (
    PUBLIC_ASSET_PREFIXES.some(prefix => pathname.startsWith(prefix)) ||
    PUBLIC_FILE_REGEX.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Public landing page
  if (pathname === '/') {
    return NextResponse.next();
  }

  // Allow public routes
  if (pathname.startsWith('/unauthorized') || PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    console.log('Middleware: Public route, allowing');
    return NextResponse.next();
  }

  // Get token from cookies or headers
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  console.log('Middleware: Token present?', !!token);

  // If no token, redirect to login (but not if already on login page)
  if (!token) {
    if (pathname === '/login') {
      return NextResponse.next();
    }
    console.log('Middleware: No token, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Decode JWT to get user role
    const decoded = decodeJWT(token);
    if (!decoded) {
      console.log('Middleware: Invalid token, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const userRole = decoded.role;
    console.log('Middleware: User role', userRole);

    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      console.log('Middleware: Token expired, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Allow shared routes for all authenticated users
    if (SHARED_ROUTES.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // Check role-based access
    const hasAccess = ROLE_ROUTES[userRole]?.some(route => pathname.startsWith(route));

    // Admin can access admin routes, Direction can access direction routes
    const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));
    const isAdminOrDirection = userRole === 'ADMIN' || userRole === 'DIRECTION';

    if (isAdminRoute && !isAdminOrDirection) {
      // Non-admin/direction trying to access admin routes
      console.log('Middleware: Unauthorized for admin route');
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    if (!hasAccess && !isAdminRoute) {
      // Role doesn't have access to this route
      console.log('Middleware: No access to route');
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    console.log('Middleware: Access granted');
    return NextResponse.next();
  } catch (error) {
    // Invalid token
    console.error('Middleware: Error', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Configure which routes to apply middleware to
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|videos|images|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|css|js|map|txt|xml)$).*)',
  ],
};
