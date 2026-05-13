import { prisma } from "@/lib/prisma";
import { PropertyCard } from "@/components/PropertyCard";
import { SearchFilters } from "@/components/SearchFilters";
import { Suspense } from "react";
import Link from "next/link";
type SearchParams = {
  city?: string;
  locality?: string;
  bhk?: string;
  intent?: string;
  minPrice?: string;
  maxPrice?: string;
  furnishing?: string;
  sort?: string;
};

export default async function PropertiesPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = { status: "LIVE" };

  if (params.intent === "SELL" || params.intent === "RENT") where.intent = params.intent;
  if (params.bhk) where.bhk = parseInt(params.bhk);
  if (params.furnishing) where.furnishing = params.furnishing;
  if (params.city) where.city = { contains: params.city };
  if (params.locality) {
    where.OR = [
      { locality: { contains: params.locality } },
      { city: { contains: params.locality } },
      { addressLine: { contains: params.locality } }
    ];
  }
  if (params.minPrice || params.maxPrice) {
    where.price = {};
    if (params.minPrice) where.price.gte = parseFloat(params.minPrice);
    if (params.maxPrice) where.price.lte = parseFloat(params.maxPrice);
  }

  const orderBy =
    params.sort === "price_asc" ? { price: "asc" as const }
    : params.sort === "price_desc" ? { price: "desc" as const }
    : { publishedAt: "desc" as const };

  const properties = await prisma.property.findMany({
    where,
    include: { photos: { take: 1, orderBy: { order: "asc" } } },
    orderBy,
    take: 48
  }).catch(() => []);

  const intentLabel = params.intent === "SELL" ? "Properties for Sale" : params.intent === "RENT" ? "Properties for Rent" : "All Properties";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-brand-primary">{intentLabel}</h1>
          <p className="text-brand-muted text-sm mt-0.5">
            {properties.length} {properties.length === 1 ? "property" : "properties"} found
            {params.locality ? ` in "${params.locality}"` : ""}
          </p>
        </div>
        <Link href="/properties/new" className="btn-primary text-sm hidden md:inline-flex">
          + List Property
        </Link>
      </div>

      {/* Filters — needs Suspense because it uses useSearchParams */}
      <Suspense fallback={<div className="h-24 bg-gray-100 rounded-xl animate-pulse mb-6" />}>
        <SearchFilters />
      </Suspense>

      {/* Results */}
      {properties.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-2xl mb-3">🔍</p>
          <p className="font-semibold text-brand-ink mb-1">No properties found</p>
          <p className="text-brand-muted text-sm">Try adjusting your filters or search in a different locality.</p>
          <Link href="/properties" className="btn-secondary mt-4 text-sm">Clear filters</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}
