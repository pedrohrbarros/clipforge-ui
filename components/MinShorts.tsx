"use client";

import { useT } from "@/lib/i18n";

export const MAX_SHORTS = 5;

/** Segmented picker for the minimum number of shorts; the maximum is fixed at 5. */
export function MinShorts({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  const t = useT();
  return (
    <fieldset className="text-sm" disabled={disabled}>
      <legend className="text-steel">{t("min.label")}</legend>
      <div
        role="radiogroup"
        aria-label={t("min.label")}
        className="mt-1.5 inline-flex overflow-hidden rounded-full border-2 border-line"
      >
        {Array.from({ length: MAX_SHORTS }, (_, i) => i + 1).map((n) => {
          const active = n === value;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(n)}
              className={[
                "h-9 w-10 font-display text-base transition-colors",
                active ? "bg-ink text-paper" : "text-ink hover:bg-panel",
                "disabled:cursor-not-allowed disabled:opacity-50",
              ].join(" ")}
            >
              {n}
            </button>
          );
        })}
      </div>
      <p className="mt-1 text-xs text-steel">
        {t("min.hint", { max: MAX_SHORTS })}
      </p>
    </fieldset>
  );
}
