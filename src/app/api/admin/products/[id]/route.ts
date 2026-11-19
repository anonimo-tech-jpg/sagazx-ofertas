import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { mutate } from "@/lib/github";
import { buildProduct } from "@/lib/validate";
export const dynamic = "force-dynamic";
const no = () => NextResponse.json({ error: "Não autorizado." }, { status: 401 });
const fail = (e: any) => NextResponse.json({ error: e.message || "Erro." }, { status: 500 });
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!isAuthed()) return no();
  const body = await req.json().catch(() => ({}));
  let err: string | undefined;
  try {
    const list = await mutate((l) => l.map((p) => {
      if (p.id !== params.id) return p;
      const r = buildProduct({ ...p, ...body }, p);
      if (!r.product) { err = r.error; throw new Error(r.error); }
      return r.product;
    }), "Edita produto");
    return NextResponse.json(list);
  } catch (e: any) { return err ? NextResponse.json({ error: err }, { status: 400 }) : fail(e); }
}
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!isAuthed()) return no();
  try { return NextResponse.json(await mutate((l) => l.filter((p) => p.id !== params.id), "Remove produto")); } catch (e) { return fail(e); }
}
