import "./globals.css";
import type { Metadata, Viewport } from "next";
export const metadata: Metadata = { title: "SAGAZx Ofertas", description: "As melhores ofertas selecionadas pela SAGAZx." };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#07050d" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
