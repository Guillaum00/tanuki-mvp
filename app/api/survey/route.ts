import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = supabaseAdmin();

  const { data, error } = await db
    .from("survey_responses")
    .insert(body)
    .select()
    .single();

  if (error) {
    console.error(error);
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
