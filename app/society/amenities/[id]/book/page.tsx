"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

const AMENITY_META: Record<string, { name: string; icon: string; fee: number; deposit: number; slots: string[] }> = {
  "demo-pool":    { name: "Swimming Pool", icon: "🏊", fee: 0,    deposit: 0,    slots: ["06:00–08:00", "08:00–10:00", "17:00–19:00", "19:00–21:00"] },
  "demo-gym":     { name: "Gym",           icon: "🏋️", fee: 0,    deposit: 0,    slots: ["05:00–07:00", "07:00–09:00", "17:00–19:00", "19:00–21:00"] },
  "demo-party":   { name: "Party Hall",    icon: "🎉", fee: 2000, deposit: 5000, slots: ["11:00–15:00", "18:00–23:00"] },
  "demo-guest":   { name: "Guest Room",    icon: "🛏️", fee: 800,  deposit: 2000, slots: ["14:00 Check-in", "12:00 Checkout"] },
  "demo-tennis":  { name: "Tennis Court",  icon: "🎾", fee: 0,    deposit: 0,    slots: ["06:00–07:30", "07:30–09:00", "17:30–19:00", "19:00–20:30"] },
  "demo-banquet": { name: "Banquet Hall",  icon: "🏛️", fee: 5000, deposit: 10000, slots: ["09:00–14:00", "18:00–23:00"] }
};

function getFutureDates(n: number): { date: string; label: string }[] {
  const result = [];
  const now = new Date();
  for (let i = 1; i <= n; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    result.push({
      date: d.toISOString().split("T")[0],
      label: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })
    });
  }
  return result;
}

export default function BookAmenityPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const meta = AMENITY_META[params.id] ?? {
    name: "Amenity", icon: "🏢", fee: 0, deposit: 0, slots: ["09:00–11:00", "14:00–16:00"]
  };

  const dates = getFutureDates(7);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = meta.fee + meta.deposit;

  async function book() {
    if (!selectedDate || !selectedSlot) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/amenity-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amenityId: params.id,
          // NOTE: replace with actual flat ID from auth context
          flatId: "seed-flat-placeholder",
          date: selectedDate,
          startTime: selectedSlot.split("–")[0],
          endTime: selectedSlot.split("–")[1] ?? selectedSlot,
          feeAmount: meta.fee,
          deposit: meta.deposit
        })
      });
      if (!res.ok) {
        const j = await res.json() as { error?: string };
        throw new Error(j.error ?? "Booking failed");
      }
      setConfirmed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  if (confirmed) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="card">
          <p className="text-4xl mb-3">✅</p>
          <h1 className="text-xl font-bold text-brand-primary mb-1">Booking Confirmed!</h1>
          <p className="text-brand-muted text-sm mb-4">
            {meta.icon} {meta.name} · {dates.find(d => d.date === selectedDate)?.label} · {selectedSlot}
          </p>
          {meta.deposit > 0 && (
            <p className="text-xs text-brand-muted mb-4">
              Refundable deposit of {formatPrice(meta.deposit)} will be released 48h after use.
            </p>
          )}
          <div className="flex gap-3">
            <Link href="/society/amenities" className="btn-secondary flex-1 text-sm">Back</Link>
            <Link href="/society" className="btn-primary flex-1 text-sm">My Society</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <nav className="text-xs text-brand-muted mb-4 flex items-center gap-1">
        <Link href="/society/amenities" className="hover:underline">Amenities</Link>
        <span>/</span>
        <span>Book {meta.name}</span>
      </nav>

      <h1 className="text-2xl font-bold text-brand-primary mb-1">
        {meta.icon} {meta.name}
      </h1>
      {total > 0 && (
        <p className="text-brand-muted text-sm mb-6">
          {meta.fee > 0 ? `Booking fee: ${formatPrice(meta.fee)}` : "Free"}
          {meta.deposit > 0 && ` · Refundable deposit: ${formatPrice(meta.deposit)}`}
        </p>
      )}

      {/* Date picker */}
      <div className="card mb-4">
        <p className="text-sm font-medium text-brand-ink mb-3">Select date</p>
        <div className="grid grid-cols-4 gap-2">
          {dates.slice(0, 8).map((d) => (
            <button key={d.date} type="button" onClick={() => { setSelectedDate(d.date); setSelectedSlot(null); }}
              className={`py-2 px-1 rounded-xl border text-xs font-medium text-center transition ${selectedDate === d.date ? "bg-brand-primary text-white border-brand-primary" : "border-gray-200 text-brand-ink hover:border-brand-accent"}`}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Slot picker */}
      {selectedDate && (
        <div className="card mb-4">
          <p className="text-sm font-medium text-brand-ink mb-3">Select time slot</p>
          <div className="grid grid-cols-2 gap-2">
            {meta.slots.map((slot) => (
              <button key={slot} type="button" onClick={() => setSelectedSlot(slot)}
                className={`py-3 px-3 rounded-xl border text-sm font-medium transition ${selectedSlot === slot ? "bg-brand-primary text-white border-brand-primary" : "border-gray-200 text-brand-ink hover:border-brand-accent"}`}>
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Summary & terms */}
      {selectedDate && selectedSlot && (
        <div className="card mb-4 space-y-3">
          <p className="text-sm font-semibold text-brand-ink">Booking summary</p>
          <div className="flex justify-between text-sm">
            <span className="text-brand-muted">{meta.name}</span>
            <span>{dates.find(d => d.date === selectedDate)?.label} · {selectedSlot}</span>
          </div>
          {meta.fee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-brand-muted">Booking fee</span>
              <span>{formatPrice(meta.fee)}</span>
            </div>
          )}
          {meta.deposit > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-brand-muted">Refundable deposit</span>
              <span>{formatPrice(meta.deposit)}</span>
            </div>
          )}
          {total > 0 && (
            <div className="flex justify-between font-bold border-t border-gray-100 pt-2">
              <span>Total</span>
              <span className="text-brand-primary">{formatPrice(total)}</span>
            </div>
          )}
          <label className="flex items-start gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}
              className="rounded mt-0.5 accent-brand-primary" />
            <span className="text-brand-muted">I agree to the usage terms and cleanup responsibilities.</span>
          </label>
        </div>
      )}

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      <button
        type="button"
        onClick={book}
        disabled={!selectedDate || !selectedSlot || (total > 0 && !termsAccepted) || loading}
        className="btn-primary w-full py-4 disabled:opacity-50"
      >
        {loading ? "Booking…" : total > 0 ? `Pay & Confirm — ${formatPrice(total)}` : "Confirm Booking"}
      </button>
    </div>
  );
}
