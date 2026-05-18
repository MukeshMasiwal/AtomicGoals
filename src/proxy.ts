import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "goaltrack_session";

const publicPaths = ["/", "/login", "/signup", "/forgot-password"];
const publicPrefixes = ["/reset-password"];
const publicApiPrefixes = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/send-otp",
  "/api/auth/verify-otp",
  "/api/auth/seed-login",
];

function isPublicPath(pathname: string): boolean {
  if (publicPaths.includes(pathname)) {
    return true;
  }
  if (publicPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }
  return publicApiPrefixes.some((prefix) => pathname.startsWith(prefix));
}

async function getSessionPayload(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );
    return payload as { role?: string };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await getSessionPayload(token) : null;
  const isAuthenticated = !!session;

  const isPublic = isPublicPath(pathname);

  // If user is authenticated and trying to access login/signup, redirect to dashboard
  if (
    isAuthenticated &&
    (pathname === "/login" || pathname === "/signup" || pathname === "/")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow access to public paths if not authenticated
  if (isPublic) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users trying to access protected paths
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
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
