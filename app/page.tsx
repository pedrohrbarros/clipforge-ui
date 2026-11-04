"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Dropzone } from "@/components/Dropzone";
import { LanguageSelect } from "@/components/LanguageSelect";
import { LogoMark } from "@/components/Logo";
import { ProgressFill, ProgressSteps } from "@/components/Progress";
import { ShortCard } from "@/components/ShortCard";
import { SignIn } from "@/components/SignIn";
import { UserMenu } from "@/components/UserMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UsagePanel } from "@/components/UsagePanel";
import {
  checkHealth,
  createJob,
  getJob,
  getMe,
  getUsage,
  zipUrl,
  type Job,
  type Me,
  type Usage,
} from "@/lib/api";
import { decodeProfile, useCredential } from "@/lib/auth";
import { ApiError, errorText, jobErrorText, useLang, useT } from "@/lib/i18n";

type Phase = "idle" | "uploading" | "processing" | "done" | "failed";

export default function Home() {
  const t = useT();
  const lang = useLang();
  const credential = useCredential();
  const [me, setMe] = useState<Me | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [captions, setCaptions] = useState(true);
  const [phase, setPhase] = useState<Phase>("idle");
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [waking, setWaking] = useState(false);
  const poll = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshUsage = useCallback(() => {
    if (!credential) return;
    getUsage()
      .then(setUsage)
      .catch(() => setUsage({ chat: null, whisper: null }));
    getMe()
      .then(setMe)
      .catch(() => setMe(null));
  }, [credential]);

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

  async function generate() {
    if (!file) return;
    setError(null);
    setJob(null);
    setPhase("uploading");
    try {
      const id = await createJob(file, captions, lang);
      setPhase("processing");
      let misses = 0;
      poll.current = setInterval(async () => {
        try {
          const next = await getJob(id);
          misses = 0;
          setJob(next);
          if (next.status === "done" || next.status === "failed") {
            if (poll.current) clearInterval(poll.current);
            setPhase(next.status);
            if (next.status === "failed")
              setError(jobErrorText(lang, next.code, next.message));
            refreshUsage();
          }
        } catch (e) {
          // A 404 means the server restarted and lost the job; anything else may be a
          // transient network or proxy hiccup, so allow a few misses before giving up.
          const gone = e instanceof ApiError && e.code === "expired";
          misses += 1;
          if (!gone && misses < 5) return;
          if (poll.current) clearInterval(poll.current);
          setPhase("failed");
          setError(
            errorText(lang, e, gone ? "errors.expired" : "errors.lostContact"),
          );
        }
      }, 2000);
    } catch (e) {
      setPhase("failed");
      setError(errorText(lang, e, "errors.uploadFailed"));
    }
  }

  function reset() {
    setFile(null);
    setJob(null);
    setError(null);
    setPhase("idle");
  }

  const busy = phase === "uploading" || phase === "processing";
  const progress = phase === "uploading" ? 2 : (job?.progress ?? 0);
  const profile = credential ? decodeProfile(credential) : null;

  return (
    <main className="flex min-h-dvh w-full flex-col px-4 py-5 sm:px-8 sm:py-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-3">
          <LogoMark className="h-10 w-auto text-ink" />
          <span className="font-display text-2xl font-bold tracking-tight">
            ClipForge
          </span>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
          {credential && <UsagePanel usage={usage} />}
          <div className="flex flex-wrap items-center gap-3 md:pt-0.5">
            {credential && <UserMenu me={me} />}
            <LanguageSelect />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {!credential && <SignIn />}

      {waking && (
        <p
          className="mt-4 rounded-lg bg-panel px-4 py-3 text-sm text-steel"
          role="status"
        >
          {t("waking")}
        </p>
      )}

      {credential && (
        <div className="mt-6 flex flex-1 flex-col sm:mt-8">
          <section
            className="flex flex-1 flex-col justify-center"
            aria-label={t("btn.make")}
          >
            {phase === "done" && job ? (
              <div className="mx-auto flex w-full max-w-full flex-col items-center">
                <h1 className="font-display text-3xl font-bold tracking-tight">
                  {job.shorts.length === 1
                    ? t("results.one")
                    : t("results.many", { n: job.shorts.length })}
                </h1>
                <div className="mt-5 flex w-full snap-x gap-5 overflow-x-auto px-1 pb-3 md:justify-center md:overflow-visible md:px-0">
                  {job.shorts.map((s) => (
                    <ShortCard key={s.index} job={job} short={s} />
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <a href={zipUrl(job)} className="btn">
                    {t("results.downloadAll")}
                  </a>
                  <button
                    type="button"
                    onClick={reset}
                    className="btn btn-quiet"
                  >
                    {t("results.again")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 md:flex-row md:items-center md:justify-center md:gap-12">
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

                <div className="w-full min-w-0 max-w-xl text-center md:text-left">
                  <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-tight">
                    {t("hero.title")}
                  </h1>
                  <p className="mt-3 text-sm leading-6 text-steel">
                    {t("hero.body")}
                  </p>

                  <label className="mt-6 flex items-center justify-center gap-3 text-sm md:justify-start">
                    <input
                      type="checkbox"
                      checked={captions}
                      onChange={(e) => setCaptions(e.target.checked)}
                      disabled={busy}
                      className="h-4 w-4 accent-ember"
                    />
                    {t("captions")}
                  </label>

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-4 md:justify-start">
                    <button
                      type="button"
                      onClick={generate}
                      disabled={!file || busy}
                      className="btn"
                    >
                      {phase === "uploading"
                        ? t("btn.uploading")
                        : phase === "processing"
                          ? t("btn.forging")
                          : t("btn.make")}
                    </button>
                    {file && !busy && (
                      <span className="truncate text-sm text-steel">
                        {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                    )}
                  </div>

                  {busy && job && (
                    <div className="mt-6 inline-block text-left">
                      <ProgressSteps
                        status={job.status}
                        progress={job.progress}
                      />
                      {profile && (
                        <p className="mt-3 text-sm text-steel">
                          {t("email.note", { email: profile.email })}
                        </p>
                      )}
                    </div>
                  )}
                  {phase === "uploading" && (
                    <p className="mt-6 text-sm text-steel">{t("sending")}</p>
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
      )}
    </main>
  );
}
