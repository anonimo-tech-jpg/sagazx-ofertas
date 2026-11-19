import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  const { GITHUB_OWNER: o, GITHUB_REPO: r } = process.env;
  const b = process.env.GITHUB_BRANCH || "main", p = process.env.GITHUB_PRODUCTS_PATH || "data/products.json";
  try {
    const res = await fetch(`https://raw.githubusercontent.com/${o}/${r}/${b}/${p}`, { next: { revalidate: 20 } });
    if (!res.ok) throw new Error();
    const list = await res.json();
    return NextResponse.json(list.filter((x: any) => x.active !== false), { headers: { "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60" } });
  } catch { return NextResponse.json({ error: "Não foi possível carregar produtos." }, { status: 502 }); }
}
