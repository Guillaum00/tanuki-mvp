"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { ZONES, getNextDeliveryDates } from "@/lib/menu";

export default function CommanderPage() {
  const router = useRouter();
  const dates = getNextDeliveryDates();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    company_name: "",
    manager_name: "",
    manager_email: "",
    delivery_address: "",
    delivery_zone: ZONES[0],
    delivery_date: dates[0]?.value ?? "",
    estimated_people: "10",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, estimated_people: parseInt(form.estimated_people) || 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      router.push(`/commande/${data.order.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  const inputClass = "w-full border-2 bg-transparent py-3 px-4 text-sm font-medium outline-none focus:border-current";

  return (
    <div style={{ backgroundColor: "var(--paper)" }}>
      <SiteHeader />
      <main className="max-w-xl mx-auto px-6 py-12">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--tanuki-red)" }}>Nouvelle commande</p>
        <h1 className="text-4xl font-black uppercase mb-10">Créer une commande d&apos;équipe</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">Entreprise</label>
            <input
              required
              className={inputClass}
              style={{ borderColor: "var(--line)" }}
              placeholder="KPMG Brussels"
              value={form.company_name}
              onChange={(e) => set("company_name", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">Votre nom</label>
            <input
              required
              className={inputClass}
              style={{ borderColor: "var(--line)" }}
              placeholder="Pauline Dupont"
              value={form.manager_name}
              onChange={(e) => set("manager_name", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">Votre email</label>
            <input
              required
              type="email"
              className={inputClass}
              style={{ borderColor: "var(--line)" }}
              placeholder="pauline@kpmg.com"
              value={form.manager_email}
              onChange={(e) => set("manager_email", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">Adresse de livraison</label>
            <input
              required
              className={inputClass}
              style={{ borderColor: "var(--line)" }}
              placeholder="Rue de la Loi 120, 1000 Bruxelles"
              value={form.delivery_address}
              onChange={(e) => set("delivery_address", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">Zone de livraison</label>
            <select
              required
              className={inputClass}
              style={{ borderColor: "var(--line)" }}
              value={form.delivery_zone}
              onChange={(e) => set("delivery_zone", e.target.value)}
            >
              {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">Date de livraison</label>
            <select
              required
              className={inputClass}
              style={{ borderColor: "var(--line)" }}
              value={form.delivery_date}
              onChange={(e) => set("delivery_date", e.target.value)}
            >
              {dates.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
            {dates.length === 0 && (
              <p className="text-xs mt-1" style={{ color: "var(--tanuki-red)" }}>Aucune date disponible cette semaine.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">Nombre de personnes estimé</label>
            <input
              required
              type="number"
              min={1}
              max={200}
              className={inputClass}
              style={{ borderColor: "var(--line)" }}
              value={form.estimated_people}
              onChange={(e) => set("estimated_people", e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm font-bold" style={{ color: "var(--tanuki-red)" }}>{error}</p>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full font-black text-sm uppercase tracking-widest py-4 px-8 text-white disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: "var(--tanuki-red)" }}
            >
              {loading ? "Création en cours…" : "Créer la commande →"}
            </button>
          </div>

          <p className="text-xs text-center" style={{ color: "var(--off-black)" }}>
            Vous recevrez un lien à partager à votre équipe et un lien tableau de bord.
          </p>
        </form>
      </main>
    </div>
  );
}
