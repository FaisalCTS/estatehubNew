import Link from "next/link";
import Image from "next/image";
import type { Property, PropertyPhoto } from "@prisma/client";
import { formatPrice, formatArea, humanise } from "@/lib/format";

type PropertyWithPhotos = Property & { photos: PropertyPhoto[] };

// SQLite: amenities is stored as Json (string[]); cast for rendering
function getAmenities(p: Property): string[] {
  try { return JSON.parse(p.amenities as string) as string[]; } catch { return []; }
}

export function PropertyCard({ property }: { property: PropertyWithPhotos }) {
  const photo = property.photos[0]?.url;
  const verifiedBadge =
    property.verification === "PHYSICALLY_VERIFIED" ? "⭐ Physically Verified"
    : property.verification === "DOCUMENT_VERIFIED"  ? "✓ Verified"
    : null;

  void getAmenities; // suppress unused-var warning — available for future use

  return (
    <Link href={`/properties/${property.id}`} className="card block hover:scale-[1.01]">
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-brand-light mb-3 relative">
        {photo ? (
          <Image
            src={photo}
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-brand-muted">
            No photo
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-1">
        {verifiedBadge && (
          <span className="text-xs bg-brand-light text-brand-primary px-2 py-0.5 rounded-full">
            {verifiedBadge}
          </span>
        )}
        <span className="text-xs text-brand-muted">
          {humanise(property.intent)}
        </span>
      </div>

      <h3 className="font-semibold text-brand-ink mb-1 line-clamp-1">{property.title}</h3>
      <p className="text-sm text-brand-muted mb-3 line-clamp-1">
        {property.locality}, {property.city}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-brand-primary">
          {formatPrice(property.price.toString())}
          {property.intent === "RENT" && <span className="text-sm font-normal text-brand-muted">/mo</span>}
        </span>
        <span className="text-xs text-brand-muted">
          {property.bhk} BHK · {formatArea(property.carpetArea)}
        </span>
      </div>
    </Link>
  );
}
