// Limite simples em memória (melhor esforço em ambiente serverless).
const hits = new Map<string, { n: number; t: number }>();
export function limited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const e = hits.get(key);
  if (!e || now - e.t > windowMs) { hits.set(key, { n: 1, t: now }); return false; }
  e.n++;
  return e.n > max;
}
export const ipOf = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
