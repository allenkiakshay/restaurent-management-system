import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const { pathname } = req.nextUrl;

  // 🚫 Redirect unauthenticated users trying to access protected pages
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/restaurants") ||
    pathname.startsWith("/update-payment") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/place-order")
  ) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 🛡 RBAC Example — Restrict /update-payment to only ADMIN
  if (pathname.startsWith("/update-payment")) {
    if (token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  if (pathname.startsWith("/checkout")) {
    if (token?.role !== "ADMIN" && token?.role !== "MANAGER") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/update-payment",
    "/restaurants/:path*",
    "/profile",
    "/cart",
    "/checkout",
    "/place-order",
    "/dashboard/:path*",
    "/orders/:path*",
  ],
};
