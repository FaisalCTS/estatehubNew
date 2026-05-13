import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const bill = await prisma.maintenanceBill.findUnique({
      where: { id },
      include: { flat: { select: { tower: true, flatNo: true } } }
    });
    if (!bill) return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    const breakdown = (() => { try { return JSON.parse(bill.breakdown as string); } catch { return []; } })();
    return NextResponse.json({ data: { ...bill, breakdown } });
  } catch (err) {
    console.error("[GET /api/bills/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch bill" }, { status: 500 });
  }
}

const patchSchema = z.object({
  action:     z.literal("pay"),
  paymentRef: z.string().min(1)
});

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
    const bill = await prisma.maintenanceBill.findUnique({ where: { id } });
    if (!bill) return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    if (bill.status === "PAID") return NextResponse.json({ error: "Bill already paid" }, { status: 409 });

    const updated = await prisma.maintenanceBill.update({
      where: { id },
      data: { status: "PAID", paidAt: new Date(), paymentRef: parsed.data.paymentRef }
    });
    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("[PATCH /api/bills/[id]]", err);
    return NextResponse.json({ error: "Failed to update bill" }, { status: 500 });
  }
}
