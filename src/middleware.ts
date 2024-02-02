import { NextRequest, NextResponse } from 'next/server';
// Import getSession from next-auth/react for server-side usage
import { getSession } from 'next-auth/react';

// Ensure your middleware export is correctly set up
export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in', '/sign-up', '/', '/verify/:path*'],
};

export async function middleware(req: NextRequest) {
  // Create a request-like object that contains the cookies header for getSession
  const requestForNextAuth = {
    headers: {
      cookie: req.headers.get('cookie') as string,
    },
  };

  // Retrieve the session using the adapted request object
  const session = await getSession({ req: requestForNextAuth });

  const url = req.nextUrl;

  // Redirect to dashboard if the user is already authenticated
  // and trying to access sign-in, sign-up, or home page
  if (
    session &&
    (url.pathname.startsWith('/sign-in') ||
      url.pathname.startsWith('/sign-up') ||
      url.pathname.startsWith('/verify') ||
      url.pathname === '/')
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Redirect to sign-in if trying to access protected routes without a session
  if (!session && url.pathname.startsWith('/dashboard')) {
    const signInPage = '/sign-in';
    const signInUrl = new URL(signInPage, req.url);
    signInUrl.searchParams.append('callbackUrl', req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}
