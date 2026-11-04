import type { Quota, Usage } from "@/lib/api";

function Row({ name, quota }: { name: string; quota: Quota | null }) {
  if (!quota) {
    return (
      <p className="text-steel">
        {name}: quota unknown
      </p>
    );
  }
  const parts: string[] = [];
  if (quota.remaining_requests != null && quota.limit_requests != null) {
    parts.push(`${quota.remaining_requests} / ${quota.limit_requests} requests`);
  }
  if (quota.remaining_tokens != null && quota.limit_tokens != null) {
    parts.push(`${quota.remaining_tokens} / ${quota.limit_tokens} tokens`);
  }
  if (quota.remaining_audio_seconds != null && quota.limit_audio_seconds != null) {
    parts.push(`${quota.remaining_audio_seconds} / ${quota.limit_audio_seconds} audio s`);
  }
  const reset = quota.reset_requests ?? quota.reset_tokens ?? quota.reset_audio_seconds;
  return (
    <p>
      <span className="text-steel">{name}</span>
      {parts.length === 0 ? (
        <span className="ml-2 text-steel">no limits reported</span>
      ) : (
        parts.map((p) => (
          <span key={p} className="ml-2 tabular-nums">
            {p}
          </span>
        ))
      )}
      {reset && <span className="ml-2 text-steel">resets in {reset}</span>}
    </p>
  );
}

export function UsagePanel({ usage }: { usage: Usage | null }) {
  return (
    <section aria-label="Groq quota left" className="text-sm leading-6">
      <p className="font-display text-ink">Free quota left on Groq</p>
      {usage ? (
        <>
          <Row name="GPT-OSS (picks moments)" quota={usage.chat} />
          <Row name="Whisper (transcribes)" quota={usage.whisper} />
        </>
      ) : (
        <p className="text-steel">Checking…</p>
      )}
    </section>
  );
}
