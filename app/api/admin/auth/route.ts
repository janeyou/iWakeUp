import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.formData();
  const token = body.get("token")?.toString() ?? "";
  const expected = process.env.CRON_SECRET;

  if (!expected || token !== expected) {
    const url = new URL(request.url);
    return NextResponse.redirect(new URL("/admin/login?error=1", url.origin));
  }

  const url = new URL(request.url);
  const response = NextResponse.redirect(new URL("/admin", url.origin));
  response.cookies.set("admin_token", expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return response;
}
