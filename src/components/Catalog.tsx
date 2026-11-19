"use client";
import { useEffect, useMemo, useState } from "react";
import { Product } from "@/types";
import { CATEGORIES } from "@/config/site";
import ProductCard from "./ProductCard";
const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export default function Catalog() {
  const [items, setItems] = useState<Product[] | null>(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState(""); const [cat, setCat] = useState("Todos os produtos"); const [sort, setSort] = useState("recent");
  useEffect(() => { fetch("/api/products").then((r) => r.json()).then((d) => Array.isArray(d) ? setItems(d) : setErr(d.error || "Erro")).catch(() => setErr("Falha ao carregar.")); }, []);
  const list = useMemo(() => {
    const n = norm(q);
    const r = (items || []).filter((p) => (cat === "Todos os produtos" || p.category === cat) && (!n || norm(`${p.name} ${p.description} ${p.category} ${p.store}`).includes(n)));
    if (sort === "price") r.sort((a, b) => (a.price ?? 1e12) - (b.price ?? 1e12));
    else if (sort === "discount") r.sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0));
    else r.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return r;
  }, [items, q, cat, sort]);
  return (
    <section className="mx-auto max-w-6xl px-4 py-5">
      <div className="flex gap-2">
        <input className="input" placeholder="Pesquisar produto, loja, categoria..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input !w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="recent">Recentes</option><option value="price">Menor preço</option><option value="discount">Maior desconto</option>
        </select>
      </div>
      <div className="flex gap-2 overflow-x-auto py-4 -mx-4 px-4">
        {["Todos os produtos", ...CATEGORIES].map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm border transition ${cat === c ? "bg-brand border-brand text-white" : "border-line bg-card text-gray-300"}`}>{c}</button>
        ))}
      </div>
      {err ? <p className="text-center text-red-400 py-10">{err}</p> : items === null ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="sk rounded-2xl h-64" />)}</div>
      ) : list.length === 0 ? <p className="text-center text-gray-400 py-16">Nenhum produto encontrado.</p> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      )}
    </section>
  );
}
