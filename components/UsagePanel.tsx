"use client";

import type { Me } from "@/lib/api";
import { Spinner } from "@/components/Spinner";
import { useT } from "@/lib/i18n";

export function UsagePanel({ me }: { me: Me | null }) {
  const t = useT();
  const left = me ? Math.max(0, me.limit - me.used_today) : null;
  const pct = me && left != null ? Math.round((left / me.limit) * 100) : 0;
  const low = left === 0;
  return (
    <section
      aria-label={t("usage.title")}
      className="w-full text-sm leading-6 sm:w-72"
    >
      <div className="flex justify-between gap-4">
        <span className="font-display text-ink">{t("usage.title")}</span>
        {me && left != null ? (
          <span
            className={`whitespace-nowrap tabular-nums ${low ? "text-ember-deep" : "text-steel"}`}
          >
            {t("usage.left", { remaining: left, limit: me.limit })}
          </span>
        ) : (
          <Spinner className="h-4 w-4" />
        )}
      </div>
      <div
        role="progressbar"
        aria-label={t("usage.aria", { pct })}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line"
      >
        <div
          className={`h-full rounded-full ${low ? "bg-ember" : "bg-ink"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {low && me && (
        <p className="mt-1 text-xs text-ember-deep">
          {t("usage.resets", {
            time: new Date(me.resets_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          })}
        </p>
      )}
    </section>
  );
}
