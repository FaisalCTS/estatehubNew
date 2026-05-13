"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type VisitType = "IN_PERSON" | "VIRTUAL";

// Generate available slots for the next 7 days (10 AM, 2 PM, 4 PM, 6 PM)
function getSlots(): { date: string; label: string; time: string }[] {
  const slots: { date: string; label: string; time: string }[] = [];
  const times = ["10:00 AM", "2:00 PM", "4:00 PM", "6:00 PM"];
  const now = new Date();
  for (let d = 1; d <= 7; d++) {
    const day = new Date(now);
    day.setDate(now.getDate() + d);
    const dateStr = day.toISOString().split("T")[0];
    const dayLabel = day.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
    for (const time of times) {
      slots.push({ date: dateStr, label: dayLabel, time });
    }
  }
  return slots;
}

export default function ScheduleVisitPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [visitType, setVisitType] = useState<VisitType>("IN_PERSON");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const slots = getSlots();
  // Group by date
  const grouped = slots.reduce<Record<string, typeof slots>>((acc, s) => {
    (acc[s.date] = acc[s.date] || []).push(s);
    return acc;
  }, {});

  async function confirm() {
    if (!selectedSlot) return;
    setLoading(true);
    setError(null);
    try {
      const [date, time] = selectedSlot.split("__");
      const [hour] = time.split(":");
      const scheduledAt = new Date(date);
      scheduledAt.setHours(parseInt(hour.replace(" AM", "").replace(" PM", "")));
      if (time.includes("PM") && !time.startsWith("12")) scheduledAt.setHours(scheduledAt.getHours() + 12);

      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // NOTE: replace with authenticated user ID once Clerk is wired up
          buyerId: "seed-buyer-placeholder",
          propertyId: params.id,
          scheduledAt: scheduledAt.toISOString(),
          type: visitType
        })
      });
      if (!res.ok) {
        const j = await res.json() as { error?: string };
        throw new Error(j.error ?? "Failed to book");
      }
      setConfirmed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  if (confirmed) {
    const [date, time] = selectedSlot!.split("__");
    const displayDate = new Date(date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="card">
          <div className="text-4xl mb-3">✅</div>
          <h1 className="text-xl font-bold text-brand-primary mb-1">Visit Booked!</h1>
          <p className="text-brand-muted text-sm mb-4">
            {visitType === "VIRTUAL" ? "Virtual tour" : "In-person visit"} on{" "}
            <strong>{displayDate}</strong> at <strong>{time}</strong>
          </p>
          <p className="text-xs text-brand-muted mb-6">
            {visitType === "VIRTUAL"
              ? "A video call link will be sent to your registered phone number 15 minutes before the slot."
              : "You will receive the property address and contact details via SMS."}
          </p>
          <div className="flex gap-3">
            <Link href={`/properties/${params.id}`} className="btn-secondary flex-1 text-sm">Back to property</Link>
            <Link href="/properties" className="btn-primary flex-1 text-sm">Browse more</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <nav className="text-xs text-brand-muted mb-4 flex items-center gap-1">
        <Link href="/properties" className="hover:underline">Properties</Link>
        <span>/</span>
        <Link href={`/properties/${params.id}`} className="hover:underline">Property</Link>
        <span>/</span>
        <span>Schedule Visit</span>
      </nav>

      <h1 className="text-2xl font-bold text-brand-primary mb-6">Schedule a Site Visit</h1>

      {/* Visit type */}
      <div className="card mb-4">
        <p className="text-sm font-medium text-brand-ink mb-3">Choose visit type</p>
        <div className="grid grid-cols-2 gap-3">
          {(["IN_PERSON", "VIRTUAL"] as VisitType[]).map((t) => (
            <button key={t} type="button" onClick={() => setVisitType(t)}
              className={`p-4 rounded-xl border-2 text-left transition ${visitType === t ? "border-brand-primary bg-brand-light" : "border-gray-200 hover:border-brand-accent"}`}>
              <p className="text-xl mb-1">{t === "IN_PERSON" ? "🚶" : "📹"}</p>
              <p className="text-sm font-semibold">{t === "IN_PERSON" ? "In-person" : "Virtual tour"}</p>
              <p className="text-xs text-brand-muted mt-0.5">
                {t === "IN_PERSON" ? "Visit the property in person" : "Live video call with the owner"}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Slot picker */}
      <div className="card mb-4">
        <p className="text-sm font-medium text-brand-ink mb-3">Pick a slot</p>
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, daySlots]) => (
            <div key={date}>
              <p className="text-xs text-brand-muted uppercase tracking-wide mb-2">
                {daySlots[0].label}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {daySlots.map((s) => {
                  const key = `${s.date}__${s.time}`;
                  return (
                    <button key={key} type="button" onClick={() => setSelectedSlot(key)}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition ${selectedSlot === key ? "bg-brand-primary text-white border-brand-primary" : "border-gray-200 text-brand-ink hover:border-brand-accent"}`}>
                      {s.time}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      <button
        type="button"
        onClick={confirm}
        disabled={!selectedSlot || loading}
        className="btn-primary w-full disabled:opacity-50"
      >
        {loading ? "Booking…" : "Confirm Slot"}
      </button>
    </div>
  );
}
