import { useEffect, useState } from "react";

type Theme = "dark" | "light";
type Lang = "en" | "ur";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") ? "dark" : "light";
    }
    return "light";
  });

  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute("dir", lang === "ur" ? "rtl" : "ltr");
    root.setAttribute("lang", lang);
  }, [lang]);

  return { theme, setTheme, lang, setLang };
}
