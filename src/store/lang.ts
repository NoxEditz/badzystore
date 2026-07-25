import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "en" | "ar";

type LangState = {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
};

export const useLang = create<LangState>()(
  persist(
    (set) => ({
      lang: "en",
      setLang: (lang) => {
        set({ lang });
        if (typeof document !== "undefined") {
          document.documentElement.lang = lang;
          document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
        }
      },
      toggleLang: () =>
        set((s) => {
          const next = s.lang === "en" ? "ar" : "en";
          if (typeof document !== "undefined") {
            document.documentElement.lang = next;
            document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
          }
          return { lang: next };
        }),
    }),
    { name: "badzy-lang" },
  ),
);
