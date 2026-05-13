import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

const createPassSchema = z.object({
  flatId:       z.string().min(1),
  visitorName:  z.string().min(2).max(100),
  visitorPhone: z.string().optional(),
  vehicleNo:    z.string().optional(),
  validUntil:   z.string().datetime()
});

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateQrToken(): string {
  return randomBytes(16).toString("hex");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const flatId = searchParams.get("flatId");
  const token  = searchParams.get("token");

  if (token) {
    try {
      const pass = await prisma.visitorPass.findUnique({ where: { qrToken: token } });
      if (!pass) return NextResponse.json({ error: "Pass not found" }, { status: 404 });
      return NextResponse.json({ data: pass });
    } catch (err) {
      console.error("[GET /api/visitor-passes token]", err);
      return NextResponse.json({ error: "Failed to fetch pass" }, { status: 500 });
    }
  }

  if (!flatId) return NextResponse.json({ error: "flatId required" }, { status: 400 });

  try {
    const passes = await prisma.visitorPass.findMany({
      where: { flatId, status: { in: ["ACTIVE", "USED"] } },
      orderBy: { createdAt: "desc" },
      take: 20
    });
    return NextResponse.json({ data: passes });
  } catch (err) {
    console.error("[GET /api/visitor-passes]", err);
    return NextResponse.json({ error: "Failed to fetch passes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createPassSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const pass = await prisma.visitorPass.create({
      data: {
        ...parsed.data,
        validUntil: new Date(parsed.data.validUntil),
        otp: generateOtp(),
        qrToken: generateQrToken()
      }
    });
    return NextResponse.json({ data: pass }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/visitor-passes]", err);
    return NextResponse.json({ error: "Failed to create pass" }, { status: 500 });
  }
}

// PATCH /api/visitor-passes?token=<token>&action=use|exit|revoke
export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token  = searchParams.get("token");
  const action = searchParams.get("action");

  if (!token || !action) {
    return NextResponse.json({ error: "token and action required" }, { status: 400 });
  }

  try {
    const pass = await prisma.visitorPass.findUnique({ where: { qrToken: token } });
    if (!pass) return NextResponse.json({ error: "Pass not found" }, { status: 404 });

    if (pass.status !== "ACTIVE") {
      return NextResponse.json({ error: `Pass is already ${pass.status.toLowerCase()}` }, { status: 409 });
    }

    const now = new Date();
    if (now > pass.validUntil) {
      await prisma.visitorPass.update({ where: { qrToken: token }, data: { status: "EXPIRED" } });
      return NextResponse.json({ error: "Pass has expired" }, { status: 410 });
    }

    const update =
      action === "use"    ? { status: "USED" as const,    enteredAt: now }
      : action === "exit"   ? { exitedAt: now }
      : action === "revoke" ? { status: "REVOKED" as const }
      : null;

    if (!update) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    const updated = await prisma.visitorPass.update({ where: { qrToken: token }, data: update });
    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("[PATCH /api/visitor-passes]", err);
    return NextResponse.json({ error: "Failed to update pass" }, { status: 500 });
  }
}
