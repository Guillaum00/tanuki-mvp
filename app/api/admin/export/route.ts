import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const password = searchParams.get("password");
  const order_id = searchParams.get("order_id");

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const db = supabaseAdmin();
  let query = db.from("box_orders").select(`
    id,
    person_name,
    sando,
    slaw,
    cookie,
    tea,
    team_order_id,
    team_orders!inner(company_name, delivery_date, delivery_zone, delivery_address, manager_email)
  `).order("person_name");

  if (order_id) {
    query = query.eq("team_order_id", order_id);
  }

  const { data: boxes } = await query;
  if (!boxes) return NextResponse.json({ error: "Aucune donnée" }, { status: 404 });

  const header = "order_id,company_name,delivery_date,delivery_zone,person_name,sando,slaw,cookie,tea,delivery_address,manager_email\n";
  const rows = boxes.map((b: any) => {
    const o = b.team_orders;
    return [b.team_order_id, o.company_name, o.delivery_date, o.delivery_zone, b.person_name, b.sando, b.slaw, b.cookie, b.tea, o.delivery_address, o.manager_email]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",");
  }).join("\n");

  return new NextResponse(header + rows, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=tanuki-export.csv",
    },
  });
}
