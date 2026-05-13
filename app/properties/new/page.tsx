"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";

// ─── Types ────────────────────────────────────────────────────────────────
type Intent = "SELL" | "RENT";
type PropertyType = "APARTMENT" | "VILLA" | "PLOT" | "INDEPENDENT_HOUSE";
type Furnishing = "UNFURNISHED" | "SEMI_FURNISHED" | "FULLY_FURNISHED";
type Verification = "SELF_DECLARED" | "DOCUMENT_VERIFIED" | "PHYSICALLY_VERIFIED";

type FormData = {
  intent: Intent;
  type: PropertyType;
  addressLine: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  bhk: number;
  carpetArea: number;
  bathrooms: number;
  balconies: number;
  furnishing: Furnishing;
  ageYears: number;
  floor: number;
  totalFloors: number;
  photoUrls: string[];
  price: number;
  isNegotiable: boolean;
  verification: Verification;
  title: string;
  description: string;
  amenities: string[];
};

const INITIAL: FormData = {
  intent: "SELL", type: "APARTMENT",
  addressLine: "", locality: "", city: "Bengaluru", state: "Karnataka", pincode: "",
  bhk: 2, carpetArea: 1000, bathrooms: 2, balconies: 1,
  furnishing: "SEMI_FURNISHED", ageYears: 0, floor: 0, totalFloors: 0,
  photoUrls: [], price: 0, isNegotiable: true,
  verification: "SELF_DECLARED", title: "", description: "", amenities: []
};

const STEPS = ["Intent", "Address", "Details", "Media", "Pricing", "Verify"];

const AMENITY_OPTIONS = [
  "Swimming Pool", "Gym", "Clubhouse", "Power Backup", "Lift",
  "Tennis Court", "Kids Play Area", "Visitor Parking", "Security", "CCTV",
  "Gas Pipeline", "Solar Panels", "Intercom", "Garden"
];

const CITIES = ["Bengaluru", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad"];
const STATES = ["Karnataka", "Maharashtra", "Delhi", "Telangana", "Tamil Nadu", "Gujarat", "West Bengal"];

// Deterministic "smart price" range based on area + locality
function suggestedRange(data: FormData): { low: number; high: number } | null {
  if (!data.carpetArea || !data.city) return null;
  const base = data.city === "Mumbai" ? 18000 : data.city === "Delhi" ? 15000 : 8000;
  const age = Math.max(0, 20 - (data.ageYears ?? 0));
  const ppsf = base + age * 100 + (data.furnishing === "FULLY_FURNISHED" ? 1000 : 0);
  const low = Math.round((ppsf * data.carpetArea) / 100000) * 100000;
  const high = Math.round((ppsf * data.carpetArea * 1.1) / 100000) * 100000;
  return data.intent === "RENT"
    ? { low: Math.round(low / 250), high: Math.round(high / 250) }
    : { low, high };
}

export default function NewPropertyPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [photoInput, setPhotoInput] = useState("");
  const router = useRouter();

  const update = (patch: Partial<FormData>) => setForm((f) => ({ ...f, ...patch }));
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  function toggleAmenity(a: string) {
    update({ amenities: form.amenities.includes(a) ? form.amenities.filter((x) => x !== a) : [...form.amenities, a] });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // NOTE: replace "seed-owner-1" with the authenticated user's ID once Clerk is wired up
      const body = {
        ownerId: "seed-owner-placeholder",
        title: form.title || `${form.bhk} BHK ${form.type === "APARTMENT" ? "Apartment" : form.type} in ${form.locality}`,
        description: form.description,
        intent: form.intent,
        type: form.type,
        bhk: form.bhk,
        carpetArea: form.carpetArea,
        bathrooms: form.bathrooms,
        balconies: form.balconies,
        furnishing: form.furnishing,
        ageYears: form.ageYears,
        floor: form.floor,
        totalFloors: form.totalFloors,
        price: form.price,
        isNegotiable: form.isNegotiable,
        addressLine: form.addressLine,
        locality: form.locality,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        amenities: form.amenities
      };
      const res = await fetch("/api/properties", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json() as { data?: { id: string }; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed to create listing");
      router.push(`/properties/${json.data!.id}?created=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  const range = suggestedRange(form);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-primary mb-1">List Your Property</h1>
      <p className="text-brand-muted text-sm mb-6">Fill in {STEPS.length} quick steps — takes under 10 minutes.</p>

      {/* Progress bar */}
      <div className="flex items-center gap-1 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1">
            <div className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? "bg-brand-primary" : "bg-gray-200"}`} />
            <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all shrink-0
              ${i < step ? "bg-brand-primary border-brand-primary text-white"
              : i === step ? "border-brand-primary text-brand-primary bg-white"
              : "border-gray-200 text-brand-muted"}`}>
              {i < step ? "✓" : i + 1}
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm font-semibold text-brand-ink mb-6">Step {step + 1}: {STEPS[step]}</p>

      <form onSubmit={submit} className="space-y-6">
        {/* ── Step 0: Intent ── */}
        {step === 0 && (
          <div className="card space-y-4">
            <div>
              <Label>What do you want to do?</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {(["SELL", "RENT"] as Intent[]).map((v) => (
                  <button key={v} type="button" onClick={() => update({ intent: v })}
                    className={`p-4 rounded-xl border-2 text-left transition ${form.intent === v ? "border-brand-primary bg-brand-light" : "border-gray-200 hover:border-brand-accent"}`}>
                    <p className="text-lg mb-1">{v === "SELL" ? "🏷️" : "🔑"}</p>
                    <p className="font-semibold">{v === "SELL" ? "Sell my property" : "Rent it out"}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Property type</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {([["APARTMENT", "🏢", "Apartment"], ["VILLA", "🏡", "Villa / Row House"], ["PLOT", "🌳", "Plot / Land"], ["INDEPENDENT_HOUSE", "🏠", "Independent House"]] as [PropertyType, string, string][]).map(([v, icon, label]) => (
                  <button key={v} type="button" onClick={() => update({ type: v })}
                    className={`p-3 rounded-xl border-2 text-left text-sm transition flex items-center gap-2 ${form.type === v ? "border-brand-primary bg-brand-light" : "border-gray-200 hover:border-brand-accent"}`}>
                    <span>{icon}</span> {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 1: Address ── */}
        {step === 1 && (
          <div className="card space-y-4">
            <div>
              <Label>Address line</Label>
              <input type="text" required placeholder="e.g. Tower A, Flat 1204, Prestige Lakeside"
                value={form.addressLine} onChange={(e) => update({ addressLine: e.target.value })}
                className="field mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Locality / Area</Label>
                <input type="text" required placeholder="e.g. Whitefield"
                  value={form.locality} onChange={(e) => update({ locality: e.target.value })}
                  className="field mt-1" />
              </div>
              <div>
                <Label>Pincode</Label>
                <input type="text" required pattern="\d{6}" placeholder="560066"
                  value={form.pincode} onChange={(e) => update({ pincode: e.target.value })}
                  className="field mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <select value={form.city} onChange={(e) => update({ city: e.target.value })} className="field mt-1">
                  {CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label>State</Label>
                <select value={form.state} onChange={(e) => update({ state: e.target.value })} className="field mt-1">
                  {STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Property details ── */}
        {step === 2 && (
          <div className="card space-y-5">
            <div>
              <Label>BHK Configuration</Label>
              <div className="flex gap-2 mt-2">
                {[1,2,3,4,5].map((b) => (
                  <button key={b} type="button" onClick={() => update({ bhk: b })}
                    className={`w-12 h-12 rounded-xl border-2 font-semibold text-sm transition ${form.bhk === b ? "border-brand-primary bg-brand-light text-brand-primary" : "border-gray-200 hover:border-brand-accent"}`}>
                    {b}{b === 5 ? "+" : ""}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Carpet Area (sqft)</Label>
                <input type="number" min={100} max={50000} required value={form.carpetArea}
                  onChange={(e) => update({ carpetArea: Number(e.target.value) })} className="field mt-1" />
              </div>
              <div>
                <Label>Age of property (years)</Label>
                <input type="number" min={0} max={100} value={form.ageYears}
                  onChange={(e) => update({ ageYears: Number(e.target.value) })} className="field mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Bathrooms</Label>
                <input type="number" min={1} max={10} value={form.bathrooms}
                  onChange={(e) => update({ bathrooms: Number(e.target.value) })} className="field mt-1" />
              </div>
              <div>
                <Label>Balconies</Label>
                <input type="number" min={0} max={10} value={form.balconies}
                  onChange={(e) => update({ balconies: Number(e.target.value) })} className="field mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Floor</Label>
                <input type="number" min={0} max={200} value={form.floor}
                  onChange={(e) => update({ floor: Number(e.target.value) })} className="field mt-1" />
              </div>
              <div>
                <Label>Total floors in building</Label>
                <input type="number" min={1} max={200} value={form.totalFloors}
                  onChange={(e) => update({ totalFloors: Number(e.target.value) })} className="field mt-1" />
              </div>
            </div>
            <div>
              <Label>Furnishing</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {([["UNFURNISHED","Unfurnished"],["SEMI_FURNISHED","Semi-furnished"],["FULLY_FURNISHED","Fully furnished"]] as [Furnishing, string][]).map(([v, lbl]) => (
                  <button key={v} type="button" onClick={() => update({ furnishing: v })}
                    className={`p-2 rounded-xl border-2 text-sm transition ${form.furnishing === v ? "border-brand-primary bg-brand-light" : "border-gray-200 hover:border-brand-accent"}`}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Amenities</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {AMENITY_OPTIONS.map((a) => (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${form.amenities.includes(a) ? "bg-brand-primary text-white border-brand-primary" : "border-gray-200 text-brand-muted hover:border-brand-accent"}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Media ── */}
        {step === 3 && (
          <div className="card space-y-4">
            <p className="text-sm text-brand-muted">Add photo URLs (one per line). Full Cloudinary/S3 upload will be enabled in the next release.</p>
            <div>
              <Label>Add a photo URL</Label>
              <div className="flex gap-2 mt-1">
                <input type="url" placeholder="https://…" value={photoInput}
                  onChange={(e) => setPhotoInput(e.target.value)}
                  className="field flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (photoInput) { update({ photoUrls: [...form.photoUrls, photoInput] }); setPhotoInput(""); }
                    }
                  }} />
                <button type="button" onClick={() => { if (photoInput) { update({ photoUrls: [...form.photoUrls, photoInput] }); setPhotoInput(""); } }}
                  className="btn-secondary text-sm">Add</button>
              </div>
            </div>
            {form.photoUrls.length > 0 ? (
              <ul className="space-y-1">
                {form.photoUrls.map((url, i) => (
                  <li key={i} className="flex items-center justify-between text-xs bg-brand-light px-3 py-2 rounded-lg">
                    <span className="truncate text-brand-ink max-w-xs">{url}</span>
                    <button type="button" onClick={() => update({ photoUrls: form.photoUrls.filter((_, j) => j !== i) })}
                      className="text-red-400 hover:text-red-600 ml-2">✕</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-brand-muted text-center py-4 border border-dashed rounded-xl">No photos added yet. At least 1 recommended.</p>
            )}
            <div>
              <Label>Listing title (optional — auto-generated if blank)</Label>
              <input type="text" placeholder={`${form.bhk} BHK in ${form.locality || "your locality"}`}
                value={form.title} onChange={(e) => update({ title: e.target.value })} className="field mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <textarea rows={4} placeholder="Describe the property — highlights, nearby landmarks, special features…"
                value={form.description} onChange={(e) => update({ description: e.target.value })}
                className="field mt-1 resize-none" />
            </div>
          </div>
        )}

        {/* ── Step 4: Pricing ── */}
        {step === 4 && (
          <div className="card space-y-4">
            {range && (
              <div className="bg-brand-light rounded-xl px-4 py-3 text-sm">
                <p className="text-brand-muted text-xs uppercase tracking-wide mb-1">Suggested price range</p>
                <p className="font-bold text-brand-primary text-lg">
                  {formatPrice(range.low)} – {formatPrice(range.high)}
                  {form.intent === "RENT" && <span className="text-sm font-normal text-brand-muted"> /month</span>}
                </p>
                <p className="text-xs text-brand-muted">Based on {form.carpetArea} sqft in {form.city} · comparable sales</p>
              </div>
            )}
            <div>
              <Label>{form.intent === "SELL" ? "Asking price (₹)" : "Monthly rent (₹)"}</Label>
              <input type="number" required min={1} value={form.price || ""}
                onChange={(e) => update({ price: Number(e.target.value) })}
                className="field mt-1 text-xl font-semibold"
                placeholder={range ? String(Math.round((range.low + range.high) / 2)) : "0"} />
              {range && form.price > 0 && form.price > range.high * 1.2 && (
                <p className="text-xs text-yellow-600 mt-1">⚠ Above the typical range for this area — may take longer to get leads.</p>
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={form.isNegotiable} onChange={(e) => update({ isNegotiable: e.target.checked })}
                className="rounded accent-brand-primary" />
              Price is negotiable
            </label>
          </div>
        )}

        {/* ── Step 5: Verification ── */}
        {step === 5 && (
          <div className="card space-y-4">
            <p className="text-sm text-brand-muted">Choose a verification level. Higher levels get more trust badges and better visibility.</p>
            {([
              ["SELF_DECLARED", "Self-declared (Free)", "Live within 5 minutes. Basic visibility.", "🟡"],
              ["DOCUMENT_VERIFIED", "Document Verified (Free)", "Upload sale deed / rent agreement. Live in 24h. Blue verified badge.", "🔵"],
              ["PHYSICALLY_VERIFIED", "Physically Verified (₹999)", "EstateHub agent visits and shoots media. Live in 72h. Gold star badge.", "⭐"]
            ] as [Verification, string, string, string][]).map(([v, title, desc, icon]) => (
              <button key={v} type="button" onClick={() => update({ verification: v })}
                className={`w-full p-4 rounded-xl border-2 text-left transition ${form.verification === v ? "border-brand-primary bg-brand-light" : "border-gray-200 hover:border-brand-accent"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span>{icon}</span>
                  <span className="font-semibold text-sm">{title}</span>
                  {form.verification === v && <span className="ml-auto text-brand-primary text-xs">Selected ✓</span>}
                </div>
                <p className="text-xs text-brand-muted pl-6">{desc}</p>
              </button>
            ))}
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          {step > 0 ? (
            <button type="button" onClick={back} className="btn-secondary text-sm">← Back</button>
          ) : <div />}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next} className="btn-primary text-sm">Continue →</button>
          ) : (
            <button type="submit" disabled={loading} className="btn-primary text-sm disabled:opacity-50">
              {loading ? "Publishing…" : "Publish Listing 🚀"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-brand-ink">{children}</label>;
}
