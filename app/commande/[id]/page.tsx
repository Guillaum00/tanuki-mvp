"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { TeamOrder, BoxOrder } from "@/lib/supabase";
import { PRICE_PER_BOX, MIN_BOXES, formatPrice, formatDate, isCutoffPassed } from "@/lib/menu";

function CommandeContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const cancelled = searchParams.get("cancelled");
  const mt = searchParams.get("mt") || "";

  const [order, setOrder] = useState<TeamOrder | null>(null);
  const [boxes, setBoxes] = useState<BoxOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [forbidden, setForbidden] = useState(false);

  const load = useCallback(async () => {
    if (!mt) { setForbidden(true); setLoading(false); return; }
    const res = await fetch(`/api/orders/${id}?mt=${mt}`);
    if (res.status === 403) { setForbidden(true); setLoading(false); return; }
    if (!res.ok) { setLoading(false); return; }
    const data = await res.json();
    setOrder(data.order);
    setBoxes(data.boxes);
    setLoading(false);
  }, [id, mt]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  const shareUrl = order ? `${window.location.origin}/order/${order.token}` : "";

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handlePay() {
    if (!order) return;
    setPaying(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: order.id, manager_token: mt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur paiement");
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: "var(--paper)" }}>
        <SiteHeader />
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <p className="font-bold uppercase tracking-widest text-sm">Chargement…</p>
        </div>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div style={{ backgroundColor: "var(--paper)" }}>
        <SiteHeader />
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <p className="font-black text-2xl uppercase mb-2">Accès non autorisé</p>
          <p className="text-sm">Ce lien de tableau de bord est invalide ou expiré.</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ backgroundColor: "var(--paper)" }}>
        <SiteHeader />
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <p className="font-bold text-xl">Commande introuvable.</p>
        </div>
      </div>
    );
  }

  const total = boxes.length * PRICE_PER_BOX;
  const canPay = boxes.length >= MIN_BOXES && order.status !== "paid" && order.status !== "cancelled";
  const cutoffPassed = isCutoffPassed(order.cutoff_at);

  return (
    <div style={{ backgroundColor: "var(--paper)" }}>
      <SiteHeader />
      <main className="max-w-2xl mx-auto px-6 py-10">

        {cancelled && (
          <div className="mb-6 border-2 p-4 text-sm font-bold" style={{ borderColor: "var(--tanuki-red)", color: "var(--tanuki-red)" }}>
            Paiement annulé. Vous pouvez réessayer.
          </div>
        )}

        {order.status === "paid" && (
          <div className="mb-6 border-2 p-4 text-sm font-bold bg-green-50" style={{ borderColor: "#16a34a", color: "#16a34a" }}>
            ✓ Commande payée et confirmée.
          </div>
        )}

        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: "var(--tanuki-red)" }}>Tableau de bord</p>
            <h1 className="text-3xl font-black uppercase">{order.company_name}</h1>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase px-2 py-1 border" style={{ borderColor: "var(--line)" }}>
              {order.status === "paid" ? "Payée" : order.status === "cancelled" ? "Annulée" : cutoffPassed ? "Clôturée" : "En cours"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm mb-6 mt-4 border-t border-b py-4" style={{ borderColor: "var(--line)" }}>
          <div>
            <span className="text-xs uppercase font-bold" style={{ color: "var(--off-black)" }}>Livraison</span>
            <p className="font-bold capitalize">{formatDate(order.delivery_date)}</p>
          </div>
          <div>
            <span className="text-xs uppercase font-bold" style={{ color: "var(--off-black)" }}>Zone</span>
            <p className="font-bold">{order.delivery_zone}</p>
          </div>
          <div className="col-span-2">
            <span className="text-xs uppercase font-bold" style={{ color: "var(--off-black)" }}>Adresse</span>
            <p className="font-bold">{order.delivery_address}</p>
          </div>
          <div>
            <span className="text-xs uppercase font-bold" style={{ color: "var(--off-black)" }}>Clôture</span>
            <p className="font-bold text-xs">{new Date(order.cutoff_at).toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" })} à 16h00</p>
          </div>
        </div>

        {/* Share link */}
        {order.status !== "paid" && order.status !== "cancelled" && (
          <div className="mb-8 border-2 p-4" style={{ borderColor: "var(--kraft)" }}>
            <p className="text-xs font-black uppercase tracking-widest mb-2">Lien à partager</p>
            <div className="flex gap-2 items-center">
              <code className="text-xs flex-1 overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: "var(--off-black)" }}>
                {shareUrl}
              </code>
              <button
                onClick={copyLink}
                className="text-xs font-black uppercase tracking-widest py-2 px-3 border-2 whitespace-nowrap"
                style={{ borderColor: "var(--black)" }}
              >
                {copied ? "✓ Copié" : "Copier le lien"}
              </button>
            </div>
          </div>
        )}

        {cutoffPassed && order.status !== "paid" && (
          <div className="mb-4 text-sm font-bold p-3" style={{ backgroundColor: "var(--kraft)" }}>
            Commandes clôturées — les employés ne peuvent plus modifier leur box.
          </div>
        )}

        {/* Counter */}
        <div className="mb-6">
          <div className="text-6xl font-black">{boxes.length}</div>
          <div className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--off-black)" }}>
            / {order.estimated_people} réponses
          </div>
        </div>

        {/* Box list */}
        {boxes.length > 0 && (
          <div className="mb-8 space-y-3">
            {boxes.map((b) => (
              <div key={b.id} className="border-2 p-4 text-sm" style={{ borderColor: "var(--line)" }}>
                <p className="font-black uppercase mb-1">{b.person_name}</p>
                <p style={{ color: "var(--off-black)" }}>{b.sando} · {b.slaw} · {b.cookie} · {b.tea}</p>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        {boxes.length > 0 && (
          <div className="border-t-2 pt-4 mb-8" style={{ borderColor: "var(--black)" }}>
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-bold uppercase">{boxes.length} boxes × {formatPrice(PRICE_PER_BOX)}</span>
              <span className="text-2xl font-black">{formatPrice(total)}</span>
            </div>
          </div>
        )}

        {/* Payment CTA */}
        {order.status !== "paid" && order.status !== "cancelled" && (
          <div>
            {!canPay && boxes.length < MIN_BOXES && (
              <p className="text-sm font-bold mb-3" style={{ color: "var(--off-black)" }}>
                Minimum {MIN_BOXES} boxes pour valider la commande. ({MIN_BOXES - boxes.length} manquantes)
              </p>
            )}
            {error && <p className="text-sm font-bold mb-3" style={{ color: "var(--tanuki-red)" }}>{error}</p>}
            <button
              disabled={!canPay || paying}
              onClick={handlePay}
              className="w-full font-black text-sm uppercase tracking-widest py-4 px-8 text-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--tanuki-red)" }}
            >
              {paying ? "Redirection…" : `Valider et payer ${boxes.length >= MIN_BOXES ? formatPrice(total) : ""}`}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CommandePage() {
  return (
    <Suspense fallback={
      <div style={{ backgroundColor: "var(--paper)" }}>
        <SiteHeader />
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <p className="font-bold uppercase tracking-widest text-sm">Chargement…</p>
        </div>
      </div>
    }>
      <CommandeContent />
    </Suspense>
  );
}
