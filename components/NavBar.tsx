"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";

export function NavBar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, isLoading, openSignIn, logout } = useAuth();

  const isSociety =
    pathname.startsWith("/society") ||
    pathname.startsWith("/gate") ||
    pathname.startsWith("/admin");
  const isMarketplace = !isSociety;

  // Close user dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function navLink(href: string, label: string) {
    const active = pathname === href || (href !== "/" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        className={`text-sm transition hover:text-brand-light ${
          active ? "font-semibold text-white underline underline-offset-4" : "text-blue-100"
        }`}
      >
        {label}
      </Link>
    );
  }

  const displayName = user
    ? (user.name?.split(" ")[0] ?? user.email.split("@")[0])
    : null;

  const initials = user
    ? (user.name ?? user.email)[0].toUpperCase()
    : null;

  function AuthButton() {
    if (isLoading) return <div className="w-20 h-7 rounded bg-white/10 animate-pulse" />;

    if (user) {
      return (
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-full pl-1 pr-3 py-1 transition"
          >
            <span className="w-7 h-7 rounded-full bg-white text-brand-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
              {initials}
            </span>
            <span className="text-sm text-white font-medium">{displayName}</span>
            <svg
              className={`w-3.5 h-3.5 text-blue-200 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl py-1.5 w-48 z-50 border border-gray-100">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-brand-primary truncate">{user.name ?? "User"}</p>
                <p className="text-xs text-brand-muted truncate">{user.email}</p>
              </div>
              <Link
                href="/dashboard/listings"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-ink hover:bg-brand-surface transition"
              >
                My Listings
              </Link>
              <Link
                href="/society"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-ink hover:bg-brand-surface transition"
              >
                My Society
              </Link>
              <div className="border-t border-gray-100 mt-1" />
              <button
                onClick={() => { logout(); setUserMenuOpen(false); }}
                className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        onClick={openSignIn}
        className="border border-white/60 text-white text-xs px-3 py-1.5 rounded hover:bg-white/20 transition font-medium"
      >
        Sign In
      </button>
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
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                isMarketplace ? "bg-white text-brand-primary shadow" : "text-blue-100 hover:text-white"
              }`}
            >
              Marketplace
            </Link>
            <Link
              href="/society"
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                isSociety ? "bg-white text-brand-primary shadow" : "text-blue-100 hover:text-white"
              }`}
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
            <AuthButton />
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded text-white"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
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
                className={`flex-1 text-center text-xs px-3 py-2 rounded-full font-medium transition ${
                  isMarketplace ? "bg-white text-brand-primary" : "text-blue-100 border border-blue-400"
                }`}
              >
                Marketplace
              </Link>
              <Link
                href="/society"
                onClick={() => setMenuOpen(false)}
                className={`flex-1 text-center text-xs px-3 py-2 rounded-full font-medium transition ${
                  isSociety ? "bg-white text-brand-primary" : "text-blue-100 border border-blue-400"
                }`}
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

            {/* Mobile auth */}
            {user ? (
              <div className="border-t border-blue-700 pt-3 mt-1">
                <p className="text-xs text-blue-200 mb-2">Signed in as <span className="font-semibold text-white">{user.name ?? user.email}</span></p>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="w-full text-center text-sm text-red-300 border border-red-400/50 rounded px-3 py-2"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => { openSignIn(); setMenuOpen(false); }}
                className="text-sm text-blue-100 border border-blue-400 rounded px-3 py-2 text-center"
              >
                Sign In
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
