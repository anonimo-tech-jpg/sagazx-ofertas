import dns from "dns/promises";
import net from "net";

function privateIp(ip: string): boolean {
  if (net.isIPv6(ip)) { const l = ip.toLowerCase(); if (l.startsWith("::ffff:")) return privateIp(l.slice(7)); return l === "::1" || l === "::" || l.startsWith("fc") || l.startsWith("fd") || l.startsWith("fe80"); }
  const [a, b] = ip.split(".").map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}
async function assertPublic(u: URL) {
  if (!["http:", "https:"].includes(u.protocol)) throw new Error("Protocolo não permitido.");
  const ips = net.isIP(u.hostname) ? [u.hostname] : (await dns.lookup(u.hostname, { all: true })).map((x) => x.address);
  if (!ips.length || ips.some(privateIp)) throw new Error("Endereço não permitido.");
}
async function get(url: string, hops = 0): Promise<{ html: string; finalUrl: string }> {
  if (hops > 4) throw new Error("Redirecionamentos demais.");
  const u = new URL(url); await assertPublic(u);
  const r = await fetch(u, { redirect: "manual", signal: AbortSignal.timeout(8000), headers: { "User-Agent": "Mozilla/5.0 (compatible; SAGAZxBot/1.0; link preview)", Accept: "text/html", "Accept-Language": "pt-BR,pt;q=0.9" } });
  const loc = r.headers.get("location");
  if (r.status >= 300 && r.status < 400 && loc) return get(new URL(loc, u).toString(), hops + 1);
  if (!r.ok) return { html: "", finalUrl: u.toString() };
  return { html: (await r.text()).slice(0, 1_500_000), finalUrl: u.toString() };
}
const dec = (s: string) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
function metaTag(html: string, key: string) {
  for (const m of html.matchAll(/<meta\s[^>]*>/gi)) {
    const t = m[0];
    const k = t.match(/(?:property|name|itemprop)\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase();
    if (k === key) { const c = t.match(/content\s*=\s*["']([^"']*)["']/i)?.[1]; if (c) return dec(c); }
  }
  return "";
}
function walk(n: any): any {
  if (!n || typeof n !== "object") return null;
  if (Array.isArray(n)) { for (const x of n) { const r = walk(x); if (r) return r; } return null; }
  const t = n["@type"];
  if (t === "Product" || (Array.isArray(t) && t.includes("Product"))) return n;
  return walk(n["@graph"]);
}
function ldProduct(html: string): any {
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { const p = walk(JSON.parse(m[1])); if (p) return p; } catch {}
  }
  return null;
}
function nameFromUrl(finalUrl: string) {
  try {
    const seg = new URL(finalUrl).pathname.split("/").filter(Boolean).pop() || "";
    const s = decodeURIComponent(seg).replace(/-i\.\d+\.\d+$/, "").replace(/MLB-?\d+/gi, "").replace(/_JM$/i, "").replace(/[-_+]+/g, " ").trim();
    return /[a-zA-ZÀ-ú]{3}/.test(s) && s.length > 8 ? s.slice(0, 200) : "";
  } catch { return ""; }
}
const STORE_MAP: [RegExp, string][] = [[/shopee\./, "Shopee"], [/aliexpress\./, "AliExpress"], [/amazon\.|amzn\./, "Amazon"], [/mercadolivre\.|mercadolibre\.|meli\./, "Mercado Livre"]];

export async function fetchMeta(url: string) {
  const { html, finalUrl } = await get(url);
  const host = new URL(finalUrl).hostname + new URL(url).hostname;
  const store = STORE_MAP.find(([re]) => re.test(host))?.[1] || "Outras lojas";
  const ld = ldProduct(html);
  const offer = ld && (Array.isArray(ld.offers) ? ld.offers[0] : ld.offers);
  let name = metaTag(html, "og:title") || ld?.name || dec(html.match(/<title[^>]*>([^<]*)/i)?.[1] || "");
  if (!name || /^shopee/i.test(name.trim())) name = nameFromUrl(finalUrl) || name;
  let image: any = metaTag(html, "og:image") || metaTag(html, "twitter:image") || (Array.isArray(ld?.image) ? ld.image[0] : ld?.image) || "";
  if (typeof image !== "string") image = image?.url || "";
  try { if (image) image = new URL(image, finalUrl).toString(); } catch { image = ""; }
  const description = metaTag(html, "og:description") || metaTag(html, "description") || ld?.description || "";
  const price = metaTag(html, "product:price:amount") || metaTag(html, "og:price:amount") || offer?.price || offer?.lowPrice || "";
  const missing = [!name && "nome", !image && "imagem", !price && "preço"].filter(Boolean) as string[];
  return { name: String(name).trim(), image, description: String(description).slice(0, 600), store, price: price ? String(price) : "", finalUrl, missing };
}