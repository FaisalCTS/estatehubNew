"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Category = "PLUMBING" | "ELECTRICAL" | "LIFT" | "SECURITY" | "CIVIL" | "PEST_CONTROL" | "HOUSEKEEPING" | "OTHER";
type Location = "INSIDE_FLAT" | "COMMON_AREA";

const CATEGORIES: { value: Category; icon: string; label: string; sla: string }[] = [
  { value: "PLUMBING",     icon: "🔧", label: "Plumbing",      sla: "4h" },
  { value: "ELECTRICAL",   icon: "💡", label: "Electrical",    sla: "4h" },
  { value: "LIFT",         icon: "🛗", label: "Lift",          sla: "2h" },
  { value: "SECURITY",     icon: "🛡️", label: "Security",     sla: "1h" },
  { value: "CIVIL",        icon: "🏗️", label: "Civil / Seepage", sla: "48h" },
  { value: "PEST_CONTROL", icon: "🐛", label: "Pest Control",  sla: "24h" },
  { value: "HOUSEKEEPING", icon: "🧹", label: "Housekeeping",  sla: "8h" },
  { value: "OTHER",        icon: "📝", label: "Other",         sla: "24h" }
];

export default function NewComplaintPage() {
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<Location>("INSIDE_FLAT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!category) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // NOTE: replace with actual flat ID from auth context
          flatId: "seed-flat-placeholder",
          category,
          description,
          location
        })
      });
      const json = await res.json() as { data?: { id: string }; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed to submit");
      router.push(`/society/complaints/${json.data!.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <nav className="text-xs text-brand-muted mb-4 flex items-center gap-1">
        <Link href="/society" className="hover:underline">My Society</Link>
        <span>/</span>
        <span>Raise Complaint</span>
      </nav>

      <h1 className="text-2xl font-bold text-brand-primary mb-6">Raise a Complaint</h1>

      <form onSubmit={submit} className="space-y-5">
        {/* Category */}
        <div className="card">
          <p className="text-sm font-medium text-brand-ink mb-3">Pick a category</p>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <button key={c.value} type="button" onClick={() => setCategory(c.value)}
                className={`p-3 rounded-xl border-2 text-left flex items-center gap-2 transition ${category === c.value ? "border-brand-primary bg-brand-light" : "border-gray-200 hover:border-brand-accent"}`}>
                <span className="text-xl">{c.icon}</span>
                <div>
                  <p className="text-sm font-medium text-brand-ink">{c.label}</p>
                  <p className="text-xs text-brand-muted">SLA {c.sla}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-ink mb-1">Describe the issue</label>
            <textarea
              required
              rows={4}
              placeholder="e.g. Bathroom tap leaking since this morning, water pooling on floor…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="field resize-none"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-brand-ink mb-2">Location</p>
            <div className="flex gap-3">
              {(["INSIDE_FLAT", "COMMON_AREA"] as Location[]).map((l) => (
                <button key={l} type="button" onClick={() => setLocation(l)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition ${location === l ? "border-brand-primary bg-brand-light text-brand-primary" : "border-gray-200 text-brand-muted hover:border-brand-accent"}`}>
                  {l === "INSIDE_FLAT" ? "🏠 Inside flat" : "🏢 Common area"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={!category || !description || loading}
          className="btn-primary w-full py-4 disabled:opacity-50"
        >
          {loading ? "Submitting…" : "Submit Complaint"}
        </button>
      </form>
    </div>
  );
}
