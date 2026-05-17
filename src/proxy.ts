import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "goaltrack_session";

const publicPaths = ["/", "/login", "/signup", "/forgot-password"];
const publicPrefixes = ["/reset-password"];
const publicApiPrefixes = ["/api/auth/login", "/api/auth/signup", "/api/auth/forgot-password", "/api/auth/reset-password"];

function isPublicPath(pathname: string): boolean {
  if (publicPaths.includes(pathname)) {
    return true;
  }
  if (publicPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }
  return publicApiPrefixes.some((prefix) => pathname.startsWith(prefix));
}

async function verifyToken(token: string): Promise<boolean> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return false;
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const isAuthenticated = token ? await verifyToken(token) : false;

  if (!isAuthenticated) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/goals/:path*", "/api/users/:path*"],
};
