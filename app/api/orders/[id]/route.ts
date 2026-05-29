import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function getManagerToken(req: NextRequest): string | null {
  return req.headers.get("x-manager-token") || new URL(req.url).searchParams.get("mt");
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mt = getManagerToken(req);
  const db = supabaseAdmin();

  const { data: order, error } = await db
    .from("team_orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  // Vérification manager_token
  if (!mt || mt !== order.manager_token) {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
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
  const mt = getManagerToken(req);
  const db = supabaseAdmin();

  // Vérification manager_token
  const { data: order } = await db
    .from("team_orders")
    .select("manager_token")
    .eq("id", id)
    .single();

  if (!order || !mt || mt !== order.manager_token) {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
  }

  const body = await req.json();
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
