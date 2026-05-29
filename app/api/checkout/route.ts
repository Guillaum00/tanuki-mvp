import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { PRICE_PER_BOX, MIN_BOXES } from "@/lib/menu";

export async function POST(req: NextRequest) {
  const { order_id, manager_token } = await req.json();
  const base = process.env.NEXT_PUBLIC_BASE_URL!;

  const db = supabaseAdmin();
  const { data: order } = await db
    .from("team_orders")
    .select("*")
    .eq("id", order_id)
    .single();

  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  // Vérification manager_token
  if (!manager_token || manager_token !== order.manager_token) {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
  }

  const { data: boxes } = await db
    .from("box_orders")
    .select("id")
    .eq("team_order_id", order_id);

  const count = boxes?.length ?? 0;

  if (count < MIN_BOXES) {
    return NextResponse.json({ error: `Minimum ${MIN_BOXES} boxes requis` }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: Math.round(PRICE_PER_BOX * 100),
          product_data: {
            name: `Tanuki Lunch Box — ${order.company_name}`,
            description: `${count} boxes — Livraison le ${order.delivery_date}`,
          },
        },
        quantity: count,
      },
    ],
    metadata: { order_id },
    customer_email: order.manager_email,
    success_url: `${base}/success?order_id=${order_id}&mt=${order.manager_token}`,
    cancel_url: `${base}/commande/${order_id}?mt=${order.manager_token}&cancelled=1`,
  });

  await db
    .from("team_orders")
    .update({ stripe_session_id: session.id, status: "ready_to_pay" })
    .eq("id", order_id);

  return NextResponse.json({ url: session.url });
}
