"use client";

import { useEffect, useState } from "react";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "";

type Response = {
  id: string;
  created_at: string;
  language: string | null;
  completed: boolean | null;
  wants_tasting: boolean | null;
  lead_email: string | null;
  lead_first_name: string | null;
  lead_last_name: string | null;
  lead_company: string | null;
  q1_location: string | null;
  q15_open: string | null;
};

type Stats = {
  total: number;
  completed: number;
  wants_tasting: number;
  leads: number;
  by_lang: Record<string, number>;
  recent: Response[];
  db_ok: boolean;
  db_error: string | null;
};

function computeStats(responses: Response[]): Stats {
  const by_lang: Record<string, number> = {};
  let completed = 0;
  let wants_tasting = 0;
  let leads = 0;

  for (const r of responses) {
    const lang = r.language ?? "EN";
    by_lang[lang] = (by_lang[lang] ?? 0) + 1;
    if (r.completed) completed++;
    if (r.wants_tasting) wants_tasting++;
    if (r.lead_email) leads++;
  }

  return {
    total: responses.length,
    completed,
    wants_tasting,
    leads,
    by_lang,
    recent: responses.slice(0, 10),
    db_ok: true,
    db_error: null,
  };
}

export default function DebugPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  async function load(pwd: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/survey?password=${encodeURIComponent(pwd)}`);
      if (res.status === 401) { setError("Mot de passe incorrect"); setLoading(false); return; }
      if (!res.ok) throw new Error("Erreur serveur");
      const json = await res.json();
      setStats({ ...computeStats(json.responses), db_ok: true, db_error: null });
      setAuthed(true);
      setLastFetch(new Date());
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur inconnue";
      setStats(s => s ? { ...s, db_ok: false, db_error: msg } : null);
      setError(msg);
    }
    setLoading(false);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    load(password);
  }

  if (!authed) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--off-white, #F5F3EE)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-body, sans-serif)" }}>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16, width: 320 }}>
          <p style={{ fontWeight: 900, fontSize: 18, letterSpacing: "0.08em", textTransform: "uppercase" }}>Admin Debug</p>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Mot de passe admin"
            style={{ padding: "10px 14px", border: "1.5px solid #222", fontSize: 15, background: "transparent", outline: "none" }}
          />
          {error && <p style={{ color: "var(--tanuki-red, #C8102E)", fontSize: 13 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ padding: "12px 0", background: "#222", color: "#fff", fontWeight: 900, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>
            {loading ? "…" : "ACCÉDER"}
          </button>
        </form>
      </main>
    );
  }

  const s = stats!;

  const statBox = (label: string, value: string | number) => (
    <div style={{ border: "1.5px solid #222", padding: "20px 24px", minWidth: 140 }}>
      <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 6, opacity: 0.55 }}>{label}</div>
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: "var(--off-white, #F5F3EE)", padding: "40px 32px", fontFamily: "var(--font-body, sans-serif)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginBottom: 40 }}>
        <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: "0.08em", textTransform: "uppercase" }}>TANUKI — DEBUG</span>
        <span style={{ fontSize: 12, opacity: 0.45 }}>
          {lastFetch ? `Mis à jour ${lastFetch.toLocaleTimeString("fr-BE")}` : ""}
        </span>
        <button
          onClick={() => load(password)}
          disabled={loading}
          style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: "none", border: "1.5px solid #222", padding: "6px 14px", cursor: "pointer" }}
        >
          {loading ? "…" : "↺ RAFRAÎCHIR"}
        </button>
      </div>

      {/* DB Status */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, fontSize: 13 }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: s.db_ok ? "#2ecc71" : "#C8102E", display: "inline-block" }} />
        <span style={{ fontWeight: 700 }}>Supabase</span>
        <span style={{ opacity: 0.5 }}>{s.db_ok ? "Connecté" : s.db_error}</span>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 40 }}>
        {statBox("Réponses totales", s.total)}
        {statBox("Complétés", s.completed)}
        {statBox("Taux complétion", s.total > 0 ? `${Math.round(s.completed / s.total * 100)}%` : "—")}
        {statBox("Veulent un tasting", s.wants_tasting)}
        {statBox("Leads capturés", s.leads)}
      </div>

      {/* Languages */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontWeight: 900, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Langues</h2>
        <div style={{ display: "flex", gap: 12 }}>
          {(["FR", "EN", "NL"] as const).map(lang => {
            const count = s.by_lang[lang] ?? 0;
            const pct = s.total > 0 ? Math.round(count / s.total * 100) : 0;
            return (
              <div key={lang} style={{ border: "1.5px solid #222", padding: "16px 24px", minWidth: 100 }}>
                <div style={{ fontWeight: 900, fontSize: 24 }}>{count}</div>
                <div style={{ fontSize: 11, letterSpacing: "0.1em", fontWeight: 700, opacity: 0.5, marginTop: 4 }}>{lang} — {pct}%</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent respondents */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontWeight: 900, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>10 derniers répondants</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #222" }}>
                {["Date", "Lang", "✓", "Tasting", "Email", "Entreprise", "Zone", "Commentaire"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.recent.length === 0 && (
                <tr><td colSpan={8} style={{ padding: "20px 12px", opacity: 0.4, fontSize: 13 }}>Aucune réponse pour l'instant.</td></tr>
              )}
              {s.recent.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", background: i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.02)" }}>
                  <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
                    {new Date(r.created_at).toLocaleDateString("fr-BE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td style={{ padding: "8px 12px", fontWeight: 700 }}>{r.language ?? "?"}</td>
                  <td style={{ padding: "8px 12px" }}>{r.completed ? "✓" : "—"}</td>
                  <td style={{ padding: "8px 12px" }}>{r.wants_tasting ? "✓" : "—"}</td>
                  <td style={{ padding: "8px 12px", color: r.lead_email ? "#222" : "#aaa" }}>{r.lead_email ?? "—"}</td>
                  <td style={{ padding: "8px 12px", color: r.lead_company ? "#222" : "#aaa" }}>{r.lead_company ?? "—"}</td>
                  <td style={{ padding: "8px 12px", fontSize: 12 }}>{r.q1_location ?? "—"}</td>
                  <td style={{ padding: "8px 12px", fontSize: 12, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.q15_open ? `"${r.q15_open}"` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Links */}
      <section>
        <h2 style={{ fontWeight: 900, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Navigation admin</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { label: "← Survey stats", href: `/admin/survey?password=${password}` },
            { label: "Survey →", href: "/survey" },
          ].map(({ label, href }) => (
            <a key={href} href={href} style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "8px 16px", border: "1.5px solid #222", textDecoration: "none", color: "#222" }}>
              {label}
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
