"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { formatDate, PRICE_PER_BOX, formatPrice } from "@/lib/menu";

type Box = { id: string; person_name: string; sando: string; slaw: string; cookie: string; tea: string };
type Order = {
  id: string;
  company_name: string;
  delivery_date: string;
  delivery_zone: string;
  delivery_address: string;
  manager_email: string;
  production_status: string;
  boxes: Box[];
};

function countItems(boxes: Box[], key: keyof Box) {
  const counts: Record<string, number> = {};
  boxes.forEach((b) => {
    const v = b[key] as string;
    counts[v] = (counts[v] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function ProductionSheet({ order, showLabels }: { order: Order; showLabels: boolean }) {
  const orderCode = `TAN-${order.delivery_date.replace(/-/g, "").substring(2)}-${order.company_name.replace(/\s+/g, "").substring(0, 6).toUpperCase()}`;

  return (
    <div className="print-break mb-16">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: "var(--tanuki-red)" }}>
          {new Date(order.delivery_date).toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}
        </p>
        <h2 className="text-4xl font-black uppercase mb-1">{order.company_name}</h2>
        <p className="text-lg font-bold mb-1">{order.delivery_zone}</p>
        <p className="text-sm">{order.delivery_address}</p>
        <p className="text-sm font-mono mt-1">{orderCode} — {order.boxes.length} boxes — {formatPrice(order.boxes.length * PRICE_PER_BOX)}</p>
      </div>

      {/* Production summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 border-2 p-6" style={{ borderColor: "var(--line)" }}>
        {[
          { label: "Sandos", key: "sando" as keyof Box },
          { label: "Slaws", key: "slaw" as keyof Box },
          { label: "Cookies", key: "cookie" as keyof Box },
          { label: "Thés", key: "tea" as keyof Box },
        ].map(({ label, key }) => (
          <div key={key}>
            <h3 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "var(--tanuki-red)" }}>{label}</h3>
            <ul className="space-y-1">
              {countItems(order.boxes, key).map(([item, count]) => (
                <li key={item} className="text-sm">
                  <span className="font-black">{item}</span>
                  <span className="ml-2" style={{ color: "var(--off-black)" }}>× {count}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Box-by-box list */}
      <h3 className="text-xs font-black uppercase tracking-widest mb-4">Box par box</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {order.boxes.map((b) => (
          <div key={b.id} className="border-2 p-4" style={{ borderColor: "var(--line)" }}>
            <p className="font-black uppercase text-lg mb-2">{b.person_name}</p>
            <p className="text-sm">{b.sando}</p>
            <p className="text-sm">{b.slaw}</p>
            <p className="text-sm">{b.cookie}</p>
            <p className="text-sm">{b.tea}</p>
          </div>
        ))}
      </div>

      {/* Printable labels */}
      {showLabels && (
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest mb-4">Étiquettes</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {order.boxes.map((b) => (
              <div
                key={b.id}
                className="border-2 p-3"
                style={{ borderColor: "var(--black)", backgroundColor: "white", color: "var(--black)" }}
              >
                <p className="font-black text-lg uppercase">{b.person_name}</p>
                <p className="text-xs font-bold uppercase mb-2">{order.company_name}</p>
                <p className="text-xs border-t pt-1" style={{ borderColor: "#ccc" }}>{b.sando}</p>
                <p className="text-xs">{b.slaw}</p>
                <p className="text-xs">{b.cookie}</p>
                <p className="text-xs">{b.tea}</p>
                <p className="text-xs border-t pt-1 mt-2 font-bold" style={{ borderColor: "#ccc" }}>{order.delivery_zone}</p>
                <p className="text-xs font-mono">{orderCode}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductionContent() {
  const searchParams = useSearchParams();
  const passwordParam = searchParams.get("password") || "";
  const orderIdParam = searchParams.get("order_id") || "";

  const [password, setPassword] = useState(passwordParam);
  const [authed, setAuthed] = useState(!!passwordParam);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLabels, setShowLabels] = useState(false);
  const [filter, setFilter] = useState<"today" | "tomorrow" | "week">("today");

  async function load(pwd: string) {
    setLoading(true);
    const res = await fetch("/api/admin/orders", { headers: { "x-admin-password": pwd } });
    if (!res.ok) { setError("Mot de passe incorrect"); setLoading(false); return false; }
    const data = await res.json();
    const paid = data.orders.filter((o: Order) => o.boxes.length > 0);
    setOrders(paid);
    setLoading(false);
    return true;
  }

  useEffect(() => {
    if (authed && passwordParam) load(passwordParam);
  }, [authed, passwordParam]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const ok = await load(password);
    if (ok) setAuthed(true);
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--paper)" }}>
        <form onSubmit={handleLogin} className="max-w-xs w-full px-6">
          <p className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: "var(--tanuki-red)" }}>TANUKI PRODUCTION</p>
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

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const tomorrowStr = new Date(now.getTime() + 86400000).toISOString().split("T")[0];
  const weekLater = new Date(now.getTime() + 7 * 86400000).toISOString().split("T")[0];

  let filtered = orders;
  if (orderIdParam) {
    filtered = orders.filter((o) => o.id === orderIdParam);
  } else {
    if (filter === "today") filtered = orders.filter((o) => o.delivery_date === todayStr);
    else if (filter === "tomorrow") filtered = orders.filter((o) => o.delivery_date === tomorrowStr);
    else filtered = orders.filter((o) => o.delivery_date >= todayStr && o.delivery_date <= weekLater);
  }

  // Group by delivery_date then delivery_zone
  const grouped: Record<string, Record<string, Order[]>> = {};
  filtered.forEach((o) => {
    if (!grouped[o.delivery_date]) grouped[o.delivery_date] = {};
    if (!grouped[o.delivery_date][o.delivery_zone]) grouped[o.delivery_date][o.delivery_zone] = [];
    grouped[o.delivery_date][o.delivery_zone].push(o);
  });

  return (
    <div style={{ backgroundColor: "var(--paper)", minHeight: "100vh" }}>
      <header className="no-print flex items-center justify-between px-6 py-4 border-b-2" style={{ borderColor: "var(--line)" }}>
        <span className="font-black text-xl" style={{ color: "var(--tanuki-red)" }}>TANUKI PRODUCTION</span>
        <div className="flex gap-4 items-center flex-wrap">
          {!orderIdParam && (
            <div className="flex gap-2">
              {(["today","tomorrow","week"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="text-xs font-bold uppercase tracking-widest py-1 px-3 border"
                  style={{
                    borderColor: filter === f ? "var(--tanuki-red)" : "var(--line)",
                    color: filter === f ? "var(--tanuki-red)" : "var(--black)",
                  }}
                >
                  {f === "today" ? "Aujourd'hui" : f === "tomorrow" ? "Demain" : "Cette semaine"}
                </button>
              ))}
            </div>
          )}
          <label className="flex items-center gap-2 text-xs font-bold uppercase">
            <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} />
            Étiquettes
          </label>
          <button
            onClick={() => window.print()}
            className="text-xs font-black uppercase tracking-widest py-2 px-4 border-2"
            style={{ borderColor: "var(--black)" }}
          >
            Imprimer
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {loading ? (
          <p className="font-bold uppercase text-center">Chargement…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-center py-12" style={{ color: "var(--off-black)" }}>Aucune commande pour cette période.</p>
        ) : (
          Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, zones]) => (
            <div key={date} className="mb-12">
              <h2 className="text-3xl font-black uppercase mb-6 border-b-4 pb-2" style={{ borderColor: "var(--tanuki-red)" }}>
                {new Date(date).toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}
              </h2>
              {Object.entries(zones).sort().map(([zone, zoneOrders]) => (
                <div key={zone} className="mb-10">
                  <h3 className="text-xl font-black uppercase mb-6 border-b pb-2" style={{ borderColor: "var(--line)" }}>{zone}</h3>
                  {zoneOrders.map((o) => (
                    <ProductionSheet key={o.id} order={o} showLabels={showLabels} />
                  ))}
                </div>
              ))}
            </div>
          ))
        )}
      </main>
    </div>
  );
}

export default function ProductionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--paper)" }}><p className="font-bold uppercase">Chargement…</p></div>}>
      <ProductionContent />
    </Suspense>
  );
}
