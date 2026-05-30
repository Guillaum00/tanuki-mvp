import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = supabaseAdmin();

  // Extract known fields, ignore anything unexpected
  const {
    language,
    completed,
    wants_tasting,
    lead_first_name,
    lead_last_name,
    lead_company,
    lead_email,
    lead_phone,
    q1_location,
    q2_team_size,
    q3_frequency,
    q4_decision_maker,
    q5_order_size,
    q6_payment_model,
    q7_payment_methods,
    q8_current_services,
    q9_budget,
    q10_frustrations,
    q11_reaction,
    q12_products,
    q13_trial_drivers,
    q14_tasting,
    q15_open,
  } = body;

  const row = {
    language: language ?? "EN",
    completed: completed ?? false,
    wants_tasting: wants_tasting ?? false,
    lead_first_name: lead_first_name ?? null,
    lead_last_name: lead_last_name ?? null,
    lead_company: lead_company ?? null,
    lead_email: lead_email ?? null,
    lead_phone: lead_phone ?? null,
    q1_location: q1_location ?? null,
    q2_team_size: q2_team_size ?? null,
    q3_frequency: q3_frequency ?? null,
    q4_decision_maker: q4_decision_maker ?? null,
    q5_order_size: q5_order_size ?? null,
    q6_payment_model: q6_payment_model ?? null,
    q7_payment_methods: q7_payment_methods ?? null,
    q8_current_services: q8_current_services ?? null,
    q9_budget: q9_budget ?? null,
    q10_frustrations: q10_frustrations ?? null,
    q11_reaction: q11_reaction ?? null,
    q12_products: q12_products ?? null,
    q13_trial_drivers: q13_trial_drivers ?? null,
    q14_tasting: q14_tasting ?? null,
    q15_open: q15_open ?? null,
  };

  const { data, error } = await db
    .from("survey_responses")
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error("Survey insert error:", error);
    return NextResponse.json({ error: "Erreur enregistrement" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const password = searchParams.get("password");

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("survey_responses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Erreur" }, { status: 500 });
  return NextResponse.json({ responses: data || [] });
}
