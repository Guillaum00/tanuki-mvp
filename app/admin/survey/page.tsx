"use client";

import { useState } from "react";

type Response = {
  id: string;
  created_at: string;
  q1_location: string;
  q2_team_size: string;
  q3_order_frequency: string;
  q4_decision_maker: string;
  q6_payment_model: string;
  q7_payment_methods: string[];
  q8_current_services: string[];
  q9_budget: string;
  q10_frustrations: string[];
  q11_reaction: string;
  q14_tasting_interest: string;
  q15_comments: string;
  lead_name: string;
  lead_company: string;
  lead_email: string;
  lead_phone: string;
  lead_team_size: string;
};

function count(responses: Response[], key: keyof Response) {
  const counts: Record<string, number> = {};
  responses.forEach((r) => {
    const v = r[key];
    if (!v) return;
    if (Array.isArray(v)) {
      v.forEach((item) => { counts[item] = (counts[item] || 0) + 1; });
    } else {
      counts[v as string] = (counts[v as string] || 0) + 1;
    }
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function StatBlock({ title, data, total }: { title: string; data: [string, number][]; total: number }) {
  return (
    <div className="border-2 p-6" style={{ borderColor: "var(--line)" }}>
      <h3 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "var(--tanuki-red)" }}>{title}</h3>
      <div className="space-y-2">
        {data.map(([label, n]) => (
          <div key={label} className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>{label}</span>
                <span>{n} ({Math.round((n / total) * 100)}%)</span>
              </div>
              <div className="h-1 w-full rounded-full" style={{ backgroundColor: "var(--line)" }}>
                <div className="h-1 rounded-full" style={{ width: `${(n / total) * 100}%`, backgroundColor: "var(--tanuki-red)" }} />
              </div>
            </div>
          </div>
        ))}
        {data.length === 0 && <p className="text-xs" style={{ color: "var(--off-black)" }}>Aucune donnée</p>}
      </div>
    </div>
  );
}

export default function AdminSurveyPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/survey?password=${encodeURIComponent(password)}`);
    if (!res.ok) { setError("Mot de passe incorrect"); setLoading(false); return; }
    const data = await res.json();
    setResponses(data.responses);
    setAuthed(true);
    setLoading(false);
  }

  function exportCSV() {
    const cols = ["id","created_at","q1_location","q2_team_size","q3_order_frequency","q4_decision_maker","q6_payment_model","q9_budget","q11_reaction","q14_tasting_interest","q15_comments","lead_name","lead_company","lead_email","lead_phone","lead_team_size"];
    const header = cols.join(",");
    const rows = responses.map((r) =>
      cols.map((c) => {
        const v = (r as any)[c];
        const str = Array.isArray(v) ? v.join(" | ") : (v || "");
        return `"${str.replace(/"/g, '""')}"`;
      }).join(",")
    ).join("\n");
    const blob = new Blob([header + "\n" + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "tanuki-survey.csv"; a.click();
  }

  const leads = responses.filter((r) => r.lead_email);
  const tastingYes = responses.filter((r) => r.q14_tasting_interest === "Yes" || r.q14_tasting_interest === "Maybe");

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--paper)" }}>
        <form onSubmit={handleLogin} className="max-w-xs w-full px-6">
          <p className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: "var(--tanuki-red)" }}>TANUKI SURVEY ADMIN</p>
          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full border-2 bg-transparent py-3 px-4 text-sm mb-4 outline-none"
            style={{ borderColor: "var(--line)" }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm font-bold mb-3" style={{ color: "var(--tanuki-red)" }}>{error}</p>}
          <button type="submit" disabled={loading} className="w-full font-black text-sm uppercase tracking-widest py-4 text-white" style={{ backgroundColor: "var(--tanuki-red)" }}>
            {loading ? "Chargement…" : "Accéder →"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--paper)", minHeight: "100vh" }}>
      <header className="flex items-center justify-between px-6 py-4 border-b-2" style={{ borderColor: "var(--line)" }}>
        <span className="font-black text-xl" style={{ color: "var(--tanuki-red)" }}>TANUKI SURVEY</span>
        <button onClick={exportCSV} className="text-xs font-black uppercase tracking-widest py-2 px-4 border-2" style={{ borderColor: "var(--black)" }}>
          Export CSV
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Réponses totales", value: responses.length },
            { label: "Leads collectés", value: leads.length },
            { label: "Intéressés par tasting", value: tastingYes.length },
            { label: "Taux leads / réponses", value: responses.length ? `${Math.round((leads.length / responses.length) * 100)}%` : "—" },
          ].map(({ label, value }) => (
            <div key={label} className="border-2 p-6" style={{ borderColor: "var(--line)" }}>
              <div className="text-3xl font-black mb-1">{value}</div>
              <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--off-black)" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <StatBlock title="Quartier" data={count(responses, "q1_location")} total={responses.length} />
          <StatBlock title="Taille d'équipe" data={count(responses, "q2_team_size")} total={responses.length} />
          <StatBlock title="Budget / personne" data={count(responses, "q9_budget")} total={responses.length} />
          <StatBlock title="Modèle de paiement" data={count(responses, "q6_payment_model")} total={responses.length} />
          <StatBlock title="Réaction au concept" data={count(responses, "q11_reaction")} total={responses.length} />
          <StatBlock title="Intérêt tasting" data={count(responses, "q14_tasting_interest")} total={responses.length} />
          <StatBlock title="Frustrations" data={count(responses, "q10_frustrations")} total={responses.length} />
          <StatBlock title="Services actuels" data={count(responses, "q8_current_services")} total={responses.length} />
        </div>

        {/* Leads table */}
        {leads.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-black uppercase mb-4">Leads ({leads.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2" style={{ borderColor: "var(--black)" }}>
                    {["Nom", "Entreprise", "Email", "Téléphone", "Taille", "Tasting", "Date"].map((h) => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-black uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((r) => (
                    <tr key={r.id} className="border-b" style={{ borderColor: "var(--line)" }}>
                      <td className="py-3 px-3 font-bold">{r.lead_name || "—"}</td>
                      <td className="py-3 px-3">{r.lead_company || "—"}</td>
                      <td className="py-3 px-3">{r.lead_email}</td>
                      <td className="py-3 px-3">{r.lead_phone || "—"}</td>
                      <td className="py-3 px-3">{r.lead_team_size || "—"}</td>
                      <td className="py-3 px-3">
                        <span style={{ color: r.q14_tasting_interest === "Yes" ? "var(--tanuki-red)" : "var(--off-black)" }}>
                          {r.q14_tasting_interest || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs">{new Date(r.created_at).toLocaleDateString("fr-BE")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Comments */}
        {responses.filter((r) => r.q15_comments).length > 0 && (
          <div>
            <h2 className="text-2xl font-black uppercase mb-4">Commentaires libres</h2>
            <div className="space-y-3">
              {responses.filter((r) => r.q15_comments).map((r) => (
                <div key={r.id} className="border-2 p-4 text-sm" style={{ borderColor: "var(--line)" }}>
                  <p className="mb-1">&ldquo;{r.q15_comments}&rdquo;</p>
                  <p className="text-xs font-bold" style={{ color: "var(--off-black)" }}>{r.lead_company || r.q1_location || "Anonyme"} — {new Date(r.created_at).toLocaleDateString("fr-BE")}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
