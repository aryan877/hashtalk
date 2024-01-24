import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in', '/sign-up', '/', '/verify/:path*'],
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // Determine the protocol based on the environment
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

  // Extract the host from the request URL
  const host = new URL(request.url).host;

  // Redirect to dashboard if the user is already authenticated
  // and trying to access sign-in, sign-up, or home page
  if (
    token &&
    (url.pathname.startsWith('/sign-in') ||
      url.pathname.startsWith('/sign-up') ||
      url.pathname.startsWith('/verify') ||
      url.pathname === '/')
  ) {
    return NextResponse.redirect(
      new URL('/dashboard', `${protocol}://${host}`)
    );
  }

  // Redirect to sign-in if the user is not authenticated
  // and trying to access the dashboard
  if (!token && url.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/sign-in', `${protocol}://${host}`));
  }

  return NextResponse.next();
}
