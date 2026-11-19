import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { mutate, readProducts } from "@/lib/github";
import { buildProduct } from "@/lib/validate";
export const dynamic = "force-dynamic";
const no = () => NextResponse.json({ error: "Não autorizado." }, { status: 401 });
const fail = (e: any) => NextResponse.json({ error: e.message || "Erro." }, { status: 500 });
export async function GET() {
  if (!isAuthed()) return no();
  try { return NextResponse.json((await readProducts()).products); } catch (e) { return fail(e); }
}
export async function POST(req: Request) {
  if (!isAuthed()) return no();
  const { product, error } = buildProduct(await req.json().catch(() => ({})));
  if (!product) return NextResponse.json({ error }, { status: 400 });
  try { return NextResponse.json(await mutate((l) => [product, ...l], `Adiciona produto: ${product.name.slice(0, 60)}`)); } catch (e) { return fail(e); }
}
