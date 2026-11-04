import { ApiError } from "@/lib/i18n";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
// Shared secret the API expects; inlined at build time via next.config.ts `env`.
const API_KEY = process.env.API_KEY ?? "";

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

function auth(extra: HeadersInit = {}): HeadersInit {
  return { Authorization: `Bearer ${API_KEY}`, ...extra };
}

// <video> tags and download links cannot send headers, so media URLs carry the key as ?token=.
const withToken = (path: string) => `${API_URL}${path}?token=${encodeURIComponent(API_KEY)}`;

export async function getUsage(): Promise<Usage> {
  const res = await fetch(`${API_URL}/usage`, { headers: auth() });
  if (!res.ok) throw await readError(res);
  return res.json();
}

export async function createJob(file: File, captions: boolean): Promise<string> {
  const form = new FormData();
  form.append("video", file);
  form.append("captions", String(captions));
  const res = await fetch(`${API_URL}/jobs`, { method: "POST", body: form, headers: auth() });
  if (!res.ok) throw await readError(res);
  const { id } = await res.json();
  return id;
}

export async function getJob(id: string): Promise<Job> {
  const res = await fetch(`${API_URL}/jobs/${id}`, { headers: auth() });
  if (!res.ok) throw await readError(res);
  return res.json();
}

export const shortUrl = (id: string, index: number, download = false) =>
  withToken(`/jobs/${id}/shorts/${index}`) + (download ? "&download=1" : "");

export const zipUrl = (id: string) => withToken(`/jobs/${id}/zip`);
