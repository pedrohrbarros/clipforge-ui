"use client";

import { LANGS, setLang, useLang, useT, type Lang } from "@/lib/i18n";

export function LanguageSelect() {
  const lang = useLang();
  const t = useT();
  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value as Lang)}
      aria-label={t("lang.label")}
      title={t("lang.label")}
      className="lang-select"
    >
      {(Object.keys(LANGS) as Lang[]).map((code) => (
        <option key={code} value={code}>
          {LANGS[code]}
        </option>
      ))}
    </select>
  );
}
