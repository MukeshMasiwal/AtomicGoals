import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";
import { resolveAuthRedirectPath } from "@/lib/auth";

const SESSION_COOKIE = "goaltrack_session";

const publicPaths = ["/", "/login"];
const publicApiPrefixes = [
  "/api/auth/send-otp",
  "/api/auth/verify-otp",
  "/api/auth/seed-login",
];

function isPublicPath(pathname: string): boolean {
  if (publicPaths.includes(pathname)) {
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
    return payload as { role?: string; approvalStatus?: string; onboardingCompleted?: boolean; verified?: boolean; isSeedUser?: boolean };
  } catch {
    return null;
  }
}

function redirectTo(pathname: string, request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
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

  const isDashboardRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isLogout = pathname === "/api/auth/logout" || pathname === "/logout";

  if (isAuthenticated && !isLogout && !pathname.startsWith("/api/")) {
    const targetPath = resolveAuthRedirectPath({
      approvalStatus:
        session.approvalStatus === "Approved" ||
        session.approvalStatus === "Rejected"
          ? session.approvalStatus
          : "Pending Approval",
      onboardingCompleted: !!session.onboardingCompleted,
      verified: !!session.verified,
      isSeedUser: !!session.isSeedUser,
    });

    const isAuthEntryPath = pathname === "/login";

    if (pathname === "/" && targetPath === "/dashboard") {
      return redirectTo("/dashboard", request);
    }

    if (pathname === targetPath) {
      return NextResponse.next();
    }

    if (isAuthEntryPath) {
      return redirectTo(targetPath, request);
    }

    if (isDashboardRoute && targetPath !== "/dashboard") {
      return redirectTo(targetPath, request);
    }

    if (isOnboarding) {
      return redirectTo(targetPath, request);
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
