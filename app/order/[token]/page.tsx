"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TeamOrder } from "@/lib/supabase";
import { MENU, formatDate, isCutoffPassed } from "@/lib/menu";

type Step = "intro" | "name" | "edit-name" | "sando" | "slaw" | "cookie" | "tea" | "recap" | "done" | "closed";

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full"
          style={{ backgroundColor: i < step ? "var(--tanuki-red)" : "var(--line)" }}
        />
      ))}
    </div>
  );
}

function ChoiceCard({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="w-full text-left border-2 p-5 text-base font-bold transition-all"
      style={{
        borderColor: selected ? "var(--tanuki-red)" : "var(--line)",
        backgroundColor: selected ? "var(--tanuki-red)" : "transparent",
        color: selected ? "white" : "var(--black)",
      }}
    >
      {label}
    </button>
  );
}

export default function OrderPage() {
  const { token } = useParams<{ token: string }>();

  const [order, setOrder] = useState<TeamOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>("intro");
  const [name, setName] = useState("");
  const [editName, setEditName] = useState("");
  const [sando, setSando] = useState("");
  const [slaw, setSlaw] = useState("");
  const [cookie, setCookie] = useState("");
  const [tea, setTea] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/order-by-token?token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        setOrder(d.order ?? null);
        setLoading(false);
        if (d.order && isCutoffPassed(d.order.cutoff_at)) setStep("closed");
        if (d.order?.status === "paid" || d.order?.status === "cancelled") setStep("closed");
      });
  }, [token]);

  async function handleSubmit() {
    if (!order) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/boxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team_order_id: order.id, person_name: name, sando, slaw, cookie, tea }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setStep("done");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFindBox() {
    if (!order || !editName.trim()) return;
    const res = await fetch(`/api/boxes/by-name?team_order_id=${order.id}&person_name=${encodeURIComponent(editName.trim())}`);
    const data = await res.json();
    if (data.box) {
      setName(data.box.person_name);
      setSando(data.box.sando);
      setSlaw(data.box.slaw);
      setCookie(data.box.cookie);
      setTea(data.box.tea);
      setStep("sando");
    } else {
      setError("Aucune box trouvée pour ce prénom.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--paper)" }}>
        <p className="font-bold uppercase tracking-widest text-sm">Chargement…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: "var(--paper)" }}>
        <p className="font-black text-2xl uppercase mb-2">Lien invalide</p>
        <p className="text-sm">Ce lien de commande n&apos;existe pas.</p>
      </div>
    );
  }

  // CLOSED
  if (step === "closed") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: "var(--paper)" }}>
        <div className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "var(--tanuki-red)" }}>TANUKI</div>
        <p className="font-black text-3xl uppercase mb-4">Commandes clôturées</p>
        <p className="text-sm max-w-xs">Les choix pour cette commande ne sont plus acceptés.</p>
      </div>
    );
  }

  // DONE
  if (step === "done") {
    return (
      <div className="min-h-screen flex flex-col px-6 py-12" style={{ backgroundColor: "var(--paper)" }}>
        <div className="text-xs font-black uppercase tracking-widest mb-12" style={{ color: "var(--tanuki-red)" }}>TANUKI</div>
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-5xl font-black uppercase mb-4">C&apos;est noté.</h1>
          <p className="text-xl font-bold mb-2">Votre box est enregistrée.</p>
          <p className="text-sm mb-10" style={{ color: "var(--off-black)" }}>
            Vous pouvez modifier votre choix jusqu&apos;à 16h00 la veille.
          </p>
          <div className="border-2 p-6 mb-10" style={{ borderColor: "var(--line)" }}>
            <p className="font-black uppercase text-lg mb-3">{name}</p>
            <p className="text-sm font-medium">{sando}</p>
            <p className="text-sm font-medium">{slaw}</p>
            <p className="text-sm font-medium">{cookie}</p>
            <p className="text-sm font-medium">{tea}</p>
          </div>
          <button
            onClick={() => setStep("sando")}
            className="w-full border-2 font-bold text-sm uppercase tracking-widest py-4"
            style={{ borderColor: "var(--black)" }}
          >
            Modifier ma box
          </button>
        </div>
      </div>
    );
  }

  // INTRO
  if (step === "intro") {
    return (
      <div className="min-h-screen flex flex-col px-6 py-12" style={{ backgroundColor: "var(--paper)" }}>
        <div className="text-xs font-black uppercase tracking-widest mb-12" style={{ color: "var(--tanuki-red)" }}>TANUKI</div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-black uppercase mb-6">
              {order.manager_name.split(" ")[0]} vous invite à composer votre box Tanuki.
            </h1>
            <div className="border-t-2 border-b-2 py-4 mb-8 space-y-1 text-sm font-medium" style={{ borderColor: "var(--line)" }}>
              <p className="capitalize">{formatDate(order.delivery_date)}</p>
              <p>{order.company_name}</p>
              <p style={{ color: "var(--off-black)" }}>{order.delivery_address}</p>
            </div>
          </div>
          <div>
            <button
              onClick={() => setStep("name")}
              className="w-full font-black text-sm uppercase tracking-widest py-5 text-white"
              style={{ backgroundColor: "var(--tanuki-red)" }}
            >
              Composer ma box →
            </button>
            <button
              onClick={() => setStep("edit-name")}
              className="w-full text-xs font-bold uppercase tracking-widest mt-3 py-3 underline"
              style={{ color: "var(--off-black)" }}
            >
              Modifier une box déjà envoyée
            </button>
          </div>
        </div>
      </div>
    );
  }

  // EDIT NAME (modifier)
  if (step === "edit-name") {
    return (
      <div className="min-h-screen flex flex-col px-6 py-12" style={{ backgroundColor: "var(--paper)" }}>
        <div className="text-xs font-black uppercase tracking-widest mb-12" style={{ color: "var(--tanuki-red)" }}>TANUKI</div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase mb-8">Retrouver ma box</h1>
            <label className="block text-xs font-black uppercase tracking-widest mb-3">Votre prénom (exact)</label>
            <input
              className="w-full border-2 bg-transparent py-4 px-4 text-xl font-bold outline-none"
              style={{ borderColor: "var(--line)" }}
              placeholder="Lucas"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFindBox()}
            />
            {error && <p className="text-sm font-bold mt-3" style={{ color: "var(--tanuki-red)" }}>{error}</p>}
          </div>
          <div className="sticky bottom-6 space-y-3">
            <button
              disabled={!editName.trim()}
              onClick={handleFindBox}
              className="w-full font-black text-sm uppercase tracking-widest py-5 text-white disabled:opacity-40"
              style={{ backgroundColor: "var(--tanuki-red)" }}
            >
              Retrouver ma box →
            </button>
            <button onClick={() => { setStep("intro"); setError(""); }} className="w-full text-xs font-bold uppercase py-3 underline">
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  // NAME
  if (step === "name") {
    return (
      <div className="min-h-screen flex flex-col px-6 py-12" style={{ backgroundColor: "var(--paper)" }}>
        <ProgressBar step={1} total={5} />
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase mb-8">Votre prénom</h1>
            <input
              className="w-full border-2 bg-transparent py-4 px-4 text-2xl font-bold outline-none"
              style={{ borderColor: "var(--line)" }}
              placeholder="Lucas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep("sando")}
              autoFocus
            />
          </div>
          <div className="sticky bottom-6">
            <button
              disabled={!name.trim()}
              onClick={() => setStep("sando")}
              className="w-full font-black text-sm uppercase tracking-widest py-5 text-white disabled:opacity-40"
              style={{ backgroundColor: "var(--tanuki-red)" }}
            >
              Continuer →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SANDO
  if (step === "sando") {
    return (
      <div className="min-h-screen flex flex-col px-6 py-12" style={{ backgroundColor: "var(--paper)" }}>
        <ProgressBar step={2} total={5} />
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "var(--off-black)" }}>Étape 1/4</p>
            <h1 className="text-3xl font-black uppercase mb-8">Choisissez votre sando</h1>
            <div className="space-y-3">
              {MENU.sandos.map((s) => (
                <ChoiceCard key={s} label={s} selected={sando === s} onSelect={() => setSando(s)} />
              ))}
            </div>
          </div>
          <div className="sticky bottom-6 mt-8">
            <button
              disabled={!sando}
              onClick={() => setStep("slaw")}
              className="w-full font-black text-sm uppercase tracking-widest py-5 text-white disabled:opacity-40"
              style={{ backgroundColor: "var(--tanuki-red)" }}
            >
              Continuer →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SLAW
  if (step === "slaw") {
    return (
      <div className="min-h-screen flex flex-col px-6 py-12" style={{ backgroundColor: "var(--paper)" }}>
        <ProgressBar step={3} total={5} />
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "var(--off-black)" }}>Étape 2/4</p>
            <h1 className="text-3xl font-black uppercase mb-8">Choisissez votre slaw</h1>
            <div className="space-y-3">
              {MENU.slaws.map((s) => (
                <ChoiceCard key={s} label={s} selected={slaw === s} onSelect={() => setSlaw(s)} />
              ))}
            </div>
          </div>
          <div className="sticky bottom-6 mt-8">
            <button
              disabled={!slaw}
              onClick={() => setStep("cookie")}
              className="w-full font-black text-sm uppercase tracking-widest py-5 text-white disabled:opacity-40"
              style={{ backgroundColor: "var(--tanuki-red)" }}
            >
              Continuer →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // COOKIE
  if (step === "cookie") {
    return (
      <div className="min-h-screen flex flex-col px-6 py-12" style={{ backgroundColor: "var(--paper)" }}>
        <ProgressBar step={4} total={5} />
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "var(--off-black)" }}>Étape 3/4</p>
            <h1 className="text-3xl font-black uppercase mb-8">Choisissez votre cookie</h1>
            <div className="space-y-3">
              {MENU.cookies.map((s) => (
                <ChoiceCard key={s} label={s} selected={cookie === s} onSelect={() => setCookie(s)} />
              ))}
            </div>
          </div>
          <div className="sticky bottom-6 mt-8">
            <button
              disabled={!cookie}
              onClick={() => setStep("tea")}
              className="w-full font-black text-sm uppercase tracking-widest py-5 text-white disabled:opacity-40"
              style={{ backgroundColor: "var(--tanuki-red)" }}
            >
              Continuer →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // TEA
  if (step === "tea") {
    return (
      <div className="min-h-screen flex flex-col px-6 py-12" style={{ backgroundColor: "var(--paper)" }}>
        <ProgressBar step={4} total={5} />
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "var(--off-black)" }}>Étape 4/4</p>
            <h1 className="text-3xl font-black uppercase mb-8">Choisissez votre thé</h1>
            <div className="space-y-3">
              {MENU.teas.map((s) => (
                <ChoiceCard key={s} label={s} selected={tea === s} onSelect={() => setTea(s)} />
              ))}
            </div>
          </div>
          <div className="sticky bottom-6 mt-8">
            <button
              disabled={!tea}
              onClick={() => setStep("recap")}
              className="w-full font-black text-sm uppercase tracking-widest py-5 text-white disabled:opacity-40"
              style={{ backgroundColor: "var(--tanuki-red)" }}
            >
              Continuer →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RECAP
  return (
    <div className="min-h-screen flex flex-col px-6 py-12" style={{ backgroundColor: "var(--paper)" }}>
      <ProgressBar step={5} total={5} />
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "var(--off-black)" }}>Votre box</p>
          <h1 className="text-4xl font-black uppercase mb-8">{name}</h1>
          <div className="border-2 p-6 space-y-3" style={{ borderColor: "var(--line)" }}>
            <div>
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--tanuki-red)" }}>Sando</span>
              <p className="text-lg font-bold">{sando}</p>
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--tanuki-red)" }}>Slaw</span>
              <p className="text-lg font-bold">{slaw}</p>
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--tanuki-red)" }}>Cookie</span>
              <p className="text-lg font-bold">{cookie}</p>
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--tanuki-red)" }}>Thé</span>
              <p className="text-lg font-bold">{tea}</p>
            </div>
          </div>
          {error && <p className="text-sm font-bold mt-4" style={{ color: "var(--tanuki-red)" }}>{error}</p>}
        </div>
        <div className="sticky bottom-6 mt-8 space-y-3">
          <button
            disabled={submitting}
            onClick={handleSubmit}
            className="w-full font-black text-sm uppercase tracking-widest py-5 text-white disabled:opacity-40"
            style={{ backgroundColor: "var(--tanuki-red)" }}
          >
            {submitting ? "Envoi…" : "Confirmer ma box →"}
          </button>
          <button onClick={() => setStep("tea")} className="w-full text-xs font-bold uppercase py-3 underline">
            Modifier
          </button>
        </div>
      </div>
    </div>
  );
}
