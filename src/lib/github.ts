import { Product } from "@/types";
const env = () => {
  const { GITHUB_TOKEN: t, GITHUB_OWNER: o, GITHUB_REPO: r } = process.env;
  if (!t || !o || !r) throw new Error("Variáveis do GitHub não configuradas.");
  return { t, o, r, b: process.env.GITHUB_BRANCH || "main", p: process.env.GITHUB_PRODUCTS_PATH || "data/products.json" };
};
const api = (e: ReturnType<typeof env>) => `https://api.github.com/repos/${e.o}/${e.r}/contents/${e.p}`;
const hdr = (t: string) => ({ Authorization: `Bearer ${t}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "sagazx-ofertas" });

export async function readProducts(): Promise<{ products: Product[]; sha: string | null }> {
  const e = env();
  const r = await fetch(`${api(e)}?ref=${e.b}`, { headers: hdr(e.t), cache: "no-store" });
  if (r.status === 404) return { products: [], sha: null };
  if (!r.ok) throw new Error(`GitHub leitura falhou (${r.status}). Verifique token/repositório.`);
  const j = await r.json();
  return { products: JSON.parse(Buffer.from(j.content, "base64").toString("utf8") || "[]"), sha: j.sha };
}
export async function mutate(fn: (list: Product[]) => Product[], msg: string) {
  const e = env();
  for (let i = 0; i < 3; i++) {
    const { products, sha } = await readProducts();
    const next = fn(products);
    const body = { message: msg, branch: e.b, sha: sha || undefined, content: Buffer.from(JSON.stringify(next, null, 2)).toString("base64") };
    const r = await fetch(api(e), { method: "PUT", headers: { ...hdr(e.t), "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (r.ok) return next;
    if (r.status !== 409 && r.status !== 422) throw new Error(`GitHub escrita falhou (${r.status}). O token precisa de Contents: Read and write.`);
  }
  throw new Error("Conflito ao salvar no GitHub. Tente novamente.");
}
