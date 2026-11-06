"use client";

import { Spinner } from "@/components/Spinner";
import { RUNNING, type Job } from "@/lib/api";
import { useLang, useT } from "@/lib/i18n";

export function Sidebar({
  jobs,
  loading,
  currentId,
  onSelect,
  onNew,
}: {
  jobs: Job[] | null;
  loading: boolean;
  currentId: string | null;
  onSelect: (job: Job) => void;
  onNew: () => void;
}) {
  const t = useT();
  const lang = useLang();
  const fmt = new Intl.DateTimeFormat(lang === "pt" ? "pt-BR" : lang, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return (
    <aside
      aria-labelledby="sidebar-heading"
      className="flex w-full shrink-0 flex-col rounded-2xl border-2 border-line bg-panel/40 p-4 lg:h-full lg:w-72"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="sidebar-heading"
          className="font-display text-lg font-bold tracking-tight"
        >
          {t("history.title")}
        </h2>
        <button
          type="button"
          onClick={onNew}
          className="btn btn-quiet !px-3 !py-1.5 text-xs"
        >
          {t("history.new")}
        </button>
      </div>
      <p className="mt-1 text-xs text-steel">{t("history.note")}</p>
      <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
        {loading || jobs === null ? (
          <div className="flex h-24 items-center justify-center">
            <Spinner />
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-steel">{t("history.empty")}</p>
        ) : (
          <ul className="space-y-1">
            {jobs.map((job) => {
              const running = RUNNING.includes(job.status);
              const active = job.id === currentId;
              const openable =
                (job.status === "done" && !job.expired) || running;
              return (
                <li key={job.id}>
                  <button
                    type="button"
                    disabled={!openable}
                    onClick={() => onSelect(job)}
                    aria-current={active ? "true" : undefined}
                    className={[
                      "w-full rounded-xl px-3 py-2 text-left text-sm transition-colors",
                      active ? "bg-ink text-paper" : "hover:bg-panel",
                      openable ? "" : "cursor-default opacity-60",
                    ].join(" ")}
                  >
                    <span className="block truncate font-display">
                      {job.created_at
                        ? fmt.format(new Date(job.created_at))
                        : "—"}
                    </span>
                    <span
                      className={`block text-xs ${active ? "text-paper/80" : "text-steel"}`}
                    >
                      {job.status === "done" &&
                        !job.expired &&
                        `${job.shorts.length} shorts`}
                      {job.status === "done" &&
                        job.expired &&
                        t("history.expired")}
                      {job.status === "failed" && t("status.failed")}
                      {running && (
                        <>
                          {t(`status.${job.status}`)} · {job.progress}%
                        </>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
