import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { computeCutoff } from "@/lib/menu";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { company_name, manager_name, manager_email, delivery_address, delivery_zone, delivery_date, estimated_people } = body;

  if (!company_name || !manager_name || !manager_email || !delivery_address || !delivery_zone || !delivery_date) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const token = uuidv4().replace(/-/g, "").substring(0, 12);
  const manager_token = uuidv4().replace(/-/g, "");
  const cutoff_at = computeCutoff(delivery_date);

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("team_orders")
    .insert({
      token,
      manager_token,
      company_name,
      manager_name,
      manager_email,
      delivery_address,
      delivery_zone,
      delivery_date,
      estimated_people: estimated_people || 1,
      cutoff_at,
      status: "collecting",
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur base de données" }, { status: 500 });
  }

  return NextResponse.json({ order: data });
}
