import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;

  const isProtected = ['/dashboard', '/tickets'].some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/tickets/:path*'],
};
