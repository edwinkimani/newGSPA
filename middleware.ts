import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { canAccessPage, type UserRole } from "@/lib/rbac"

// Define public paths that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/contact",
  "/faq",
  "/privacy-policy",
  "/terms-of-service",
  "/why-join",
  "/blog",
  "/certification-directory",
  "/modules",
  "/results",
  "/verify-email",
  "/verify-email/success",
]

// Define paths that require specific roles
const ROLE_PATHS = {
  admin: ["/admin"],
  master_practitioner: ["/master-practitioner"],
  practitioner: ["/dashboard", "/test"],
}

// Define specific master practitioner sub-routes that should be protected
const MASTER_PRACTITIONER_PATHS = [
  "/master-practitioner/modules",
  "/master-practitioner/levels",
  "/master-practitioner/certificates",
  "/master-practitioner/tests",
  "/master-practitioner/students",
]

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Handle auth redirects for logged-in users
    if (pathname.startsWith("/auth/") && token) {
      const url = req.nextUrl.clone()

      // Role-based dashboard redirects
      switch (token.role) {
        case "admin":
          url.pathname = "/admin"
          break
        case "master_practitioner":
          url.pathname = "/master-practitioner"
          break
        case "practitioner":
          url.pathname = "/dashboard"
          break
        default:
          url.pathname = "/dashboard"
      }
      return NextResponse.redirect(url)
    }

    // Protect role-specific paths
    if (token) {
      // Check if user has completed registration
      if (!token.profileComplete && !pathname.startsWith("/register") && !pathname.startsWith("/auth/")) {
        return NextResponse.redirect(new URL("/register", req.url))
      }

      // Handle role-based access using RBAC
      const userRole: UserRole = (token.role as UserRole) || 'practitioner'
      if (!canAccessPage(userRole, pathname)) {
        // Redirect unauthorized users to their appropriate dashboard
        return NextResponse.redirect(
          new URL(
            userRole === "admin"
              ? "/admin"
              : userRole === "master_practitioner"
                ? "/master-practitioner"
                : "/dashboard",
            req.url,
          ),
        )
      }

      // Additional check for master practitioner sub-routes
      if (MASTER_PRACTITIONER_PATHS.some((path) => pathname.startsWith(path)) && userRole !== "master_practitioner") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }

      // Handle API routes protection
      if (pathname.startsWith("/api/")) {
        // Protect admin API routes
        if (pathname.startsWith("/api/admin") && userRole !== "admin") {
          return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
            status: 403,
            headers: { "content-type": "application/json" },
          })
        }

        if (
          pathname.startsWith("/api/master-practitioner") &&
          userRole !== "master_practitioner" &&
          userRole !== "admin"
        ) {
          return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
            status: 403,
            headers: { "content-type": "application/json" },
          })
        }
      }

      // Check membership payment for protected content
      // Allow temporary access if user just completed payment (check URL params)
      // Exclude payment page itself from this check
      const hasPaymentSuccess = req.nextUrl.searchParams.get("payment") === "success"
      if (
        userRole === "practitioner" &&
        pathname.startsWith("/dashboard") &&
        !pathname.startsWith("/dashboard/payment") &&
        !token.membershipPaid &&
        !hasPaymentSuccess
      ) {
        return NextResponse.redirect(new URL("/dashboard/payment", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Always allow access to public paths and auth-related paths
        if (
          PUBLIC_PATHS.includes(pathname) ||
          pathname.startsWith("/auth/") ||
          pathname.startsWith("/_next/") ||
          pathname.startsWith("/api/") ||
          pathname === "/register" ||
          pathname.startsWith("/register/") ||
          pathname === "/payment" ||
          pathname.startsWith("/verify-email/")
        ) {
          return true
        }

        // Require authentication for all other paths
        return !!token
      },
    },
  },
)

export const runtime = "nodejs"

// Update matcher to exclude static files and images
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
