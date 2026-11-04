import type { JobStatus } from "@/lib/api";

const STEPS: { status: JobStatus; label: string }[] = [
  { status: "transcribing", label: "Transcribing the audio" },
  { status: "selecting", label: "Picking the best moments" },
  { status: "rendering", label: "Cutting and captioning" },
];

export function ProgressFill({ progress }: { progress: number }) {
  return (
    <div
      aria-hidden="true"
      className="ember-fill absolute inset-x-0 bottom-0"
      style={{ height: `${Math.max(4, progress)}%` }}
    />
  );
}

export function ProgressSteps({ status, progress }: { status: JobStatus; progress: number }) {
  const current = STEPS.findIndex((s) => s.status === status);
  return (
    <ol className="space-y-1 text-sm leading-6" aria-live="polite">
      {STEPS.map((step, i) => {
        const state = i < current ? "done" : i === current ? "now" : "next";
        return (
          <li
            key={step.status}
            className={
              state === "now" ? "text-ink" : state === "done" ? "text-steel line-through" : "text-steel/60"
            }
          >
            {step.label}
            {state === "now" && <span className="ml-2 tabular-nums text-ember-deep">{progress}%</span>}
          </li>
        );
      })}
    </ol>
  );
}
