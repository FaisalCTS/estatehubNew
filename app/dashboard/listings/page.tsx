import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice, formatArea } from "@/lib/format";

export default async function MyListingsPage() {
  // NOTE: replace with authenticated user's ID once Clerk is wired up
  const owner = await prisma.user.findFirst({ where: { phone: "+919876543210" } }).catch(() => null);

  const listings = owner
    ? await prisma.property.findMany({
        where: { ownerId: owner.id },
        include: {
          photos: { take: 1, orderBy: { order: "asc" } },
          visits: { where: { status: { in: ["REQUESTED", "CONFIRMED"] } } },
          _count: { select: { savedBy: true } }
        },
        orderBy: { createdAt: "desc" }
      }).catch(() => [])
    : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-primary">My Listings</h1>
        <Link href="/properties/new" className="btn-primary text-sm">+ New listing</Link>
      </div>

      {listings.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-3xl mb-3">🏠</p>
          <p className="font-medium text-brand-ink mb-1">No listings yet</p>
          <p className="text-brand-muted text-sm mb-4">List your property to start receiving leads.</p>
          <Link href="/properties/new" className="btn-primary text-sm">List a property</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((p) => {
            const healthScore = Math.min(100, 40 + (p.photos.length > 0 ? 20 : 0) + (p.description ? 20 : 0) + (p.amenities.length > 0 ? 10 : 0) + (p.verification !== "SELF_DECLARED" ? 10 : 0));
            return (
              <div key={p.id} className="card flex flex-col md:flex-row gap-4">
                {/* Thumbnail */}
                <div className="w-full md:w-40 h-28 bg-brand-light rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-brand-muted text-sm">
                  {p.photos[0]?.url ? (
                    <img src={p.photos[0].url} alt={p.title} className="w-full h-full object-cover" />
                  ) : "No photo"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <Link href={`/properties/${p.id}`} className="font-semibold text-brand-ink hover:text-brand-accent line-clamp-1">
                      {p.title}
                    </Link>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-sm text-brand-muted mb-2">
                    {p.bhk} BHK · {formatArea(p.carpetArea)} · {p.locality}, {p.city}
                  </p>
                  <p className="text-lg font-bold text-brand-primary mb-3">
                    {formatPrice(p.price.toString())}
                    {p.intent === "RENT" && <span className="text-sm font-normal text-brand-muted">/mo</span>}
                  </p>

                  {/* Metrics */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-brand-muted">Saves</span>
                      <span className="font-semibold text-brand-ink ml-1">{p._count.savedBy}</span>
                    </div>
                    <div>
                      <span className="text-brand-muted">Visits pending</span>
                      <span className="font-semibold text-brand-ink ml-1">{p.visits.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-brand-muted">Listing health</span>
                      <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-accent rounded-full" style={{ width: `${healthScore}%` }} />
                      </div>
                      <span className="font-semibold text-brand-ink">{healthScore}/100</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col gap-2 shrink-0">
                  <Link href={`/properties/${p.id}`} className="btn-secondary text-xs px-3 py-2">View</Link>
                  <Link href={`/properties/${p.id}/edit`} className="btn-secondary text-xs px-3 py-2">Edit</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    LIVE:                "bg-green-100 text-green-700",
    DRAFT:               "bg-gray-100 text-gray-600",
    PENDING_VERIFICATION:"bg-yellow-100 text-yellow-700",
    SOLD:                "bg-blue-100 text-blue-700",
    RENTED:              "bg-blue-100 text-blue-700",
    WITHDRAWN:           "bg-red-100 text-red-700"
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}
