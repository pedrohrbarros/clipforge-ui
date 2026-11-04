"use client";

import type { JobStatus } from "@/lib/api";
import { useT } from "@/lib/i18n";

const STEPS: JobStatus[] = ["downloading", "transcribing", "selecting", "rendering"];

export function ProgressFill({ progress }: { progress: number }) {
  return (
    <div
      aria-hidden="true"
      className="ember-fill absolute inset-x-0 bottom-0"
      style={{ height: `${Math.max(4, progress)}%` }}
    />
  );
}

export function ProgressSteps({
  status,
  progress,
  fromYoutube,
}: {
  status: JobStatus;
  progress: number;
  fromYoutube: boolean;
}) {
  const t = useT();
  const steps = fromYoutube ? STEPS : STEPS.filter((s) => s !== "downloading");
  const current = steps.indexOf(status);
  return (
    <ol className="space-y-1 text-sm leading-6" aria-live="polite">
      {steps.map((step, i) => {
        const state = i < current ? "done" : i === current ? "now" : "next";
        return (
          <li
            key={step}
            className={
              state === "now"
                ? "text-ink"
                : state === "done"
                  ? "text-steel line-through"
                  : "text-steel/60"
            }
          >
            {t(`steps.${step}`)}
            {state === "now" && (
              <span className="ml-2 tabular-nums text-ember-deep">{progress}%</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
