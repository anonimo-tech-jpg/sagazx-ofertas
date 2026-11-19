import Header from "@/components/Header";
import { SERVICES, SITE } from "@/config/site";
export const metadata = { title: "Loja SAGAZx" };
export default function Loja() {
  return (<>
    <Header />
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl md:text-5xl font-extrabold text-center">Potencialize seu projeto com <span className="text-brand">Eficiência</span></h1>
      <p className="text-center text-gray-400 mt-3">Serviços de tecnologia desenvolvidos por SAGAZx.</p>
      <div className="grid md:grid-cols-3 gap-4 mt-10">
        {SERVICES.map((s) => (
          <div key={s.title} className="fade bg-card border border-line rounded-2xl p-6 hover:border-brand transition">
            <div className="text-4xl">{s.icon}</div>
            <h2 className="text-xl font-bold mt-3">{s.title}</h2>
            <p className="text-gray-400 mt-2 text-sm">{s.desc}</p>
            <ul className="mt-3 space-y-1 text-sm text-brand-light">{s.extra.map((x) => <li key={x}>✔ {x}</li>)}</ul>
          </div>
        ))}
      </div>
      <div className="text-center mt-10">
        <a href={SITE.discordUrl} target="_blank" rel="noopener noreferrer" className="btn inline-block text-lg px-8 py-4">ACESSAR LOJA NO DISCORD</a>
      </div>
    </main>
  </>);
}
