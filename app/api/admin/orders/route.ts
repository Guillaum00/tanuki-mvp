import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function checkAuth(req: NextRequest) {
  const auth = req.headers.get("x-admin-password");
  return auth === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const db = supabaseAdmin();
  const { data: orders } = await db
    .from("team_orders")
    .select("*")
    .order("delivery_date", { ascending: true });

  if (!orders) return NextResponse.json({ orders: [] });

  const ordersWithBoxes = await Promise.all(
    orders.map(async (o) => {
      const { data: boxes } = await db
        .from("box_orders")
        .select("*")
        .eq("team_order_id", o.id)
        .order("created_at");
      return { ...o, boxes: boxes || [] };
    })
  );

  return NextResponse.json({ orders: ordersWithBoxes });
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id, ...updates } = await req.json();
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("team_orders")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: "Erreur mise à jour" }, { status: 500 });
  return NextResponse.json({ order: data });
}
