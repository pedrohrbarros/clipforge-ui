"use client";

import { useT } from "@/lib/i18n";

export type Mode = "best" | "split";

/** Pick the best moments, or cut the whole video into consecutive parts. */
export function ModePicker({
  value,
  onChange,
  disabled,
}: {
  value: Mode;
  onChange: (m: Mode) => void;
  disabled?: boolean;
}) {
  const t = useT();
  return (
    <fieldset className="text-sm" disabled={disabled}>
      <legend className="text-steel">{t("mode.label")}</legend>
      <div
        role="radiogroup"
        aria-label={t("mode.label")}
        className="mt-1.5 flex flex-wrap gap-2"
      >
        {(["best", "split"] as Mode[]).map((m) => {
          const active = m === value;
          return (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(m)}
              className={[
                "max-w-[15rem] rounded-xl border-2 px-3 py-2 text-left transition-colors",
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-line text-ink hover:border-ink",
                "disabled:cursor-not-allowed disabled:opacity-50",
              ].join(" ")}
            >
              <span className="block font-display">{t(`mode.${m}`)}</span>
              <span
                className={`block text-xs ${active ? "text-paper/80" : "text-steel"}`}
              >
                {t(`mode.${m}.hint`)}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
