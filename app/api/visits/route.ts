import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createVisitSchema = z.object({
  buyerId:     z.string().min(1),
  propertyId:  z.string().min(1),
  scheduledAt: z.string().datetime(),
  type:        z.enum(["IN_PERSON", "VIRTUAL"]).default("IN_PERSON"),
  notes:       z.string().optional()
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("propertyId");
  const buyerId    = searchParams.get("buyerId");

  const where: Record<string, unknown> = {};
  if (propertyId) where.propertyId = propertyId;
  if (buyerId)    where.buyerId    = buyerId;

  try {
    const visits = await prisma.visit.findMany({
      where,
      include: { property: { select: { title: true, locality: true, city: true } } },
      orderBy: { scheduledAt: "asc" }
    });
    return NextResponse.json({ data: visits });
  } catch (err) {
    console.error("[GET /api/visits]", err);
    return NextResponse.json({ error: "Failed to fetch visits" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createVisitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { buyerId, propertyId, scheduledAt, type, notes } = parsed.data;

  try {
    // Prevent double-booking the same slot on the same property
    const conflict = await prisma.visit.findFirst({
      where: { propertyId, scheduledAt: new Date(scheduledAt), status: { in: ["REQUESTED", "CONFIRMED"] } }
    });
    if (conflict) {
      return NextResponse.json({ error: "This slot is already taken. Please pick another time." }, { status: 409 });
    }

    const visit = await prisma.visit.create({
      data: { buyerId, propertyId, scheduledAt: new Date(scheduledAt), type, notes }
    });
    return NextResponse.json({ data: visit }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/visits]", err);
    return NextResponse.json({ error: "Failed to book visit" }, { status: 500 });
  }
}
