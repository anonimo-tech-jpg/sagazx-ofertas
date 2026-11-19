import crypto from "crypto";
import { cookies } from "next/headers";
const NAME = "sx_session";
const TTL = 60 * 60 * 12;
const secret = () => process.env.SESSION_SECRET || "";
const sign = (v: string) => crypto.createHmac("sha256", secret()).update(v).digest("hex");
const h = (s: string) => crypto.createHash("sha256").update(s).digest();

export function checkCredentials(u: string, p: string) {
  const U = process.env.ADMIN_USER, P = process.env.ADMIN_PASSWORD;
  if (!U || !P || secret().length < 16) return false;
  const a = crypto.timingSafeEqual(h(u), h(U));
  const b = crypto.timingSafeEqual(h(p), h(P));
  return a && b;
}
export function createSession() {
  const v = `${Date.now() + TTL * 1000}`;
  cookies().set(NAME, `${v}.${sign(v)}`, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: TTL });
}
export function destroySession() { cookies().delete(NAME); }
export function isAuthed() {
  const c = cookies().get(NAME)?.value;
  if (!c || secret().length < 16) return false;
  const [v, sig] = c.split(".");
  if (!v || !sig) return false;
  const good = sign(v);
  if (sig.length !== good.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return false;
  return Number(v) > Date.now();
}
