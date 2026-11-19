import Link from "next/link";
import { SITE } from "@/config/site";
export default function Header({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3 flex-wrap">
        <Link href="/" className="text-2xl font-extrabold tracking-tight">SAGAZx<span className="text-brand"> Ofertas</span></Link>
        <nav className="ml-auto flex gap-2 text-sm">
          <Link href="/" className="btn-ghost">Ofertas</Link>
          <Link href="/loja" className="btn">Loja SAGAZx</Link>
        </nav>
        {children}
      </div>
    </header>
  );
}
