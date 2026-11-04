"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Dropzone } from "@/components/Dropzone";
import { LanguageSelect } from "@/components/LanguageSelect";
import { LogoMark } from "@/components/Logo";
import { ProgressFill, ProgressSteps } from "@/components/Progress";
import { ShortCard } from "@/components/ShortCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UsagePanel } from "@/components/UsagePanel";
import { checkHealth, createJob, getJob, getUsage, zipUrl, type Job, type Usage } from "@/lib/api";
import { errorText, jobErrorText, useLang, useT } from "@/lib/i18n";

type Phase = "idle" | "uploading" | "processing" | "done" | "failed";

export default function Home() {
  const t = useT();
  const lang = useLang();
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [captions, setCaptions] = useState(true);
  const [phase, setPhase] = useState<Phase>("idle");
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [waking, setWaking] = useState(false);
  const poll = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshUsage = useCallback(() => {
    getUsage()
      .then(setUsage)
      .catch(() => setUsage({ chat: null, whisper: null }));
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

  useEffect(
    () => () => {
      if (poll.current) clearInterval(poll.current);
    },
    [],
  );

  const link = url.trim();
  const fromYoutube = link.length > 0;

  async function generate() {
    if (!file && !fromYoutube) return;
    setError(null);
    setJob(null);
    setPhase("uploading");
    try {
      const id = await createJob(fromYoutube ? { url: link } : { file: file! }, captions);
      setPhase("processing");
      poll.current = setInterval(async () => {
        try {
          const next = await getJob(id);
          setJob(next);
          if (next.status === "done" || next.status === "failed") {
            if (poll.current) clearInterval(poll.current);
            setPhase(next.status);
            if (next.status === "failed") setError(jobErrorText(lang, next.code, next.message));
            refreshUsage();
          }
        } catch (e) {
          if (poll.current) clearInterval(poll.current);
          setPhase("failed");
          setError(errorText(lang, e, "errors.lostContact"));
        }
      }, 2000);
    } catch (e) {
      setPhase("failed");
      setError(errorText(lang, e, "errors.uploadFailed"));
    }
  }

  function reset() {
    setFile(null);
    setUrl("");
    setJob(null);
    setError(null);
    setPhase("idle");
  }

  const busy = phase === "uploading" || phase === "processing";
  const progress = phase === "uploading" ? 2 : (job?.progress ?? 0);

  return (
    <main className="flex w-full flex-col px-4 py-6 sm:px-8 lg:h-dvh lg:overflow-hidden">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <LogoMark className="h-10 w-auto text-ink" />
          <span className="font-display text-2xl font-bold tracking-tight">ClipForge</span>
        </div>
        <div className="flex flex-wrap items-start gap-6">
          <UsagePanel usage={usage} />
          <div className="flex items-center gap-2">
            <LanguageSelect />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {waking && (
        <p className="mt-4 rounded-lg bg-panel px-4 py-3 text-sm text-steel" role="status">
          {t("waking")}
        </p>
      )}

      <div className="mt-8 flex min-h-0 flex-1 flex-col">
        <section
          className="flex min-h-0 flex-1 flex-col justify-center"
          aria-label={t("btn.make")}
        >
          {phase === "done" && job ? (
            <div className="mx-auto flex w-full max-w-full flex-col items-center">
              <h1 className="font-display text-3xl font-bold tracking-tight">
                {job.shorts.length === 1
                  ? t("results.one")
                  : t("results.many", { n: job.shorts.length })}
              </h1>
              <div className="mt-5 flex max-w-full gap-5 overflow-x-auto pb-3">
                {job.shorts.map((s) => (
                  <ShortCard key={s.index} jobId={job.id} short={s} />
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <a href={zipUrl(job.id)} className="btn">
                  {t("results.downloadAll")}
                </a>
                <button type="button" onClick={reset} className="btn btn-quiet">
                  {t("results.again")}
                </button>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 sm:flex-row sm:items-center sm:justify-center sm:gap-12">
              <div className="relative shrink-0">
                <Dropzone
                  file={file}
                  onFile={(f) => {
                    setFile(f);
                    setError(null);
                  }}
                  onError={setError}
                  disabled={busy}
                />
                {busy && (
                  <div className="phone pointer-events-none absolute inset-0 border-transparent bg-transparent">
                    <ProgressFill progress={progress} />
                  </div>
                )}
              </div>

              <div className="w-full min-w-0 max-w-xl">
                <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-tight">
                  {t("hero.title")}
                </h1>
                <p className="mt-3 text-sm leading-6 text-steel">{t("hero.body")}</p>

                <label className="mt-6 block text-sm">
                  <span className="text-steel">{t("link.label")}</span>
                  <input
                    type="url"
                    inputMode="url"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      setError(null);
                    }}
                    placeholder={t("link.placeholder")}
                    disabled={busy}
                    className="field mt-1.5 block w-full"
                  />
                  {fromYoutube && file && (
                    <span className="mt-1 block text-xs text-steel">
                      {t("link.override", { name: file.name })}
                    </span>
                  )}
                </label>

                <label className="mt-6 flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={captions}
                    onChange={(e) => setCaptions(e.target.checked)}
                    disabled={busy}
                    className="h-4 w-4 accent-ember"
                  />
                  {t("captions")}
                </label>

                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={generate}
                    disabled={(!file && !fromYoutube) || busy}
                    className="btn"
                  >
                    {phase === "uploading"
                      ? t("btn.uploading")
                      : phase === "processing"
                        ? t("btn.forging")
                        : t("btn.make")}
                  </button>
                  {file && !busy && !fromYoutube && (
                    <span className="truncate text-sm text-steel">
                      {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                  )}
                </div>

                {busy && job && (
                  <div className="mt-6">
                    <ProgressSteps
                      status={job.status}
                      progress={job.progress}
                      fromYoutube={fromYoutube}
                    />
                  </div>
                )}
                {phase === "uploading" && (
                  <p className="mt-6 text-sm text-steel">
                    {fromYoutube ? t("starting") : t("sending")}
                  </p>
                )}
                {error && (
                  <p
                    className="mt-6 rounded-lg border border-ember-deep/40 bg-panel px-4 py-3 text-sm text-ember-deep"
                    role="alert"
                  >
                    {error}
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
