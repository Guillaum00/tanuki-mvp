import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export default function CancelPage() {
  return (
    <div style={{ backgroundColor: "var(--paper)" }}>
      <SiteHeader />
      <main className="max-w-xl mx-auto px-6 py-16 text-center">
        <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "var(--tanuki-red)" }}>Paiement annulé</p>
        <h1 className="text-4xl font-black uppercase mb-6">Pas de problème.</h1>
        <p className="text-sm mb-8" style={{ color: "var(--off-black)" }}>
          Votre commande est toujours ouverte. Vous pouvez réessayer le paiement depuis votre tableau de bord.
        </p>
        <Link
          href="/"
          className="inline-block font-bold text-sm uppercase tracking-widest py-3 px-6 border-2"
          style={{ borderColor: "var(--black)" }}
        >
          Retour à l&apos;accueil
        </Link>
      </main>
    </div>
  );
}
