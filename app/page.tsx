"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Dropzone } from "@/components/Dropzone";
import { LogoMark } from "@/components/Logo";
import { ProgressFill, ProgressSteps } from "@/components/Progress";
import { ShortCard } from "@/components/ShortCard";
import { UsagePanel } from "@/components/UsagePanel";
import { checkHealth, createJob, getJob, getUsage, zipUrl, type Job, type Usage } from "@/lib/api";

type Phase = "idle" | "uploading" | "processing" | "done" | "failed";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [captions, setCaptions] = useState(true);
  const [phase, setPhase] = useState<Phase>("idle");
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [waking, setWaking] = useState(false);
  const poll = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshUsage = useCallback(() => {
    getUsage().then(setUsage).catch(() => setUsage({ chat: null, whisper: null }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await checkHealth();
      if (cancelled) return;
      if (!ok) {
        setWaking(true);
        while (!(await checkHealth(10000))) {
          if (cancelled) return;
        }
        setWaking(false);
      }
      refreshUsage();
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshUsage]);

  useEffect(() => () => {
    if (poll.current) clearInterval(poll.current);
  }, []);

  async function generate() {
    if (!file) return;
    setError(null);
    setJob(null);
    setPhase("uploading");
    try {
      const id = await createJob(file, captions);
      setPhase("processing");
      poll.current = setInterval(async () => {
        try {
          const next = await getJob(id);
          setJob(next);
          if (next.status === "done" || next.status === "failed") {
            if (poll.current) clearInterval(poll.current);
            setPhase(next.status);
            if (next.status === "failed") setError(next.message);
            refreshUsage();
          }
        } catch (e) {
          if (poll.current) clearInterval(poll.current);
          setPhase("failed");
          setError(e instanceof Error ? e.message : "Lost contact with the server.");
        }
      }, 2000);
    } catch (e) {
      setPhase("failed");
      setError(e instanceof Error ? e.message : "Upload failed.");
    }
  }

  function reset() {
    setFile(null);
    setJob(null);
    setError(null);
    setPhase("idle");
  }

  const busy = phase === "uploading" || phase === "processing";
  const progress = phase === "uploading" ? 4 : (job?.progress ?? 0);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <LogoMark className="h-10 w-auto text-ink" />
          <span className="font-display text-2xl font-bold tracking-tight">ClipForge</span>
        </div>
        <UsagePanel usage={usage} />
      </header>

      {waking && (
        <p className="mt-6 rounded-lg bg-panel px-4 py-3 text-sm text-steel" role="status">
          Waking the server. The free tier sleeps when idle, this takes up to a minute.
        </p>
      )}

      <section className="mt-14 grid gap-10 sm:grid-cols-[240px_1fr] sm:gap-14">
        <div className="relative">
          <Dropzone file={file} onFile={(f) => { setFile(f); setError(null); }} onError={setError} disabled={busy} />
          {busy && (
            <div className="phone pointer-events-none absolute inset-0 border-transparent bg-transparent">
              <ProgressFill progress={progress} />
            </div>
          )}
        </div>

        <div className="max-w-md">
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            One long video in.
            <br />
            Up to five shorts out.
          </h1>
          <p className="mt-4 text-base leading-7 text-steel">
            ClipForge listens to your video, finds the moments worth posting, and cuts them to
            9:16 with captions burned in. Nothing is stored; results disappear after an hour.
          </p>

          <label className="mt-8 flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={captions}
              onChange={(e) => setCaptions(e.target.checked)}
              disabled={busy}
              className="h-4 w-4 accent-ember"
            />
            Burn captions into each short
          </label>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            {phase === "done" ? (
              <button type="button" onClick={reset} className="btn">
                Start another video
              </button>
            ) : (
              <button type="button" onClick={generate} disabled={!file || busy} className="btn">
                {phase === "uploading" ? "Uploading…" : phase === "processing" ? "Forging…" : "Make shorts"}
              </button>
            )}
            {file && !busy && phase !== "done" && (
              <span className="text-sm text-steel">
                {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
              </span>
            )}
          </div>

          {busy && job && (
            <div className="mt-8">
              <ProgressSteps status={job.status} progress={job.progress} />
            </div>
          )}
          {phase === "uploading" && (
            <p className="mt-8 text-sm text-steel">Sending the file to the server…</p>
          )}

          {error && (
            <p className="mt-8 rounded-lg border border-ember-deep/40 bg-panel px-4 py-3 text-sm text-ember-deep" role="alert">
              {error}
            </p>
          )}
        </div>
      </section>

      {phase === "done" && job && (
        <section className="mt-16" aria-label="Your shorts">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              {job.shorts.length === 1 ? "One short ready" : `${job.shorts.length} shorts ready`}
            </h2>
            <a href={zipUrl(job.id)} className="btn">
              Download all
            </a>
          </div>
          <div className="mt-6 flex gap-6 overflow-x-auto pb-4">
            {job.shorts.map((s) => (
              <ShortCard key={s.index} jobId={job.id} short={s} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
