"use client";

import { shortUrl, type Job, type Short } from "@/lib/api";
import { useT } from "@/lib/i18n";

export function ShortCard({ job, short }: { job: Job; short: Short }) {
  const t = useT();
  return (
    <figure className="w-[200px] shrink-0 snap-start md:w-auto md:min-w-0 md:max-w-[240px] md:flex-1">
      <div className="phone phone-fluid overflow-hidden border-ink bg-ink">
        <video
          src={shortUrl(job, short)}
          controls
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      </div>
      <figcaption className="mt-3">
        <p className="font-display text-base leading-tight text-ink">
          {short.title}
        </p>
        <p className="mt-1 text-sm text-steel">{short.duration}s</p>
        <a
          href={shortUrl(job, short, true)}
          className="mt-2 inline-block text-sm text-ink underline underline-offset-4 hover:text-ember-deep"
        >
          {t("short.download")}
        </a>
      </figcaption>
    </figure>
  );
}
