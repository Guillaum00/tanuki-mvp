import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) return NextResponse.json({ error: "Token manquant" }, { status: 400 });

  const db = supabaseAdmin();
  const { data: order } = await db
    .from("team_orders")
    .select("*")
    .eq("token", token)
    .single();

  if (!order) return NextResponse.json({ error: "Lien invalide" }, { status: 404 });

  return NextResponse.json({ order });
}
