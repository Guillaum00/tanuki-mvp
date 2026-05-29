"use client";

import { useState } from "react";

const TOTAL_STEPS = 17; // 15 questions + lead + done

type Answers = {
  q1_location: string;
  q1_other: string;
  q2_team_size: string;
  q3_order_frequency: string;
  q4_decision_maker: string;
  q4_other: string;
  q5_meal_count: string;
  q6_payment_model: string;
  q6_other: string;
  q7_payment_methods: string[];
  q7_other: string;
  q8_current_services: string[];
  q8_other: string;
  q9_budget: string;
  q10_frustrations: string[];
  q10_other: string;
  q11_reaction: string;
  q12_products: string[];
  q13_trial_drivers: string[];
  q14_tasting_interest: string;
  q15_comments: string;
  lead_name: string;
  lead_company: string;
  lead_email: string;
  lead_phone: string;
  lead_team_size: string;
};

const EMPTY: Answers = {
  q1_location: "", q1_other: "",
  q2_team_size: "",
  q3_order_frequency: "",
  q4_decision_maker: "", q4_other: "",
  q5_meal_count: "",
  q6_payment_model: "", q6_other: "",
  q7_payment_methods: [], q7_other: "",
  q8_current_services: [], q8_other: "",
  q9_budget: "",
  q10_frustrations: [], q10_other: "",
  q11_reaction: "",
  q12_products: [],
  q13_trial_drivers: [],
  q14_tasting_interest: "",
  q15_comments: "",
  lead_name: "", lead_company: "", lead_email: "", lead_phone: "", lead_team_size: "",
};

function ProgressBar({ step }: { step: number }) {
  const pct = Math.round(((step - 1) / (TOTAL_STEPS - 2)) * 100);
  if (step <= 0 || step >= TOTAL_STEPS) return null;
  return (
    <div className="mb-8">
      <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--off-black)" }}>
        <span>Question {step} / 15</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1 w-full rounded-full" style={{ backgroundColor: "var(--line)" }}>
        <div className="h-1 rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: "var(--tanuki-red)" }} />
      </div>
    </div>
  );
}

function Radio({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-3">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className="w-full text-left border-2 py-4 px-5 text-sm font-bold transition-all"
          style={{
            borderColor: value === o ? "var(--tanuki-red)" : "var(--line)",
            backgroundColor: value === o ? "var(--tanuki-red)" : "transparent",
            color: value === o ? "white" : "var(--black)",
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function MultiSelect({ options, values, onChange, max }: { options: string[]; values: string[]; onChange: (v: string[]) => void; max?: number }) {
  function toggle(o: string) {
    if (values.includes(o)) {
      onChange(values.filter((v) => v !== o));
    } else {
      if (max && values.length >= max) return;
      onChange([...values, o]);
    }
  }
  return (
    <div className="space-y-3">
      {options.map((o) => {
        const selected = values.includes(o);
        return (
          <button
            key={o}
            onClick={() => toggle(o)}
            className="w-full text-left border-2 py-4 px-5 text-sm font-bold transition-all flex items-center gap-3"
            style={{
              borderColor: selected ? "var(--tanuki-red)" : "var(--line)",
              backgroundColor: selected ? "var(--tanuki-red)" : "transparent",
              color: selected ? "white" : "var(--black)",
            }}
          >
            <span className="text-xs">{selected ? "✓" : "○"}</span>
            {o}
          </button>
        );
      })}
    </div>
  );
}

function OtherField({ label = "Précisez", value, onChange }: { label?: string; value: string; onChange: (v: string) => void }) {
  return (
    <input
      className="w-full border-2 bg-transparent py-3 px-4 text-sm font-medium outline-none mt-3"
      style={{ borderColor: "var(--line)" }}
      placeholder={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function NextBtn({ onClick, disabled, label = "Continuer →" }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <div className="sticky bottom-0 pt-6 pb-2" style={{ backgroundColor: "var(--paper)" }}>
      <button
        onClick={onClick}
        disabled={disabled}
        className="w-full font-black text-sm uppercase tracking-widest py-5 text-white disabled:opacity-30"
        style={{ backgroundColor: "var(--tanuki-red)" }}
      >
        {label}
      </button>
    </div>
  );
}

export default function SurveyPage() {
  const [step, setStep] = useState(0); // 0 = landing
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k: keyof Answers, v: any) => setAnswers((a) => ({ ...a, [k]: v }));
  const next = () => setStep((s) => s + 1);
  const skip = () => setStep((s) => s + 1);

  async function handleLeadSubmit() {
    setSubmitting(true);
    try {
      await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
    } catch {}
    setSubmitting(false);
    setStep(TOTAL_STEPS - 1);
  }

  const wrap = (content: React.ReactNode, stepNum?: number) => (
    <div className="min-h-screen flex flex-col px-6 py-8" style={{ backgroundColor: "var(--paper)" }}>
      <div className="text-xs font-black uppercase tracking-widest mb-8" style={{ color: "var(--tanuki-red)" }}>TANUKI</div>
      {stepNum !== undefined && <ProgressBar step={stepNum} />}
      <div className="flex-1 flex flex-col justify-between">
        {content}
      </div>
    </div>
  );

  // LANDING
  if (step === 0) return wrap(
    <>
      <div>
        <h1 className="text-5xl font-black uppercase leading-none mb-6">HELP US FIX OFFICE LUNCH.</h1>
        <p className="text-base mb-8" style={{ color: "var(--off-black)" }}>
          We&apos;re building a new lunch delivery service for Brussels offices. Take our 2-minute survey and help shape the launch.
        </p>
        <div className="space-y-2 mb-10">
          {["2 minutes", "Brussels offices only", "Free tasting opportunities"].map((t) => (
            <div key={t} className="flex items-center gap-3 text-sm font-bold">
              <span style={{ color: "var(--tanuki-red)" }}>✔</span> {t}
            </div>
          ))}
        </div>
      </div>
      <NextBtn onClick={next} label="START SURVEY →" />
    </>
  );

  // Q1 — Location
  if (step === 1) return wrap(
    <>
      <div>
        <h2 className="text-3xl font-black uppercase mb-8">Where is your office located?</h2>
        <Radio
          options={["European Quarter", "Louise / Châtelain", "Brussels City Center", "Canal / Tour & Taxis", "Dansaert / Sainte-Catherine", "Saint-Gilles", "Ixelles", "Anderlecht", "Other"]}
          value={answers.q1_location}
          onChange={(v) => set("q1_location", v)}
        />
        {answers.q1_location === "Other" && (
          <OtherField value={answers.q1_other} onChange={(v) => set("q1_other", v)} />
        )}
      </div>
      <NextBtn onClick={next} disabled={!answers.q1_location || (answers.q1_location === "Other" && !answers.q1_other)} />
    </>,
    1
  );

  // Q2 — Team size
  if (step === 2) return wrap(
    <>
      <div>
        <h2 className="text-3xl font-black uppercase mb-8">How many people work from your office on a typical day?</h2>
        <Radio
          options={["1–5", "6–10", "11–20", "21–50", "50+"]}
          value={answers.q2_team_size}
          onChange={(v) => set("q2_team_size", v)}
        />
      </div>
      <NextBtn onClick={next} disabled={!answers.q2_team_size} />
    </>,
    2
  );

  // Q3 — Order frequency
  if (step === 3) return wrap(
    <>
      <div>
        <h2 className="text-3xl font-black uppercase mb-3">How often did your team order delivered lunch in the last 30 days?</h2>
        <Radio
          options={["Never", "1 time", "2–3 times", "4–6 times", "More than 6 times"]}
          value={answers.q3_order_frequency}
          onChange={(v) => set("q3_order_frequency", v)}
        />
      </div>
      <NextBtn onClick={next} disabled={!answers.q3_order_frequency} />
    </>,
    3
  );

  // Q4 — Decision maker
  if (step === 4) return wrap(
    <>
      <div>
        <h2 className="text-3xl font-black uppercase mb-8">Who usually organizes lunch orders?</h2>
        <Radio
          options={["Office manager", "HR / People team", "Team leader", "Employees organize themselves", "Other"]}
          value={answers.q4_decision_maker}
          onChange={(v) => set("q4_decision_maker", v)}
        />
        {answers.q4_decision_maker === "Other" && (
          <OtherField value={answers.q4_other} onChange={(v) => set("q4_other", v)} />
        )}
      </div>
      <NextBtn onClick={next} disabled={!answers.q4_decision_maker} />
    </>,
    4
  );

  // Q5 — Meal count
  if (step === 5) return wrap(
    <>
      <div>
        <h2 className="text-3xl font-black uppercase mb-8">When your team orders, how many meals are usually included?</h2>
        <Radio
          options={["1–5", "6–10", "11–20", "21–50", "50+"]}
          value={answers.q5_meal_count}
          onChange={(v) => set("q5_meal_count", v)}
        />
      </div>
      <NextBtn onClick={next} disabled={!answers.q5_meal_count} />
    </>,
    5
  );

  // Q6 — Payment model
  if (step === 6) return wrap(
    <>
      <div>
        <h2 className="text-3xl font-black uppercase mb-8">How are office lunches usually paid for?</h2>
        <Radio
          options={["Company pays everything", "Employees pay individually", "Mixed", "Depends on occasion", "We rarely order lunch", "Other"]}
          value={answers.q6_payment_model}
          onChange={(v) => set("q6_payment_model", v)}
        />
        {answers.q6_payment_model === "Other" && (
          <OtherField value={answers.q6_other} onChange={(v) => set("q6_other", v)} />
        )}
      </div>
      <NextBtn onClick={next} disabled={!answers.q6_payment_model} />
    </>,
    6
  );

  // Q7 — Payment methods (multi)
  if (step === 7) return wrap(
    <>
      <div>
        <h2 className="text-3xl font-black uppercase mb-3">Which payment methods are typically used?</h2>
        <p className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: "var(--off-black)" }}>Plusieurs réponses possibles</p>
        <MultiSelect
          options={["Company invoice", "Company credit card", "Individual online payment", "Meal vouchers", "Bank transfer", "Other"]}
          values={answers.q7_payment_methods}
          onChange={(v) => set("q7_payment_methods", v)}
        />
        {answers.q7_payment_methods.includes("Other") && (
          <OtherField value={answers.q7_other} onChange={(v) => set("q7_other", v)} />
        )}
      </div>
      <NextBtn onClick={next} disabled={answers.q7_payment_methods.length === 0} />
    </>,
    7
  );

  // Q8 — Current services (multi)
  if (step === 8) return wrap(
    <>
      <div>
        <h2 className="text-3xl font-black uppercase mb-3">Which services do you currently use?</h2>
        <p className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: "var(--off-black)" }}>Plusieurs réponses possibles</p>
        <MultiSelect
          options={["Uber Eats", "Deliveroo", "Catering company", "Local sandwich shop", "Employees bring lunch from home", "Other"]}
          values={answers.q8_current_services}
          onChange={(v) => set("q8_current_services", v)}
        />
        {answers.q8_current_services.includes("Other") && (
          <OtherField value={answers.q8_other} onChange={(v) => set("q8_other", v)} />
        )}
      </div>
      <NextBtn onClick={next} disabled={answers.q8_current_services.length === 0} />
    </>,
    8
  );

  // Q9 — Budget
  if (step === 9) return wrap(
    <>
      <div>
        <h2 className="text-3xl font-black uppercase mb-8">What&apos;s your usual budget per person for a delivered lunch?</h2>
        <Radio
          options={["Less than €10", "€10–12", "€13–15", "€16–18", "€19–22", "More than €22"]}
          value={answers.q9_budget}
          onChange={(v) => set("q9_budget", v)}
        />
      </div>
      <NextBtn onClick={next} disabled={!answers.q9_budget} />
    </>,
    9
  );

  // Q10 — Frustrations (multi, max 3)
  if (step === 10) return wrap(
    <>
      <div>
        <h2 className="text-3xl font-black uppercase mb-3">What frustrates you most about office lunch ordering?</h2>
        <p className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: "var(--off-black)" }}>Choisissez jusqu&apos;à 3</p>
        <MultiSelect
          options={["Food quality", "Lack of healthy options", "Lack of vegetarian options", "Delivery fees", "Late deliveries", "Complicated ordering process", "Limited choice", "Packaging waste", "Inconsistent quality", "Poor customer service", "Other"]}
          values={answers.q10_frustrations}
          onChange={(v) => set("q10_frustrations", v)}
          max={3}
        />
        {answers.q10_frustrations.includes("Other") && (
          <OtherField value={answers.q10_other} onChange={(v) => set("q10_other", v)} />
        )}
      </div>
      <NextBtn onClick={next} disabled={answers.q10_frustrations.length === 0} />
    </>,
    10
  );

  // Q11 — Reaction
  if (step === 11) return wrap(
    <>
      <div>
        <h2 className="text-3xl font-black uppercase mb-4">How would your team react to this?</h2>
        <div className="border-2 p-4 mb-6 text-sm font-medium" style={{ borderColor: "var(--kraft)", backgroundColor: "var(--kraft)", opacity: 0.6 }}>
          Order before 4PM the day before. Delivery on a fixed weekday. Free delivery from 10 lunches.
        </div>
        <Radio
          options={["We would probably use it", "We would try it if pricing is competitive", "We would use it for team lunches only", "We already have a solution", "We are unlikely to use a service like this"]}
          value={answers.q11_reaction}
          onChange={(v) => set("q11_reaction", v)}
        />
      </div>
      <NextBtn onClick={next} disabled={!answers.q11_reaction} />
    </>,
    11
  );

  // Q12 — Products (multi)
  if (step === 12) return wrap(
    <>
      <div>
        <h2 className="text-3xl font-black uppercase mb-3">Which products would interest your team?</h2>
        <p className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: "var(--off-black)" }}>Plusieurs réponses possibles</p>
        <MultiSelect
          options={["Sandos", "Slaws", "Cookies", "Soft drinks", "Tea", "Breakfast delivery", "Meeting catering boxes", "Sharing platters", "Seasonal specials"]}
          values={answers.q12_products}
          onChange={(v) => set("q12_products", v)}
        />
      </div>
      <NextBtn onClick={next} disabled={answers.q12_products.length === 0} />
    </>,
    12
  );

  // Q13 — Trial drivers (multi, max 2)
  if (step === 13) return wrap(
    <>
      <div>
        <h2 className="text-3xl font-black uppercase mb-3">What would make you try a new office lunch service?</h2>
        <p className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: "var(--off-black)" }}>Choisissez jusqu&apos;à 2</p>
        <MultiSelect
          options={["Free tasting", "Better food quality", "More original menu", "Better value for money", "Easier group ordering", "Free delivery", "Healthier options", "Better vegetarian options"]}
          values={answers.q13_trial_drivers}
          onChange={(v) => set("q13_trial_drivers", v)}
          max={2}
        />
      </div>
      <NextBtn onClick={next} disabled={answers.q13_trial_drivers.length === 0} />
    </>,
    13
  );

  // Q14 — Tasting interest
  if (step === 14) return wrap(
    <>
      <div>
        <h2 className="text-3xl font-black uppercase mb-8">Would you be interested in a free tasting for your team?</h2>
        <Radio
          options={["Yes", "Maybe", "No"]}
          value={answers.q14_tasting_interest}
          onChange={(v) => set("q14_tasting_interest", v)}
        />
      </div>
      <NextBtn onClick={next} disabled={!answers.q14_tasting_interest} />
    </>,
    14
  );

  // Q15 — Comments
  if (step === 15) return wrap(
    <>
      <div>
        <h2 className="text-3xl font-black uppercase mb-3">Anything else you&apos;d like to see?</h2>
        <p className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: "var(--off-black)" }}>Optionnel</p>
        <textarea
          className="w-full border-2 bg-transparent py-3 px-4 text-sm font-medium outline-none resize-none"
          style={{ borderColor: "var(--line)", minHeight: "120px" }}
          placeholder="Partagez vos idées…"
          value={answers.q15_comments}
          onChange={(e) => set("q15_comments", e.target.value)}
        />
      </div>
      <NextBtn onClick={next} label="Continuer →" />
    </>,
    15
  );

  // LEAD CAPTURE
  if (step === 16) return wrap(
    <>
      <div>
        <h2 className="text-4xl font-black uppercase mb-3">THANKS FOR YOUR FEEDBACK.</h2>
        <p className="text-base mb-8" style={{ color: "var(--off-black)" }}>
          Want to be invited to our first tastings?
        </p>
        <div className="space-y-4">
          {[
            { key: "lead_name", placeholder: "Your name" },
            { key: "lead_company", placeholder: "Company" },
            { key: "lead_email", placeholder: "Email", type: "email" },
            { key: "lead_phone", placeholder: "Phone (optional)" },
            { key: "lead_team_size", placeholder: "Team size" },
          ].map(({ key, placeholder, type }) => (
            <input
              key={key}
              type={type || "text"}
              className="w-full border-2 bg-transparent py-3 px-4 text-sm font-medium outline-none"
              style={{ borderColor: "var(--line)" }}
              placeholder={placeholder}
              value={(answers as any)[key]}
              onChange={(e) => set(key as keyof Answers, e.target.value)}
            />
          ))}
        </div>
      </div>
      <div className="sticky bottom-0 pt-6 pb-2 space-y-3" style={{ backgroundColor: "var(--paper)" }}>
        <button
          onClick={handleLeadSubmit}
          disabled={submitting}
          className="w-full font-black text-sm uppercase tracking-widest py-5 text-white disabled:opacity-40"
          style={{ backgroundColor: "var(--tanuki-red)" }}
        >
          {submitting ? "Envoi…" : "JOIN THE EARLY ACCESS LIST →"}
        </button>
        <button
          onClick={handleLeadSubmit}
          disabled={submitting}
          className="w-full text-xs font-bold uppercase py-3 underline"
          style={{ color: "var(--off-black)" }}
        >
          Skip — just submit my answers
        </button>
      </div>
    </>
  );

  // DONE
  return wrap(
    <div className="flex-1 flex flex-col justify-center text-center">
      <div className="text-6xl mb-6">✓</div>
      <h2 className="text-4xl font-black uppercase mb-4">C&apos;est noté.</h2>
      <p className="text-base mb-2" style={{ color: "var(--off-black)" }}>
        Merci pour votre temps.
      </p>
      <p className="text-sm mb-10" style={{ color: "var(--off-black)" }}>
        We&apos;ll be in touch for tastings.
      </p>
      <a
        href="/"
        className="inline-block font-bold text-sm uppercase tracking-widest py-3 px-6 border-2"
        style={{ borderColor: "var(--black)" }}
      >
        ← Retour Tanuki
      </a>
    </div>
  );
}
