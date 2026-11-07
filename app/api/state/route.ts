import { NextResponse } from "next/server";
import { checkPassword } from "@/lib/auth";
import { isPersistent, readData, writeData } from "@/lib/store";
import { sanitizeAppData } from "@/lib/tournament";

export const dynamic = "force-dynamic";

/** Archivio completo dei tornei (pubblico, sola lettura). */
export async function GET() {
  try {
    const data = await readData();
    return NextResponse.json(
      { data, persistent: isPersistent() },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Impossibile leggere i dati." }, { status: 500 });
  }
}

/** Salva l'archivio completo (solo admin). */
export async function PUT(req: Request) {
  if (!checkPassword(req.headers.get("x-admin-password"))) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }
  try {
    const data = sanitizeAppData(await req.json());
    await writeData(data);
    return NextResponse.json({ ok: true, persistent: isPersistent() });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Impossibile salvare i dati." }, { status: 500 });
  }
}
