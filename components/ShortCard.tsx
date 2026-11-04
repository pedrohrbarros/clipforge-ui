import { shortUrl, type Short } from "@/lib/api";

export function ShortCard({ jobId, short }: { jobId: string; short: Short }) {
  return (
    <figure className="shrink-0">
      <div className="phone overflow-hidden border-ink bg-ink">
        <video
          src={shortUrl(jobId, short.index)}
          controls
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      </div>
      <figcaption className="mt-3">
        <p className="font-display text-base leading-tight text-ink">{short.title}</p>
        <p className="mt-1 text-sm text-steel">{short.duration}s</p>
        <a
          href={shortUrl(jobId, short.index, true)}
          className="mt-2 inline-block text-sm text-ink underline underline-offset-4 hover:text-ember-deep"
        >
          Download
        </a>
      </figcaption>
    </figure>
  );
}
