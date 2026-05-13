import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createNoticeSchema = z.object({
  societyId: z.string().min(1),
  title:     z.string().min(3).max(200),
  body:      z.string().min(5),
  isPinned:  z.boolean().default(false)
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const societyId = searchParams.get("societyId");
  if (!societyId) return NextResponse.json({ error: "societyId required" }, { status: 400 });

  try {
    const notices = await prisma.notice.findMany({
      where: { societyId },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }]
    });
    return NextResponse.json({ data: notices });
  } catch (err) {
    console.error("[GET /api/notices]", err);
    return NextResponse.json({ error: "Failed to fetch notices" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createNoticeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const notice = await prisma.notice.create({ data: parsed.data });
    return NextResponse.json({ data: notice }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/notices]", err);
    return NextResponse.json({ error: "Failed to create notice" }, { status: 500 });
  }
}
