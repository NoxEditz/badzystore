import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "dark" | "light";

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  // Remove both, then add current
  root.classList.remove("dark", "light");
  root.classList.add(theme);
  // Signal a transition
  root.classList.add("theme-transitioning");
  setTimeout(() => root.classList.remove("theme-transitioning"), 350);
}

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        applyTheme(next);
        set({ theme: next });
      },
    }),
    { name: "badzy-theme" },
  ),
);
