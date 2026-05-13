import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default async function BillsPage() {
  // NOTE: replace flat lookup with current user's flat once Clerk is wired up
  const flat = await prisma.flat.findFirst({
    where: { tower: "A", flatNo: "1204" },
    include: {
      bills: { orderBy: [{ cycleYear: "desc" }, { cycleMonth: "desc" }], take: 12 }
    }
  }).catch(() => null);

  const bills = flat?.bills ?? [];

  const totalPaid = bills.filter(b => b.status === "PAID").reduce((sum, b) => sum + Number(b.amount), 0);
  const totalPending = bills.filter(b => b.status === "PENDING" || b.status === "OVERDUE").reduce((sum, b) => sum + Number(b.amount), 0);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <nav className="text-xs text-brand-muted mb-4 flex items-center gap-1">
        <Link href="/society" className="hover:underline">My Society</Link>
        <span>/</span>
        <span>Maintenance Bills</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Maintenance Bills</h1>
          {flat && (
            <p className="text-brand-muted text-sm mt-0.5">Tower {flat.tower} · Flat {flat.flatNo}</p>
          )}
        </div>
        <Link href="/admin/billing" className="text-xs text-brand-accent hover:underline">Admin view →</Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-xs text-brand-muted uppercase tracking-wide mb-1">Pending</p>
          <p className="text-2xl font-bold text-red-500">{formatPrice(totalPending)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-brand-muted uppercase tracking-wide mb-1">Paid this year</p>
          <p className="text-2xl font-bold text-green-600">{formatPrice(totalPaid)}</p>
        </div>
      </div>

      {/* Bill list */}
      {bills.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-2xl mb-2">📋</p>
          <p className="text-brand-muted text-sm">No bills yet. Bills are generated on the 1st of each month.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bills.map((bill) => (
            <Link key={bill.id} href={`/society/bills/${bill.id}`}
              className="card flex items-center justify-between hover:border-brand-accent">
              <div>
                <p className="font-semibold text-brand-ink">
                  {MONTH_NAMES[bill.cycleMonth - 1]} {bill.cycleYear}
                </p>
                <p className="text-xs text-brand-muted mt-0.5">
                  Due {new Date(bill.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  {Number(bill.lateFee) > 0 && <span className="text-red-500 ml-2">+ {formatPrice(bill.lateFee.toString())} late fee</span>}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-bold text-brand-primary">{formatPrice(bill.amount.toString())}</p>
                <StatusBadge status={bill.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    PAID:      "bg-green-100 text-green-700",
    PENDING:   "bg-yellow-100 text-yellow-700",
    OVERDUE:   "bg-red-100 text-red-700",
    CANCELLED: "bg-gray-100 text-gray-500"
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}
