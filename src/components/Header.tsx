"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/feed", label: "Feed" },
  { href: "/sources", label: "Sources" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-100 sticky top-0 z-50 bg-white/98 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-[60px]">

          {/* Logo */}
          <Link href="/" className="flex flex-col leading-none group">
            <span className="font-bold text-[17px] text-gray-950 tracking-[-0.02em] group-hover:text-gray-700 transition-colors">
              Dirty Paintbrushes
            </span>
            <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-blue-600 mt-[3px]">
              The Tracker
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-gray-950 text-white"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

        </div>
      </div>
    </header>
  );
}
