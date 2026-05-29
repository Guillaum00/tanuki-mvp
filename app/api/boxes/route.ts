import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { team_order_id, person_name, sando, slaw, cookie, tea } = body;

  if (!team_order_id || !person_name || !sando || !slaw || !cookie || !tea) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const db = supabaseAdmin();

  const { data: order } = await db
    .from("team_orders")
    .select("cutoff_at, status")
    .eq("id", team_order_id)
    .single();

  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  if (order.status === "paid" || order.status === "cancelled") {
    return NextResponse.json({ error: "Commandes clôturées" }, { status: 400 });
  }
  if (new Date() > new Date(order.cutoff_at)) {
    return NextResponse.json({ error: "Commandes clôturées" }, { status: 400 });
  }

  // Cherche une box existante pour ce prénom (insensible à la casse)
  const { data: existing } = await db
    .from("box_orders")
    .select("id")
    .eq("team_order_id", team_order_id)
    .ilike("person_name", person_name)
    .single();

  let data, error;

  if (existing) {
    // Mise à jour
    ({ data, error } = await db
      .from("box_orders")
      .update({ person_name, sando, slaw, cookie, tea, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single());
  } else {
    // Création
    ({ data, error } = await db
      .from("box_orders")
      .insert({ team_order_id, person_name, sando, slaw, cookie, tea })
      .select()
      .single());
  }

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur enregistrement" }, { status: 500 });
  }

  return NextResponse.json({ box: data });
}
