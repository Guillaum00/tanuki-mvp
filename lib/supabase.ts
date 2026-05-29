import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function supabaseAdmin() {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export type TeamOrder = {
  id: string;
  token: string;
  company_name: string;
  manager_name: string;
  manager_email: string;
  delivery_address: string;
  delivery_zone: string;
  delivery_date: string;
  estimated_people: number;
  cutoff_at: string;
  status: "collecting" | "ready_to_pay" | "paid" | "cancelled";
  production_status?: "paid" | "in_production" | "ready" | "dispatched" | "delivered";
  created_at: string;
  stripe_session_id?: string;
};

export type BoxOrder = {
  id: string;
  team_order_id: string;
  person_name: string;
  sando: string;
  slaw: string;
  cookie: string;
  tea: string;
  created_at: string;
  updated_at: string;
};
