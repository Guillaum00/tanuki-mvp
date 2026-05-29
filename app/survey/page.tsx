"use client";

import { useState } from "react";

const TOTAL_Q = 15;

type Answers = {
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
  lead_name: string; lead_company: string;
  lead_email: string; lead_phone: string; lead_team_size: string;
};

const EMPTY: Answers = {
  q1_location: "", q1_other: "", q2_team_size: "", q3_order_frequency: "",
  q4_decision_maker: "", q4_other: "", q5_meal_count: "",
  q6_payment_model: "", q6_other: "",
  q7_payment_methods: [], q7_other: "",
  q8_current_services: [], q8_other: "",
  q9_budget: "", q10_frustrations: [], q10_other: "",
  q11_reaction: "", q12_products: [], q13_trial_drivers: [],
  q14_tasting_interest: "", q15_comments: "",
  lead_name: "", lead_company: "", lead_email: "", lead_phone: "", lead_team_size: "",
};

// Sub-labels for cards
const SUBLABELS: Record<string, Record<string, string>> = {
  q2: { "1–5": "Petite équipe", "6–10": "Équipe standard", "11–20": "Moyenne entreprise", "21–50": "Grande structure", "50+": "Corporate" },
  q5: { "1–5": "Petit groupe", "6–10": "Standard", "11–20": "Équipe", "21–50": "Grande commande", "50+": "Corporate" },
  q9: { "Less than €10": "Budget serré", "€10–12": "Économique", "€13–15": "Standard", "€16–18": "Confort", "€19–22": "Premium", "More than €22": "Haut de gamme" },
  q14: { "Yes": "Je veux tester", "Maybe": "Pourquoi pas", "No": "Pas pour moi" },
};

function Progress({ step }: { step: number }) {
  const pct = Math.round(((step - 1) / TOTAL_Q) * 100);
  return (
    <div className="mb-10 flex items-center gap-5">
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-black leading-none" style={{ color: "var(--tanuki-red)" }}>
          {String(step).padStart(2, "0")}
        </span>
        <span className="text-sm font-bold" style={{ color: "var(--kraft)" }}>/ {TOTAL_Q}</span>
      </div>
      <div className="flex-1 h-px relative" style={{ backgroundColor: "var(--line)" }}>
        <div
          className="absolute top-0 left-0 h-px transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: "var(--tanuki-red)" }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-all duration-500"
          style={{ left: `${pct}%`, backgroundColor: "var(--tanuki-red)", transform: "translate(-50%, -50%)" }}
        />
      </div>
    </div>
  );
}

function Card({ label, sublabel, selected, onClick }: { label: string; sublabel?: string; selected: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const active = selected || hovered;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="text-left border-2 p-5 transition-all duration-100"
      style={{
        borderColor: selected ? "var(--tanuki-red)" : "var(--line)",
        backgroundColor: selected ? "var(--tanuki-red)" : hovered ? "var(--black)" : "transparent",
        color: active ? "white" : "var(--black)",
      }}
    >
      <div className="text-sm font-black uppercase tracking-wide leading-tight">{label}</div>
      {sublabel && <div className="text-xs font-medium mt-1 opacity-70">{sublabel}</div>}
    </button>
  );
}

function CardGrid({ options, value, onChange, sublabels }: {
  options: string[]; value: string; onChange: (v: string) => void; sublabels?: Record<string, string>;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((o) => (
        <Card key={o} label={o} sublabel={sublabels?.[o]} selected={value === o} onClick={() => onChange(o)} />
      ))}
    </div>
  );
}

function MultiGrid({ options, values, onChange, max, sublabels }: {
  options: string[]; values: string[]; onChange: (v: string[]) => void; max?: number; sublabels?: Record<string, string>;
}) {
  function toggle(o: string) {
    if (values.includes(o)) { onChange(values.filter((v) => v !== o)); return; }
    if (max && values.length >= max) return;
    onChange([...values, o]);
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((o) => {
        const [hovered, setHovered] = useState(false);
        const selected = values.includes(o);
        const active = selected || hovered;
        return (
          <button
            key={o}
            onClick={() => toggle(o)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="text-left border-2 p-5 transition-all duration-100"
            style={{
              borderColor: selected ? "var(--tanuki-red)" : "var(--line)",
              backgroundColor: selected ? "var(--tanuki-red)" : hovered ? "var(--black)" : "transparent",
              color: active ? "white" : "var(--black)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-black">{selected ? "✓" : "○"}</span>
              <div>
                <div className="text-sm font-black uppercase tracking-wide">{o}</div>
                {sublabels?.[o] && <div className="text-xs opacity-70 mt-0.5">{sublabels[o]}</div>}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function OtherInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      className="w-full border-b-2 bg-transparent py-3 text-sm font-medium outline-none mt-4"
      style={{ borderColor: "var(--black)" }}
      placeholder="Précisez…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function Cta({ onClick, disabled, label = "Continuer →" }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <div className="mt-10 flex justify-end">
      <button
        onClick={onClick}
        disabled={disabled}
        className="font-black text-sm uppercase tracking-widest py-4 px-8 border-2 transition-all disabled:opacity-25"
        style={{
          borderColor: "var(--black)",
          backgroundColor: "var(--black)",
          color: "white",
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            (e.target as HTMLElement).style.backgroundColor = "var(--tanuki-red)";
            (e.target as HTMLElement).style.borderColor = "var(--tanuki-red)";
          }
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLElement).style.backgroundColor = "var(--black)";
          (e.target as HTMLElement).style.borderColor = "var(--black)";
        }}
      >
        {label}
      </button>
    </div>
  );
}

function Shell({ children, step }: { children: React.ReactNode; step?: number }) {
  return (
    <div className="min-h-screen px-6 py-10" style={{ backgroundColor: "var(--paper)" }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <a href="/" className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--tanuki-red)" }}>← TANUKI</a>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--off-black)" }}>2 minutes</span>
        </div>
        {step !== undefined && <Progress step={step} />}
        {children}
      </div>
    </div>
  );
}

function Question({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-3xl md:text-4xl font-black uppercase leading-tight mb-2" style={{ color: "var(--black)" }}>
      {children}
    </h2>
  );
}

function Context({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium mb-8" style={{ color: "var(--off-black)" }}>{children}</p>;
}

export default function SurveyPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof Answers, v: any) => setAnswers((a) => ({ ...a, [k]: v }));
  const next = () => setStep((s) => s + 1);

  async function submit() {
    setSubmitting(true);
    try {
      await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
    } catch {}
    setSubmitting(false);
    next();
  }

  // LANDING
  if (step === 0) return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--paper)" }}>
      <div className="max-w-2xl mx-auto px-6 py-16 flex-1 flex flex-col justify-between w-full">
        <div>
          <div className="text-xs font-black uppercase tracking-widest mb-16" style={{ color: "var(--tanuki-red)" }}>TANUKI × BRUSSELS</div>
          <h1 className="text-5xl md:text-7xl font-black uppercase leading-none mb-8" style={{ color: "var(--black)" }}>
            HELP US FIX<br />OFFICE<br />LUNCH.
          </h1>
          <p className="text-base max-w-sm mb-10" style={{ color: "var(--off-black)" }}>
            Nous créons un service de lunch pour les bureaux bruxellois. Vos réponses nous aideront à construire quelque chose d&apos;utile.
          </p>
          <div className="space-y-3 mb-12">
            {["2 minutes", "Bureaux bruxellois uniquement", "Opportunités de tastings gratuits"].map((t) => (
              <div key={t} className="flex items-center gap-3 text-sm font-bold">
                <span className="text-xs" style={{ color: "var(--tanuki-red)" }}>✔</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="border-t-2 pt-8 mb-8" style={{ borderColor: "var(--line)" }} />
          <button
            onClick={next}
            className="font-black text-sm uppercase tracking-widest py-4 px-10 border-2 transition-colors"
            style={{ backgroundColor: "var(--tanuki-red)", borderColor: "var(--tanuki-red)", color: "white" }}
          >
            START SURVEY →
          </button>
        </div>
      </div>
    </div>
  );

  // Q1
  if (step === 1) return (
    <Shell step={1}>
      <Question>Où se trouve votre bureau ?</Question>
      <Context>Nous livrons dans des zones précises — cela nous aide à planifier.</Context>
      <CardGrid
        options={["European Quarter", "Louise / Châtelain", "Brussels City Center", "Canal / Tour & Taxis", "Dansaert / Sainte-Catherine", "Saint-Gilles", "Ixelles", "Anderlecht", "Other"]}
        value={answers.q1_location} onChange={(v) => set("q1_location", v)}
      />
      {answers.q1_location === "Other" && <OtherInput value={answers.q1_other} onChange={(v) => set("q1_other", v)} />}
      <Cta onClick={next} disabled={!answers.q1_location || (answers.q1_location === "Other" && !answers.q1_other)} />
    </Shell>
  );

  // Q2
  if (step === 2) return (
    <Shell step={2}>
      <Question>Combien de personnes travaillent au bureau en temps normal ?</Question>
      <Context>Pour calibrer la taille minimale des commandes.</Context>
      <CardGrid options={["1–5", "6–10", "11–20", "21–50", "50+"]} value={answers.q2_team_size} onChange={(v) => set("q2_team_size", v)} sublabels={SUBLABELS.q2} />
      <Cta onClick={next} disabled={!answers.q2_team_size} />
    </Shell>
  );

  // Q3
  if (step === 3) return (
    <Shell step={3}>
      <Question>Combien de fois avez-vous commandé un lunch livré ces 30 derniers jours ?</Question>
      <Context>Nous voulons comprendre votre fréquence actuelle.</Context>
      <CardGrid options={["Never", "1 time", "2–3 times", "4–6 times", "More than 6 times"]} value={answers.q3_order_frequency} onChange={(v) => set("q3_order_frequency", v)} />
      <Cta onClick={next} disabled={!answers.q3_order_frequency} />
    </Shell>
  );

  // Q4
  if (step === 4) return (
    <Shell step={4}>
      <Question>Qui organise les commandes de lunch ?</Question>
      <Context>Pour savoir à qui nous adresser.</Context>
      <CardGrid options={["Office manager", "HR / People team", "Team leader", "Employees organize themselves", "Other"]} value={answers.q4_decision_maker} onChange={(v) => set("q4_decision_maker", v)} />
      {answers.q4_decision_maker === "Other" && <OtherInput value={answers.q4_other} onChange={(v) => set("q4_other", v)} />}
      <Cta onClick={next} disabled={!answers.q4_decision_maker} />
    </Shell>
  );

  // Q5
  if (step === 5) return (
    <Shell step={5}>
      <Question>Combien de repas commandez-vous en général ?</Question>
      <Context>Notre service est optimisé à partir de 10 boxes.</Context>
      <CardGrid options={["1–5", "6–10", "11–20", "21–50", "50+"]} value={answers.q5_meal_count} onChange={(v) => set("q5_meal_count", v)} sublabels={SUBLABELS.q5} />
      <Cta onClick={next} disabled={!answers.q5_meal_count} />
    </Shell>
  );

  // Q6
  if (step === 6) return (
    <Shell step={6}>
      <Question>Comment le lunch est-il payé ?</Question>
      <Context>Cela nous aide à concevoir notre modèle de facturation.</Context>
      <CardGrid options={["Company pays everything", "Employees pay individually", "Mixed", "Depends on occasion", "We rarely order lunch", "Other"]} value={answers.q6_payment_model} onChange={(v) => set("q6_payment_model", v)} />
      {answers.q6_payment_model === "Other" && <OtherInput value={answers.q6_other} onChange={(v) => set("q6_other", v)} />}
      <Cta onClick={next} disabled={!answers.q6_payment_model} />
    </Shell>
  );

  // Q7
  if (step === 7) return (
    <Shell step={7}>
      <Question>Quels moyens de paiement utilisez-vous ?</Question>
      <Context>Sélectionnez tout ce qui s&apos;applique.</Context>
      <MultiGrid options={["Company invoice", "Company credit card", "Individual online payment", "Meal vouchers", "Bank transfer", "Other"]} values={answers.q7_payment_methods} onChange={(v) => set("q7_payment_methods", v)} />
      {answers.q7_payment_methods.includes("Other") && <OtherInput value={answers.q7_other} onChange={(v) => set("q7_other", v)} />}
      <Cta onClick={next} disabled={answers.q7_payment_methods.length === 0} />
    </Shell>
  );

  // Q8
  if (step === 8) return (
    <Shell step={8}>
      <Question>Quels services utilisez-vous actuellement ?</Question>
      <Context>Sélectionnez tout ce qui s&apos;applique.</Context>
      <MultiGrid options={["Uber Eats", "Deliveroo", "Catering company", "Local sandwich shop", "Employees bring lunch from home", "Other"]} values={answers.q8_current_services} onChange={(v) => set("q8_current_services", v)} />
      {answers.q8_current_services.includes("Other") && <OtherInput value={answers.q8_other} onChange={(v) => set("q8_other", v)} />}
      <Cta onClick={next} disabled={answers.q8_current_services.length === 0} />
    </Shell>
  );

  // Q9
  if (step === 9) return (
    <Shell step={9}>
      <Question>Quel budget par personne pour un lunch livré ?</Question>
      <Context>Notre box est à 15,50 € — livraison incluse dès 10 boxes.</Context>
      <CardGrid options={["Less than €10", "€10–12", "€13–15", "€16–18", "€19–22", "More than €22"]} value={answers.q9_budget} onChange={(v) => set("q9_budget", v)} sublabels={SUBLABELS.q9} />
      <Cta onClick={next} disabled={!answers.q9_budget} />
    </Shell>
  );

  // Q10
  if (step === 10) return (
    <Shell step={10}>
      <Question>Qu&apos;est-ce qui vous frustre le plus dans les commandes de lunch ?</Question>
      <Context>Choisissez jusqu&apos;à 3 réponses.</Context>
      <MultiGrid max={3} options={["Food quality", "Lack of healthy options", "Lack of vegetarian options", "Delivery fees", "Late deliveries", "Complicated ordering process", "Limited choice", "Packaging waste", "Inconsistent quality", "Poor customer service", "Other"]} values={answers.q10_frustrations} onChange={(v) => set("q10_frustrations", v)} />
      {answers.q10_frustrations.includes("Other") && <OtherInput value={answers.q10_other} onChange={(v) => set("q10_other", v)} />}
      <Cta onClick={next} disabled={answers.q10_frustrations.length === 0} />
    </Shell>
  );

  // Q11
  if (step === 11) return (
    <Shell step={11}>
      <Question>Comment votre équipe réagirait à ce système ?</Question>
      <div className="border-l-4 pl-4 mb-8" style={{ borderColor: "var(--tanuki-red)" }}>
        <p className="text-sm font-medium" style={{ color: "var(--off-black)" }}>
          Commande avant 16h la veille · Livraison un jour fixe · Gratuit dès 10 boxes
        </p>
      </div>
      <CardGrid options={["We would probably use it", "We would try it if pricing is competitive", "We would use it for team lunches only", "We already have a solution", "We are unlikely to use a service like this"]} value={answers.q11_reaction} onChange={(v) => set("q11_reaction", v)} />
      <Cta onClick={next} disabled={!answers.q11_reaction} />
    </Shell>
  );

  // Q12
  if (step === 12) return (
    <Shell step={12}>
      <Question>Quels produits intéresseraient votre équipe ?</Question>
      <Context>Sélectionnez tout ce qui s&apos;applique.</Context>
      <MultiGrid options={["Sandos", "Slaws", "Cookies", "Soft drinks", "Tea", "Breakfast delivery", "Meeting catering boxes", "Sharing platters", "Seasonal specials"]} values={answers.q12_products} onChange={(v) => set("q12_products", v)} />
      <Cta onClick={next} disabled={answers.q12_products.length === 0} />
    </Shell>
  );

  // Q13
  if (step === 13) return (
    <Shell step={13}>
      <Question>Qu&apos;est-ce qui vous ferait tester un nouveau service ?</Question>
      <Context>Choisissez jusqu&apos;à 2 réponses.</Context>
      <MultiGrid max={2} options={["Free tasting", "Better food quality", "More original menu", "Better value for money", "Easier group ordering", "Free delivery", "Healthier options", "Better vegetarian options"]} values={answers.q13_trial_drivers} onChange={(v) => set("q13_trial_drivers", v)} />
      <Cta onClick={next} disabled={answers.q13_trial_drivers.length === 0} />
    </Shell>
  );

  // Q14
  if (step === 14) return (
    <Shell step={14}>
      <Question>Un tasting gratuit pour votre équipe vous intéresserait ?</Question>
      <Context>Nous organisons des sessions de dégustation avant le lancement.</Context>
      <CardGrid options={["Yes", "Maybe", "No"]} value={answers.q14_tasting_interest} onChange={(v) => set("q14_tasting_interest", v)} sublabels={SUBLABELS.q14} />
      <Cta onClick={next} disabled={!answers.q14_tasting_interest} />
    </Shell>
  );

  // Q15
  if (step === 15) return (
    <Shell step={15}>
      <Question>Autre chose que vous aimeriez voir ?</Question>
      <Context>Optionnel — mais toujours utile.</Context>
      <textarea
        className="w-full border-2 bg-transparent py-4 px-4 text-sm font-medium outline-none resize-none"
        style={{ borderColor: "var(--line)", minHeight: "140px" }}
        placeholder="Partagez vos idées…"
        value={answers.q15_comments}
        onChange={(e) => set("q15_comments", e.target.value)}
      />
      <Cta onClick={next} label="Continuer →" />
    </Shell>
  );

  // LEAD CAPTURE
  if (step === 16) return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--paper)" }}>
      <div className="max-w-2xl mx-auto px-6 py-16 w-full flex-1 flex flex-col justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-widest mb-12" style={{ color: "var(--tanuki-red)" }}>TANUKI × BRUSSELS</div>
          <h2 className="text-4xl md:text-5xl font-black uppercase leading-none mb-4">MERCI POUR<br />VOS RÉPONSES.</h2>
          <p className="text-base mb-10" style={{ color: "var(--off-black)" }}>
            Vous voulez être invité à nos premiers tastings ?
          </p>
          <div className="space-y-4 mb-8">
            {[
              { key: "lead_name", label: "Votre nom", type: "text" },
              { key: "lead_company", label: "Entreprise", type: "text" },
              { key: "lead_email", label: "Email", type: "email" },
              { key: "lead_phone", label: "Téléphone (optionnel)", type: "tel" },
              { key: "lead_team_size", label: "Taille de l'équipe", type: "text" },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{ color: "var(--off-black)" }}>{label}</label>
                <input
                  type={type}
                  className="w-full border-b-2 bg-transparent py-3 text-sm font-medium outline-none"
                  style={{ borderColor: "var(--line)" }}
                  value={(answers as any)[key]}
                  onChange={(e) => set(key as keyof Answers, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="border-t-2 pt-8 space-y-4" style={{ borderColor: "var(--line)" }}>
          <button
            onClick={submit}
            disabled={submitting}
            className="font-black text-sm uppercase tracking-widest py-4 px-10 border-2 disabled:opacity-40 transition-colors"
            style={{ backgroundColor: "var(--tanuki-red)", borderColor: "var(--tanuki-red)", color: "white" }}
          >
            {submitting ? "Envoi…" : "JOIN THE EARLY ACCESS LIST →"}
          </button>
          <div>
            <button onClick={submit} disabled={submitting} className="text-xs font-bold uppercase tracking-widest underline" style={{ color: "var(--off-black)" }}>
              Skip — just submit my answers
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // DONE
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: "var(--paper)" }}>
      <div className="max-w-2xl w-full">
        <div className="text-xs font-black uppercase tracking-widest mb-12" style={{ color: "var(--tanuki-red)" }}>TANUKI × BRUSSELS</div>
        <div className="text-8xl font-black mb-6" style={{ color: "var(--tanuki-red)" }}>✓</div>
        <h2 className="text-5xl font-black uppercase leading-none mb-6">C&apos;EST<br />NOTÉ.</h2>
        <p className="text-base mb-2" style={{ color: "var(--off-black)" }}>Merci pour votre temps.</p>
        <p className="text-sm mb-12" style={{ color: "var(--off-black)" }}>Nous reviendrons vers vous pour les tastings.</p>
        <a href="/" className="text-xs font-black uppercase tracking-widest border-b-2 pb-1" style={{ borderColor: "var(--black)" }}>
          ← Retour Tanuki
        </a>
      </div>
    </div>
  );
}
