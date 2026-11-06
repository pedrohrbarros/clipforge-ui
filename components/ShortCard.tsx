"use client";

import { useEffect, useState } from "react";
import {
  downloadUrl,
  fetchMedia,
  saveBlob,
  shortPath,
  type Job,
  type Short,
} from "@/lib/api";
import { useT } from "@/lib/i18n";

const slug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "short";

export function ShortCard({ job, short }: { job: Job; short: Short }) {
  const t = useT();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const filename = `${slug(short.title)}-${short.index}.mp4`;

  // Without a storage link the file comes from the API with the auth header, as a blob.
  useEffect(() => {
    if (short.url) return;
    let objectUrl: string | null = null;
    let cancelled = false;
    fetchMedia(shortPath(job, short))
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [job, short]);

  const src = short.url ?? blobUrl;

  return (
    <figure className="w-[200px] shrink-0 snap-start md:w-auto md:min-w-0 md:max-w-[240px] md:flex-1">
      <div
        className="phone phone-fluid overflow-hidden border-ink bg-ink"
        style={{ aspectRatio: (short.aspect ?? "9:16").replace(":", " / ") }}
      >
        {src && (
          <video
            src={src}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <figcaption className="mt-3">
        <p className="font-display text-base leading-tight text-ink">
          {short.title}
        </p>
        <p className="mt-1 text-sm text-steel">{short.duration}s</p>
        {short.url ? (
          <a
            href={downloadUrl(short.url, filename)}
            className="mt-2 inline-block text-sm text-ink underline underline-offset-4 hover:text-ember-deep"
          >
            {t("short.download")}
          </a>
        ) : (
          <button
            type="button"
            onClick={() =>
              fetchMedia(shortPath(job, short)).then((b) =>
                saveBlob(b, filename),
              )
            }
            className="mt-2 inline-block text-sm text-ink underline underline-offset-4 hover:text-ember-deep"
          >
            {t("short.download")}
          </button>
        )}
      </figcaption>
    </figure>
  );
}
