import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PropertyCard } from "@/components/PropertyCard";

// Server component — runs on the server, fetches data directly via Prisma.
// No useEffect, no fetch, no API route needed for read-on-load.
export default async function HomePage() {
  const featured = await prisma.property
    .findMany({
      where: { status: "LIVE" },
      include: { photos: { take: 1, orderBy: { order: "asc" } } },
      take: 6,
      orderBy: { publishedAt: "desc" }
    })
    .catch(() => []); // graceful fallback if DB isn't connected yet

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-primary to-brand-accent text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Find homes. Live well.
          </h1>
          <p className="text-lg md:text-xl text-brand-light mb-8 max-w-2xl mx-auto">
            India&apos;s unified real estate platform — discover verified properties and manage your society life in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/properties" className="btn-primary bg-white !text-brand-primary hover:!bg-brand-light">
              Browse Properties
            </Link>
            <Link href="/properties/new" className="btn-secondary border-white text-white hover:!bg-white/10">
              List Your Property
            </Link>
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl">Featured properties</h2>
          <Link href="/properties" className="text-brand-accent hover:underline text-sm">
            View all →
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-brand-muted mb-2">No properties yet.</p>
            <p className="text-sm text-brand-muted">
              Run <code className="bg-gray-100 px-2 py-1 rounded">npm run db:seed</code> to add sample data,
              or list your own property.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </section>

      {/* Mode toggle promo */}
      <section className="bg-white border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-16 grid md:grid-cols-2 gap-8">
          <div className="card">
            <h3 className="text-xl mb-2">For Buyers & Renters</h3>
            <p className="text-brand-muted mb-4">
              Verified listings, owner-direct contact, virtual tours, and EMI calculators all in one place.
            </p>
            <Link href="/properties" className="text-brand-accent hover:underline">
              Start searching →
            </Link>
          </div>
          <div className="card">
            <h3 className="text-xl mb-2">For Society Residents</h3>
            <p className="text-brand-muted mb-4">
              Visitor passes, maintenance bills, amenity bookings, and complaint tracking — all from your phone.
            </p>
            <Link href="/society" className="text-brand-accent hover:underline">
              Open My Society →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
