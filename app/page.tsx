import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { MENU } from "@/lib/menu";

const ROUTES = [
  { day: "Mardi", zone: "Louise / Ixelles" },
  { day: "Mercredi", zone: "Quartier Européen" },
  { day: "Jeudi", zone: "Centre / Pentagone / Sablon" },
  { day: "Vendredi", zone: "Tour & Taxis" },
];

export default function HomePage() {
  return (
    <div style={{ backgroundColor: "var(--paper)" }}>
      <SiteHeader />

      {/* Hero */}
      <section className="px-6 py-20 border-b-2" style={{ borderColor: "var(--line)" }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--tanuki-red)" }}>
            OFFICE LUNCHES. ACTUALLY GOOD.
          </p>
          <h1 className="text-5xl md:text-8xl font-black uppercase leading-none mb-8" style={{ color: "var(--black)" }}>
            DES LUNCH<br />BOXES QUI<br />CHANGENT.
          </h1>
          <p className="text-xl mb-10 max-w-md" style={{ color: "var(--off-black)" }}>
            Des lunch boxes végétales livrées à vélo dans les bureaux bruxellois.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/commander"
              className="inline-block font-black text-sm uppercase tracking-widest py-4 px-8 text-white"
              style={{ backgroundColor: "var(--tanuki-red)" }}
            >
              Créer une commande d&apos;équipe →
            </Link>
            <a
              href="mailto:bonjour@tanuki.be?subject=Demande de sample Tanuki"
              className="inline-block font-bold text-sm uppercase tracking-widest py-4 px-8 border-2"
              style={{ borderColor: "var(--black)" }}
            >
              Demander un sample
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 border-b-2" style={{ borderColor: "var(--line)" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black uppercase mb-12">
            1 lien. 20 choix. 0 gestion.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { n: "01", label: "Créez une commande" },
              { n: "02", label: "Partagez le lien à votre équipe" },
              { n: "03", label: "Chacun compose sa box" },
              { n: "04", label: "Vous validez et payez une seule fois" },
            ].map((s) => (
              <div key={s.n} className="border-2 p-6" style={{ borderColor: "var(--line)" }}>
                <div className="text-5xl font-black mb-3" style={{ color: "var(--kraft)" }}>{s.n}</div>
                <p className="font-bold text-sm uppercase leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Routes */}
      <section className="px-6 py-16 border-b-2" style={{ borderColor: "var(--line)" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black uppercase mb-2">Zones de livraison</h2>
          <p className="text-sm mb-8" style={{ color: "var(--off-black)" }}>Commande avant 16h00 la veille.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {ROUTES.map((r) => (
              <div key={r.zone} className="border-2 p-6" style={{ borderColor: "var(--line)" }}>
                <div className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: "var(--tanuki-red)" }}>{r.day}</div>
                <div className="font-bold text-sm leading-tight">{r.zone}</div>
                <div className="mt-4 h-20 border" style={{ borderColor: "var(--kraft)", backgroundColor: "var(--kraft)", opacity: 0.3 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu */}
      <section className="px-6 py-16" style={{ backgroundColor: "var(--off-black)", color: "white" }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--kraft)" }}>Menu fixe hebdomadaire</p>
          <h2 className="text-3xl font-black uppercase mb-2">Votre box</h2>
          <p className="text-sm mb-10" style={{ color: "var(--kraft)" }}>1 sando + 1 slaw + 1 cookie + 1 thé</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "var(--tanuki-red)" }}>Sandos</h3>
              <ul className="space-y-2">
                {MENU.sandos.map((s) => <li key={s} className="text-sm font-medium">{s}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "var(--tanuki-red)" }}>Slaws</h3>
              <ul className="space-y-2">
                {MENU.slaws.map((s) => <li key={s} className="text-sm font-medium">{s}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "var(--tanuki-red)" }}>Cookies</h3>
              <ul className="space-y-2">
                {MENU.cookies.map((s) => <li key={s} className="text-sm font-medium">{s}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "var(--tanuki-red)" }}>Thés</h3>
              <ul className="space-y-2">
                {MENU.teas.map((s) => <li key={s} className="text-sm font-medium">{s}</li>)}
              </ul>
            </div>
          </div>
          <div className="mt-12">
            <Link
              href="/commander"
              className="inline-block font-black text-sm uppercase tracking-widest py-4 px-8 text-white border-2 border-white"
            >
              Créer une commande d&apos;équipe →
            </Link>
          </div>
        </div>
      </section>

      <footer className="px-6 py-8 text-xs border-t-2" style={{ borderColor: "var(--line)", color: "var(--off-black)" }}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between gap-2">
          <span>© Tanuki Brussels</span>
          <span>bonjour@tanuki.be</span>
        </div>
      </footer>
    </div>
  );
}
