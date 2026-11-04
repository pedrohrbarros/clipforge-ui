import { getCredential, setCredential } from "@/lib/auth";
import { ApiError } from "@/lib/i18n";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

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
  "queued" | "transcribing" | "selecting" | "rendering" | "done" | "failed";

export type Short = {
  index: number;
  title: string;
  start: number;
  end: number;
  duration: number;
  url: string | null; // signed storage link, or null when served by the API
};

export type Job = {
  id: string;
  status: JobStatus;
  progress: number;
  message: string;
  code: string;
  shorts: Short[];
  zip_url: string | null;
};

export type Me = {
  email: string;
  name: string;
  used_today: number;
  limit: number;
  resets_at: string;
};

async function readError(res: Response): Promise<ApiError> {
  if (res.status === 401) setCredential(null); // expired or revoked sign-in
  try {
    const body = await res.json();
    const detail = body.detail;
    if (detail && typeof detail === "object")
      return new ApiError(detail.message, detail.code);
    return new ApiError(
      typeof detail === "string" ? detail : res.statusText,
      null,
    );
  } catch {
    return new ApiError(res.statusText, null);
  }
}

function auth(extra: HeadersInit = {}): HeadersInit {
  return { Authorization: `Bearer ${getCredential() ?? ""}`, ...extra };
}

// Fallback media URLs served by the API (no storage bucket configured) carry the token.
const withToken = (path: string) =>
  `${API_URL}${path}?token=${encodeURIComponent(getCredential() ?? "")}`;

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

export async function getMe(): Promise<Me> {
  const res = await fetch(`${API_URL}/me`, { headers: auth() });
  if (!res.ok) throw await readError(res);
  return res.json();
}

export async function getUsage(): Promise<Usage> {
  const res = await fetch(`${API_URL}/usage`, { headers: auth() });
  if (!res.ok) throw await readError(res);
  return res.json();
}

export async function createJob(
  file: File,
  captions: boolean,
  lang: string,
): Promise<string> {
  const form = new FormData();
  form.append("video", file);
  form.append("captions", String(captions));
  form.append("lang", lang);
  const res = await fetch(`${API_URL}/jobs`, {
    method: "POST",
    body: form,
    headers: auth(),
  });
  if (!res.ok) throw await readError(res);
  const { id } = await res.json();
  return id;
}

export async function getJob(id: string): Promise<Job> {
  const res = await fetch(`${API_URL}/jobs/${id}`, { headers: auth() });
  if (!res.ok) throw await readError(res);
  return res.json();
}

export const shortUrl = (job: Job, short: Short, download = false) =>
  short.url ??
  withToken(`/jobs/${job.id}/shorts/${short.index}`) +
    (download ? "&download=1" : "");

export const zipUrl = (job: Job) =>
  job.zip_url ?? withToken(`/jobs/${job.id}/zip`);
