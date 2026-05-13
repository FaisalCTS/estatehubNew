"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function NavBar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isSociety = pathname.startsWith("/society") || pathname.startsWith("/gate") || pathname.startsWith("/admin");
  const isMarketplace = !isSociety;

  function navLink(href: string, label: string) {
    const active = pathname === href || (href !== "/" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        className={`text-sm transition hover:text-brand-light ${active ? "font-semibold text-white underline underline-offset-4" : "text-blue-100"}`}
      >
        {label}
      </Link>
    );
  }

  return (
    <header className="bg-brand-primary text-white sticky top-0 z-50 shadow-md">
      <div className="mx-auto max-w-7xl px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
            EstateHub
          </Link>

          {/* Mode toggle */}
          <div className="hidden md:flex items-center gap-1 bg-brand-accent/30 rounded-full px-1 py-1">
            <Link
              href="/properties"
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${isMarketplace ? "bg-white text-brand-primary shadow" : "text-blue-100 hover:text-white"}`}
            >
              Marketplace
            </Link>
            <Link
              href="/society"
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${isSociety ? "bg-white text-brand-primary shadow" : "text-blue-100 hover:text-white"}`}
            >
              My Society
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {isMarketplace ? (
              <>
                {navLink("/properties", "Buy / Rent")}
                {navLink("/properties/new", "List Property")}
                {navLink("/loans", "Home Loans")}
                {navLink("/dashboard/listings", "My Listings")}
              </>
            ) : (
              <>
                {navLink("/society", "Home")}
                {navLink("/society/visitors/new", "Visitor Pass")}
                {navLink("/society/bills", "Bills")}
                {navLink("/society/amenities", "Amenities")}
                {navLink("/society/complaints/new", "Complaints")}
                {navLink("/society/notices", "Notices")}
              </>
            )}
            <Link href="/sign-in" className="btn-secondary border-white text-white text-xs px-3 py-1.5 hover:!bg-white/20">
              Sign In
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded text-white"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-3 border-t border-blue-700 pt-3">
            {/* Mode toggle mobile */}
            <div className="flex gap-2 mb-1">
              <Link
                href="/properties"
                onClick={() => setMenuOpen(false)}
                className={`flex-1 text-center text-xs px-3 py-2 rounded-full font-medium transition ${isMarketplace ? "bg-white text-brand-primary" : "text-blue-100 border border-blue-400"}`}
              >
                Marketplace
              </Link>
              <Link
                href="/society"
                onClick={() => setMenuOpen(false)}
                className={`flex-1 text-center text-xs px-3 py-2 rounded-full font-medium transition ${isSociety ? "bg-white text-brand-primary" : "text-blue-100 border border-blue-400"}`}
              >
                My Society
              </Link>
            </div>
            {isMarketplace ? (
              <>
                <Link href="/properties" onClick={() => setMenuOpen(false)} className="text-blue-100 hover:text-white text-sm">Buy / Rent</Link>
                <Link href="/properties/new" onClick={() => setMenuOpen(false)} className="text-blue-100 hover:text-white text-sm">List Property</Link>
                <Link href="/loans" onClick={() => setMenuOpen(false)} className="text-blue-100 hover:text-white text-sm">Home Loans</Link>
                <Link href="/dashboard/listings" onClick={() => setMenuOpen(false)} className="text-blue-100 hover:text-white text-sm">My Listings</Link>
              </>
            ) : (
              <>
                <Link href="/society" onClick={() => setMenuOpen(false)} className="text-blue-100 hover:text-white text-sm">Home</Link>
                <Link href="/society/visitors/new" onClick={() => setMenuOpen(false)} className="text-blue-100 hover:text-white text-sm">Visitor Pass</Link>
                <Link href="/society/bills" onClick={() => setMenuOpen(false)} className="text-blue-100 hover:text-white text-sm">Bills</Link>
                <Link href="/society/amenities" onClick={() => setMenuOpen(false)} className="text-blue-100 hover:text-white text-sm">Amenities</Link>
                <Link href="/society/complaints/new" onClick={() => setMenuOpen(false)} className="text-blue-100 hover:text-white text-sm">Complaints</Link>
                <Link href="/society/notices" onClick={() => setMenuOpen(false)} className="text-blue-100 hover:text-white text-sm">Notices</Link>
              </>
            )}
            <Link href="/sign-in" onClick={() => setMenuOpen(false)} className="text-sm text-blue-100 border border-blue-400 rounded px-3 py-2 text-center">Sign In</Link>
          </nav>
        )}
      </div>
    </header>
  );
}
