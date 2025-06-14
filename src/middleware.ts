// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  // Allow Next.js internals and NextAuth routes
  if (pathname.startsWith("/_next") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const isAuth = !!token;

  const isProtectedRoute = pathname.startsWith("/dashboard");
  const isPublicRoute = pathname === "/" || pathname === "/login";

  if (isProtectedRoute && !isAuth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuth && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // All other cases → allow
  return NextResponse.next();
}

// Match routes to be intercepted by middleware
export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
