import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { fetchMeta } from "@/lib/meta";
import { cleanUrl } from "@/lib/validate";
import { limited, ipOf } from "@/lib/ratelimit";
export async function POST(req: Request) {
  if (!isAuthed()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  if (limited("meta:" + ipOf(req), 30, 10 * 60_000)) return NextResponse.json({ error: "Limite de buscas atingido." }, { status: 429 });
  const { url } = await req.json().catch(() => ({ url: "" }));
  const safe = cleanUrl(url);
  if (!safe) return NextResponse.json({ error: "Link inválido." }, { status: 400 });
  try { return NextResponse.json(await fetchMeta(safe)); }
  catch (e: any) { return NextResponse.json({ error: e.message || "Não foi possível ler o link. Preencha manualmente." }, { status: 422 }); }
}
