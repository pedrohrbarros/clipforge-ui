import type { Quota, Usage } from "@/lib/api";

function Meter({ label, quota }: { label: string; quota: Quota | null }) {
  const limit = quota?.limit_requests ?? null;
  const remaining = quota?.remaining_requests ?? null;
  if (limit == null || remaining == null) {
    return (
      <div>
        <div className="flex justify-between gap-4">
          <span>{label}</span>
          <span className="text-steel">not available</span>
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
        <span>{label}</span>
        <span className={`tabular-nums ${low ? "text-ember-deep" : "text-steel"}`}>
          {remaining.toLocaleString()} of {limit.toLocaleString()} left
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`${label}, ${pct}% of today's uses left`}
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
        <p className="mt-1 text-xs text-ember-deep">Resets in {quota.reset_requests}</p>
      )}
    </div>
  );
}

export function UsagePanel({ usage }: { usage: Usage | null }) {
  return (
    <section aria-label="Uses left today" className="w-full max-w-xs text-sm leading-6">
      <p className="font-display text-ink">Uses left today</p>
      {usage ? (
        <div className="mt-2 space-y-3">
          <Meter label="Picking moments" quota={usage.chat} />
          <Meter label="Transcribing" quota={usage.whisper} />
        </div>
      ) : (
        <p className="text-steel">Checking…</p>
      )}
    </section>
  );
}
