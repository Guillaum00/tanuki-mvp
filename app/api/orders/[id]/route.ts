import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = supabaseAdmin();

  const { data: order, error } = await db
    .from("team_orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  const { data: boxes } = await db
    .from("box_orders")
    .select("*")
    .eq("team_order_id", id)
    .order("created_at");

  return NextResponse.json({ order, boxes: boxes || [] });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const db = supabaseAdmin();

  const { data, error } = await db
    .from("team_orders")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Erreur mise à jour" }, { status: 500 });
  }

  return NextResponse.json({ order: data });
}
