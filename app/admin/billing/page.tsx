"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const BILL_HEADS = [
  { key: "cam", label: "Common Area Maintenance", default: 6000 },
  { key: "water", label: "Water Charges", default: 900 },
  { key: "sinking", label: "Sinking Fund", default: 1000 },
  { key: "vehicle", label: "Vehicle (per car)", default: 500 }
];

// Demo stats
const DEMO_STATS = {
  totalFlats: 412,
  collected: 347,
  totalAmount: 35200000 / 100,
  collectedAmount: 28400000 / 100,
  defaulters: 24
};

export default function AdminBillingPage() {
  const now = new Date();
  const [cycleMonth, setCycleMonth] = useState(now.getMonth() + 1);
  const [cycleYear, setCycleYear] = useState(now.getFullYear());
  const [dueDay, setDueDay] = useState(10);
  const [lateFee, setLateFee] = useState(50);
  const [heads, setHeads] = useState(BILL_HEADS.map(h => ({ ...h, enabled: true, amount: h.default })));
  const [step, setStep] = useState<"config" | "preview" | "dispatched">("config");
  const [dispatching, setDispatching] = useState(false);

  const perFlatTotal = heads.filter(h => h.enabled).reduce((s, h) => s + h.amount, 0);
  const totalInvoice = perFlatTotal * DEMO_STATS.totalFlats;

  async function dispatch() {
    setDispatching(true);
    await new Promise(r => setTimeout(r, 1500)); // simulate API call
    setDispatching(false);
    setStep("dispatched");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <nav className="text-xs text-brand-muted mb-4 flex items-center gap-1">
        <Link href="/society" className="hover:underline">My Society</Link>
        <span>/</span>
        <span>Admin · Billing</span>
      </nav>

      <h1 className="text-2xl font-bold text-brand-primary mb-6">Society Admin — Billing</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <KpiCard label="Total flats" value={String(DEMO_STATS.totalFlats)} />
        <KpiCard label="Collected" value={`${DEMO_STATS.collected} / ${DEMO_STATS.totalFlats}`} />
        <KpiCard label="Total raised" value={formatPrice(DEMO_STATS.totalAmount)} />
        <KpiCard label="Defaulters" value={String(DEMO_STATS.defaulters)} highlight />
      </div>

      {step === "dispatched" ? (
        <div className="card text-center py-10">
          <p className="text-4xl mb-3">✅</p>
          <h2 className="text-xl font-bold text-brand-primary mb-1">Bills Dispatched!</h2>
          <p className="text-brand-muted text-sm mb-1">
            {DEMO_STATS.totalFlats} invoices · {formatPrice(totalInvoice)} raised
          </p>
          <p className="text-xs text-brand-muted mb-6">
            Reminders scheduled at T-3 days, due date, T+3, T+10
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setStep("config")} className="btn-secondary text-sm">Generate next cycle</button>
            <Link href="/society/bills" className="btn-primary text-sm">View collections</Link>
          </div>
        </div>
      ) : step === "preview" ? (
        <div className="space-y-5">
          <div className="card">
            <h2 className="font-semibold text-brand-primary mb-4">Preview — {MONTH_NAMES[cycleMonth - 1]} {cycleYear}</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-brand-muted">Billing cycle</span>
                <span>1–{new Date(cycleYear, cycleMonth, 0).getDate()} {MONTH_NAMES[cycleMonth - 1]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Due date</span>
                <span>{dueDay} {MONTH_NAMES[cycleMonth % 12]} {cycleMonth === 12 ? cycleYear + 1 : cycleYear}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Late fee</span>
                <span>₹{lateFee}/day after due</span>
              </div>
              <div className="flex justify-between font-bold border-t border-gray-100 pt-2">
                <span>Per flat total</span>
                <span className="text-brand-primary">{formatPrice(perFlatTotal)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total to invoice ({DEMO_STATS.totalFlats} flats)</span>
                <span className="text-brand-primary">{formatPrice(totalInvoice)}</span>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-700">
              ⚠ 3 flats flagged: missing meter readings. Estimated values will be used.
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep("config")} className="btn-secondary flex-1">← Back</button>
            <button onClick={dispatch} disabled={dispatching} className="btn-primary flex-1 disabled:opacity-50">
              {dispatching ? "Dispatching…" : `Approve & Dispatch ${DEMO_STATS.totalFlats} bills`}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Cycle config */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-brand-primary">Configure billing cycle</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-ink mb-1">Month</label>
                <select value={cycleMonth} onChange={e => setCycleMonth(Number(e.target.value))} className="field">
                  {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-ink mb-1">Year</label>
                <select value={cycleYear} onChange={e => setCycleYear(Number(e.target.value))} className="field">
                  {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-ink mb-1">Due day of next month</label>
                <input type="number" min={1} max={28} value={dueDay} onChange={e => setDueDay(Number(e.target.value))} className="field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-ink mb-1">Late fee (₹/day)</label>
                <input type="number" min={0} value={lateFee} onChange={e => setLateFee(Number(e.target.value))} className="field" />
              </div>
            </div>
          </div>

          {/* Bill heads */}
          <div className="card space-y-3">
            <h2 className="font-semibold text-brand-primary">Bill heads</h2>
            {heads.map((h, i) => (
              <div key={h.key} className="flex items-center gap-3">
                <input type="checkbox" checked={h.enabled}
                  onChange={e => setHeads(hs => hs.map((x, j) => j === i ? { ...x, enabled: e.target.checked } : x))}
                  className="rounded accent-brand-primary" />
                <span className="text-sm flex-1 text-brand-ink">{h.label}</span>
                <input type="number" min={0} value={h.amount}
                  onChange={e => setHeads(hs => hs.map((x, j) => j === i ? { ...x, amount: Number(e.target.value) } : x))}
                  disabled={!h.enabled}
                  className="field w-28 text-right disabled:opacity-40" />
              </div>
            ))}
            <div className="flex justify-between font-bold border-t border-gray-100 pt-2 text-sm">
              <span>Per flat total</span>
              <span className="text-brand-primary">{formatPrice(perFlatTotal)}</span>
            </div>
          </div>

          <button onClick={() => setStep("preview")} className="btn-primary w-full">
            Preview Bills →
          </button>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="card text-center">
      <p className="text-xs text-brand-muted uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-xl font-bold ${highlight ? "text-red-500" : "text-brand-primary"}`}>{value}</p>
    </div>
  );
}
