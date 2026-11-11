import { unzipSync } from "fflate";
import { expect, test, vi } from "vitest";
import type { Job } from "./api";
import { zipShorts } from "./zip";

test("zips every short from its signed link under a numbered name", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => ({
      ok: true,
      blob: async () => new Blob([`video ${url}`]),
    })),
  );
  const job = {
    id: "j",
    shorts: [
      { index: 1, url: "https://s/1" },
      { index: 2, url: "https://s/2" },
    ],
  } as Job;
  const seen: number[] = [];
  const blob = await zipShorts(job, (n) => seen.push(n));
  const entries = unzipSync(new Uint8Array(await blob.arrayBuffer()));
  expect(Object.keys(entries)).toEqual(["short-1.mp4", "short-2.mp4"]);
  expect(new TextDecoder().decode(entries["short-2.mp4"])).toBe(
    "video https://s/2",
  );
  expect(seen).toEqual([1, 2]);
  vi.unstubAllGlobals();
});
