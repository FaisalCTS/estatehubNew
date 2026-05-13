"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const BHK_OPTIONS = [1, 2, 3, 4, 5];
const FURNISHING_OPTIONS = [
  { value: "UNFURNISHED", label: "Unfurnished" },
  { value: "SEMI_FURNISHED", label: "Semi" },
  { value: "FULLY_FURNISHED", label: "Fully" }
];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" }
];

export function SearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const get = (key: string) => searchParams.get(key) ?? "";

  const push = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // reset to page 1 on filter change
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const toggleBhk = (bhk: number) => {
    const current = get("bhk");
    push("bhk", current === String(bhk) ? "" : String(bhk));
  };

  const toggleFurnishing = (val: string) => {
    const current = get("furnishing");
    push("furnishing", current === val ? "" : val);
  };

  const clearAll = () => {
    router.push(pathname);
  };

  const hasFilters = !!(get("intent") || get("bhk") || get("minPrice") || get("maxPrice") || get("furnishing") || get("locality"));

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 space-y-4">
      {/* Row 1: intent + locality search */}
      <div className="flex flex-wrap gap-3">
        {/* Intent toggle */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
          {(["", "SELL", "RENT"] as const).map((val) => (
            <button
              key={val}
              onClick={() => push("intent", val)}
              className={`px-4 py-2 transition ${get("intent") === val ? "bg-brand-primary text-white" : "text-brand-muted hover:bg-brand-light"}`}
            >
              {val === "" ? "All" : val === "SELL" ? "Buy" : "Rent"}
            </button>
          ))}
        </div>

        {/* Locality search */}
        <input
          type="text"
          placeholder="Search locality, society, city…"
          defaultValue={get("locality")}
          onKeyDown={(e) => {
            if (e.key === "Enter") push("locality", (e.target as HTMLInputElement).value.trim());
          }}
          onBlur={(e) => push("locality", e.target.value.trim())}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:border-brand-accent"
        />

        {/* Sort */}
        <select
          value={get("sort") || "newest"}
          onChange={(e) => push("sort", e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-accent"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Row 2: BHK + price + furnishing */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* BHK */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-brand-muted uppercase tracking-wide">BHK</span>
          <div className="flex gap-1">
            {BHK_OPTIONS.map((b) => (
              <button
                key={b}
                onClick={() => toggleBhk(b)}
                className={`w-9 h-9 rounded-lg text-sm font-medium border transition ${get("bhk") === String(b) ? "bg-brand-primary text-white border-brand-primary" : "border-gray-200 text-brand-ink hover:border-brand-accent"}`}
              >
                {b === 5 ? "5+" : b}
              </button>
            ))}
          </div>
        </div>

        {/* Price range */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-brand-muted uppercase tracking-wide">Price</span>
          <input
            type="number"
            placeholder="Min (₹)"
            defaultValue={get("minPrice")}
            onBlur={(e) => push("minPrice", e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-2 text-sm w-28 focus:outline-none focus:border-brand-accent"
          />
          <span className="text-brand-muted text-xs">to</span>
          <input
            type="number"
            placeholder="Max (₹)"
            defaultValue={get("maxPrice")}
            onBlur={(e) => push("maxPrice", e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-2 text-sm w-28 focus:outline-none focus:border-brand-accent"
          />
        </div>

        {/* Furnishing */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-brand-muted uppercase tracking-wide">Furnishing</span>
          <div className="flex gap-1">
            {FURNISHING_OPTIONS.map((f) => (
              <button
                key={f.value}
                onClick={() => toggleFurnishing(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${get("furnishing") === f.value ? "bg-brand-primary text-white border-brand-primary" : "border-gray-200 text-brand-ink hover:border-brand-accent"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={clearAll}
            className="ml-auto text-xs text-brand-accent hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}
