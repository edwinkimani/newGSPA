"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shield, Menu, X, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useUser } from "@/components/user-context"
import { useRouter } from "next/navigation"

export default function Navigation() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { role, logout } = useUser()
  const router = useRouter()

  const dashboardHref = role === 'admin' ? '/admin/master-dashboard' : role === 'master_practitioner' ? '/master-practitioner' : '/practitioner'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/modules", label: "Modules" },
    { href: "/about", label: "About" },
    { href: "/why-join", label: "Why Join Us" },
    { href: "/contact", label: "Contact" },
  ]
  return (
    <nav
      className={`border-b sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-lg border-border text-foreground" : "bg-primary border-primary-600 text-primary-foreground"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className={`flex items-center gap-3 font-bold text-xl group ${isScrolled ? "text-primary" : "text-primary-foreground"}`}>
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent/30 to-secondary/30 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className={`relative p-1 rounded-lg group-hover:bg-primary-foreground/20 transition-colors duration-300 ${isScrolled ? "bg-primary/10" : "bg-primary-foreground/10"}`}>
                <img
                  src="/Global-Security-Practitioners-Alliance.png"
                  alt="GSPA Logo"
                  className="h-12 w-auto group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            </div>
            <span className={`text-balance bg-gradient-to-r from-primary-foreground to-accent bg-clip-text text-transparent font-bold ${isScrolled ? "text-primary" : ""}`}>
              GSPA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-all duration-200 relative group ${
                    pathname === item.href
                      ? "text-accent font-semibold"
                      : `${isScrolled ? "text-foreground/80 hover:text-primary" : "text-primary-foreground/80 hover:text-accent"}`
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-accent transition-all duration-200 ${
                      pathname === item.href ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  ></span>
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              {role ? (
                <>
                  <Button
                    variant="ghost"
                    asChild
                    className={`${isScrolled ? "hover:bg-muted hover:text-primary" : "hover:bg-primary-foreground/10 hover:text-accent"} transition-colors duration-200`}
                  >
                    <Link href={dashboardHref}>
                      My Dashboard
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className={`${isScrolled ? "hover:bg-muted hover:text-primary" : "hover:bg-primary-foreground/10 hover:text-accent"} transition-colors duration-200`}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    asChild
                    className={`${isScrolled ? "hover:bg-muted hover:text-primary" : "hover:bg-primary-foreground/10 hover:text-accent"} transition-colors duration-200`}
                  >
                    <Link href="/auth/login">Login</Link>
                  </Button>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-primary font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    <Link href="/register">Join GSPA</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className={`md:hidden transition-colors duration-200 ${isScrolled ? "hover:bg-muted" : "hover:bg-primary-foreground/10"}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <div className="relative w-5 h-5">
              <Menu
                className={`h-5 w-5 absolute transition-all duration-200 ${isMenuOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"}`}
              />
              <X
                className={`h-5 w-5 absolute transition-all duration-200 ${isMenuOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"}`}
              />
            </div>
          </Button>
        </div>

        <div
          id="mobile-menu"
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen
              ? "max-h-96 opacity-100 py-4 border-t border-primary-600"
              : "max-h-0 opacity-0 py-0 overflow-hidden"
          }`}
        >
          <div className="flex flex-col gap-4">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-all duration-200 py-2 px-3 rounded-lg ${
                  pathname === item.href
                    ? "text-accent font-semibold bg-primary-foreground/10"
                    : `${isScrolled ? "text-foreground/80 hover:text-primary hover:bg-muted/50" : "text-primary-foreground/80 hover:text-accent hover:bg-primary-foreground/5"}`
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            <div className="border-t border-primary-600 pt-4 mt-2">
              {role ? (
                <>
                  <Button
                    variant="ghost"
                    asChild
                    className={`w-full justify-start ${isScrolled ? "hover:bg-muted hover:text-primary" : "hover:bg-primary-foreground/10 hover:text-accent"}`}
                  >
                    <Link href={dashboardHref} onClick={() => setIsMenuOpen(false)}>
                      My Dashboard
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => { handleLogout(); setIsMenuOpen(false) }}
                    className={`w-full justify-start mt-2 ${isScrolled ? "hover:bg-muted hover:text-primary" : "hover:bg-primary-foreground/10 hover:text-accent"}`}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    asChild
                    className={`w-full justify-start ${isScrolled ? "hover:bg-muted hover:text-primary" : "hover:bg-primary-foreground/10 hover:text-accent"}`}
                  >
                    <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full justify-start bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-primary font-semibold mt-2"
                  >
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      Join GSPA
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
