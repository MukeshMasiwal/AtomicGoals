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
    return payload as { role?: string; approvalStatus?: string; onboardingCompleted?: boolean };
  } catch {
    return null;
  }
}

export default async function proxy(request: NextRequest) {
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

  console.log(`[Middleware] Path: ${pathname}, Auth: ${isAuthenticated}, Session:`, session);

  const isPublic = isPublicPath(pathname);

  const isOnboarding = pathname === "/onboarding";
  const isWaiting = pathname === "/waiting-approval";
  const isRejectedRoute = pathname === "/rejected";
  const isLogout = pathname === "/api/auth/logout" || pathname === "/logout";

  if (isAuthenticated && !isLogout) {
    const isApproved = session.approvalStatus === "Approved";
    const isPending = session.approvalStatus === "Pending Approval";
    const isRejected = session.approvalStatus === "Rejected";
    const hasCompletedOnboarding = session.onboardingCompleted;

    // Allow API requests to go through
    if (!pathname.startsWith("/api/")) {
      if (!hasCompletedOnboarding && !isOnboarding && pathname !== "/signup" && pathname !== "/") {
        console.log(`[Middleware] Redirecting to /onboarding (Incomplete Onboarding)`);
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
      
      if (hasCompletedOnboarding && isPending && !isWaiting && pathname !== "/") {
        console.log(`[Middleware] Redirecting to /waiting-approval (Pending)`);
        return NextResponse.redirect(new URL("/waiting-approval", request.url));
      }
      
      if (hasCompletedOnboarding && isRejected && !isRejectedRoute && pathname !== "/") {
        console.log(`[Middleware] Redirecting to /rejected (Rejected)`);
        return NextResponse.redirect(new URL("/rejected", request.url));
      }

      if (isApproved && (isOnboarding || isWaiting || isRejectedRoute || pathname === "/signup")) {
        console.log(`[Middleware] Redirecting to /dashboard (Approved)`);
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // If user is authenticated and trying to access login/signup
    if (pathname === "/login" || pathname === "/signup") {
      if (!hasCompletedOnboarding) {
        console.log(`[Middleware] Redirecting from ${pathname} to /onboarding`);
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
      if (isPending) {
        console.log(`[Middleware] Redirecting from ${pathname} to /waiting-approval`);
        return NextResponse.redirect(new URL("/waiting-approval", request.url));
      }
      if (isRejected) {
        console.log(`[Middleware] Redirecting from ${pathname} to /rejected`);
        return NextResponse.redirect(new URL("/rejected", request.url));
      }
      console.log(`[Middleware] Redirecting from ${pathname} to /dashboard`);
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (pathname === "/") {
      if (isApproved) {
        console.log(`[Middleware] Redirecting from / to /dashboard`);
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
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
