import { Product } from "@/types";
const brl = (n: number | null) => (n == null ? "" : n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
export default function ProductCard({ p }: { p: Product }) {
  return (
    <article className="fade bg-card border border-line rounded-2xl overflow-hidden flex flex-col hover:border-brand transition">
      <div className="relative aspect-square bg-white">
        {p.image ? <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-contain" /> : <div className="w-full h-full grid place-items-center text-gray-400">Sem imagem</div>}
        {p.discount ? <span className="absolute top-2 right-2 bg-brand text-white text-xs font-bold px-2 py-1 rounded-lg">-{p.discount}%</span> : null}
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <span className="text-[11px] text-brand-light font-semibold uppercase">{p.store}</span>
        <h3 className="text-sm font-semibold line-clamp-2">{p.name}</h3>
        <div className="mt-auto pt-2">
          {p.oldPrice ? <div className="text-xs text-gray-400 line-through">{brl(p.oldPrice)}</div> : null}
          <div className="text-lg font-extrabold text-brand-light">{p.price != null ? brl(p.price) : "Ver preço"}</div>
        </div>
        <a href={p.affiliateUrl} target="_blank" rel="noopener noreferrer sponsored nofollow" className="btn text-center mt-2">Comprar</a>
      </div>
    </article>
  );
}
