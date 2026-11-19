import crypto from "crypto";
import { CATEGORIES } from "@/config/site";
import { Product } from "@/types";

const clean = (s: unknown, max: number) => String(s ?? "").replace(/<[^>]*>/g, "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);
export function cleanUrl(s: unknown, httpsOnly = false): string | null {
  try {
    const u = new URL(String(s ?? "").trim());
    if (u.protocol !== "https:" && (httpsOnly || u.protocol !== "http:")) return null;
    if (u.username || u.password) return null;
    return u.toString();
  } catch { return null; }
}
const num = (v: unknown): number | null => {
  if (v === "" || v == null) return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) && n >= 0 && n < 1e9 ? Math.round(n * 100) / 100 : NaN;
};

export function buildProduct(i: any, base?: Product): { product?: Product; error?: string } {
  const name = clean(i.name, 200);
  if (!name) return { error: "Nome é obrigatório." };
  const affiliateUrl = cleanUrl(i.affiliateUrl);
  if (!affiliateUrl) return { error: "Link de afiliado inválido (use http/https)." };
  const image = i.image ? cleanUrl(i.image, true) : "";
  if (i.image && !image) return { error: "Imagem inválida (precisa ser https)." };
  const productUrl = i.productUrl ? cleanUrl(i.productUrl) : "";
  if (i.productUrl && !productUrl) return { error: "Link do produto inválido." };
  const price = num(i.price), oldPrice = num(i.oldPrice);
  let discount = num(i.discount);
  if ([price, oldPrice, discount].some((x) => Number.isNaN(x))) return { error: "Preço/desconto inválido." };
  if (discount !== null && discount > 99) return { error: "Desconto deve ser até 99." };
  if (discount === null && price && oldPrice && oldPrice > price) discount = Math.round((1 - price / oldPrice) * 100);
  const category = CATEGORIES.includes(i.category) ? i.category : "Outros";
  return { product: {
    id: base?.id || crypto.randomUUID(), name, image: image || "", price, oldPrice, discount,
    store: clean(i.store, 60) || "Outras lojas", category, description: clean(i.description, 600),
    affiliateUrl, productUrl: productUrl || "",
    createdAt: base?.createdAt || new Date().toISOString(),
    active: typeof i.active === "boolean" ? i.active : base?.active ?? true,
  }};
}
