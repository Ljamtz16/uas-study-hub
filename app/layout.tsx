import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { BookOpen, Home, Settings } from "lucide-react";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import "./globals.css";

export const metadata: Metadata = { title:"UAS Study Hub", description:"Study core offline para Fundamentos UAS", manifest:"/manifest.webmanifest" };
export const viewport: Viewport = { themeColor:"#185d52" };

export default function RootLayout({ children }: Readonly<{ children:React.ReactNode }>) {
  return <html lang="es"><body><ServiceWorkerRegistration /><header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur"><nav aria-label="Principal" className="mx-auto flex max-w-6xl items-center justify-between flex-wrap gap-2 px-5 py-4"><Link href="/" className="flex items-center gap-2 font-bold text-[#185d52]"><BookOpen size={22}/> UAS Study Hub</Link><div className="flex gap-2 text-sm font-medium"><Link className="flex min-h-11 items-center gap-2 rounded-lg px-3 hover:bg-[#e9efed]" href="/"><Home size={17}/> Inicio</Link><Link className="flex min-h-11 items-center gap-2 rounded-lg px-3 hover:bg-[#e9efed]" href="/courses"><BookOpen size={17}/> Cursos</Link><Link className="flex min-h-11 items-center gap-2 rounded-lg px-3 hover:bg-[#e9efed]" href="/knowledge-map">Knowledge Map</Link><Link className="flex min-h-11 items-center gap-2 rounded-lg px-3 hover:bg-[#e9efed]" href="/settings"><Settings size={17}/> Datos</Link></div></nav></header><main className="mx-auto min-h-[calc(100vh-73px)] max-w-6xl px-5 py-8">{children}</main></body></html>;
}
