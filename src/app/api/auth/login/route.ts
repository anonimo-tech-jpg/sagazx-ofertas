import { NextResponse } from "next/server";
import { checkCredentials, createSession } from "@/lib/auth";
import { limited, ipOf } from "@/lib/ratelimit";
export async function POST(req: Request) {
  if (limited("login:" + ipOf(req), 5, 15 * 60_000)) return NextResponse.json({ error: "Muitas tentativas. Aguarde 15 minutos." }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  if (!checkCredentials(String(b.user ?? ""), String(b.password ?? ""))) return NextResponse.json({ error: "Usuário ou senha incorretos." }, { status: 401 });
  createSession();
  return NextResponse.json({ ok: true });
}
