import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isDevelopmentEnvironment } from "./lib/constants";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Health check
  if (pathname.startsWith("/ping")) {
    return new Response("pong", { status: 200 });
  }

  // Let NextAuth handle its own routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/image")) {
    console.log("Skipping auth for /api/image");
    return NextResponse.next();
  }
  // Get session token
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: !isDevelopmentEnvironment,
  });

  // If user is NOT logged in
  if (!token) {
    // Allow access to /login and /register
    if (["/login", "/register"].includes(pathname)) {
      return NextResponse.next();
    }

    // Otherwise redirect to /login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in, block access to /login and /register
  if (["/login", "/register"].includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {};
