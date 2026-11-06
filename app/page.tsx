"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Dropzone } from "@/components/Dropzone";
import { LanguageSelect } from "@/components/LanguageSelect";
import { LogoMark } from "@/components/Logo";
import { ProgressFill, ProgressSteps } from "@/components/Progress";
import { ShortCard } from "@/components/ShortCard";
import { Sidebar } from "@/components/Sidebar";
import { SignIn } from "@/components/SignIn";
import { Spinner } from "@/components/Spinner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UsagePanel } from "@/components/UsagePanel";
import { UserMenu } from "@/components/UserMenu";
import {
  RUNNING,
  checkHealth,
  createJob,
  downloadUrl,
  fetchMedia,
  getJob,
  getMe,
  getUsage,
  listJobs,
  saveBlob,
  zipPath,
  type Job,
  type Me,
  type Usage,
} from "@/lib/api";
import { useSession } from "@/lib/auth";
import { ApiError, errorText, jobErrorText, useLang, useT } from "@/lib/i18n";

type Phase = "idle" | "uploading" | "processing" | "done" | "failed";

export default function Home() {
  const t = useT();
  const lang = useLang();
  const session = useSession();
  const [ready, setReady] = useState(false); // the API answered /health
  const [me, setMe] = useState<Me | null>(null);
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [captions, setCaptions] = useState(true);
  const [phase, setPhase] = useState<Phase>("idle");
  const [job, setJob] = useState<Job | null>(null);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const poll = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshAccount = useCallback(() => {
    if (!session) return;
    getUsage()
      .then(setUsage)
      .catch(() => setUsage({ chat: null, whisper: null }));
    getMe()
      .then(setMe)
      .catch(() => setMe(null));
    listJobs()
      .then(setJobs)
      .catch(() => setJobs([]));
  }, [session]);

  const stopPolling = () => {
    if (poll.current) clearInterval(poll.current);
    poll.current = null;
  };

  // Follow a job until it finishes; the API keeps the job, so this survives reloads.
  const follow = useCallback(
    (id: string) => {
      stopPolling();
      setPhase("processing");
      let misses = 0;
      poll.current = setInterval(async () => {
        try {
          const next = await getJob(id);
          misses = 0;
          setJob(next);
          setJobs(
            (list) => list?.map((j) => (j.id === next.id ? next : j)) ?? list,
          );
          if (next.status === "done" || next.status === "failed") {
            stopPolling();
            setPhase(next.status);
            if (next.status === "failed")
              setError(jobErrorText(lang, next.code, next.message));
            refreshAccount();
          }
        } catch (e) {
          const gone = e instanceof ApiError && e.code === "expired";
          misses += 1;
          if (!gone && misses < 5) return;
          stopPolling();
          setPhase("failed");
          setError(
            errorText(lang, e, gone ? "errors.expired" : "errors.lostContact"),
          );
        }
      }, 2000);
    },
    [lang, refreshAccount],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Wait for the API, which on a free host may be waking up; the UI shows loaders meanwhile.
      while (!(await checkHealth(10000))) {
        if (cancelled) return;
      }
      if (cancelled) return;
      setReady(true);
      if (!session) return;
      refreshAccount();
      const list = await listJobs().catch(() => [] as Job[]);
      if (cancelled) return;
      const running = list.find((j) => RUNNING.includes(j.status));
      if (running) {
        setJob(running);
        follow(running.id);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session, refreshAccount, follow]);

  useEffect(() => () => stopPolling(), []);

  async function generate() {
    if (!file) return;
    setError(null);
    setJob(null);
    setPhase("uploading");
    try {
      const id = await createJob(file, captions);
      refreshAccount();
      follow(id);
    } catch (e) {
      setPhase("failed");
      setError(errorText(lang, e, "errors.uploadFailed"));
    }
  }

  function reset() {
    stopPolling();
    setFile(null);
    setJob(null);
    setError(null);
    setPhase("idle");
  }

  // Open a job from the sidebar: fresh download links come from GET /jobs/{id}.
  async function open(item: Job) {
    stopPolling();
    setError(null);
    setOpening(true);
    try {
      const full = await getJob(item.id);
      setJob(full);
      if (RUNNING.includes(full.status)) follow(full.id);
      else setPhase(full.status === "done" ? "done" : "failed");
    } catch (e) {
      setPhase("failed");
      setError(errorText(lang, e, "errors.expired"));
    } finally {
      setOpening(false);
    }
  }

  const busy = phase === "uploading" || phase === "processing";
  const canSubmit = ready && me !== null && file !== null && !busy;
  const progress = phase === "uploading" ? 2 : (job?.progress ?? 0);

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
          {session && <UsagePanel usage={usage} />}
          <div className="flex flex-wrap items-center gap-3 md:pt-0.5">
            {session && <UserMenu me={me} />}
            <LanguageSelect />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {!session && <SignIn />}

      {session && (
        <div className="mt-6 flex flex-1 flex-col gap-6 sm:mt-8 lg:flex-row lg:items-stretch">
          <Sidebar
            jobs={jobs}
            loading={!ready}
            currentId={job?.id ?? null}
            onSelect={open}
            onNew={reset}
          />

          <section
            className="flex min-w-0 flex-1 flex-col justify-center"
            aria-label={t("btn.make")}
          >
            {opening ? (
              <div className="flex justify-center">
                <Spinner className="h-8 w-8" />
              </div>
            ) : phase === "done" && job ? (
              <div className="mx-auto flex w-full max-w-full flex-col items-center">
                <h1 className="font-display text-3xl font-bold tracking-tight">
                  {job.shorts.length === 1
                    ? t("results.one")
                    : t("results.many", { n: job.shorts.length })}
                </h1>
                <div className="mt-5 flex w-full snap-x gap-5 overflow-x-auto px-1 pb-3 md:justify-center md:overflow-visible md:px-0">
                  {job.shorts.map((s) => (
                    <ShortCard
                      key={`${job.id}-${s.index}`}
                      job={job}
                      short={s}
                    />
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  {job.zip_url ? (
                    <a
                      href={downloadUrl(job.zip_url, "clipforge-shorts.zip")}
                      className="btn"
                    >
                      {t("results.downloadAll")}
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="btn"
                      onClick={() =>
                        fetchMedia(zipPath(job)).then((b) =>
                          saveBlob(b, "clipforge-shorts.zip"),
                        )
                      }
                    >
                      {t("results.downloadAll")}
                    </button>
                  )}
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
                    disabled={busy || !ready}
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
                      disabled={busy || !ready}
                      className="h-4 w-4 accent-ember"
                    />
                    {t("captions")}
                  </label>

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-4 md:justify-start">
                    <button
                      type="button"
                      onClick={generate}
                      disabled={!canSubmit}
                      className="btn"
                    >
                      {!ready || (me === null && !busy) ? (
                        <Spinner className="h-4 w-4 border-paper/40 border-t-paper" />
                      ) : phase === "uploading" ? (
                        t("btn.uploading")
                      ) : phase === "processing" ? (
                        t("btn.forging")
                      ) : (
                        t("btn.make")
                      )}
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
                      <p className="mt-3 text-sm text-steel">
                        {t("resume.note")}
                      </p>
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
