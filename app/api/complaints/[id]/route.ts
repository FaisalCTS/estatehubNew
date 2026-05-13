import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: { updates: { orderBy: { createdAt: "asc" } } }
    });
    if (!complaint) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: complaint });
  } catch (err) {
    console.error("[GET /api/complaints/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

const patchSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("rate"), rating: z.number().int().min(1).max(5) }),
  z.object({ action: z.literal("update"), message: z.string().min(1), statusTo: z.enum(["ASSIGNED","IN_PROGRESS","RESOLVED","CLOSED","REOPENED"]).optional() })
]);

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    if (parsed.data.action === "rate") {
      const updated = await prisma.complaint.update({
        where: { id },
        data: { rating: parsed.data.rating, status: "CLOSED" }
      });
      return NextResponse.json({ data: updated });
    }

    if (parsed.data.action === "update") {
      const updateData: { message: string; statusTo?: string } = { message: parsed.data.message };
      if (parsed.data.statusTo) updateData.statusTo = parsed.data.statusTo;

      const [update] = await prisma.$transaction([
        prisma.complaintUpdate.create({ data: { complaintId: id, ...updateData } }),
        ...(parsed.data.statusTo
          ? [prisma.complaint.update({
              where: { id },
              data: {
                status: parsed.data.statusTo,
                ...(parsed.data.statusTo === "RESOLVED" ? { resolvedAt: new Date() } : {})
              }
            })]
          : [])
      ]);
      return NextResponse.json({ data: update });
    }
  } catch (err) {
    console.error("[PATCH /api/complaints/[id]]", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
