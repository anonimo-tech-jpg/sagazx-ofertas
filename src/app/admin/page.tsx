"use client";
import { useEffect, useState } from "react";
import { Product } from "@/types";
import { CATEGORIES, STORES } from "@/config/site";
const empty = { productUrl: "", name: "", image: "", price: "", oldPrice: "", discount: "", store: "Outras lojas", category: "Outros", affiliateUrl: "", description: "" };
type F = typeof empty;
async function call(url: string, method = "GET", body?: unknown) {
  const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Erro");
  return d;
}
export default function Admin() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [cred, setCred] = useState({ user: "", password: "" });
  const [items, setItems] = useState<Product[]>([]);
  const [form, setForm] = useState<F>(empty); const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  const [q, setQ] = useState(""); const [cat, setCat] = useState("");
  const load = () => call("/api/admin/products").then(setItems).catch((e) => setMsg(e.message));
  useEffect(() => { call("/api/auth/me").then((d) => { setAuthed(d.authed); if (d.authed) load(); }); }, []);
  const wrap = async (fn: () => Promise<void>) => { setBusy(true); setMsg(""); try { await fn(); } catch (e: any) { setMsg(e.message); } setBusy(false); };
  const set = (k: keyof F, v: string) => setForm((f) => ({ ...f, [k]: v }));

  if (authed === null) return <p className="p-8 text-center">Carregando...</p>;
  if (!authed) return (
    <main className="min-h-screen grid place-items-center p-4">
      <div className="bg-card border border-line rounded-2xl p-6 w-full max-w-sm space-y-3">
        <h1 className="text-2xl font-extrabold">Admin <span className="text-brand">SAGAZx</span></h1>
        <input className="input" placeholder="Usuário" autoComplete="username" value={cred.user} onChange={(e) => setCred({ ...cred, user: e.target.value })} />
        <input className="input" type="password" placeholder="Senha" autoComplete="current-password" value={cred.password} onChange={(e) => setCred({ ...cred, password: e.target.value })} onKeyDown={(e) => e.key === "Enter" && (document.getElementById("go") as HTMLButtonElement).click()} />
        {msg && <p className="text-red-400 text-sm">{msg}</p>}
        <button id="go" className="btn w-full" disabled={busy} onClick={() => wrap(async () => { await call("/api/auth/login", "POST", cred); setAuthed(true); load(); })}>Entrar</button>
      </div>
    </main>
  );

  const fetchLink = () => wrap(async () => {
    const d = await call("/api/admin/fetch-meta", "POST", { url: form.productUrl });
    setForm((f) => ({ ...f, name: d.name || f.name, image: d.image || f.image, description: d.description || f.description, store: d.store || f.store, price: d.price || f.price }));
    setMsg("Dados encontrados. Confira e complete o que faltar (link de afiliado, preços).");
  });
  const save = () => wrap(async () => {
    const list = editId ? await call(`/api/admin/products/${editId}`, "PUT", form) : await call("/api/admin/products", "POST", form);
    setItems(list); setOpen(false); setForm(empty); setEditId(null); setMsg("Salvo no GitHub ✔ (o site atualiza em ~1 minuto)");
  });
  const edit = (p: Product) => { setForm({ productUrl: p.productUrl, name: p.name, image: p.image, price: p.price?.toString() ?? "", oldPrice: p.oldPrice?.toString() ?? "", discount: p.discount?.toString() ?? "", store: p.store, category: p.category, affiliateUrl: p.affiliateUrl, description: p.description }); setEditId(p.id); setOpen(true); window.scrollTo(0, 0); };
  const shown = items.filter((p) => (!cat || p.category === cat) && (!q || `${p.name} ${p.store}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <main className="mx-auto max-w-3xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-extrabold">Painel <span className="text-brand">SAGAZx</span></h1>
        <button className="btn ml-auto" onClick={() => { setForm(empty); setEditId(null); setOpen(!open); }}>+ Adicionar</button>
        <button className="btn-ghost" onClick={() => call("/api/auth/logout", "POST").then(() => setAuthed(false))}>Sair</button>
      </div>
      {msg && <p className="bg-card border border-line rounded-xl p-3 text-sm">{msg}</p>}
      {open && (
        <div className="bg-card border border-line rounded-2xl p-4 space-y-3 fade">
          <div className="flex gap-2"><input className="input" placeholder="Cole o link do produto" value={form.productUrl} onChange={(e) => set("productUrl", e.target.value)} /><button className="btn" disabled={busy} onClick={fetchLink}>Buscar</button></div>
          {form.image && <div className="bg-white rounded-xl p-2 w-32"><img src={form.image} alt="prévia" referrerPolicy="no-referrer" className="w-full object-contain" /></div>}
          <input className="input" placeholder="Nome" value={form.name} onChange={(e) => set("name", e.target.value)} />
          <input className="input" placeholder="URL da imagem (https)" value={form.image} onChange={(e) => set("image", e.target.value)} />
          <input className="input" placeholder="Link de afiliado (obrigatório)" value={form.affiliateUrl} onChange={(e) => set("affiliateUrl", e.target.value)} />
          <div className="grid grid-cols-3 gap-2">
            <input className="input" inputMode="decimal" placeholder="Preço" value={form.price} onChange={(e) => set("price", e.target.value)} />
            <input className="input" inputMode="decimal" placeholder="Antes" value={form.oldPrice} onChange={(e) => set("oldPrice", e.target.value)} />
            <input className="input" inputMode="numeric" placeholder="Desc. %" value={form.discount} onChange={(e) => set("discount", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input className="input" list="stores" placeholder="Loja" value={form.store} onChange={(e) => set("store", e.target.value)} />
            <datalist id="stores">{STORES.map((s) => <option key={s} value={s} />)}</datalist>
            <select className="input" value={form.category} onChange={(e) => set("category", e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          <textarea className="input" rows={3} placeholder="Descrição" value={form.description} onChange={(e) => set("description", e.target.value)} />
          <button className="btn w-full" disabled={busy} onClick={save}>{editId ? "Salvar alterações" : "Salvar produto"}</button>
        </div>
      )}
      <div className="flex gap-2"><input className="input" placeholder="Pesquisar..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input !w-auto" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">Todas</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
      <ul className="space-y-2">{shown.map((p) => (
        <li key={p.id} className={`bg-card border border-line rounded-xl p-3 flex gap-3 items-center ${p.active ? "" : "opacity-50"}`}>
          <div className="w-14 h-14 bg-white rounded-lg shrink-0 overflow-hidden">{p.image && <img src={p.image} alt="" referrerPolicy="no-referrer" className="w-full h-full object-contain" />}</div>
          <div className="min-w-0 flex-1"><p className="text-sm font-semibold truncate">{p.name}</p><p className="text-xs text-gray-400">{p.store} · {p.category}{p.price != null ? ` · R$ ${p.price}` : ""}</p></div>
          <div className="flex flex-col gap-1 text-xs">
            <button className="btn-ghost !p-1.5" onClick={() => edit(p)}>Editar</button>
            <button className="btn-ghost !p-1.5" onClick={() => wrap(async () => setItems(await call(`/api/admin/products/${p.id}`, "PUT", { active: !p.active })))}>{p.active ? "Desativar" : "Ativar"}</button>
            <button className="btn-ghost !p-1.5 text-red-400" onClick={() => confirm(`Excluir "${p.name}"?`) && wrap(async () => setItems(await call(`/api/admin/products/${p.id}`, "DELETE")))}>Excluir</button>
          </div>
        </li>))}
        {!shown.length && <p className="text-center text-gray-400 py-8">Nenhum produto.</p>}
      </ul>
    </main>
  );
}
