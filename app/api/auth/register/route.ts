import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, AUTH_COOKIE } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 30,
  path: "/",
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const first = Object.values(fieldErrors).flat()[0];
    return NextResponse.json({ error: first ?? "Validation failed" }, { status: 400 });
  }

  const { name, email, phone, password } = parsed.data;

  try {
    const conflict = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (conflict) {
      const field = conflict.email === email ? "Email" : "Mobile number";
      return NextResponse.json(
        { error: `${field} is already registered. Try signing in.` },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, phone, passwordHash },
    });

    const token = await signToken({
      id: user.id,
      name: user.name,
      email: user.email!,
      phone: user.phone,
    });

    const res = NextResponse.json(
      { data: { id: user.id, name: user.name, email: user.email } },
      { status: 201 }
    );
    res.cookies.set(AUTH_COOKIE, token, COOKIE_OPTS);
    return res;
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
