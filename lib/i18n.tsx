"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import fr from "@/locales/fr";
import en from "@/locales/en";
import nl from "@/locales/nl";
import type { Locale } from "@/locales/fr";

export type Lang = "FR" | "EN" | "NL";
const LOCALES: Record<Lang, Locale> = { FR: fr, EN: en, NL: nl };

type I18nCtx = { lang: Lang; setLang: (l: Lang) => void; t: Locale };
const Ctx = createContext<I18nCtx>({ lang: "EN", setLang: () => {}, t: en });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("EN");

  useEffect(() => {
    const stored = localStorage.getItem("tanuki_lang") as Lang | null;
    if (stored && stored in LOCALES) { setLangState(stored); return; }
    const browser = navigator.language.toLowerCase();
    if (browser.startsWith("fr")) setLangState("FR");
    else if (browser.startsWith("nl")) setLangState("NL");
    else setLangState("EN");
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("tanuki_lang", l);
  }

  return <Ctx.Provider value={{ lang, setLang, t: LOCALES[lang] }}>{children}</Ctx.Provider>;
}

export function useI18n() { return useContext(Ctx); }

export function LangSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex items-center gap-1 text-xs font-black uppercase tracking-widest">
      {(["FR", "EN", "NL"] as Lang[]).map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span style={{ color: "var(--line)" }}>|</span>}
          <button
            onClick={() => setLang(l)}
            style={{ color: l === lang ? "var(--tanuki-red)" : "var(--off-black)", fontWeight: l === lang ? 900 : 700 }}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}
