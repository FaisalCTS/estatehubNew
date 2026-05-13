import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "EstateHub — Find Homes. Live Well.",
  description: "India's unified real estate marketplace and society management platform."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
        <NavBar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-200 bg-white">

          <div className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm text-brand-muted">
            <div>
              <p className="font-semibold text-brand-primary mb-2">EstateHub</p>
              <p className="text-xs">India&apos;s unified real estate platform — buy, sell, rent, and manage your society life in one place.</p>
            </div>
            <div>
              <p className="font-semibold text-brand-ink mb-2">Marketplace</p>
              <ul className="space-y-1">
                <li><a href="/properties?intent=sell" className="hover:text-brand-accent">Buy Property</a></li>
                <li><a href="/properties?intent=rent" className="hover:text-brand-accent">Rent Property</a></li>
                <li><a href="/properties/new" className="hover:text-brand-accent">List Property</a></li>
                <li><a href="/loans" className="hover:text-brand-accent">Home Loans</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-brand-ink mb-2">Society</p>
              <ul className="space-y-1">
                <li><a href="/society/visitors/new" className="hover:text-brand-accent">Visitor Pass</a></li>
                <li><a href="/society/bills" className="hover:text-brand-accent">Pay Bills</a></li>
                <li><a href="/society/amenities" className="hover:text-brand-accent">Book Amenities</a></li>
                <li><a href="/society/complaints/new" className="hover:text-brand-accent">Raise Complaint</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-brand-ink mb-2">Company</p>
              <ul className="space-y-1">
                <li><a href="/about" className="hover:text-brand-accent">About Us</a></li>
                <li><a href="/privacy" className="hover:text-brand-accent">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-brand-accent">Terms of Use</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 px-4 py-3 text-center text-xs text-brand-muted">
            © {new Date().getFullYear()} EstateHub. Built with Next.js, Prisma & Tailwind CSS.
          </div>
        </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
