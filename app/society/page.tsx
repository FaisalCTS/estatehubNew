import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

// Server component — shows the society home for the demo society.
// Once Clerk auth is wired up, replace `demoFlat` with the current user's flat.
export default async function SocietyPage() {
  // Load demo society data
  const society = await prisma.society.findFirst({
    where: { name: "Prestige Lakeside Habitat" },
    include: {
      flats: {
        include: {
          bills: { where: { status: "PENDING" }, orderBy: { dueDate: "asc" }, take: 1 },
          visitorPasses: { where: { status: "ACTIVE" }, orderBy: { validUntil: "asc" }, take: 3 }
        },
        take: 1
      },
      notices: { orderBy: { createdAt: "desc" }, take: 3 }
    }
  }).catch(() => null);

  const flat = society?.flats[0];
  const pendingBill = flat?.bills[0];
  const activePass = flat?.visitorPasses ?? [];

  const notices = society?.notices ?? [];

  const amenityTagList: string[] = (() => { try { return JSON.parse(society?.amenityTags as string ?? "[]") as string[]; } catch { return []; } })();

  if (!society) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="card">
          <p className="text-4xl mb-4">🏢</p>
          <h1 className="text-xl font-bold text-brand-primary mb-2">Find your society</h1>
          <p className="text-brand-muted text-sm mb-6">
            Search for your residential complex to access visitor passes, maintenance bills, amenity bookings, and more.
          </p>
          <Link href="/society/join" className="btn-primary">Find My Society</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Society header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">{society.name}</h1>
          <p className="text-brand-muted text-sm mt-0.5">
            {society.locality}, {society.city} · {society.totalFlats} flats
          </p>
          {flat && (
            <span className="inline-block mt-1 text-xs bg-brand-light text-brand-primary px-2 py-0.5 rounded-full">
              Tower {flat.tower} · Flat {flat.flatNo}
            </span>
          )}
        </div>
        <Link href="/society/join" className="text-xs text-brand-accent hover:underline">
          Change flat →
        </Link>
      </div>

      {/* Pending bill alert */}
      {pendingBill && (
        <div className="mb-6 rounded-xl bg-yellow-50 border border-yellow-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-yellow-800">
              Maintenance bill due {new Date(pendingBill.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </p>
            <p className="text-yellow-700 text-lg font-bold">{formatPrice(pendingBill.amount.toString())}</p>
          </div>
          <Link href={`/society/bills/${pendingBill.id}`} className="btn-primary text-sm bg-yellow-500 hover:bg-yellow-600 border-none">
            Pay Now
          </Link>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { href: "/society/visitors/new", icon: "👤", label: "Invite Visitor" },
          { href: "/society/bills",        icon: "💳", label: "Pay Bills" },
          { href: "/society/amenities",    icon: "🏊", label: "Book Amenity" },
          { href: "/society/complaints/new", icon: "🔧", label: "Raise Complaint" },
          { href: "/society/notices",      icon: "📋", label: "Notices" },
          { href: "/gate",                 icon: "🛡️", label: "Gate Log" },
          { href: "/society/polls",        icon: "📊", label: "Polls" },
          { href: "/admin/billing",        icon: "⚙️", label: "Admin" }
        ].map((a) => (
          <Link key={a.href} href={a.href}
            className="card flex flex-col items-center justify-center gap-2 py-5 hover:border-brand-accent hover:shadow-md text-center">
            <span className="text-2xl">{a.icon}</span>
            <span className="text-xs font-medium text-brand-ink">{a.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Active visitor passes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-brand-primary">Active Visitor Passes</h2>
            <Link href="/society/visitors/new" className="text-xs text-brand-accent hover:underline">+ New pass</Link>
          </div>
          {activePass.length === 0 ? (
            <p className="text-brand-muted text-sm text-center py-4">No active passes. Invite your first visitor.</p>
          ) : (
            <ul className="space-y-2">
              {activePass.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm bg-brand-light rounded-lg px-3 py-2">
                  <div>
                    <p className="font-medium text-brand-ink">{p.visitorName}</p>
                    <p className="text-xs text-brand-muted">
                      Valid until {new Date(p.validUntil).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {p.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Latest notices */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-brand-primary">Recent Notices</h2>
            <Link href="/society/notices" className="text-xs text-brand-accent hover:underline">View all</Link>
          </div>
          {notices.length === 0 ? (
            <p className="text-brand-muted text-sm text-center py-4">No notices from the committee yet.</p>
          ) : (
            <ul className="space-y-3">
              {notices.map((n) => (
                <li key={n.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-brand-ink">{n.isPinned && "📌 "}{n.title}</p>
                  <p className="text-xs text-brand-muted line-clamp-2 mt-0.5">{n.body}</p>
                  <p className="text-xs text-brand-muted mt-1">
                    {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Society amenities */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-brand-primary">Society Amenities</h2>
            <Link href="/society/amenities" className="text-xs text-brand-accent hover:underline">Book →</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {(amenityTagList.length > 0 ? amenityTagList : ["Swimming Pool", "Gym", "Clubhouse"]).map((a) => (
              <span key={a} className="text-xs bg-brand-light text-brand-primary px-3 py-1.5 rounded-full">{a}</span>
            ))}
          </div>
        </div>

        {/* Society info */}
        <div className="card">
          <h2 className="font-semibold text-brand-primary mb-4">Society Info</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-brand-muted">Total Flats</dt>
              <dd className="font-medium">{society.totalFlats}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-brand-muted">Location</dt>
              <dd className="font-medium">{society.locality}, {society.city}</dd>
            </div>
            {society.reraId && (
              <div className="flex justify-between">
                <dt className="text-brand-muted">RERA ID</dt>
                <dd className="font-medium font-mono text-xs">{society.reraId}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-brand-muted">Pincode</dt>
              <dd className="font-medium">{society.pincode}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
