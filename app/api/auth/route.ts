import { NextResponse } from "next/server";
import { checkPassword, getAdminPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!getAdminPassword()) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_PASSWORD non configurata sul server." },
      { status: 503 }
    );
  }
  const body = await req.json().catch(() => ({}));
  if (!checkPassword(body?.password)) {
    return NextResponse.json({ ok: false, error: "Password errata." }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
