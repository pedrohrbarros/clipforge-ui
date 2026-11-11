import { zipSync } from "fflate";
import { fetchMedia, shortPath, type Job } from "@/lib/api";

/** Zip a job's shorts in the browser (stored, no compression: video does not shrink). */
export async function zipShorts(
  job: Job,
  onProgress?: (done: number, total: number) => void,
): Promise<Blob> {
  const files: Record<string, [Uint8Array, { level: 0 }]> = {};
  let done = 0;
  for (const short of job.shorts) {
    const blob = short.url
      ? await fetch(short.url).then((r) => {
          if (!r.ok) throw new Error(`short ${short.index}: ${r.status}`);
          return r.blob();
        })
      : await fetchMedia(shortPath(job, short));
    files[`short-${short.index}.mp4`] = [
      new Uint8Array(await blob.arrayBuffer()),
      { level: 0 },
    ];
    done += 1;
    onProgress?.(done, job.shorts.length);
  }
  return new Blob([zipSync(files)], { type: "application/zip" });
}
