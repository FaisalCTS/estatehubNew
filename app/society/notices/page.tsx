import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function NoticesPage() {
  const society = await prisma.society.findFirst({ where: { name: "Prestige Lakeside Habitat" } }).catch(() => null);

  const notices = await prisma.notice.findMany({
    where: { societyId: society?.id ?? "" },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }]
  }).catch(() => []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <nav className="text-xs text-brand-muted mb-4 flex items-center gap-1">
        <Link href="/society" className="hover:underline">My Society</Link>
        <span>/</span>
        <span>Notices</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-primary">Notice Board</h1>
        <Link href="/admin/billing" className="text-xs text-brand-accent hover:underline">Admin →</Link>
      </div>

      {notices.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-3xl mb-3">📋</p>
          <p className="font-medium text-brand-ink mb-1">No notices yet</p>
          <p className="text-brand-muted text-sm">The committee will post updates here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((n) => (
            <div key={n.id} className={`card ${n.isPinned ? "border-brand-primary border-2" : ""}`}>
              <div className="flex items-start justify-between mb-2">
                <h2 className="font-semibold text-brand-ink flex items-center gap-1">
                  {n.isPinned && <span>📌</span>}
                  {n.title}
                </h2>
                <span className="text-xs text-brand-muted shrink-0 ml-3">
                  {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <p className="text-brand-muted text-sm leading-relaxed whitespace-pre-line">{n.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
