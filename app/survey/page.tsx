"use client";

import { useState } from "react";
import { I18nProvider, useI18n, LangSwitcher } from "@/lib/i18n";

// ─── Answer key types ────────────────────────────────────────────────────────

type SurveyData = {
  q1_location: string; q1_other: string;
  q2_team_size: string;
  q3_order_frequency: string;
  q4_decision_maker: string; q4_other: string;
  q5_meal_count: string;
  q6_payment_model: string; q6_other: string;
  q7_payment_methods: string[]; q7_other: string;
  q8_current_services: string[]; q8_other: string;
  q9_budget: string;
  q10_frustrations: string[]; q10_other: string;
  q11_reaction: string;
  q12_products: string[];
  q13_trial_drivers: string[];
  q14_tasting_interest: string;
  q15_comments: string;
  wants_tasting: boolean;
  lead_first_name: string; lead_last_name: string;
  lead_company: string; lead_email: string; lead_phone: string;
  language: string;
  completed: boolean;
};

const EMPTY: SurveyData = {
  q1_location: "", q1_other: "", q2_team_size: "", q3_order_frequency: "",
  q4_decision_maker: "", q4_other: "", q5_meal_count: "",
  q6_payment_model: "", q6_other: "",
  q7_payment_methods: [], q7_other: "",
  q8_current_services: [], q8_other: "",
  q9_budget: "", q10_frustrations: [], q10_other: "",
  q11_reaction: "", q12_products: [], q13_trial_drivers: [],
  q14_tasting_interest: "", q15_comments: "",
  wants_tasting: false,
  lead_first_name: "", lead_last_name: "", lead_company: "", lead_email: "", lead_phone: "",
  language: "EN", completed: false,
};

const TOTAL_Q = 15;

// ─── Reusable components ─────────────────────────────────────────────────────

function Progress({ step }: { step: number }) {
  const { t } = useI18n();
  const pct = Math.round(((step - 1) / TOTAL_Q) * 100);
  return (
    <div className="mb-10">
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-5xl font-black leading-none tabular-nums" style={{ color: "var(--tanuki-red)" }}>
          {String(step).padStart(2, "0")}
        </span>
        <span className="text-sm font-bold" style={{ color: "var(--kraft)" }}>
          {t.progress.of} {TOTAL_Q}
        </span>
      </div>
      <div className="h-px w-full relative" style={{ backgroundColor: "var(--line)" }}>
        <div
          className="absolute inset-y-0 left-0 transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: "var(--tanuki-red)", height: "2px", top: "-0.5px" }}
        />
        <div
          className="absolute w-2 h-2 rounded-full border-2 transition-all duration-500"
          style={{
            left: `${pct}%`, top: "50%", transform: "translate(-50%, -50%)",
            backgroundColor: "var(--tanuki-red)", borderColor: "var(--tanuki-red)",
          }}
        />
      </div>
    </div>
  );
}

// ← Fixed: extracted into named component to avoid useState in .map() (React Rules of Hooks)
function SingleCard({ label, sublabel, selected, onClick }: {
  label: string; sublabel?: string; selected: boolean; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="text-left border-2 p-5 transition-colors duration-100 w-full"
      style={{
        borderColor: selected ? "var(--tanuki-red)" : "var(--line)",
        backgroundColor: selected ? "var(--tanuki-red)" : hovered ? "var(--black)" : "transparent",
        color: selected || hovered ? "white" : "var(--black)",
      }}
    >
      <div className="text-sm font-black uppercase tracking-wide">{label}</div>
      {sublabel && <div className="text-xs font-medium mt-0.5 opacity-70">{sublabel}</div>}
    </button>
  );
}

function MultiCard({ label, sublabel, selected, disabled, onClick }: {
  label: string; sublabel?: string; selected: boolean; disabled: boolean; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={disabled}
      className="text-left border-2 p-5 transition-colors duration-100 w-full disabled:opacity-40"
      style={{
        borderColor: selected ? "var(--tanuki-red)" : "var(--line)",
        backgroundColor: selected ? "var(--tanuki-red)" : hovered ? "var(--black)" : "transparent",
        color: selected || hovered ? "white" : "var(--black)",
      }}
    >
      <div className="flex items-start gap-2">
        <span className="text-xs font-black mt-0.5 shrink-0">{selected ? "✓" : "○"}</span>
        <div>
          <div className="text-sm font-black uppercase tracking-wide">{label}</div>
          {sublabel && <div className="text-xs font-medium mt-0.5 opacity-70">{sublabel}</div>}
        </div>
      </div>
    </button>
  );
}

function RadioGrid({ options, value, onChange, sublabels }: {
  options: [string, string][]; // [key, label]
  value: string;
  onChange: (k: string) => void;
  sublabels?: Record<string, string>;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map(([key, label]) => (
        <SingleCard
          key={key}
          label={label}
          sublabel={sublabels?.[key]}
          selected={value === key}
          onClick={() => onChange(key)}
        />
      ))}
    </div>
  );
}

function MultiGrid({ options, values, onChange, max, sublabels }: {
  options: [string, string][];
  values: string[];
  onChange: (v: string[]) => void;
  max?: number;
  sublabels?: Record<string, string>;
}) {
  function toggle(key: string) {
    if (values.includes(key)) { onChange(values.filter((v) => v !== key)); return; }
    if (max && values.length >= max) return;
    onChange([...values, key]);
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map(([key, label]) => (
        <MultiCard
          key={key}
          label={label}
          sublabel={sublabels?.[key]}
          selected={values.includes(key)}
          disabled={!values.includes(key) && !!max && values.length >= max}
          onClick={() => toggle(key)}
        />
      ))}
    </div>
  );
}

function OtherInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      className="w-full border-b-2 bg-transparent py-3 text-sm font-medium outline-none mt-4"
      style={{ borderColor: "var(--black)" }}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function Cta({ onClick, disabled, label }: { onClick: () => void; disabled?: boolean; label: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div className="mt-10 flex justify-end">
      <button
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        className="font-black text-sm uppercase tracking-widest py-4 px-10 border-2 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
        style={{
          borderColor: hov && !disabled ? "var(--tanuki-red)" : "var(--black)",
          backgroundColor: hov && !disabled ? "var(--tanuki-red)" : "var(--black)",
          color: "white",
        }}
      >
        {label}
      </button>
    </div>
  );
}

function Shell({ children, step }: { children: React.ReactNode; step?: number }) {
  return (
    <div className="min-h-screen px-6 py-8" style={{ backgroundColor: "var(--paper)" }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <a href="/" className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--tanuki-red)" }}>← TANUKI</a>
          <LangSwitcher />
        </div>
        {step !== undefined && <Progress step={step} />}
        {children}
      </div>
    </div>
  );
}

function Q({ children }: { children: React.ReactNode }) {
  return <h2 className="text-3xl md:text-4xl font-black uppercase leading-tight mb-2" style={{ color: "var(--black)" }}>{children}</h2>;
}

function Ctx2({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium mb-8" style={{ color: "var(--off-black)" }}>{children}</p>;
}

// ─── Survey inner (needs i18n context) ───────────────────────────────────────

function SurveyInner() {
  const { t, lang } = useI18n();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<SurveyData>({ ...EMPTY, language: lang });
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof SurveyData, v: any) => setData((d) => ({ ...d, [k]: v }));
  const next = () => setStep((s) => s + 1);

  // Keep language in sync
  const d = { ...data, language: lang };

  async function submit(final: Partial<SurveyData> = {}) {
    setSubmitting(true);
    try {
      await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...d, ...final, completed: true }),
      });
    } catch { /* non-blocking */ }
    setSubmitting(false);
    next();
  }

  // Helper: convert record to [key, label] pairs
  function entries(obj: Record<string, string>): [string, string][] {
    return Object.entries(obj) as [string, string][];
  }

  // ── LANDING ──────────────────────────────────────────────────────────────
  if (step === 0) return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--paper)" }}>
      <div className="max-w-2xl mx-auto px-6 py-8 w-full flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-16">
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--tanuki-red)" }}>
            {t.landing.tag}
          </span>
          <LangSwitcher />
        </div>
        <div className="flex-1">
          <h1 className="text-5xl md:text-7xl font-black uppercase leading-none mb-8" style={{ color: "var(--black)" }}>
            {t.landing.title[0]}<br />{t.landing.title[1]}
          </h1>
          <p className="text-sm max-w-sm mb-10 whitespace-pre-line" style={{ color: "var(--off-black)", lineHeight: 1.7 }}>
            {t.landing.intro}
          </p>
          <div className="space-y-3 mb-12">
            {t.landing.benefits.map((b) => (
              <div key={b} className="flex items-center gap-3 text-sm font-bold">
                <span className="text-xs" style={{ color: "var(--tanuki-red)" }}>✔</span>
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t-2 pt-8" style={{ borderColor: "var(--line)" }}>
          <button
            onClick={next}
            className="font-black text-sm uppercase tracking-widest py-4 px-10 transition-colors"
            style={{ backgroundColor: "var(--tanuki-red)", color: "white" }}
          >
            {t.landing.cta} →
          </button>
        </div>
      </div>
    </div>
  );

  // ── Q1 — Location ────────────────────────────────────────────────────────
  if (step === 1) return (
    <Shell step={1}>
      <Q>{t.questions.q1.title}</Q>
      <Ctx2>{t.questions.q1.context}</Ctx2>
      <RadioGrid options={entries(t.answers.locations)} value={data.q1_location} onChange={(v) => set("q1_location", v)} />
      {data.q1_location === "other" && <OtherInput value={data.q1_other} onChange={(v) => set("q1_other", v)} placeholder={t.ui.specify} />}
      <Cta onClick={next} label={t.ui["continue"]} disabled={!data.q1_location || (data.q1_location === "other" && !data.q1_other)} />
    </Shell>
  );

  // ── Q2 — Team size ───────────────────────────────────────────────────────
  if (step === 2) return (
    <Shell step={2}>
      <Q>{t.questions.q2.title}</Q>
      <Ctx2>{t.questions.q2.context}</Ctx2>
      <RadioGrid options={entries(t.answers.team_sizes)} value={data.q2_team_size} onChange={(v) => set("q2_team_size", v)} sublabels={t.answers.team_sizes_sub} />
      <Cta onClick={next} label={t.ui["continue"]} disabled={!data.q2_team_size} />
    </Shell>
  );

  // ── Q3 — Frequency ───────────────────────────────────────────────────────
  if (step === 3) return (
    <Shell step={3}>
      <Q>{t.questions.q3.title}</Q>
      <Ctx2>{t.questions.q3.context}</Ctx2>
      <RadioGrid options={entries(t.answers.frequencies)} value={data.q3_order_frequency} onChange={(v) => set("q3_order_frequency", v)} />
      <Cta onClick={next} label={t.ui["continue"]} disabled={!data.q3_order_frequency} />
    </Shell>
  );

  // ── Q4 — Decision maker ──────────────────────────────────────────────────
  if (step === 4) return (
    <Shell step={4}>
      <Q>{t.questions.q4.title}</Q>
      <Ctx2>{t.questions.q4.context}</Ctx2>
      <RadioGrid options={entries(t.answers.decision_makers)} value={data.q4_decision_maker} onChange={(v) => set("q4_decision_maker", v)} />
      {data.q4_decision_maker === "other" && <OtherInput value={data.q4_other} onChange={(v) => set("q4_other", v)} placeholder={t.ui.specify} />}
      <Cta onClick={next} label={t.ui["continue"]} disabled={!data.q4_decision_maker} />
    </Shell>
  );

  // ── Q5 — Meal count ──────────────────────────────────────────────────────
  if (step === 5) return (
    <Shell step={5}>
      <Q>{t.questions.q5.title}</Q>
      <Ctx2>{t.questions.q5.context}</Ctx2>
      <RadioGrid options={entries(t.answers.team_sizes)} value={data.q5_meal_count} onChange={(v) => set("q5_meal_count", v)} sublabels={t.answers.team_sizes_sub} />
      <Cta onClick={next} label={t.ui["continue"]} disabled={!data.q5_meal_count} />
    </Shell>
  );

  // ── Q6 — Payment model ───────────────────────────────────────────────────
  if (step === 6) return (
    <Shell step={6}>
      <Q>{t.questions.q6.title}</Q>
      <Ctx2>{t.questions.q6.context}</Ctx2>
      <RadioGrid options={entries(t.answers.payment_models)} value={data.q6_payment_model} onChange={(v) => set("q6_payment_model", v)} />
      {data.q6_payment_model === "other" && <OtherInput value={data.q6_other} onChange={(v) => set("q6_other", v)} placeholder={t.ui.specify} />}
      <Cta onClick={next} label={t.ui["continue"]} disabled={!data.q6_payment_model} />
    </Shell>
  );

  // ── Q7 — Payment methods (multi) ─────────────────────────────────────────
  if (step === 7) return (
    <Shell step={7}>
      <Q>{t.questions.q7.title}</Q>
      <Ctx2>{t.ui.multi_hint}</Ctx2>
      <MultiGrid options={entries(t.answers.payment_methods)} values={data.q7_payment_methods} onChange={(v) => set("q7_payment_methods", v)} />
      {data.q7_payment_methods.includes("other") && <OtherInput value={data.q7_other} onChange={(v) => set("q7_other", v)} placeholder={t.ui.specify} />}
      <Cta onClick={next} label={t.ui["continue"]} disabled={data.q7_payment_methods.length === 0} />
    </Shell>
  );

  // ── Q8 — Current services (multi) ────────────────────────────────────────
  if (step === 8) return (
    <Shell step={8}>
      <Q>{t.questions.q8.title}</Q>
      <Ctx2>{t.ui.multi_hint}</Ctx2>
      <MultiGrid options={entries(t.answers.current_services)} values={data.q8_current_services} onChange={(v) => set("q8_current_services", v)} />
      {data.q8_current_services.includes("other") && <OtherInput value={data.q8_other} onChange={(v) => set("q8_other", v)} placeholder={t.ui.specify} />}
      <Cta onClick={next} label={t.ui["continue"]} disabled={data.q8_current_services.length === 0} />
    </Shell>
  );

  // ── Q9 — Budget ──────────────────────────────────────────────────────────
  if (step === 9) return (
    <Shell step={9}>
      <Q>{t.questions.q9.title}</Q>
      <Ctx2>{t.questions.q9.context}</Ctx2>
      <RadioGrid options={entries(t.answers.budgets)} value={data.q9_budget} onChange={(v) => set("q9_budget", v)} sublabels={t.answers.budgets_sub} />
      <Cta onClick={next} label={t.ui["continue"]} disabled={!data.q9_budget} />
    </Shell>
  );

  // ── Q10 — Frustrations (multi max 3) ─────────────────────────────────────
  if (step === 10) return (
    <Shell step={10}>
      <Q>{t.questions.q10.title}</Q>
      <Ctx2>{`${t.ui.max_hint} 3`}</Ctx2>
      <MultiGrid options={entries(t.answers.frustrations)} values={data.q10_frustrations} onChange={(v) => set("q10_frustrations", v)} max={3} />
      {data.q10_frustrations.includes("other") && <OtherInput value={data.q10_other} onChange={(v) => set("q10_other", v)} placeholder={t.ui.specify} />}
      <Cta onClick={next} label={t.ui["continue"]} disabled={data.q10_frustrations.length === 0} />
    </Shell>
  );

  // ── Q11 — Reaction ───────────────────────────────────────────────────────
  if (step === 11) return (
    <Shell step={11}>
      <Q>{t.questions.q11.title}</Q>
      <div className="border-l-4 pl-4 mb-8" style={{ borderColor: "var(--tanuki-red)" }}>
        <p className="text-sm font-medium" style={{ color: "var(--off-black)" }}>{t.questions.q11.context}</p>
      </div>
      <RadioGrid options={entries(t.answers.reactions)} value={data.q11_reaction} onChange={(v) => set("q11_reaction", v)} />
      <Cta onClick={next} label={t.ui["continue"]} disabled={!data.q11_reaction} />
    </Shell>
  );

  // ── Q12 — Products (multi) ───────────────────────────────────────────────
  if (step === 12) return (
    <Shell step={12}>
      <Q>{t.questions.q12.title}</Q>
      <Ctx2>{t.ui.multi_hint}</Ctx2>
      <MultiGrid options={entries(t.answers.products)} values={data.q12_products} onChange={(v) => set("q12_products", v)} />
      <Cta onClick={next} label={t.ui["continue"]} disabled={data.q12_products.length === 0} />
    </Shell>
  );

  // ── Q13 — Trial drivers (multi max 2) ────────────────────────────────────
  if (step === 13) return (
    <Shell step={13}>
      <Q>{t.questions.q13.title}</Q>
      <Ctx2>{`${t.ui.max_hint} 2`}</Ctx2>
      <MultiGrid options={entries(t.answers.trial_drivers)} values={data.q13_trial_drivers} onChange={(v) => set("q13_trial_drivers", v)} max={2} />
      <Cta onClick={next} label={t.ui["continue"]} disabled={data.q13_trial_drivers.length === 0} />
    </Shell>
  );

  // ── Q14 — Tasting interest ───────────────────────────────────────────────
  if (step === 14) return (
    <Shell step={14}>
      <Q>{t.questions.q14.title}</Q>
      <Ctx2>{t.questions.q14.context}</Ctx2>
      <RadioGrid options={entries(t.answers.tasting)} value={data.q14_tasting_interest} onChange={(v) => set("q14_tasting_interest", v)} sublabels={t.answers.tasting_sub} />
      <Cta onClick={next} label={t.ui["continue"]} disabled={!data.q14_tasting_interest} />
    </Shell>
  );

  // ── Q15 — Comments ───────────────────────────────────────────────────────
  if (step === 15) return (
    <Shell step={15}>
      <Q>{t.questions.q15.title}</Q>
      <Ctx2>{t.ui.optional}</Ctx2>
      <textarea
        className="w-full border-2 bg-transparent py-4 px-4 text-sm font-medium outline-none resize-none"
        style={{ borderColor: "var(--line)", minHeight: "140px" }}
        placeholder={t.ui.specify}
        value={data.q15_comments}
        onChange={(e) => set("q15_comments", e.target.value)}
      />
      <Cta onClick={next} label={t.ui["continue"]} />
    </Shell>
  );

  // ── LEAD CAPTURE ─────────────────────────────────────────────────────────
  if (step === 16) return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--paper)" }}>
      <div className="max-w-2xl mx-auto px-6 py-8 w-full flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-12">
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--tanuki-red)" }}>{t.done.tag}</span>
          <LangSwitcher />
        </div>
        <h2 className="text-4xl md:text-5xl font-black uppercase leading-none mb-6">
          {t.lead.title[0]}<br />{t.lead.title[1]}
        </h2>
        <p className="text-base mb-8" style={{ color: "var(--off-black)" }}>{t.lead.subtitle}</p>

        {/* Tasting choice */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          <SingleCard label={t.lead.tasting_yes} selected={data.wants_tasting === true} onClick={() => set("wants_tasting", true)} />
          <SingleCard label={t.lead.tasting_no} selected={data.wants_tasting === false && step > 15} onClick={() => { set("wants_tasting", false); submit({ wants_tasting: false }); }} />
        </div>

        {/* Contact fields — only if wants tasting */}
        {data.wants_tasting && (
          <div className="space-y-5 mb-8">
            {[
              { key: "lead_first_name", label: t.lead.fields.first_name },
              { key: "lead_last_name", label: t.lead.fields.last_name },
              { key: "lead_company", label: t.lead.fields.company },
              { key: "lead_email", label: t.lead.fields.email, type: "email" },
              { key: "lead_phone", label: t.lead.fields.phone, type: "tel" },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{ color: "var(--off-black)" }}>{label}</label>
                <input
                  type={type || "text"}
                  className="w-full border-b-2 bg-transparent py-3 text-sm font-medium outline-none transition-colors"
                  style={{ borderColor: "var(--line)" }}
                  value={(data as any)[key]}
                  onChange={(e) => set(key as keyof SurveyData, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

        <div className="border-t-2 pt-8 flex flex-col gap-4" style={{ borderColor: "var(--line)" }}>
          {data.wants_tasting && (
            <button
              onClick={() => submit()}
              disabled={submitting}
              className="font-black text-sm uppercase tracking-widest py-4 px-10 disabled:opacity-40 self-start"
              style={{ backgroundColor: "var(--tanuki-red)", color: "white" }}
            >
              {submitting ? t.ui.sending : t.lead.cta}
            </button>
          )}
          <button onClick={() => submit({ wants_tasting: false })} disabled={submitting} className="text-xs font-bold uppercase tracking-widest underline self-start" style={{ color: "var(--off-black)" }}>
            {t.lead.skip}
          </button>
        </div>
      </div>
    </div>
  );

  // ── DONE ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--paper)" }}>
      <div className="max-w-2xl mx-auto px-6 py-8 w-full flex-1 flex flex-col justify-between">
        <span className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--tanuki-red)" }}>{t.done.tag}</span>
        <div>
          <div className="text-8xl font-black mb-6 leading-none" style={{ color: "var(--tanuki-red)" }}>✓</div>
          <h2 className="text-5xl md:text-7xl font-black uppercase leading-none mb-8">
            {t.done.title[0]}<br />{t.done.title[1]}
          </h2>
          <p className="text-base whitespace-pre-line mb-4" style={{ color: "var(--off-black)", lineHeight: 1.7 }}>{t.done.body}</p>
          <p className="text-sm font-bold">{t.done.closing}</p>
        </div>
        <div className="border-t-2 pt-8" style={{ borderColor: "var(--line)" }}>
          <a href="/" className="text-xs font-black uppercase tracking-widest border-b-2 pb-0.5" style={{ borderColor: "var(--black)" }}>
            {t.done.back}
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Root export (wraps with i18n provider) ───────────────────────────────────

export default function SurveyPage() {
  return (
    <I18nProvider>
      <SurveyInner />
    </I18nProvider>
  );
}
