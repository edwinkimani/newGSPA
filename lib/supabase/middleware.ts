import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Supabase not configured in this environment — warn and continue with default response.
    console.warn('[v0] Supabase env vars missing; middleware will continue without Supabase checks', {
      url: !!supabaseUrl,
      key: !!supabaseAnonKey,
    })
    return supabaseResponse
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Redirect unauthenticated users away from protected pages
    if (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/admin")) {
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = "/auth/login"
        return NextResponse.redirect(url)
      }
    }

    // Redirect authenticated users away from auth pages
    if (request.nextUrl.pathname.startsWith("/auth/") && user) {
      // Check user role and redirect accordingly
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("membership_fee_paid, role_id")
          .eq("id", user.id)
          .single()

        // If admin role, send to admin root
        if (profile?.role_id) {
          const { data: role } = await supabase
            .from("roles")
            .select("name")
            .eq("id", profile.role_id)
            .single()

          if (role?.name === "admin") {
            const url = request.nextUrl.clone()
            url.pathname = "/admin"
            return NextResponse.redirect(url)
          }

          if (role?.name === "master_practitioner") {
            const url = request.nextUrl.clone()
            url.pathname = "/admin/master-dashboard"
            return NextResponse.redirect(url)
          }
        }

        // For regular users, check if they have completed registration
        const url = request.nextUrl.clone()
        if (!profile) {
          url.pathname = "/register/step-1"
        } else if (!profile.membership_fee_paid) {
          url.pathname = "/payment"
        } else {
          url.pathname = "/dashboard"
        }
        return NextResponse.redirect(url)
      } catch (error) {
        // If profile check fails, redirect to dashboard as fallback
        const url = request.nextUrl.clone()
        url.pathname = "/dashboard"
        return NextResponse.redirect(url)
      }
    }
  } catch (error) {
    console.error("[v0] Error in middleware getUser:", error)
  }

  const response = supabaseResponse.clone()

  // Security headers
  const securityHeaders = {
    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",

    // Prevent clickjacking attacks
    "X-Frame-Options": "DENY",

    // Enable XSS protection
    "X-XSS-Protection": "1; mode=block",

    // Control referrer information
    "Referrer-Policy": "strict-origin-when-cross-origin",

    // Restrict permissions for browser APIs
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",

    // Force HTTPS connections
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",

    // Content Security Policy
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co https://checkout.paystack.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://quintjtreswyjxxogcjt.supabase.co wss://quintjtreswyjxxogcjt.supabase.co https://api.paystack.co",
      "frame-src 'self' https://js.paystack.co https://checkout.paystack.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),

    // Prevent DNS prefetching
    "X-DNS-Prefetch-Control": "off",

    // Remove server information
    Server: "",

    // Cache control for sensitive pages
    "Cache-Control":
      request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname.startsWith("/admin") ||
      request.nextUrl.pathname.startsWith("/auth")
        ? "no-cache, no-store, must-revalidate, private"
        : "public, max-age=3600",

    // Prevent caching of sensitive content
    Pragma:
      request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname.startsWith("/admin") ||
      request.nextUrl.pathname.startsWith("/auth")
        ? "no-cache"
        : "cache",
  }

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  if (request.nextUrl.pathname.startsWith("/api/")) {
    response.headers.set("X-RateLimit-Limit", "100")
    response.headers.set("X-RateLimit-Remaining", "99")
    response.headers.set("X-RateLimit-Reset", String(Date.now() + 3600000))
  }

  if (request.nextUrl.pathname.startsWith("/auth/")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow")
    response.headers.set("Cross-Origin-Embedder-Policy", "require-corp")
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin")
  }

  return response
}
