import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const SLA_HOURS: Record<string, number> = {
  PLUMBING: 4, ELECTRICAL: 4, LIFT: 2, SECURITY: 1,
  CIVIL: 48, PEST_CONTROL: 24, HOUSEKEEPING: 8, OTHER: 24
};

const createSchema = z.object({
  flatId:      z.string().min(1),
  category:    z.enum(["PLUMBING","ELECTRICAL","LIFT","SECURITY","CIVIL","PEST_CONTROL","HOUSEKEEPING","OTHER"]),
  description: z.string().min(10).max(2000),
  location:    z.enum(["INSIDE_FLAT","COMMON_AREA"]).default("INSIDE_FLAT")
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const flatId = searchParams.get("flatId");

  try {
    const complaints = await prisma.complaint.findMany({
      where: flatId ? { flatId } : {},
      include: { updates: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" },
      take: 50
    });
    return NextResponse.json({ data: complaints });
  } catch (err) {
    console.error("[GET /api/complaints]", err);
    return NextResponse.json({ error: "Failed to fetch complaints" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const complaint = await prisma.complaint.create({
      data: {
        ...parsed.data,
        slaHours: SLA_HOURS[parsed.data.category] ?? 24
      },
      include: { updates: true }
    });
    return NextResponse.json({ data: complaint }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/complaints]", err);
    return NextResponse.json({ error: "Failed to create complaint" }, { status: 500 });
  }
}
