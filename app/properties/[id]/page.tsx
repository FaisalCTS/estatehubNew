import { prisma } from "@/lib/prisma";
import { formatPrice, formatArea, humanise } from "@/lib/format";
import { EmiCalculator } from "@/components/EmiCalculator";
import { LocalityScore } from "@/components/LocalityScore";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PropertyDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { order: "asc" } },
      owner: { select: { name: true, isKycVerified: true } },
      society: { select: { name: true, amenityTags: true } }
    }
  }).catch(() => null);

  if (!property) notFound();

  const verificationBadge =
    property.verification === "PHYSICALLY_VERIFIED" ? { label: "⭐ Physically Verified", cls: "bg-green-100 text-green-800" }
    : property.verification === "DOCUMENT_VERIFIED"  ? { label: "✓ Document Verified",   cls: "bg-brand-light text-brand-primary" }
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-brand-muted mb-4 flex items-center gap-1">
        <Link href="/properties" className="hover:underline">Properties</Link>
        <span>/</span>
        <span>{property.locality}</span>
        <span>/</span>
        <span className="text-brand-ink truncate max-w-48">{property.title}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left column: gallery + details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery */}
          <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
            {property.photos.length === 0 ? (
              <div className="col-span-2 aspect-video bg-brand-light flex items-center justify-center text-brand-muted rounded-xl">
                No photos available
              </div>
            ) : (
              <>
                <div className="col-span-2 md:col-span-1 aspect-video md:row-span-2 relative bg-brand-light">
                  <Image
                    src={property.photos[0].url}
                    alt={property.photos[0].caption ?? property.title}
                    fill sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                </div>
                {property.photos.slice(1, 3).map((photo) => (
                  <div key={photo.id} className="aspect-video relative bg-brand-light hidden md:block">
                    <Image
                      src={photo.url}
                      alt={photo.caption ?? property.title}
                      fill sizes="25vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </>
            )}
          </div>
          {property.photos.length > 3 && (
            <p className="text-xs text-brand-muted -mt-1 text-right">
              +{property.photos.length - 3} more photos
            </p>
          )}

          {/* Headline */}
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {verificationBadge && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${verificationBadge.cls}`}>
                  {verificationBadge.label}
                </span>
              )}
              <span className="text-xs bg-gray-100 text-brand-muted px-2 py-0.5 rounded-full">
                {humanise(property.intent)}
              </span>
              <span className="text-xs bg-gray-100 text-brand-muted px-2 py-0.5 rounded-full">
                {humanise(property.type)}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-brand-primary mb-1">{property.title}</h1>
            <p className="text-brand-muted text-sm">
              {property.addressLine}, {property.locality}, {property.city} — {property.pincode}
            </p>
          </div>

          {/* Price & key facts */}
          <div className="card">
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-brand-primary">
                {formatPrice(property.price.toString())}
              </span>
              {property.intent === "RENT" && <span className="text-brand-muted">/month</span>}
              {property.isNegotiable && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Negotiable</span>
              )}
            </div>
            {property.pricePerSqft && (
              <p className="text-sm text-brand-muted mb-4">
                {formatPrice(property.pricePerSqft.toString())}/sqft
              </p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
              <Fact label="Configuration" value={`${property.bhk} BHK`} />
              <Fact label="Carpet Area" value={formatArea(property.carpetArea)} />
              <Fact label="Furnishing" value={humanise(property.furnishing)} />
              <Fact label="Floor" value={property.floor != null ? `${property.floor} of ${property.totalFloors ?? "—"}` : "—"} />
              <Fact label="Bathrooms" value={`${property.bathrooms}`} />
              <Fact label="Balconies" value={`${property.balconies}`} />
              {property.ageYears != null && <Fact label="Age" value={property.ageYears === 0 ? "New" : `${property.ageYears} years`} />}
              {property.facing && <Fact label="Facing" value={property.facing} />}
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="card">
              <h2 className="text-lg font-semibold text-brand-primary mb-3">About this property</h2>
              <p className="text-brand-muted leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>
          )}

          {/* Society amenities */}
          {(() => {
            const propAmenities: string[] = (() => { try { return JSON.parse(property.amenities as string) as string[]; } catch { return []; } })();
            const socAmenities: string[] = (() => { try { return JSON.parse((property.society?.amenityTags as string | undefined) ?? "[]") as string[]; } catch { return []; } })();
            const allAmenities = [...new Set([...propAmenities, ...socAmenities])];
            return allAmenities.length > 0 ? (
            <div className="card">
              <h2 className="text-lg font-semibold text-brand-primary mb-3">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {allAmenities.map((a) => (
                  <span key={a} className="text-sm bg-brand-light text-brand-primary px-3 py-1 rounded-full">
                    {a}
                  </span>
                ))}
              </div>
            </div>
            ) : null;
          })()}

          {/* Locality score */}
          <LocalityScore locality={property.locality} city={property.city} />
        </div>

        {/* Right column: CTAs + owner + EMI */}
        <div className="space-y-4">
          {/* Owner card */}
          <div className="card">
            <p className="text-xs text-brand-muted uppercase tracking-wide mb-1">Listed by</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-brand-primary font-bold text-sm">
                {property.owner.name?.[0] ?? "?"}
              </div>
              <div>
                <p className="font-semibold text-brand-ink text-sm">{property.owner.name ?? "Owner"}</p>
                {property.owner.isKycVerified && (
                  <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    KYC Verified
                  </span>
                )}
              </div>
            </div>
            <Link href={`/properties/${property.id}/schedule`} className="btn-primary w-full text-center text-sm mb-2 block">
              Schedule Visit
            </Link>
            <button className="btn-secondary w-full text-sm">
              Contact Owner
            </button>
            <p className="text-xs text-center text-brand-muted mt-2">
              Phone number shared after login
            </p>
          </div>

          {/* Quick share */}
          <div className="card flex gap-3">
            <button className="flex-1 text-xs text-brand-muted border border-gray-200 rounded-lg py-2 hover:border-brand-accent hover:text-brand-accent transition">
              ♡ Save
            </button>
            <button
              className="flex-1 text-xs text-brand-muted border border-gray-200 rounded-lg py-2 hover:border-brand-accent hover:text-brand-accent transition"
              onClick={() => {}}
            >
              ↑ Share
            </button>
          </div>

          {/* EMI calculator */}
          {property.intent === "SELL" && (
            <EmiCalculator listingPrice={Number(property.price)} />
          )}

          {/* Maintenance */}
          {property.maintenanceMonthly && (
            <div className="card text-sm">
              <p className="text-brand-muted text-xs uppercase tracking-wide mb-1">Monthly Maintenance</p>
              <p className="font-semibold text-brand-ink">{formatPrice(property.maintenanceMonthly.toString())}/mo</p>
            </div>
          )}

          {/* Available from */}
          {property.availableFrom && (
            <div className="card text-sm">
              <p className="text-brand-muted text-xs uppercase tracking-wide mb-1">Available From</p>
              <p className="font-semibold text-brand-ink">
                {new Date(property.availableFrom).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-brand-muted uppercase tracking-wide mb-0.5">{label}</div>
      <div className="font-semibold text-brand-ink text-sm">{value}</div>
    </div>
  );
}
