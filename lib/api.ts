import { ApiError } from "@/lib/i18n";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Quota = {
  limit_requests?: number | null;
  remaining_requests?: number | null;
  limit_tokens?: number | null;
  remaining_tokens?: number | null;
  limit_audio_seconds?: number | null;
  remaining_audio_seconds?: number | null;
  reset_requests?: string | null;
  reset_tokens?: string | null;
  reset_audio_seconds?: string | null;
  observed_at?: number | null;
};

export type Usage = { chat: Quota | null; whisper: Quota | null };

export type JobStatus =
  | "queued"
  | "downloading"
  | "transcribing"
  | "selecting"
  | "rendering"
  | "done"
  | "failed";

export type Short = { index: number; title: string; start: number; end: number; duration: number };

export type Job = {
  id: string;
  status: JobStatus;
  progress: number;
  message: string;
  code: string;
  shorts: Short[];
};

async function readError(res: Response): Promise<ApiError> {
  try {
    const body = await res.json();
    const detail = body.detail;
    if (detail && typeof detail === "object") return new ApiError(detail.message, detail.code);
    return new ApiError(typeof detail === "string" ? detail : res.statusText, null);
  } catch {
    return new ApiError(res.statusText, null);
  }
}

export async function checkHealth(timeoutMs = 3000): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_URL}/health`, { signal: controller.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function getUsage(): Promise<Usage> {
  const res = await fetch(`${API_URL}/usage`);
  if (!res.ok) throw await readError(res);
  return res.json();
}

export async function createJob(
  source: { file: File } | { url: string },
  captions: boolean,
): Promise<string> {
  const form = new FormData();
  if ("file" in source) form.append("video", source.file);
  else form.append("url", source.url);
  form.append("captions", String(captions));
  const res = await fetch(`${API_URL}/jobs`, { method: "POST", body: form });
  if (!res.ok) throw await readError(res);
  const { id } = await res.json();
  return id;
}

export async function getJob(id: string): Promise<Job> {
  const res = await fetch(`${API_URL}/jobs/${id}`);
  if (!res.ok) throw await readError(res);
  return res.json();
}

export const shortUrl = (id: string, index: number, download = false) =>
  `${API_URL}/jobs/${id}/shorts/${index}${download ? "?download=1" : ""}`;

export const zipUrl = (id: string) => `${API_URL}/jobs/${id}/zip`;
