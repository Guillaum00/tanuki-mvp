"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { TeamOrder, BoxOrder } from "@/lib/supabase";
import { formatDate, formatPrice, PRICE_PER_BOX } from "@/lib/menu";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const mt = searchParams.get("mt") || "";
  const [order, setOrder] = useState<TeamOrder | null>(null);
  const [boxes, setBoxes] = useState<BoxOrder[]>([]);

  useEffect(() => {
    if (!orderId || !mt) return;
    fetch(`/api/orders/${orderId}?mt=${mt}`)
      .then((r) => r.json())
      .then((d) => { setOrder(d.order); setBoxes(d.boxes || []); });
  }, [orderId, mt]);

  return (
    <main className="max-w-xl mx-auto px-6 py-16 text-center">
      <div className="text-5xl mb-6">✓</div>
      <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "var(--tanuki-red)" }}>Commande confirmée</p>
      <h1 className="text-4xl font-black uppercase mb-6">Merci !</h1>

      {order && (
        <div className="border-2 p-6 text-left mb-8" style={{ borderColor: "var(--line)" }}>
          <p className="font-black text-lg mb-2">{order.company_name}</p>
          <p className="text-sm mb-1 capitalize">{formatDate(order.delivery_date)}</p>
          <p className="text-sm mb-1">{order.delivery_zone}</p>
          <p className="text-sm mb-4" style={{ color: "var(--off-black)" }}>{order.delivery_address}</p>
          <div className="border-t pt-4" style={{ borderColor: "var(--line)" }}>
            <p className="font-black text-xl">{boxes.length} boxes — {formatPrice(boxes.length * PRICE_PER_BOX)}</p>
          </div>
        </div>
      )}

      <p className="text-sm mb-8" style={{ color: "var(--off-black)" }}>
        Un récapitulatif vous a été envoyé par email.
      </p>

      {orderId && mt && (
        <Link
          href={`/commande/${orderId}?mt=${mt}`}
          className="inline-block font-bold text-sm uppercase tracking-widest py-3 px-6 border-2"
          style={{ borderColor: "var(--black)" }}
        >
          Voir la commande
        </Link>
      )}
    </main>
  );
}

export default function SuccessPage() {
  return (
    <div style={{ backgroundColor: "var(--paper)" }}>
      <SiteHeader />
      <Suspense fallback={<div className="px-6 py-16 text-center font-bold uppercase">Chargement…</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
