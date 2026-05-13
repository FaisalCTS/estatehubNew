"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

type BreakdownItem = { head: string; amount: number };

type Bill = {
  id: string;
  cycleMonth: number;
  cycleYear: number;
  amount: string;
  breakdown: BreakdownItem[];
  dueDate: string;
  status: string;
  lateFee: string;
  paidAt?: string;
  paymentRef?: string;
};

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI · anita@okhdfcbank", icon: "📱" },
  { id: "card", label: "HDFC Card •••• 4421", icon: "💳" },
  { id: "wallet", label: "EstateHub Wallet", icon: "👛" }
];

export default function BillDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [payMethod, setPayMethod] = useState("upi");
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    fetch(`/api/bills/${params.id}`)
      .then((r) => r.json())
      .then((j: { data?: Bill }) => { if (j.data) setBill(j.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  async function pay() {
    if (!bill) return;
    setPaying(true);
    try {
      const res = await fetch(`/api/bills/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pay", paymentRef: `SIM-${Date.now()}` })
      });
      if (res.ok) {
        setPaid(true);
        setBill((b) => b ? { ...b, status: "PAID", paidAt: new Date().toISOString() } : b);
      }
    } catch {}
    finally { setPaying(false); }
  }

  if (loading) return <div className="mx-auto max-w-lg px-4 py-12 text-center text-brand-muted">Loading…</div>;
  if (!bill) return <div className="mx-auto max-w-lg px-4 py-12 text-center text-brand-muted">Bill not found.</div>;

  const isPaid = bill.status === "PAID" || paid;
  const isOverdue = bill.status === "OVERDUE" && !isPaid;
  const total = Number(bill.amount) + Number(bill.lateFee);

  if (isPaid) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="card">
          <p className="text-4xl mb-3">✅</p>
          <h1 className="text-xl font-bold text-brand-primary mb-1">Payment Successful!</h1>
          <p className="text-brand-muted text-sm mb-4">
            {MONTH_NAMES[bill.cycleMonth - 1]} {bill.cycleYear} maintenance — {formatPrice(bill.amount)}
          </p>
          {bill.paymentRef && <p className="text-xs font-mono text-brand-muted mb-4">Txn: {bill.paymentRef}</p>}
          <div className="flex gap-3">
            <Link href="/society/bills" className="btn-secondary flex-1 text-sm">Back to bills</Link>
            <Link href="/society" className="btn-primary flex-1 text-sm">My Society</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <nav className="text-xs text-brand-muted mb-4 flex items-center gap-1">
        <Link href="/society" className="hover:underline">My Society</Link>
        <span>/</span>
        <Link href="/society/bills" className="hover:underline">Bills</Link>
        <span>/</span>
        <span>{MONTH_NAMES[bill.cycleMonth - 1]} {bill.cycleYear}</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-primary">
          {MONTH_NAMES[bill.cycleMonth - 1]} {bill.cycleYear} Bill
        </h1>
        {isOverdue && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Overdue</span>
        )}
      </div>

      {/* Breakdown */}
      <div className="card mb-4">
        <h2 className="font-semibold text-brand-ink mb-4">Bill breakdown</h2>
        <div className="space-y-3">
          {Array.isArray(bill.breakdown) && bill.breakdown.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-brand-muted">{item.head}</span>
              <span className="font-medium text-brand-ink">{formatPrice(item.amount)}</span>
            </div>
          ))}
        </div>
        {Number(bill.lateFee) > 0 && (
          <div className="flex justify-between text-sm mt-3 pt-3 border-t border-gray-100 text-red-600">
            <span>Late fee</span>
            <span className="font-medium">{formatPrice(bill.lateFee)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t border-gray-200">
          <span>Total</span>
          <span className="text-brand-primary">{formatPrice(total)}</span>
        </div>
        <p className="text-xs text-brand-muted mt-2">
          Due by {new Date(bill.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Payment method */}
      <div className="card mb-4">
        <h2 className="font-semibold text-brand-ink mb-3">Choose payment method</h2>
        <div className="space-y-2">
          {PAYMENT_METHODS.map((m) => (
            <button key={m.id} type="button" onClick={() => setPayMethod(m.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition ${payMethod === m.id ? "border-brand-primary bg-brand-light" : "border-gray-200 hover:border-brand-accent"}`}>
              <span className="text-xl">{m.icon}</span>
              <span className="text-sm font-medium text-brand-ink">{m.label}</span>
              {payMethod === m.id && <span className="ml-auto text-brand-primary text-xs">✓</span>}
            </button>
          ))}
        </div>
      </div>

      <button onClick={pay} disabled={paying}
        className="btn-primary w-full py-4 text-lg disabled:opacity-50">
        {paying ? "Processing…" : `Pay ${formatPrice(total)}`}
      </button>
      <p className="text-xs text-brand-muted text-center mt-2">
        Powered by Razorpay · 256-bit SSL encrypted
      </p>
    </div>
  );
}
