import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const team_order_id = searchParams.get("team_order_id");
  const person_name = searchParams.get("person_name");

  if (!team_order_id || !person_name) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data } = await db
    .from("box_orders")
    .select("*")
    .eq("team_order_id", team_order_id)
    .ilike("person_name", person_name)
    .single();

  if (!data) return NextResponse.json({ box: null });
  return NextResponse.json({ box: data });
}
