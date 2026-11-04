"use client";

import { useEffect, useRef, useState } from "react";
import {
  downloadFileUrl,
  getDownload,
  getYoutubeInfo,
  startYoutubeDownload,
  type Download,
  type YoutubeInfo,
} from "@/lib/api";

type Phase = "idle" | "checking" | "ready" | "downloading" | "done" | "failed";

function formatDuration(seconds: number | null) {
  if (seconds == null) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function YoutubeDownloader() {
  const [url, setUrl] = useState("");
  const [info, setInfo] = useState<YoutubeInfo | null>(null);
  const [option, setOption] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [download, setDownload] = useState<Download | null>(null);
  const [error, setError] = useState<string | null>(null);
  const poll = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (poll.current) clearInterval(poll.current);
  }, []);

  async function check() {
    setError(null);
    setInfo(null);
    setDownload(null);
    setPhase("checking");
    try {
      const next = await getYoutubeInfo(url.trim());
      setInfo(next);
      const preferred = next.options.find((o) => o.id === "v1080") ?? next.options[0];
      setOption(preferred?.id ?? "");
      setPhase("ready");
    } catch (e) {
      setPhase("failed");
      setError(e instanceof Error ? e.message : "Could not check this link.");
    }
  }

  async function start() {
    setError(null);
    setPhase("downloading");
    try {
      const id = await startYoutubeDownload(url.trim(), option);
      poll.current = setInterval(async () => {
        try {
          const next = await getDownload(id);
          setDownload(next);
          if (next.status === "done" || next.status === "failed") {
            if (poll.current) clearInterval(poll.current);
            setPhase(next.status);
            if (next.status === "failed") setError(next.message);
          }
        } catch (e) {
          if (poll.current) clearInterval(poll.current);
          setPhase("failed");
          setError(e instanceof Error ? e.message : "Lost contact with the server.");
        }
      }, 1500);
    } catch (e) {
      setPhase("failed");
      setError(e instanceof Error ? e.message : "Could not start the download.");
    }
  }

  const busy = phase === "checking" || phase === "downloading";
  const duration = info ? formatDuration(info.duration) : null;

  return (
    <section className="mt-20 max-w-2xl" aria-labelledby="yt-heading">
      <h2 id="yt-heading" className="font-display text-2xl font-bold tracking-tight">
        Download a YouTube video
      </h2>
      <p className="mt-2 text-base leading-7 text-steel">
        Paste a link, pick a quality, and save the file to your computer. Works best from
        your own machine; YouTube sometimes blocks hosted servers.
      </p>

      <form
        className="mt-6 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (url.trim() && !busy) check();
        }}
      >
        <input
          type="url"
          inputMode="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=…"
          aria-label="YouTube link"
          disabled={busy}
          className="field flex-1"
        />
        <button type="submit" disabled={!url.trim() || busy} className="btn">
          {phase === "checking" ? "Checking…" : "Check video"}
        </button>
      </form>

      {info && (
        <div className="mt-6 flex gap-5 rounded-2xl border-[3px] border-ink bg-panel p-4 sm:items-start">
          {info.thumbnail && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={info.thumbnail}
              alt=""
              className="h-20 w-36 shrink-0 rounded-lg object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg leading-tight">{info.title}</p>
            {duration && <p className="mt-1 text-sm text-steel">{duration}</p>}

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-steel">Quality</span>
                <select
                  value={option}
                  onChange={(e) => setOption(e.target.value)}
                  disabled={busy || phase === "done"}
                  className="field"
                >
                  {info.options.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>

              {phase === "done" && download ? (
                <a href={downloadFileUrl(download.id)} className="btn">
                  Save file
                </a>
              ) : (
                <button type="button" onClick={start} disabled={busy || !option} className="btn">
                  {phase === "downloading" ? "Downloading…" : "Download"}
                </button>
              )}
            </div>

            {phase === "downloading" && (
              <div className="mt-4">
                <div
                  role="progressbar"
                  aria-label="Download progress"
                  aria-valuenow={download?.progress ?? 0}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-1.5 overflow-hidden rounded-full bg-line"
                >
                  <div className="ember-fill h-full rounded-full" style={{ width: `${download?.progress ?? 0}%` }} />
                </div>
                <p className="mt-1 text-xs text-steel">
                  {download?.progress ? `${download.progress}%` : "Starting…"}
                </p>
              </div>
            )}
            {phase === "done" && download?.filename && (
              <p className="mt-3 text-sm text-steel">{download.filename}</p>
            )}
          </div>
        </div>
      )}

      {error && (
        <p
          className="mt-6 rounded-lg border border-ember-deep/40 bg-panel px-4 py-3 text-sm text-ember-deep"
          role="alert"
        >
          {error}
        </p>
      )}
    </section>
  );
}
