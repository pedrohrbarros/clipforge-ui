"use client";

import type { Quota, Usage } from "@/lib/api";
import { Spinner } from "@/components/Spinner";
import { useT } from "@/lib/i18n";

function Meter({ label, quota }: { label: string; quota: Quota | null }) {
  const t = useT();
  const limit = quota?.limit_requests ?? null;
  const remaining = quota?.remaining_requests ?? null;
  if (limit == null || remaining == null) {
    return (
      <div>
        <div className="flex justify-between gap-4">
          <span className="whitespace-nowrap">{label}</span>
          <span className="text-steel">{t("usage.na")}</span>
        </div>
        <div className="mt-1.5 h-1.5 rounded-full bg-line" />
      </div>
    );
  }
  const pct = Math.max(0, Math.min(100, Math.round((remaining / limit) * 100)));
  const low = pct < 15;
  return (
    <div>
      <div className="flex justify-between gap-4">
        <span className="whitespace-nowrap">{label}</span>
        <span
          className={`whitespace-nowrap tabular-nums ${low ? "text-ember-deep" : "text-steel"}`}
        >
          {t("usage.left", {
            remaining: remaining.toLocaleString(),
            limit: limit.toLocaleString(),
          })}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={t("usage.aria", { label, pct })}
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
      {remaining === 0 && quota?.reset_requests && (
        <p className="mt-1 text-xs text-ember-deep">
          {t("usage.resets", { time: quota.reset_requests })}
        </p>
      )}
    </div>
  );
}

export function UsagePanel({ usage }: { usage: Usage | null }) {
  const t = useT();
  return (
    <section aria-label={t("usage.title")} className="text-sm leading-6">
      <p className="font-display text-ink">{t("usage.title")}</p>
      {usage ? (
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:gap-x-8">
          <div className="w-full sm:w-72">
            <Meter label={t("usage.chat")} quota={usage.chat} />
          </div>
          <div className="w-full sm:w-72">
            <Meter label={t("usage.whisper")} quota={usage.whisper} />
          </div>
        </div>
      ) : (
        <div className="mt-2 flex h-12 items-center">
          <Spinner />
        </div>
      )}
    </section>
  );
}
