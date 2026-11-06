"use client";

import { useT } from "@/lib/i18n";

export const ASPECTS = ["9:16", "4:5", "1:1", "16:9"] as const;
export type Aspect = (typeof ASPECTS)[number];

/** Small outline of each shape, so the choice reads at a glance. */
function Shape({ aspect, active }: { aspect: Aspect; active: boolean }) {
  const [w, h] = aspect.split(":").map(Number);
  const scale = 22 / Math.max(w, h);
  return (
    <span
      aria-hidden="true"
      className={`block rounded-[3px] border-2 ${active ? "border-paper" : "border-ink"}`}
      style={{ width: w * scale, height: h * scale }}
    />
  );
}

export function AspectRatio({
  value,
  onChange,
  disabled,
}: {
  value: Aspect;
  onChange: (a: Aspect) => void;
  disabled?: boolean;
}) {
  const t = useT();
  return (
    <fieldset className="text-sm" disabled={disabled}>
      <legend className="text-steel">{t("aspect.label")}</legend>
      <div
        role="radiogroup"
        aria-label={t("aspect.label")}
        className="mt-1.5 flex flex-wrap gap-2"
      >
        {ASPECTS.map((a) => {
          const active = a === value;
          return (
            <button
              key={a}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(a)}
              className={[
                "flex h-16 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 transition-colors",
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-line text-ink hover:border-ink",
                "disabled:cursor-not-allowed disabled:opacity-50",
              ].join(" ")}
            >
              <Shape aspect={a} active={active} />
              <span className="font-display text-xs">{t(`aspect.${a}`)}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
