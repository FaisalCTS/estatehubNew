"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Update = { id: string; message: string; statusTo?: string; createdAt: string };
type Complaint = {
  id: string;
  category: string;
  description: string;
  location: string;
  status: string;
  slaHours: number;
  rating?: number;
  resolvedAt?: string;
  createdAt: string;
  updates: Update[];
};

const CATEGORY_ICONS: Record<string, string> = {
  PLUMBING: "🔧", ELECTRICAL: "💡", LIFT: "🛗", SECURITY: "🛡️",
  CIVIL: "🏗️", PEST_CONTROL: "🐛", HOUSEKEEPING: "🧹", OTHER: "📝"
};

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  OPEN:        { label: "Open",        cls: "bg-yellow-100 text-yellow-700" },
  ASSIGNED:    { label: "Assigned",    cls: "bg-blue-100 text-blue-700" },
  IN_PROGRESS: { label: "In Progress", cls: "bg-orange-100 text-orange-700" },
  RESOLVED:    { label: "Resolved",    cls: "bg-green-100 text-green-700" },
  CLOSED:      { label: "Closed",      cls: "bg-gray-100 text-gray-600" },
  REOPENED:    { label: "Reopened",    cls: "bg-red-100 text-red-700" }
};

export default function ComplaintDetailPage() {
  const params = useParams<{ id: string }>();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [rated, setRated] = useState(false);

  useEffect(() => {
    fetch(`/api/complaints/${params.id}`)
      .then((r) => r.json())
      .then((j: { data?: Complaint }) => { if (j.data) setComplaint(j.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  async function submitRating(stars: number) {
    setRating(stars);
    await fetch(`/api/complaints/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "rate", rating: stars })
    }).catch(() => {});
    setRated(true);
  }

  if (loading) return <div className="mx-auto max-w-lg px-4 py-12 text-center text-brand-muted">Loading…</div>;
  if (!complaint) return <div className="mx-auto max-w-lg px-4 py-12 text-center text-brand-muted">Complaint not found.</div>;

  const statusCfg = STATUS_LABEL[complaint.status] ?? { label: complaint.status, cls: "bg-gray-100 text-gray-600" };
  const icon = CATEGORY_ICONS[complaint.category] ?? "📝";
  const isResolved = complaint.status === "RESOLVED" || complaint.status === "CLOSED";

  const timeline = [
    { label: "Submitted", time: complaint.createdAt, done: true },
    { label: "Assigned to technician", time: complaint.updates.find(u => u.statusTo === "ASSIGNED")?.createdAt ?? null, done: ["ASSIGNED","IN_PROGRESS","RESOLVED","CLOSED"].includes(complaint.status) },
    { label: "In progress", time: complaint.updates.find(u => u.statusTo === "IN_PROGRESS")?.createdAt ?? null, done: ["IN_PROGRESS","RESOLVED","CLOSED"].includes(complaint.status) },
    { label: "Resolved", time: complaint.resolvedAt ?? null, done: isResolved }
  ];

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <nav className="text-xs text-brand-muted mb-4 flex items-center gap-1">
        <Link href="/society" className="hover:underline">My Society</Link>
        <span>/</span>
        <span>Complaint #{complaint.id.slice(-6).toUpperCase()}</span>
      </nav>

      {/* Header */}
      <div className="card mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <div>
              <p className="font-semibold text-brand-ink capitalize">{complaint.category.replace("_", " ").toLowerCase()}</p>
              <p className="text-xs text-brand-muted capitalize">{complaint.location.replace("_", " ").toLowerCase()}</p>
            </div>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCfg.cls}`}>
            {statusCfg.label}
          </span>
        </div>
        <p className="text-sm text-brand-muted leading-relaxed">{complaint.description}</p>
        <p className="text-xs text-brand-muted mt-2">
          Filed {new Date(complaint.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          · SLA {complaint.slaHours}h
        </p>
      </div>

      {/* Status timeline */}
      <div className="card mb-4">
        <h2 className="font-semibold text-brand-primary mb-4">Status timeline</h2>
        <div className="space-y-3">
          {timeline.map((t, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${t.done ? "bg-brand-primary text-white" : "bg-gray-100 text-brand-muted"}`}>
                {t.done ? "✓" : i + 1}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${t.done ? "text-brand-ink" : "text-brand-muted"}`}>{t.label}</p>
                {t.time && (
                  <p className="text-xs text-brand-muted">
                    {new Date(t.time).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Updates */}
      {complaint.updates.length > 0 && (
        <div className="card mb-4">
          <h2 className="font-semibold text-brand-primary mb-3">Updates</h2>
          <div className="space-y-3">
            {complaint.updates.map((u) => (
              <div key={u.id} className="bg-brand-light rounded-lg px-3 py-2">
                <p className="text-sm text-brand-ink">{u.message}</p>
                <p className="text-xs text-brand-muted mt-1">
                  {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rating (shown when resolved) */}
      {isResolved && !rated && !complaint.rating && (
        <div className="card mb-4">
          <h2 className="font-semibold text-brand-primary mb-3">Rate the resolution</h2>
          <div className="flex gap-2 justify-center mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button" onClick={() => submitRating(s)}
                className={`text-3xl transition hover:scale-110 ${s <= rating ? "opacity-100" : "opacity-30"}`}>
                ⭐
              </button>
            ))}
          </div>
          <p className="text-xs text-brand-muted text-center">Was the issue fully resolved? Tap a star to rate.</p>
        </div>
      )}

      {rated && (
        <div className="card mb-4 text-center">
          <p className="text-green-600 font-medium">Thanks for your feedback! ⭐</p>
        </div>
      )}

      <div className="flex gap-3">
        <Link href="/society/complaints/new" className="btn-secondary flex-1 text-sm">+ New complaint</Link>
        <Link href="/society" className="btn-primary flex-1 text-sm">My Society</Link>
      </div>
    </div>
  );
}
