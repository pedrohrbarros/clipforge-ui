"use client";

import { useT } from "@/lib/i18n";

export const MAX_TOTAL = 10;
export const MIN_SECONDS = 5;
export const MAX_SECONDS = 60;

export type PlanGroup = {
  count: number;
  min_seconds: number;
  max_seconds: number;
};
export const DEFAULT_PLAN: PlanGroup[] = [
  { count: 1, min_seconds: 20, max_seconds: 60 },
];

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

/** Rows of "N shorts of X to Y seconds". Total ≤ 10 shorts, lengths within 5 to 60 s. */
export function ShortPlan({
  value,
  onChange,
  disabled,
}: {
  value: PlanGroup[];
  onChange: (plan: PlanGroup[]) => void;
  disabled?: boolean;
}) {
  const t = useT();
  const total = value.reduce((n, g) => n + g.count, 0);
  const left = MAX_TOTAL - total;

  const update = (i: number, patch: Partial<PlanGroup>) => {
    const next = value.map((g, j) => (j === i ? { ...g, ...patch } : g));
    const g = next[i];
    // Keep each row consistent: count within what is left, min below max, both in range.
    const others = total - value[i].count;
    g.count = clamp(
      Math.round(g.count || 1),
      1,
      Math.max(1, MAX_TOTAL - others),
    );
    g.min_seconds = clamp(
      Math.round(g.min_seconds || MIN_SECONDS),
      MIN_SECONDS,
      MAX_SECONDS - 1,
    );
    g.max_seconds = clamp(
      Math.round(g.max_seconds || MAX_SECONDS),
      g.min_seconds + 1,
      MAX_SECONDS,
    );
    onChange(next);
  };

  const field = "field w-20 py-1.5 text-center tabular-nums";

  return (
    <fieldset className="text-sm" disabled={disabled}>
      <legend className="text-steel">{t("plan.label")}</legend>
      <ul className="mt-1.5 space-y-2">
        {value.map((g, i) => (
          <li key={i} className="flex flex-wrap items-center gap-2">
            <input
              type="number"
              min={1}
              max={MAX_TOTAL}
              value={g.count}
              onChange={(e) => update(i, { count: Number(e.target.value) })}
              aria-label={t("plan.count")}
              className={field}
            />
            <span>{t("plan.of")}</span>
            <input
              type="number"
              min={MIN_SECONDS}
              max={MAX_SECONDS - 1}
              value={g.min_seconds}
              onChange={(e) =>
                update(i, { min_seconds: Number(e.target.value) })
              }
              aria-label={t("plan.min")}
              className={field}
            />
            <span>{t("plan.to")}</span>
            <input
              type="number"
              min={MIN_SECONDS + 1}
              max={MAX_SECONDS}
              value={g.max_seconds}
              onChange={(e) =>
                update(i, { max_seconds: Number(e.target.value) })
              }
              aria-label={t("plan.max")}
              className={field}
            />
            <span>{t("plan.seconds")}</span>
            {value.length > 1 && (
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                aria-label={t("plan.remove")}
                className="text-steel underline underline-offset-4 hover:text-ember-deep"
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-steel">
        <button
          type="button"
          disabled={left <= 0}
          onClick={() =>
            onChange([...value, { count: 1, min_seconds: 20, max_seconds: 60 }])
          }
          className="text-ink underline underline-offset-4 hover:text-ember-deep disabled:no-underline disabled:opacity-50"
        >
          {t("plan.add")}
        </button>
        <span>
          {t("plan.total", { n: total, max: MAX_TOTAL, sec: MAX_SECONDS })}
        </span>
      </div>
    </fieldset>
  );
}
