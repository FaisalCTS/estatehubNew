import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

// Default amenities shown when none are seeded in the DB
const DEFAULT_AMENITIES = [
  { id: "demo-pool",    name: "Swimming Pool", icon: "🏊", isFree: true,  feeAmount: null, description: "Open 6 AM – 9 PM · Adult & kids pools" },
  { id: "demo-gym",     name: "Gym",            icon: "🏋️", isFree: true,  feeAmount: null, description: "Fully equipped · Open 5 AM – 10 PM" },
  { id: "demo-party",   name: "Party Hall",     icon: "🎉", isFree: false, feeAmount: 2000, description: "Capacity 100 · AV system · Catering allowed" },
  { id: "demo-guest",   name: "Guest Room",     icon: "🛏️", isFree: false, feeAmount: 800,  description: "2 guest rooms · AC · Private bathroom" },
  { id: "demo-tennis",  name: "Tennis Court",   icon: "🎾", isFree: true,  feeAmount: null, description: "Flood-lit · Racket rental available" },
  { id: "demo-banquet", name: "Banquet Hall",   icon: "🏛️", isFree: false, feeAmount: 5000, description: "Capacity 300 · Stage · Professional lighting" }
];

export default async function AmenitiesPage() {
  const society = await prisma.society.findFirst({
    where: { name: "Prestige Lakeside Habitat" },
    include: { bookableAmenities: true }
  }).catch(() => null);

  const dbAmenities = society?.bookableAmenities ?? [];
  const amenities = dbAmenities.length > 0 ? dbAmenities : DEFAULT_AMENITIES;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <nav className="text-xs text-brand-muted mb-4 flex items-center gap-1">
        <Link href="/society" className="hover:underline">My Society</Link>
        <span>/</span>
        <span>Amenities</span>
      </nav>

      <h1 className="text-2xl font-bold text-brand-primary mb-6">Book an Amenity</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {amenities.map((a) => (
          <Link
            key={a.id}
            href={`/society/amenities/${a.id}/book`}
            className="card flex items-start gap-4 hover:border-brand-accent hover:shadow-md"
          >
            <span className="text-3xl">{a.icon ?? "🏢"}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-brand-ink">{a.name}</p>
                {a.isFree ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Free</span>
                ) : (
                  <span className="text-xs bg-brand-light text-brand-primary px-2 py-0.5 rounded-full">
                    {formatPrice(a.feeAmount ? String(a.feeAmount) : "0")}
                  </span>
                )}
              </div>
              {a.description && (
                <p className="text-xs text-brand-muted line-clamp-2">{a.description}</p>
              )}
              <p className="text-xs text-brand-accent mt-2 font-medium">Book a slot →</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
