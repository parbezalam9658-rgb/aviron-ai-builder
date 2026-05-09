import { NextRequest, NextResponse } from "next/server";

const adminAllowedRoles = new Set(["Super Admin", "Admin"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get("aviron_auth")?.value || "0";
  const roleCookie = decodeURIComponent(request.cookies.get("aviron_role")?.value || "Normal User");
  const planCookie = decodeURIComponent(request.cookies.get("aviron_plan")?.value || "Free");
  const hasProAccess =
    planCookie === "Pro" || planCookie === "Pro+" || roleCookie === "Admin" || roleCookie === "Super Admin";

  if (pathname.startsWith("/dashboard") && authCookie !== "1") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin") && !adminAllowedRoles.has(roleCookie)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if ((pathname.startsWith("/deploy") || pathname.startsWith("/domains")) && !hasProAccess) {
    return NextResponse.redirect(new URL("/pricing", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/deploy/:path*", "/domains/:path*"],
};
