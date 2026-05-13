// API route: /api/properties
// GET  — list properties (with optional filters)
// POST — create a new property listing
//
// This file is THE TEMPLATE for every other API route in EstateHub.
// Pattern: parse → validate with Zod → call Prisma → return typed JSON.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// ─── Zod input schemas ────────────────────────────────────────────────────
const createPropertySchema = z.object({
  ownerId: z.string().min(1),
  title: z.string().min(5).max(200),
  description: z.string().optional(),
  intent: z.enum(["SELL", "RENT"]),
  type: z.enum(["APARTMENT", "VILLA", "PLOT", "INDEPENDENT_HOUSE", "COMMERCIAL"]),
  bhk: z.number().int().min(0).max(10),
  carpetArea: z.number().int().min(100).max(50000),
  bathrooms: z.number().int().min(0).max(10).default(1),
  balconies: z.number().int().min(0).max(10).default(0),
  furnishing: z.enum(["UNFURNISHED", "SEMI_FURNISHED", "FULLY_FURNISHED"]).default("UNFURNISHED"),
  ageYears: z.number().int().min(0).max(200).optional(),
  floor: z.number().int().min(0).max(200).optional(),
  totalFloors: z.number().int().min(0).max(200).optional(),
  price: z.number().positive(),
  isNegotiable: z.boolean().default(true),
  addressLine: z.string().min(3),
  locality: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().regex(/^\d{6}$/, "Must be a 6-digit pincode"),
  amenities: z.array(z.string()).default([])
});

// ─── GET /api/properties ──────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") ?? undefined;
  const bhkParam = searchParams.get("bhk");
  const intent = searchParams.get("intent")?.toUpperCase();

  const where: Record<string, unknown> = { status: "LIVE" };
  if (city) where.city = city;
  if (bhkParam) where.bhk = parseInt(bhkParam);
  if (intent === "SELL" || intent === "RENT") where.intent = intent;

  try {
    const properties = await prisma.property.findMany({
      where,
      include: { photos: { take: 1, orderBy: { order: "asc" } } },
      orderBy: { publishedAt: "desc" },
      take: 50
    });
    return NextResponse.json({ data: properties });
  } catch (err) {
    console.error("[GET /api/properties]", err);
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}

// ─── POST /api/properties ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createPropertySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const property = await prisma.property.create({
      data: {
        ...parsed.data,
        status: "DRAFT" // owners must explicitly publish via a separate action
      }
    });
    return NextResponse.json({ data: property }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/properties]", err);
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
  }
}
