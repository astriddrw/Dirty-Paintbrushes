"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/feed", label: "Feed" },
  { href: "/sources", label: "Sources" },
  { href: "/about", label: "About" },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 bg-background">
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16">
          {/* Logo — Instrument Serif italic, indigo */}
          <Link
            href="/"
            className="font-serif italic text-base lg:text-lg font-normal tracking-tight text-indigo hover:opacity-70 transition-opacity"
          >
            Dirty Paintbrushes
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.slice(1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "font-nav uppercase text-[15px] font-light text-indigo transition-colors",
                  pathname === link.href
                    ? "font-medium underline decoration-2 decoration-indigo underline-offset-4"
                    : "hover:opacity-70"
                )}
              >
                {link.label}
              </Link>
            ))}

            {!loading && (
              user ? (
                <button
                  onClick={signOut}
                  title={user.email ?? undefined}
                  className="font-nav uppercase text-[15px] font-light text-indigo hover:opacity-70 transition-opacity"
                >
                  Log out
                </button>
              ) : (
                <Link
                  href="/login"
                  className="font-nav uppercase text-[15px] font-light text-indigo hover:opacity-70 transition-opacity"
                >
                  Login
                </Link>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-3 -mr-3"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-foreground" />
            ) : (
              <Menu className="h-5 w-5 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "font-nav text-sm font-light transition-colors",
                    pathname === link.href
                      ? "text-foreground font-medium underline decoration-2 decoration-indigo underline-offset-4"
                      : "text-indigo"
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {!loading && (
                user ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOut()
                    }}
                    className="font-nav text-sm font-light text-indigo pt-2 border-t border-border text-left"
                  >
                    Log out
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-nav text-sm font-light text-indigo pt-2 border-t border-border"
                  >
                    Login
                  </Link>
                )
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
