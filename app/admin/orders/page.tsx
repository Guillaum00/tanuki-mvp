"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatDate, formatPrice, PRICE_PER_BOX } from "@/lib/menu";

type OrderWithBoxes = {
  id: string;
  company_name: string;
  manager_name: string;
  manager_email: string;
  delivery_date: string;
  delivery_zone: string;
  delivery_address: string;
  estimated_people: number;
  status: string;
  production_status: string;
  token: string;
  boxes: { id: string; person_name: string; sando: string; slaw: string; cookie: string; tea: string }[];
};

export default function AdminOrdersPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [orders, setOrders] = useState<OrderWithBoxes[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (pwd: string) => {
    setLoading(true);
    const res = await fetch("/api/admin/orders", { headers: { "x-admin-password": pwd } });
    if (!res.ok) { setError("Mot de passe incorrect"); setLoading(false); return false; }
    const data = await res.json();
    setOrders(data.orders);
    setLoading(false);
    return true;
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const ok = await load(password);
    if (ok) setAuthed(true);
  }

  const exportCSV = (orderId?: string) => {
    const params = new URLSearchParams({ password });
    if (orderId) params.set("order_id", orderId);
    window.open(`/api/admin/export?${params}`);
  };

  async function updateStatus(id: string, field: string, value: string) {
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ id, [field]: value }),
    });
    load(password);
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--paper)" }}>
        <form onSubmit={handleLogin} className="max-w-xs w-full px-6">
          <p className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: "var(--tanuki-red)" }}>TANUKI ADMIN</p>
          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full border-2 bg-transparent py-3 px-4 text-sm mb-4 outline-none"
            style={{ borderColor: "var(--line)" }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm font-bold mb-3" style={{ color: "var(--tanuki-red)" }}>{error}</p>}
          <button type="submit" className="w-full font-black text-sm uppercase tracking-widest py-4 text-white" style={{ backgroundColor: "var(--tanuki-red)" }}>
            Accéder →
          </button>
        </form>
      </div>
    );
  }

  const paidOrders = orders.filter((o) => o.status === "paid");
  const openOrders = orders.filter((o) => o.status !== "paid" && o.status !== "cancelled");

  return (
    <div style={{ backgroundColor: "var(--paper)", minHeight: "100vh" }}>
      <header className="flex items-center justify-between px-6 py-4 border-b-2" style={{ borderColor: "var(--line)" }}>
        <span className="font-black text-xl" style={{ color: "var(--tanuki-red)" }}>TANUKI ADMIN</span>
        <div className="flex gap-4">
          <Link href="/admin/production" className="text-xs font-bold uppercase tracking-widest underline">Vue production</Link>
          <button onClick={() => exportCSV()} className="text-xs font-bold uppercase tracking-widest underline">Export CSV global</button>
        </div>
      </header>

      {loading ? (
        <div className="px-6 py-12 text-center"><p className="font-bold uppercase">Chargement…</p></div>
      ) : (
        <main className="max-w-4xl mx-auto px-6 py-10 space-y-12">
          <section>
            <h2 className="text-2xl font-black uppercase mb-6">Commandes payées ({paidOrders.length})</h2>
            <div className="space-y-4">
              {paidOrders.map((o) => (
                <div key={o.id} className="border-2 p-6" style={{ borderColor: "var(--line)" }}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-black text-lg">{o.company_name}</p>
                      <p className="text-sm capitalize">{formatDate(o.delivery_date)} — {o.delivery_zone}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black">{o.boxes.length} boxes — {formatPrice(o.boxes.length * PRICE_PER_BOX)}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-wrap mt-3">
                    <Link href={`/admin/production?order_id=${o.id}&password=${password}`} className="text-xs font-bold uppercase tracking-widest underline">Fiche production</Link>
                    <button onClick={() => exportCSV(o.id)} className="text-xs font-bold uppercase tracking-widest underline">Export CSV</button>
                    <select
                      value={o.production_status || "paid"}
                      onChange={(e) => updateStatus(o.id, "production_status", e.target.value)}
                      className="text-xs font-bold uppercase border py-1 px-2 bg-transparent"
                      style={{ borderColor: "var(--line)" }}
                    >
                      {["paid","in_production","ready","dispatched","delivered"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
              {paidOrders.length === 0 && <p className="text-sm" style={{ color: "var(--off-black)" }}>Aucune commande payée.</p>}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-6">Commandes en cours ({openOrders.length})</h2>
            <div className="space-y-4">
              {openOrders.map((o) => (
                <div key={o.id} className="border-2 p-6" style={{ borderColor: "var(--line)" }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-black">{o.company_name}</p>
                      <p className="text-sm capitalize">{formatDate(o.delivery_date)}</p>
                      <p className="text-xs mt-1" style={{ color: "var(--off-black)" }}>{o.boxes.length} / {o.estimated_people} réponses</p>
                    </div>
                    <Link href={`/commande/${o.id}`} className="text-xs font-bold uppercase tracking-widest underline">Voir</Link>
                  </div>
                </div>
              ))}
              {openOrders.length === 0 && <p className="text-sm" style={{ color: "var(--off-black)" }}>Aucune commande en cours.</p>}
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
