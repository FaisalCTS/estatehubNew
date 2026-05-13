import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createBookingSchema = z.object({
  amenityId:  z.string().min(1),
  flatId:     z.string().min(1),
  date:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  startTime:  z.string().min(1),
  endTime:    z.string().min(1),
  feeAmount:  z.number().min(0).optional(),
  deposit:    z.number().min(0).optional()
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const flatId    = searchParams.get("flatId");
  const amenityId = searchParams.get("amenityId");

  const where: Record<string, unknown> = {};
  if (flatId)    where.flatId    = flatId;
  if (amenityId) where.amenityId = amenityId;

  try {
    const bookings = await prisma.amenityBooking.findMany({
      where,
      include: { amenity: { select: { name: true, icon: true } } },
      orderBy: { date: "desc" },
      take: 20
    });
    return NextResponse.json({ data: bookings });
  } catch (err) {
    console.error("[GET /api/amenity-bookings]", err);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { amenityId, flatId, date, startTime, endTime, feeAmount, deposit } = parsed.data;

  try {
    // Check for conflict on same amenity + date + overlapping time
    const conflict = await prisma.amenityBooking.findFirst({
      where: {
        amenityId,
        date: new Date(date),
        status: "CONFIRMED",
        startTime,
        endTime
      }
    });
    if (conflict) {
      return NextResponse.json({ error: "This slot is already booked. Please pick another time." }, { status: 409 });
    }

    const booking = await prisma.amenityBooking.create({
      data: {
        amenityId,
        flatId,
        date: new Date(date),
        startTime,
        endTime,
        feeAmount,
        deposit
      }
    });
    return NextResponse.json({ data: booking }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/amenity-bookings]", err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
