"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

type VehicleType = "NONE" | "CAR" | "BIKE";

type PassData = {
  visitorName: string;
  visitorPhone: string;
  vehicleType: VehicleType;
  vehicleNo: string;
  validHours: number;
};

type GeneratedPass = {
  id: string;
  visitorName: string;
  otp: string;
  qrToken: string;
  validUntil: string;
};

const QUICK_TEMPLATES = [
  { label: "🚖 Cab / Auto", name: "Cab Driver", phone: "" },
  { label: "📦 Delivery", name: "Delivery Person", phone: "" },
  { label: "🛵 Zomato / Swiggy", name: "Food Delivery", phone: "" },
  { label: "🧹 Maid / Help", name: "Domestic Help", phone: "" }
];

export default function NewVisitorPassPage() {
  const [form, setForm] = useState<PassData>({
    visitorName: "", visitorPhone: "", vehicleType: "NONE", vehicleNo: "", validHours: 12
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pass, setPass] = useState<GeneratedPass | null>(null);
  const [copied, setCopied] = useState(false);

  const update = (patch: Partial<PassData>) => setForm((f) => ({ ...f, ...patch }));

  async function generate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const validUntil = new Date();
      validUntil.setHours(validUntil.getHours() + form.validHours);

      const res = await fetch("/api/visitor-passes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // NOTE: replace "seed-flat-1" with actual flat ID from auth context
          flatId: "seed-flat-placeholder",
          visitorName: form.visitorName,
          visitorPhone: form.visitorPhone || undefined,
          vehicleNo: form.vehicleType !== "NONE" ? form.vehicleNo : undefined,
          validUntil: validUntil.toISOString()
        })
      });
      const json = await res.json() as { data?: GeneratedPass; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed to generate pass");
      setPass(json.data!);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    if (!pass) return;
    const url = `${window.location.origin}/gate/verify?token=${pass.qrToken}`;
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  function reset() {
    setPass(null);
    setForm({ visitorName: "", visitorPhone: "", vehicleType: "NONE", vehicleNo: "", validHours: 12 });
    setCopied(false);
  }

  if (pass) {
    const expiry = new Date(pass.validUntil).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    const expiryDate = new Date(pass.validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    return (
      <div className="mx-auto max-w-md px-4 py-8 text-center">
        <div className="card">
          <div className="text-4xl mb-2">✅</div>
          <h1 className="text-xl font-bold text-brand-primary mb-1">Pass Generated!</h1>
          <p className="text-brand-muted text-sm mb-5">For {pass.visitorName} · Valid till {expiryDate} {expiry}</p>

          {/* OTP display */}
          <div className="bg-brand-light rounded-xl py-6 px-4 mb-5">
            <p className="text-xs text-brand-muted uppercase tracking-widest mb-2">Entry Code (OTP)</p>
            <p className="text-5xl font-bold tracking-widest text-brand-primary font-mono">
              {pass.otp}
            </p>
            <p className="text-xs text-brand-muted mt-2">Guard will enter this code OR scan the link</p>
          </div>

          {/* Pass detail */}
          <div className="text-left text-sm space-y-2 mb-5 bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between">
              <span className="text-brand-muted">Visitor</span>
              <span className="font-medium">{pass.visitorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Valid until</span>
              <span className="font-medium">{expiryDate} · {expiry}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Pass ID</span>
              <span className="font-mono text-xs text-brand-muted">{pass.id.slice(-8).toUpperCase()}</span>
            </div>
          </div>

          {/* Share actions */}
          <div className="flex flex-col gap-2">
            <button onClick={copyLink}
              className="btn-primary w-full text-sm">
              {copied ? "✓ Link Copied!" : "📋 Copy pass link"}
            </button>
            <a href={`https://wa.me/?text=Hi! I've generated a visitor pass for you. Use this link to enter: ${encodeURIComponent(`${typeof window !== "undefined" ? window.location.origin : ""}/gate/verify?token=${pass.qrToken}`)}`}
              target="_blank" rel="noreferrer"
              className="btn-secondary w-full text-sm text-center">
              💬 Share on WhatsApp
            </a>
            <button onClick={reset} className="text-sm text-brand-muted hover:text-brand-ink mt-1">
              + Generate another pass
            </button>
          </div>
        </div>
        <div className="mt-4">
          <Link href="/society" className="text-sm text-brand-accent hover:underline">← Back to My Society</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <nav className="text-xs text-brand-muted mb-4 flex items-center gap-1">
        <Link href="/society" className="hover:underline">My Society</Link>
        <span>/</span>
        <span>New Visitor Pass</span>
      </nav>
      <h1 className="text-2xl font-bold text-brand-primary mb-6">Invite a Visitor</h1>

      {/* Quick templates */}
      <div className="flex flex-wrap gap-2 mb-5">
        {QUICK_TEMPLATES.map((t) => (
          <button key={t.label} type="button"
            onClick={() => update({ visitorName: t.name, visitorPhone: t.phone })}
            className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-brand-muted hover:border-brand-accent hover:text-brand-accent transition">
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={generate} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-ink mb-1">Visitor name *</label>
          <input type="text" required placeholder="e.g. Riya Sharma"
            value={form.visitorName} onChange={(e) => update({ visitorName: e.target.value })}
            className="field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-ink mb-1">Visitor phone (optional)</label>
          <input type="tel" placeholder="+91 98XXX XXXXX"
            value={form.visitorPhone} onChange={(e) => update({ visitorPhone: e.target.value })}
            className="field" />
        </div>

        {/* Vehicle */}
        <div>
          <label className="block text-sm font-medium text-brand-ink mb-2">Vehicle</label>
          <div className="flex gap-2">
            {(["NONE", "CAR", "BIKE"] as VehicleType[]).map((v) => (
              <button key={v} type="button" onClick={() => update({ vehicleType: v })}
                className={`flex-1 py-2 text-sm rounded-lg border-2 font-medium transition ${form.vehicleType === v ? "border-brand-primary bg-brand-light text-brand-primary" : "border-gray-200 text-brand-muted hover:border-brand-accent"}`}>
                {v === "NONE" ? "None" : v === "CAR" ? "🚗 Car" : "🏍️ Bike"}
              </button>
            ))}
          </div>
          {form.vehicleType !== "NONE" && (
            <input type="text" placeholder="Vehicle number e.g. KA-01-AB-1234"
              value={form.vehicleNo} onChange={(e) => update({ vehicleNo: e.target.value.toUpperCase() })}
              className="field mt-2" />
          )}
        </div>

        {/* Validity */}
        <div>
          <label className="block text-sm font-medium text-brand-ink mb-2">
            Valid for: <strong>{form.validHours === 24 ? "Until midnight" : `${form.validHours} hours`}</strong>
          </label>
          <div className="flex gap-2 flex-wrap">
            {[2, 4, 8, 12, 24].map((h) => (
              <button key={h} type="button" onClick={() => update({ validHours: h })}
                className={`px-3 py-1.5 text-sm rounded-lg border-2 transition ${form.validHours === h ? "border-brand-primary bg-brand-light text-brand-primary" : "border-gray-200 text-brand-muted hover:border-brand-accent"}`}>
                {h === 24 ? "All day" : `${h}h`}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
          {loading ? "Generating…" : "Generate Pass"}
        </button>
      </form>
    </div>
  );
}
